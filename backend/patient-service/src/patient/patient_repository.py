import re
from datetime import date, datetime, timezone
from fastapi import HTTPException, status
from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ASCENDING, DESCENDING, ReturnDocument
from src.patient.patient_dto import GetPatientsListDto
from src.common.interfaces.patient_interface import (
    PatientDetailsInterface,
    PatientProfileUpdateInterface,
    PatientsListItemInterface,
    PatientsListResponseInterface,
    MasterDataItemInterface,
    PatientMedicalRecordsResponseInterface,
    PatientMedicalRecordListItemInterface,
    PatientMedicalRecordDetailsResponseInterface,
    PatientMedicalDocumentItemInterface,
    PatientMedicationItemInterface,
)
from src.common.logger.logger import getLogger
from src.db.db_service import getDatabase
from src.db.models.patient_entity import PatientProfile
from src.db.models.medical_documents_entity import MedicalDocument
from src.db.models.medical_record_entity import MedicalRecord
from src.db.models.medication_entity import MedicalMedication
from src.common.enums.medical_enums import MedicationStatus, MedicalRecordStatus

logger = getLogger("patient_repository")


class PatientRepository:
    def __init__(self):
        self.db = getDatabase()
        self.patientsCollection = self.db["patient_profiles"]
        self.statesCollection = self.db["states"]
        self.districtsCollection = self.db["districts"]
        self.medicalRecordsCollection = self.db["patient_medical_records"]
        self.medicalDocumentsCollection = self.db["patient_medical_documents"]
        self.medicationsCollection = self.db["patient_medications"]
        self.medicalDocumentTypesCollection = self.db["medical_document_types"]

    # * Create Patient
    async def createPatient(
        self,
        patientProfile: PatientProfile,
    ) -> PatientProfile:
        """
        * @description create patient reposiroty
        * @params self, patientProfile
        * @returns PatientProfile
        """
        data = patientProfile.model_dump(by_alias=True)

        await self.patientsCollection.insert_one(data)

        return patientProfile

    async def updatePatientProfile(
        self,
        patientProfileId: str,
        updateData: PatientProfileUpdateInterface,
    ) -> str | None:
        """
        * @description update patient profile details repository
        * @params patientProfileId, updateData
        * @returns str | None
        """
        try:
            profileObjectId = ObjectId(patientProfileId)
        except InvalidId:
            raise ValueError("Invalid patient profile ID")

        if not updateData:
            raise ValueError("No fields provided for update")

        fieldMap = {
            "firstName": "first_name",
            "middleName": "middle_name",
            "lastName": "last_name",
            "dateOfBirth": "date_of_birth",
            "age": "age",
            "gender": "gender",
            "profileImage": "profile_image",
            "address": "address",
            "stateId": "state_id",
            "districtId": "district_id",
            "pincode": "pincode",
        }
        mongoUpdate = {}
        for k, v in updateData.items():
            mongoKey = fieldMap.get(k, k)
            mongoUpdate[mongoKey] = v

        updateQuery = {
            "$set": {
                **mongoUpdate,
                "updated_at": datetime.now(timezone.utc),
            }
        }

        result = await self.patientsCollection.find_one_and_update(
            {
                "_id": profileObjectId,
            },
            updateQuery,
            projection={
                "_id": 0,
                "patient_id": 1,
            },
            return_document=ReturnDocument.AFTER,
        )

        if not result:
            return None

        return result["patient_id"]

    async def getPatientDetails(
        self,
        patientPrimaryKey: int | None = None,
    ) -> PatientDetailsInterface | None:
        """
        * @description get patient details repository
        * @params self, patientPrimaryKey
        * @returns PatientDetailsInterface | None
        """
        query: dict = {}
        if patientPrimaryKey is not None and patientPrimaryKey > 0:
            query["patient_primary_key"] = patientPrimaryKey
        else:
            return None

        document = await self.patientsCollection.find_one(query)

        if not document:
            return None

        stateId = document.get("state_id")
        districtId = document.get("district_id")
        stateName = None
        districtName = None

        if stateId is not None:
            stateDoc = await self.db["states"].find_one(
                {"state_id": stateId}, {"_id": 0, "state_name": 1}
            )
            if stateDoc:
                stateName = stateDoc.get("state_name")

        if districtId is not None:
            districtDoc = await self.db["districts"].find_one(
                {"district_id": districtId}, {"_id": 0, "district_name": 1}
            )
            if districtDoc:
                districtName = districtDoc.get("district_name")

        patientDetails: PatientDetailsInterface = {
            "patientProfileId": str(document.pop("_id")),
            "patientPrimaryKey": document["patient_primary_key"],
            "patientId": document["patient_id"],
            "firstName": document["first_name"],
            "middleName": document.get("middle_name"),
            "lastName": document["last_name"],
            "email": document["email"],
            "mobile": document["mobile"],
            "dateOfBirth": document.get("date_of_birth"),
            "age": document.get("age"),
            "gender": document.get("gender"),
            "profileImage": document.get("profile_image"),
            "address": document.get("address"),
            "stateId": stateId,
            "stateName": stateName,
            "districtId": districtId,
            "districtName": districtName,
            "pincode": document.get("pincode"),
        }
        return patientDetails

    # * Get Patients List with pagination and filters
    async def getPatientsList(
        self,
        request: GetPatientsListDto,
        doctorPrimaryKey: int | None = None,
        healthInstitutePrimaryKey: int | None = None,
    ) -> PatientsListResponseInterface:
        """
        * @decription get patient list respository
        * @params request, doctorPrimaryKey, healthInstitutePrimaryKey
        * returns PatientsListResponseInterface
        """
        pipeline: list[dict] = []
        matchQuery: dict = {}
        if request.stateId is not None and request.stateId > 0:
            matchQuery["state_id"] = request.stateId

        if request.search and request.search.strip():
            escapedSearch = re.escape(request.search.strip())
            regexSearch = {"$regex": escapedSearch, "$options": "i"}
            matchQuery["$or"] = [
                {"first_name": regexSearch},
                {"middle_name": regexSearch},
                {"last_name": regexSearch},
                {"patient_id": regexSearch},
            ]

        if matchQuery:
            pipeline.append({"$match": matchQuery})

        medicalRecordMatch: dict = {}
        if doctorPrimaryKey is not None and doctorPrimaryKey > 0:
            medicalRecordMatch["doctor_primary_key"] = doctorPrimaryKey

        if healthInstitutePrimaryKey is not None and healthInstitutePrimaryKey > 0:
            medicalRecordMatch["health_institute_primary_key"] = (
                healthInstitutePrimaryKey
            )

        if medicalRecordMatch:
            pipeline.extend(
                [
                    {
                        "$lookup": {
                            "from": "patient_medical_records",
                            "let": {
                                "p_pk": "$patient_primary_key",
                                "p_id": "$patient_id",
                            },
                            "pipeline": [
                                {
                                    "$match": {
                                        "$expr": {
                                            "$or": [
                                                {
                                                    "$eq": [
                                                        "$patient_primary_key",
                                                        "$$p_pk",
                                                    ]
                                                },
                                                {"$eq": ["$patient_id", "$$p_id"]},
                                            ]
                                        },
                                        **medicalRecordMatch,
                                    }
                                },
                                {"$limit": 1},
                            ],
                            "as": "medical_records",
                        }
                    },
                    {
                        "$match": {
                            "medical_records.0": {"$exists": True},
                        }
                    },
                ]
            )

        pipeline.append({"$sort": {"created_at": DESCENDING, "_id": DESCENDING}})
        pipeline.append(
            {
                "$facet": {
                    "total_count": [{"$count": "count"}],
                    "paginated_results": [
                        {"$skip": request.offset},
                        {"$limit": request.limit},
                    ],
                }
            }
        )

        cursor = await self.patientsCollection.aggregate(pipeline)
        facetData = None
        async for doc in cursor:
            facetData = doc
            break

        if facetData:
            totalList = facetData.get("total_count", [])
            total = totalList[0]["count"] if totalList else 0
            docs = facetData.get("paginated_results", [])
        else:
            total = 0
            docs = []

        patients: list[PatientsListItemInterface] = []
        for doc in docs:
            patients.append(
                {
                    "patientPrimaryKey": doc["patient_primary_key"],
                    "patientId": doc["patient_id"],
                    "firstName": doc["first_name"],
                    "middleName": doc.get("middle_name"),
                    "lastName": doc["last_name"],
                    "age": doc.get("age"),
                    "gender": doc.get("gender"),
                }
            )

        return {
            "patients": patients,
            "total": total,
            "offset": request.offset if request.offset is not None else 0,
            "limit": request.limit if request.limit is not None else 10,
        }

    async def getStates(self) -> list[MasterDataItemInterface]:
        """
        * @description get states list repository
        * @params self
        * @returns json MasterDataItemInterface[]
        """
        cursor = self.statesCollection.find(
            {},
            {"_id": 0, "state_id": 1, "state_name": 1, "state_code": 1},
        ).sort("state_id", ASCENDING)

        states: list[MasterDataItemInterface] = []
        async for doc in cursor:
            states.append(
                {
                    "id": doc["state_id"],
                    "name": doc["state_name"],
                    "code": doc["state_code"],
                }
            )
        return states

    async def getDistricts(self, state_id: int) -> list[MasterDataItemInterface]:
        """
        * @description get district list repository
        * @params self, id
        * returns MasterDataItemInterface[]
        """
        cursor = self.districtsCollection.find(
            {"state_id": state_id},
            {"_id": 0, "district_id": 1, "district_name": 1, "district_code": 1},
        ).sort("district_id", ASCENDING)

        districts: list[MasterDataItemInterface] = []
        async for doc in cursor:
            districts.append(
                {
                    "id": doc["district_id"],
                    "name": doc["district_name"],
                    "code": doc["district_code"],
                }
            )
        return districts

    async def createMedicalRecord(
        self,
        medicalRecord: MedicalRecord,
        medicalDocuments: list[MedicalDocument],
        medications: list[MedicalMedication],
        medicalRecordId: str,
    ) -> str:
        """
        * @description create patient medical record repository
        * @params self, medicalRecord, medicalDocuments, medications
        * @returns string
        """
        recordData = medicalRecord.model_dump(mode="json")
        recordData["_id"] = ObjectId(medicalRecordId)
        recordResult = await self.medicalRecordsCollection.insert_one(recordData)
        medicalRecordId = str(recordResult.inserted_id)

        if medicalDocuments:
            docs_data = []
            for doc in medicalDocuments:
                doc_dict = doc.model_dump(mode="json", by_alias=True)
                doc_dict["medicalRecordId"] = medicalRecordId
                docs_data.append(doc_dict)
            await self.medicalDocumentsCollection.insert_many(docs_data)

        if medications:
            medsData = []
            for med in medications:
                medDict = med.model_dump(mode="json", by_alias=True)
                medDict["medicalRecordId"] = medicalRecordId
                medsData.append(medDict)
            await self.medicationsCollection.insert_many(medsData)

        logger.success(
            f"Created medical record (id={medicalRecordId}) for patient {medicalRecord.patientId} "
            f"with {len(medicalDocuments)} documents and {len(medications)} medications."
        )

        return medicalRecordId

    async def uploadMedicalDocuments(
        self,
        patientId: str,
        medicalRecordId: str,
        medicalDocuments: list[MedicalDocument],
    ) -> str:
        """
        * @description upload medical documents repository
        * @params self, patientId, medicalDocuments
        * @returns str
        """
        if medicalDocuments:
            docs_data = [doc.model_dump(mode="json") for doc in medicalDocuments]
            await self.medicalDocumentsCollection.insert_many(docs_data)

        logger.success(f"Uploaded medical documents for patient{patientId}")

        return medicalRecordId

    async def updateMedications(
        self,
        medicalRecordId: str,
        medications: list[dict | MedicalMedication],
    ) -> str:
        """
        * @description update medications repository
        * @params self, medicalRecordId, medications
        * @returns string
        """
        try:
            recordId = ObjectId(medicalRecordId)
        except InvalidId:
            raise ValueError(f"Invalid medicalRecordId: {medicalRecordId}")

        record = await self.medicalRecordsCollection.find_one({"_id": recordId})
        if not record:
            raise ValueError(f"Medical record not found with id: {medicalRecordId}")

        newMedications = []
        nowUtc = datetime.now(timezone.utc)

        for med in medications:
            medData = (
                dict(med) if isinstance(med, dict) else med.model_dump(mode="json")
            )
            medId = medData.get("medication_id")
            if medId:
                try:
                    medicationId = ObjectId(medId)
                except InvalidId:
                    continue

                updateFields: dict = {"updated_at": nowUtc}

                if medData.get("status") is not None:
                    updateFields["status"] = int(medData["status"])

                if "end_date" in medData:
                    endDate = medData["end_date"]
                    updateFields["end_date"] = (
                        endDate.isoformat()
                        if isinstance(endDate, date)
                        else (
                            endDate.strip()
                            if isinstance(endDate, str) and endDate.strip()
                            else None
                        )
                    )

                result = await self.medicationsCollection.update_one(
                    {
                        "_id": medicationId,
                        "$or": [
                            {"medical_record_id": medicalRecordId},
                        ],
                    },
                    {"$set": updateFields},
                )
                if result.matched_count == 0:
                    raise ValueError(
                        f"Medication not found for medical record: {medId}"
                    )
            else:
                # Insert new medication
                if not medData.get("medication_name") or not medData.get("dosage"):
                    continue

                startDate = medData.get("start_date")
                if isinstance(startDate, date):
                    startDateStr = startDate.isoformat()
                elif isinstance(startDate, str) and startDate.strip():
                    startDateStr = startDate.strip()
                else:
                    startDateStr = date.today().isoformat()

                status = medData.get("status")
                if status is None:
                    status = MedicationStatus.ACTIVE.value
                else:
                    status = int(status)

                newMedicationEntry = {
                    "medical_record_id": medicalRecordId,
                    "medication_name": medData.get("medication_name", "").strip(),
                    "dosage": medData.get("dosage", "").strip(),
                    "description": (
                        medData.get("description", "").strip()
                        if medData.get("description")
                        else None
                    ),
                    "start_date": startDateStr,
                    "end_date": None,
                    "status": status,
                    "created_at": nowUtc,
                    "updated_at": None,
                }
                newMedications.append(newMedicationEntry)

        if newMedications:
            await self.medicationsCollection.insert_many(newMedications)

        logger.success(f"Updated medications for medical record (id={medicalRecordId})")

        return medicalRecordId

    async def getPatientMedicalRecords(
        self,
        patientPrimaryKey: int,
        patientId: str | None = None,
        offset: int = 0,
        limit: int = 10,
    ) -> PatientMedicalRecordsResponseInterface:
        """
        * @description get patient medical records repository
        * @params patientPrimaryKey, patientId, offset, limit
        * @returns PatientMedicalRecordsResponseInterface
        """
        filter_query: dict = {}

        if patientPrimaryKey:
            filter_query["patient_primary_key"] = patientPrimaryKey

        if patientId:
            filter_query["patient_id"] = patientId

        total = await self.medicalRecordsCollection.count_documents(filter_query)

        pipeline = [
            {"$match": filter_query},
            {
                "$sort": {
                    "created_at": DESCENDING,
                    "_id": DESCENDING,
                }
            },
            {"$skip": offset},
            {"$limit": limit},
            {
                "$project": {
                    "_id": 0,
                    "patientMedicalRecordId": {"$toString": "$_id"},
                    "doctorPrimaryKey": {"$ifNull": ["$doctor_primary_key", 0]},
                    "doctorId": {"$ifNull": ["$doctor_id", ""]},
                    "healthInstitutePrimaryKey": {
                        "$ifNull": ["$health_institute_primary_key", 0]
                    },
                    "healthInstituteId": {"$ifNull": ["$health_institute_id", ""]},
                    "title": {"$ifNull": ["$title", ""]},
                    "diagnosis": {"$ifNull": ["$diagnosis", ""]},
                    "status": {
                        "$toInt": {
                            "$ifNull": [
                                "$status",
                                MedicalRecordStatus.ACTIVE,
                            ]
                        }
                    },
                }
            },
        ]

        cursor = await self.medicalRecordsCollection.aggregate(pipeline)

        medical_records: list[PatientMedicalRecordListItemInterface] = (
            await cursor.to_list(length=limit)
        )

        return {
            "medicalRecords": medical_records,
            "total": total,
            "offset": offset,
            "limit": limit,
        }

    async def getPatientMedicalRecordDetails(
        self, medicalRecordId: str
    ) -> PatientMedicalRecordDetailsResponseInterface:
        """
        * @description get patient medical record details repository
        * @params medicalRecordId
        * @returns PatientMedicalRecordDetailsResponseInterface
        """
        try:
            recordObjectId = ObjectId(medicalRecordId)
        except InvalidId:
            raise ValueError("Invalid medical record ID")

        pipeline = [
            {"$match": {"_id": recordObjectId}},
            {
                "$lookup": {
                    "from": "patient_medical_documents",
                    "let": {"record_id": medicalRecordId},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$eq": [
                                        "$medical_record_id",
                                        "$$record_id",
                                    ]
                                }
                            }
                        },
                        {
                            "$sort": {
                                "created_at": ASCENDING,
                                "_id": ASCENDING,
                            }
                        },
                        {
                            "$lookup": {
                                "from": "medical_document_types",
                                "localField": "document_type",
                                "foreignField": "document_type_id",
                                "as": "document_type_info",
                            }
                        },
                        {
                            "$unwind": {
                                "path": "$document_type_info",
                                "preserveNullAndEmptyArrays": True,
                            }
                        },
                        {
                            "$project": {
                                "_id": 1,
                                "document_type": 1,
                                "document_type_name": {
                                    "$ifNull": [
                                        "$document_type_info.document_type_name",
                                        "Other",
                                    ]
                                },
                                "title": 1,
                                "description": 1,
                                "document_url": 1,
                                "document_date": 1,
                            }
                        },
                    ],
                    "as": "medical_documents",
                }
            },
            {
                "$lookup": {
                    "from": "patient_medications",
                    "let": {"rec_id": medicalRecordId},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {"$eq": ["$medical_record_id", "$$rec_id"]}
                            }
                        },
                        {"$sort": {"created_at": ASCENDING, "_id": ASCENDING}},
                        {
                            "$project": {
                                "_id": 1,
                                "medication_name": 1,
                                "dosage": 1,
                                "description": 1,
                                "start_date": 1,
                                "end_date": 1,
                                "status": 1,
                            }
                        },
                    ],
                    "as": "medications",
                }
            },
        ]

        cursor = await self.medicalRecordsCollection.aggregate(pipeline)
        record = None
        async for doc in cursor:
            record = doc
            break

        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical record details not found!",
            )

        medicalDocuments: list[PatientMedicalDocumentItemInterface] = [
            {
                "patientMedicalDocumentId": str(doc["_id"]),
                "documentType": int(doc.get("document_type", 1)),
                "documentTypeName": doc.get("document_type_name", "Other"),
                "title": doc.get("title", ""),
                "description": doc.get("description"),
                "documentUrl": doc.get("document_url", ""),
                "documentDate": str(doc.get("document_date", "") or ""),
            }
            for doc in record.get("medical_documents", [])
        ]

        medications: list[PatientMedicationItemInterface] = [
            {
                "patientMedicationId": str(med["_id"]),
                "medicationName": med.get("medication_name", ""),
                "dosage": med.get("dosage", ""),
                "description": med.get("description"),
                "startDate": str(med.get("start_date", "") or ""),
                "endDate": (
                    str(med.get("end_date", "") or "") if med.get("end_date") else None
                ),
                "status": int(med.get("status", 1)),
            }
            for med in record.get("medications", [])
        ]

        return {
            "patientMedicalRecordId": str(record["_id"]),
            "title": record.get("title", ""),
            "diagnosis": record.get("diagnosis", ""),
            "status": int(record.get("status", MedicalRecordStatus.ACTIVE)),
            "startedDate": str(record.get("started_date", "") or ""),
            "resolvedDate": (
                str(record.get("resolved_date", "") or "")
                if record.get("resolved_date")
                else None
            ),
            "medicalDocuments": medicalDocuments,
            "medications": medications,
        }

import datetime

from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ASCENDING, DESCENDING
from datetime import date, datetime, timezone

from app.common.enums.medical_enums import MedicalRecordStatus, MedicationStatus
from app.common.interfaces.patient_interface import (
    PatientMedicalDocumentItemInterface,
    PatientMedicalRecordDetailsResponseInterface,
    PatientMedicalRecordListItemInterface,
    PatientMedicalRecordsResponseInterface,
    PatientMedicationItemInterface,
)
from app.common.logger import get_logger
from app.db.db_service import get_database
from app.db.models.medical_documents_entity import MedicalDocument
from app.db.models.medical_record_entity import MedicalRecord
from app.db.models.medication_entity import MedicalMedication

logger = get_logger("medical_record_repository")


class MedicalRecordRepository:
    def __init__(self):
        self.db = get_database()
        self.medical_records_collection = self.db["patient_medical_records"]
        self.medical_documents_collection = self.db["patient_medical_documents"]
        self.medications_collection = self.db["patient_medications"]
        self.medical_document_types_collection = self.db["medical_document_types"]

    # * Create medical Record
    async def create_medical_record(
        self,
        medical_record: MedicalRecord,
        medical_documents: list[MedicalDocument],
        medications: list[MedicalMedication],
    ) -> str:
        # 1. Insert main medical record
        record_data = medical_record.model_dump(mode="json")
        record_result = await self.medical_records_collection.insert_one(record_data)
        medical_record_id = str(record_result.inserted_id)

        # 2. Insert medical documents if present
        if medical_documents:
            docs_data = []
            for doc in medical_documents:
                doc_dict = doc.model_dump(mode="json")
                doc_dict["medical_record_id"] = medical_record_id
                docs_data.append(doc_dict)
            await self.medical_documents_collection.insert_many(docs_data)

        # 3. Insert medications if present
        if medications:
            meds_data = []
            for med in medications:
                med_dict = med.model_dump(mode="json")
                med_dict["medical_record_id"] = medical_record_id
                meds_data.append(med_dict)
            await self.medications_collection.insert_many(meds_data)

        logger.success(
            f"Created medical record (id={medical_record_id}) for patient {medical_record.patient_id} "
            f"with {len(medical_documents)} documents and {len(medications)} medications."
        )

        return medical_record_id

    # * Upload Medical Documents
    async def upload_medical_documents(
        self,
        patient_id: str,
        medical_documents: list[MedicalDocument],
    ) -> str:
        if medical_documents:
            docs_data = [doc.model_dump(mode="json") for doc in medical_documents]
            await self.medical_documents_collection.insert_many(docs_data)

        logger.success(f"Uploaded medical documents for patient{patient_id}")

        return patient_id

    # * Get Patient Medical Records
    async def get_patient_medical_records(
        self,
        patient_primary_key: int,
        patient_id: str | None = None,
        offset: int = 0,
        limit: int = 10,
    ) -> PatientMedicalRecordsResponseInterface:
        filter_query: dict = {}
        if patient_primary_key:
            filter_query["patient_primary_key"] = patient_primary_key
        if patient_id:
            filter_query["patient_id"] = patient_id

        total = await self.medical_records_collection.count_documents(filter_query)

        cursor = (
            self.medical_records_collection.find(filter_query)
            .sort([("created_at", DESCENDING), ("_id", DESCENDING)])
            .skip(offset)
            .limit(limit)
        )

        medical_records: list[PatientMedicalRecordListItemInterface] = []
        async for doc in cursor:
            medical_records.append(
                {
                    "patient_medical_record_id": str(doc["_id"]),
                    "doctor_primary_key": doc.get("doctor_primary_key", 0),
                    "doctor_id": doc.get("doctor_id", ""),
                    "health_institute_primary_key": doc.get(
                        "health_institute_primary_key", 0
                    ),
                    "health_institute_id": doc.get("health_institute_id", ""),
                    "title": doc.get("title", ""),
                    "diagnosis": doc.get("diagnosis", ""),
                    "status": int(doc.get("status", MedicalRecordStatus.ACTIVE)),
                }
            )

        return {
            "medical_records": medical_records,
            "total": total,
            "offset": offset,
            "limit": limit,
        }

    # * Get Medical Record Details
    async def get_medical_record_details(
        self, medical_record_id: str
    ) -> PatientMedicalRecordDetailsResponseInterface | None:
        try:
            record_object_id = ObjectId(medical_record_id)
        except InvalidId:
            raise ValueError("Invalid medical record ID")

        pipeline = [
            {"$match": {"_id": record_object_id}},
            {
                "$lookup": {
                    "from": "patient_medical_documents",
                    "let": {"record_id": medical_record_id},
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
                    "let": {"rec_id": medical_record_id},
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

        cursor = await self.medical_records_collection.aggregate(pipeline)
        record = None
        async for doc in cursor:
            record = doc
            break

        if not record:
            return None

        medical_documents: list[PatientMedicalDocumentItemInterface] = [
            {
                "patient_medical_document_id": str(doc["_id"]),
                "document_type": int(doc.get("document_type", 1)),
                "document_type_name": doc.get("document_type_name", "Other"),
                "title": doc.get("title", ""),
                "description": doc.get("description"),
                "document_url": doc.get("document_url", ""),
                "document_date": str(doc.get("document_date", "") or ""),
            }
            for doc in record.get("medical_documents", [])
        ]

        medications: list[PatientMedicationItemInterface] = [
            {
                "patient_medication_id": str(med["_id"]),
                "medication_name": med.get("medication_name", ""),
                "dosage": med.get("dosage", ""),
                "description": med.get("description"),
                "start_date": str(med.get("start_date", "") or ""),
                "end_date": (
                    str(med.get("end_date", "") or "") if med.get("end_date") else None
                ),
                "status": int(med.get("status", 1)),
            }
            for med in record.get("medications", [])
        ]

        return {
            "patient_medical_record_id": str(record["_id"]),
            "title": record.get("title", ""),
            "diagnosis": record.get("diagnosis", ""),
            "status": int(record.get("status", MedicalRecordStatus.ACTIVE)),
            "started_date": str(record.get("started_date", "") or ""),
            "resolved_date": (
                str(record.get("resolved_date", "") or "")
                if record.get("resolved_date")
                else None
            ),
            "medical_documents": medical_documents,
            "medications": medications,
        }

    # * Update Medications
    async def update_medications(
        self,
        medical_record_id: str,
        medications: list[dict | MedicalMedication],
    ) -> str:
        # 1. Verify medical record exists
        try:
            record_oid = ObjectId(medical_record_id)
        except InvalidId:
            raise ValueError(f"Invalid medical_record_id: {medical_record_id}")

        record = await self.medical_records_collection.find_one({"_id": record_oid})
        if not record:
            raise ValueError(f"Medical record not found with id: {medical_record_id}")

        new_meds_to_insert = []
        now_utc = datetime.now(timezone.utc)

        for med in medications:
            med_data = (
                dict(med) if isinstance(med, dict) else med.model_dump(mode="json")
            )
            med_id = med_data.get("patient_medication_id") or med_data.get(
                "medication_id"
            )

            if med_id:
                # Update existing medication status and end_date only
                try:
                    med_oid = ObjectId(med_id)
                except InvalidId:
                    continue

                update_fields: dict = {"updated_at": now_utc}

                if med_data.get("status") is not None:
                    update_fields["status"] = int(med_data["status"])

                if "end_date" in med_data:
                    end_d = med_data["end_date"]
                    update_fields["end_date"] = (
                        end_d.isoformat()
                        if isinstance(end_d, date)
                        else end_d.strip()
                        if isinstance(end_d, str) and end_d.strip()
                        else None
                    )

                await self.medications_collection.update_one(
                    {"_id": med_oid, "medical_record_id": medical_record_id},
                    {"$set": update_fields},
                )
            else:
                # Insert new medication
                if not med_data.get("medication_name") or not med_data.get("dosage"):
                    continue

                start_d = med_data.get("start_date")
                if isinstance(start_d, date):
                    start_d_str = start_d.isoformat()
                elif isinstance(start_d, str) and start_d.strip():
                    start_d_str = start_d.strip()
                else:
                    start_d_str = date.today().isoformat()

                status_val = med_data.get("status")
                if status_val is None:
                    status_val = MedicationStatus.ACTIVE.value
                else:
                    status_val = int(status_val)

                new_med_entry = {
                    "medical_record_id": medical_record_id,
                    "medication_name": med_data.get("medication_name", "").strip(),
                    "dosage": med_data.get("dosage", "").strip(),
                    "description": (
                        med_data.get("description", "").strip()
                        if med_data.get("description")
                        else None
                    ),
                    "start_date": start_d_str,
                    "end_date": None,  # For new entry, do not set end date
                    "status": status_val,
                    "created_at": now_utc,
                    "updated_at": None,
                }
                new_meds_to_insert.append(new_med_entry)

        if new_meds_to_insert:
            await self.medications_collection.insert_many(new_meds_to_insert)

        logger.success(
            f"Updated medications for medical record (id={medical_record_id})"
        )

        return medical_record_id

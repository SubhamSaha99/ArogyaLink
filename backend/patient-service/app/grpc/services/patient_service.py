from datetime import date
from typing import cast

import grpc
from app.common.decorators.grpc_error_handler import grpc_error_handler
from app.common.enums.medical_enums import MedicalDocumentType
from app.common.interfaces.patient_interface import PatientProfileUpdateInterface
from app.config.settings import settings
from app.db.models.medical_documents_entity import MedicalDocument
from app.db.models.medical_record_entity import MedicalRecord
from app.db.models.medication_entity import MedicalMedication
from app.db.models.patient_entity import PatientProfile
from app.proto.generated import patient_pb2, patient_pb2_grpc
from app.services.patient_service import PatientService as PatientProfileService


class PatientService(patient_pb2_grpc.PatientServiceServicer):
    def __init__(self):
        self.patient_service = PatientProfileService()

    # * Create Patient
    @grpc_error_handler
    async def CreatePatient(
        self,
        request: patient_pb2.PatientProfileReq,
        context: grpc.aio.ServicerContext,
    ) -> patient_pb2.PatientProfileRes:

        patient_profile = PatientProfile(
            patient_primary_key=request.patientPrimaryKey,
            patient_id=request.patientId,
            first_name=request.firstName,
            middle_name=request.middleName or None,
            last_name=request.lastName,
        )

        result = await self.patient_service.create_patient_profile(patient_profile)

        return patient_pb2.PatientProfileRes(
            patientId=result.patient_id,
        )

    # * Update Patient Profile
    @grpc_error_handler
    async def UpdatePatientProfile(
        self,
        request: patient_pb2.UpdatePatientProfileDetailsReq,
        context: grpc.aio.ServicerContext,
    ) -> patient_pb2.UpdatePatientProfileDetailsRes:

        field_mapping = {
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

        patient_profile = cast(
            PatientProfileUpdateInterface,
            {
                field_mapping[field.name]: value
                for field, value in request.ListFields()
                if field.name in field_mapping
            },
        )

        result = await self.patient_service.update_patient_profile(
            request.patientProfileId,
            request.patientId,
            patient_profile,
        )

        return patient_pb2.UpdatePatientProfileDetailsRes(
            patientId=result,
        )

    # * Get Patient Details
    @grpc_error_handler
    async def GetPatientDetails(
        self,
        request: patient_pb2.GetPatientDetailsReq,
        context: grpc.aio.ServicerContext,
    ) -> patient_pb2.GetPatientDetailsRes:

        patient_details = await self.patient_service.get_patient_details(
            request.patientPrimaryKey,
            request.patientId,
        )

        profile_image = (
            f"{settings.api_base_url}/uploads/{patient_details['profile_image']}"
            if patient_details.get("profile_image")
            else None
        )

        return patient_pb2.GetPatientDetailsRes(
            patientPrimaryKey=patient_details["patient_primary_key"],
            patientId=patient_details["patient_id"],
            patientProfile=patient_pb2.PatientDetails(
                patientProfileId=patient_details["patient_profile_id"],
                firstName=patient_details["first_name"],
                middleName=patient_details.get("middle_name"),
                lastName=patient_details["last_name"],
                dateOfBirth=patient_details.get("date_of_birth"),
                age=patient_details.get("age"),
                gender=patient_details.get("gender"),
                profileImage=profile_image,
                address=patient_details.get("address"),
                stateId=patient_details.get("state_id"),
                stateName=patient_details.get("state_name"),
                districtId=patient_details.get("district_id"),
                districtName=patient_details.get("district_name"),
                pincode=patient_details.get("pincode"),
            ),
        )

    # * Create Patient Medical Record
    @grpc_error_handler
    async def CreatePatientMedicalRecord(
        self,
        request: patient_pb2.CreatePatientMedicalRecordReq,
        context: grpc.aio.ServicerContext,
    ) -> patient_pb2.CreatePatientMedicalRecordRes:

        if not request.HasField("medicalRecord"):
            raise ValueError("medicalRecord details are required")

        req_record = request.medicalRecord

        medical_record = MedicalRecord(
            patient_primary_key=req_record.patientPrimaryKey,
            patient_id=req_record.patientId,
            doctor_primary_key=req_record.doctorPrimaryKey,
            doctor_id=req_record.doctorId,
            health_institute_primary_key=req_record.healthInstitutePrimaryKey,
            health_institute_id=req_record.healthInstituteId,
            title=req_record.title,
            diagnosis=req_record.diagnosis,
            description=req_record.description if req_record.description else None,
            started_date=date.fromisoformat(req_record.startedDate),
        )

        medical_documents = [
            MedicalDocument(
                medical_record_id="",
                document_type=MedicalDocumentType(doc.documentType),
                title=doc.title,
                document_url=doc.documentUrl,
                document_date=(
                    date.fromisoformat(doc.documentDate) if doc.documentDate else None
                ),
            )
            for doc in request.medicalDocuments
        ]

        medications = [
            MedicalMedication(
                medical_record_id="",
                medication_name=med.medicationName,
                dosage=med.dosage,
                start_date=date.fromisoformat(med.startDate),
            )
            for med in request.medications
        ]

        patient_id = await self.patient_service.create_patient_medical_record(
            medical_record=medical_record,
            medical_documents=medical_documents,
            medications=medications,
        )

        return patient_pb2.CreatePatientMedicalRecordRes(
            patientId=patient_id,
        )

    # * Get States
    @grpc_error_handler
    async def GetStates(
        self,
        request: patient_pb2.GetStatesReq,
        context: grpc.aio.ServicerContext,
    ) -> patient_pb2.GetStatesRes:

        states = await self.patient_service.get_states()

        return patient_pb2.GetStatesRes(
            states=[
                patient_pb2.MasterDataItem(
                    id=item["id"],
                    name=item["name"],
                    code=item["code"],
                )
                for item in states
            ]
        )

    # * Get Districts
    @grpc_error_handler
    async def GetDistricts(
        self,
        request: patient_pb2.GetDistrictsReq,
        context: grpc.aio.ServicerContext,
    ) -> patient_pb2.GetDistrictsRes:

        districts = await self.patient_service.get_districts(request.stateId)

        return patient_pb2.GetDistrictsRes(
            districts=[
                patient_pb2.MasterDataItem(
                    id=item["id"],
                    name=item["name"],
                    code=item["code"],
                )
                for item in districts
            ]
        )

    # * Get Patients List
    @grpc_error_handler
    async def GetPatientsList(
        self,
        request: patient_pb2.GetPatientsListReq,
        context: grpc.aio.ServicerContext,
    ) -> patient_pb2.GetPatientsListRes:

        search = (
            request.search
            if request.HasField("search") and request.search.strip()
            else None
        )
        state_id = (
            request.stateId
            if request.HasField("stateId") and request.stateId > 0
            else None
        )
        offset = request.offset or 0
        limit = request.limit if request.limit > 0 else 10

        result = await self.patient_service.get_patients_list(
            offset=offset,
            limit=limit,
            search=search,
            state_id=state_id,
        )

        return patient_pb2.GetPatientsListRes(
            patients=[
                patient_pb2.PatientsListData(
                    patientPrimaryKey=patient["patient_primary_key"],
                    patientId=patient["patient_id"],
                    firstName=patient["first_name"],
                    middleName=patient.get("middle_name"),
                    lastName=patient["last_name"],
                    age=patient.get("age"),
                    gender=patient.get("gender"),
                )
                for patient in result["patients"]
            ],
            total=result["total"],
            offset=result["offset"],
            limit=result["limit"],
        )

    # * Get Patient Medical Records
    @grpc_error_handler
    async def GetPatientMedicalRecords(
        self,
        request: patient_pb2.GetPatientMedicalRecordsReq,
        context: grpc.aio.ServicerContext,
    ) -> patient_pb2.GetPatientMedicalRecordsRes:

        offset = request.offset or 0
        limit = request.limit if request.limit > 0 else 10

        result = await self.patient_service.get_patient_medical_records(
            patient_primary_key=request.patientPrimaryKey,
            patient_id=request.patientId if request.patientId else None,
            offset=offset,
            limit=limit,
        )

        return patient_pb2.GetPatientMedicalRecordsRes(
            medicalRecords=[
                patient_pb2.PatientMedicalRecordsList(
                    patientMedicalRecordId=rec["patient_medical_record_id"],
                    doctorPrimaryKey=rec["doctor_primary_key"],
                    doctorId=rec["doctor_id"],
                    healthInstitutePrimaryKey=rec["health_institute_primary_key"],
                    healthInstituteId=rec["health_institute_id"],
                    title=rec["title"],
                    diagnosis=rec["diagnosis"],
                    status=rec["status"],
                )
                for rec in result["medical_records"]
            ],
            total=result["total"],
            offset=result["offset"],
            limit=result["limit"],
        )

    # * Get Patient Medical Record Details
    @grpc_error_handler
    async def GetPatientMedicalRecordDetails(
        self,
        request: patient_pb2.GetPatientMedicalRecordDetailsReq,
        context: grpc.aio.ServicerContext,
    ) -> patient_pb2.GetPatientMedicalRecordDetailsRes:

        result = await self.patient_service.get_patient_medical_record_details(
            medical_record_id=request.medicalRecordId
        )

        return patient_pb2.GetPatientMedicalRecordDetailsRes(
            patientMedicalRecordId=result["patient_medical_record_id"],
            title=result["title"],
            diagnosis=result["diagnosis"],
            status=result["status"],
            startedDate=result["started_date"],
            resolvedDate=result.get("resolved_date"),
            medicalDocuments=[
                patient_pb2.GetPateintMedicalDocuments(
                    patientMedicalDocumentId=doc["patient_medical_document_id"],
                    documentType=doc["document_type"],
                    documentTypeName=doc["document_type_name"],
                    title=doc["title"],
                    documentUrl=(
                        f"{settings.api_base_url}/uploads/{doc['document_url'].lstrip('/')}"
                        if doc["document_url"]
                        and not doc["document_url"].startswith(
                            ("http://", "https://")
                        )
                        else doc["document_url"]
                    ),
                    documentDate=doc["document_date"],
                )
                for doc in result["medical_documents"]
            ],
            medications=[
                patient_pb2.GetPatientMedications(
                    patientMedicationId=med["patient_medication_id"],
                    medicationName=med["medication_name"],
                    dosage=med["dosage"],
                    startDate=med["start_date"],
                    endDate=med.get("end_date"),
                    status=med["status"],
                )
                for med in result["medications"]
            ],
        )



from datetime import date
from typing import cast

import grpc
from app.common.decorators.grpc_error_handler import grpc_error_handler
from app.common.enums.medical_enums import MedicalDocumentType
from app.common.interfaces.patient_interface import PatientProfileUpdateInterface
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

        profile_data = {
            "patientProfileId": patient_details["patient_profile_id"],
            "firstName": patient_details["first_name"],
            "lastName": patient_details["last_name"],
            "middleName": patient_details["middle_name"],
            "dateOfBirth": patient_details["date_of_birth"],
            "age": patient_details["age"],
            "gender": patient_details["gender"],
            "profileImage": patient_details["profile_image"],
            "address": patient_details["address"],
            "stateId": patient_details["state_id"],
            "districtId": patient_details["district_id"],
        }

        patient_profile = patient_pb2.PatientDetails(
            **{key: value for key, value in profile_data.items() if value is not None}
        )

        return patient_pb2.GetPatientDetailsRes(
            patientPrimaryKey=patient_details["patient_primary_key"],
            patientId=patient_details["patient_id"],
            patientProfile=patient_profile,
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
                    date.fromisoformat(doc.documentDate)
                    if doc.documentDate
                    else None
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

from typing import cast
import grpc

from app.proto.generated import patient_pb2
from app.proto.generated import patient_pb2_grpc
from app.db.models.patient_entity import PatientProfile
from app.services.patient_service import PatientService as PatientProfileService
from app.common.decorators.grpc_error_handler import grpc_error_handler
from app.common.interfaces.patient_interface import PatientProfileUpdateInterface


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

    # * get patient details
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
            **{
                key: value
                for key, value in profile_data.items()
                if value is not None
            }
        )

        return patient_pb2.GetPatientDetailsRes(
            patientPrimaryKey=patient_details["patient_primary_key"],
            patientId=patient_details["patient_id"],
            patientProfile=patient_profile,
        )

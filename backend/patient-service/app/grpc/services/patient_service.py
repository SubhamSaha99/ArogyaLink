import grpc
from app.proto.generated import patient_pb2
from app.proto.generated import patient_pb2_grpc
from app.db.models.patient_entity import PatientProfile
from app.services.patient_service import PatientService as PatientProfileService
from app.grpc.error_handler import grpc_error_handler


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

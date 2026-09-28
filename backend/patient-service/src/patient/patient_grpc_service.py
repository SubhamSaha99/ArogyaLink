from _collections_abc import Awaitable
from datetime import date
from typing import cast
import grpc

from src.common.decorator.grpc_error_handler import grpcErrorHandler
from src.proto.generated import patient_pb2, patient_pb2_grpc
from src.patient.patient_service import PatientService
from src.db.models.patient_entity import PatientProfile


class PatientGrpcService(patient_pb2_grpc.PatientServiceServicer):
    def __init__(self):
        self.patientService = PatientService()

    @grpcErrorHandler
    async def CreatePatient(
        self,
        request: patient_pb2.PatientProfileReq,
        context: grpc.aio.ServicerContext,
    ) -> patient_pb2.PatientProfileRes:
        """
        * @description create patient grpc service
        * @params self, request, context
        * @returns PatientProfileRes
        """
        patientProfile = PatientProfile(
            patient_primary_key=request.patientPrimaryKey,
            patient_id=request.patientId,
            first_name=request.firstName,
            middle_name=request.middleName or None,
            last_name=request.lastName,
            email=request.email,
            mobile=request.mobile,
        )
        
        result = await self.patientService.createPatient(patientProfile=patientProfile);
        
        return patient_pb2.PatientProfileRes(
            patientId=result.patientId,
        )

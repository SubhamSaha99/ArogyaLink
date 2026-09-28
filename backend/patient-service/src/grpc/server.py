import grpc

from src.common.logger.logger import getLogger
from src.config.settings import settings
from src.patient.patient_grpc_service import PatientGrpcService
from src.proto.generated import patient_pb2_grpc

logger = getLogger("grpc_server")


async def startGrpcServer() -> grpc.aio.Server:

    server = grpc.aio.server()

    patient_pb2_grpc.add_PatientServiceServicer_to_server(
        PatientGrpcService(),
        server,
    )

    grpcUrl = settings.patientServiceGrpcUrl
    server.add_insecure_port(grpcUrl)

    await server.start()

    logger.info(f"Patient gRPC server started on {grpcUrl}")

    return server


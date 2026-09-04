import grpc

from app.proto.generated import patient_pb2_grpc
from app.grpc.services.patient_service import PatientService
from app.config.settings import settings
from app.common.logger import get_logger

logger = get_logger("grpc_server")


async def start_grpc_server() -> grpc.aio.Server:

    server = grpc.aio.server()

    patient_pb2_grpc.add_PatientServiceServicer_to_server(
        PatientService(),
        server,
    )

    grpc_url = settings.patient_service_grpc_url
    server.add_insecure_port(grpc_url)

    await server.start()

    logger.info(f"Patient gRPC server started on {grpc_url}")

    return server

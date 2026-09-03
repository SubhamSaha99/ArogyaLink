import grpc

from app.proto.generated import patient_pb2_grpc
from app.grpc.services.patient_service import PatientService
from app.config.settings import settings


async def start_grpc_server() -> grpc.aio.Server:

    server = grpc.aio.server()

    patient_pb2_grpc.add_PatientServiceServicer_to_server(
        PatientService(),
        server,
    )

    server.add_insecure_port(settings.patient_service_grpc_url)

    await server.start()

    print(f"Patient gRPC server started on {settings.patient_service_grpc_url}")

    return server

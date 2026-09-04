import asyncio

from app.db.db_service import connect_database, close_database
from app.grpc.server import start_grpc_server
from app.common.logger import get_logger

logger = get_logger("main")


async def main():
    logger.info("Initializing Patient Microservice...")
    await connect_database()
    grpc_server = await start_grpc_server()
    logger.success("Patient Microservice initialized and ready for incoming gRPC requests.")

    try:
        await grpc_server.wait_for_termination()
    finally:
        logger.info("Shutting down Patient Microservice...")
        await grpc_server.stop(grace=5)
        await close_database()
        logger.info("Patient Microservice shutdown complete.")


if __name__ == "__main__":
    asyncio.run(main())

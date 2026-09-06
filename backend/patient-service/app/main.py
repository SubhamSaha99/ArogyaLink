import asyncio
import signal
from app.db.db_service import connect_database, close_database, create_indexes
from app.grpc.server import start_grpc_server
from app.common.logger import get_logger
from app.redis.redis_service import RedisService

logger = get_logger("main")
redis_service = RedisService()


async def main():
    await connect_database()
    await create_indexes()
    await redis_service.ping()
    grpc_server = await start_grpc_server()

    shutdown_event = asyncio.Event()

    def shutdown_signal():
        logger.info("Shutdown signal received")
        shutdown_event.set()

    loop = asyncio.get_running_loop()

    loop.add_signal_handler(
        signal.SIGTERM,
        shutdown_signal,
    )

    loop.add_signal_handler(
        signal.SIGINT,
        shutdown_signal,
    )

    logger.info("Patient Service started successfully")

    try:
        await shutdown_event.wait()

    finally:
        logger.info("Stopping Patient Service...")

        await grpc_server.stop(grace=5)

        logger.info("gRPC server stopped")
        await redis_service.close()
        await close_database()
        logger.info("Patient Service shutdown completed")


if __name__ == "__main__":
    asyncio.run(main())

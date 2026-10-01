import asyncio
import signal

import uvicorn
from fastapi import FastAPI

from src.config.settings import settings
from src.common.logger.logger import getLogger
from src.db.db_service import (
    closeDatabase,
    connectDatabase,
    createIndexes,
)
from src.common.exceptions.handlers import registerExceptionHandlers
from src.grpc.server import startGrpcServer
from src.redis.redis_service import RedisService
from src.patient.patient_router import router as patientRouter


logger = getLogger("main")

redisService = RedisService()
redis_service = redisService


app = FastAPI(
    title="Patient Service",
    version="1.0.0",
)

registerExceptionHandlers(app)
app.include_router(
    patientRouter,
    prefix="/api",
)


async def main():
    
    await connectDatabase()
    await createIndexes()
    await redisService.ping()
    grpcServer = await startGrpcServer()

    # -------------------------
    # HTTP
    # -------------------------

    httpConfig = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=settings.port,
        log_level="info",
        reload=False
    )

    httpServer = uvicorn.Server(httpConfig)

    # -------------------------
    # Shutdown
    # -------------------------

    shutdownEvent = asyncio.Event()

    def shutdownSignal():
        logger.info("Shutdown signal received")
        shutdownEvent.set()

    loop = asyncio.get_running_loop()

    loop.add_signal_handler(
        signal.SIGTERM,
        shutdownSignal,
    )

    loop.add_signal_handler(
        signal.SIGINT,
        shutdownSignal,
    )

    # -------------------------
    # Start HTTP
    # -------------------------

    httpTask = asyncio.create_task(
        httpServer.serve()
    )

    logger.info(
        f"Patient Service HTTP server running on port {settings.port}"
    )

    try:

        await shutdownEvent.wait()

    finally:

        logger.info("Stopping Patient Service...")

        # Stop HTTP
        httpServer.should_exit = True

        await httpTask

        logger.info("HTTP server stopped")

        # Stop gRPC
        await grpcServer.stop(grace=5)
        logger.info("gRPC server stopped")

        # Stop Redis
        await redisService.close()

        # Close database
        await closeDatabase()

        logger.info(
            "Patient Service shutdown completed"
        )


if __name__ == "__main__":
    asyncio.run(main())
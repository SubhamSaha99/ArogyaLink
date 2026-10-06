import asyncio
from datetime import datetime, timezone
import os
import resource
import time
from typing import Any

from src.common.logger.logger import getLogger
from src.db.db_module import mongoClient
from src.redis.redis_service import RedisService
from src.config.settings import settings

logger = getLogger("health_service")
SERVICE_START_TIME = time.time()
TIMEOUT_SECONDS = 3.0


class HealthService:
    def __init__(self, redisService: RedisService | None = None):
        self.redisService = redisService or RedisService()

    def getLiveness(self) -> dict[str, Any]:
        return {
            "status": "ok",
            "service": "patient-service",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "uptime": int(time.time() - SERVICE_START_TIME),
        }

    async def check(self) -> dict[str, Any]:
        database, redis = await asyncio.gather(
            self.checkDatabase(),
            self.checkRedis(),
        )

        isHealthy = database["status"] == "up" and redis["status"] == "up"

        try:
            # On Linux ru_maxrss is reported in kilobytes
            rssMb = round(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024, 2)
        except Exception:
            rssMb = 0.0

        return {
            "status": "ok" if isHealthy else "degraded",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": "patient-service",
            "uptime": int(time.time() - SERVICE_START_TIME),
            "environment": settings.nodeEnv,
            "dependencies": {
                "database": database,
                "redis": redis,
            },
            "memory": {
                "rssMb": rssMb,
            },
        }

    async def checkDatabase(self) -> dict[str, Any]:
        start = time.time()
        try:
            await asyncio.wait_for(
                mongoClient.admin.command("ping"),
                timeout=TIMEOUT_SECONDS,
            )
            return {
                "status": "up",
                "responseTimeMs": round((time.time() - start) * 1000, 2),
            }
        except Exception as error:
            logger.error(f"MongoDB health check failed: {error}")
            return {
                "status": "down",
                "responseTimeMs": round((time.time() - start) * 1000, 2),
                "error": str(error),
            }

    async def checkRedis(self) -> dict[str, Any]:
        start = time.time()
        try:
            pong = await asyncio.wait_for(
                self.redisService.redis.ping(),
                timeout=TIMEOUT_SECONDS,
            )
            if pong:
                return {
                    "status": "up",
                    "responseTimeMs": round((time.time() - start) * 1000, 2),
                }
            return {
                "status": "down",
                "responseTimeMs": round((time.time() - start) * 1000, 2),
                "error": f"Unexpected response from Redis: {pong}",
            }
        except Exception as error:
            logger.error(f"Redis health check failed: {error}")
            return {
                "status": "down",
                "responseTimeMs": round((time.time() - start) * 1000, 2),
                "error": str(error),
            }


from redis.asyncio import Redis

from app.common.logger import get_logger
from app.redis.server import redis_client

logger = get_logger("RedisService")


class RedisService:
    def __init__(self):
        self.redis: Redis = redis_client

    async def ping(self):
        connected = await self.redis.ping()
        if connected:
            logger.info("Redis connected successfully")
        else:
            logger.error("Redis connection failed")

    async def get(self, key: str) -> str | None:
        value = await self.redis.get(key)
        return value.decode() if isinstance(value, bytes) else value

    async def set(
        self,
        key: str,
        value: str,
        ttl: int | None = None,
    ) -> None:

        if ttl is not None:
            await self.redis.set(key, value, ex=ttl)
            return

        await self.redis.set(key, value)

    async def increment(self, key: str) -> int:
        return await self.redis.incr(key)

    async def decrement(self, key: str) -> int:
        return await self.redis.decr(key)

    async def expire(self, key: str, seconds: int) -> bool:
        return bool(await self.redis.expire(key, seconds))

    async def delete(self, key: str) -> None:
        await self.redis.delete(key)

    async def exists(self, key: str) -> bool:
        return bool(await self.redis.exists(key))

    async def ttl(self, key: str) -> int:
        return await self.redis.ttl(key)

    async def setWithTTL(
        self,
        key: str,
        value: str,
        ttl: int,
    ) -> None:
        await self.redis.set(key, value, ex=ttl)

    def pipeline(self):
        return self.redis.pipeline()

    async def close(self) -> None:
        await self.redis.aclose()
        logger.info("Redis connection closed gracefully")

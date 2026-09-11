from redis.asyncio import Redis

from app.common.logger import get_logger
from app.redis.server import redis_client

logger = get_logger("RedisService")


class RedisService:

    def __init__(self):
        self.redis: Redis = redis_client

    # * Ping Redis
    async def ping(self) -> bool:
        connected = await self.redis.ping()

        if connected:
            logger.info("Redis connected successfully")
        else:
            logger.error("Redis connection failed")

        return bool(connected)

    # * Get key-value from Redis
    async def get(self, key: str) -> str | None:
        value = await self.redis.get(key)

        if isinstance(value, bytes):
            return value.decode()

        return value

    # * Set key-value from Redis
    async def set(
        self,
        key: str,
        value: str,
        ttl: int | None = None,
    ) -> None:
        if ttl is not None:
            await self.redis.set(
                key,
                value,
                ex=ttl,
            )
            return

        await self.redis.set(key, value)

    # * Delete key from redis
    async def delete(self, key: str) -> None:
        await self.redis.delete(key)

    # * Checking Existence of key in Redis
    async def exists(self, key: str) -> bool:
        return bool(await self.redis.exists(key))

    # * Returns the time-to-live of a key in redis
    async def ttl(self, key: str) -> int:
        return await self.redis.ttl(key)

    # * Setting key with time-to-live
    async def set_with_ttl(
        self,
        key: str,
        value: str,
        ttl: int,
    ) -> None:
        await self.redis.set(
            key,
            value,
            ex=ttl,
        )

    # * Returning redis pipeline
    def pipeline(self):
        return self.redis.pipeline()

    # * Set Distribution lock
    async def acquire_lock(
        self,
        key: str,
        token: str,
        ttl: int = 10,
    ) -> bool:
        result = await self.redis.set(
            key,
            token,
            nx=True,
            ex=ttl,
        )

        return result is True

    # * Release Distribution Lock
    async def release_lock(
        self,
        key: str,
        token: str,
    ) -> bool:
        script = """
        if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
        else
            return 0
        end
        """

        result = await self.redis.eval(
            script,
            1,
            key,
            token,
        )

        return result == 1

    # * Close Redis Connection
    async def close(self) -> None:
        await self.redis.aclose()
        logger.info("Redis connection closed gracefully")

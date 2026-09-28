import asyncio
import json
import random
import uuid
from collections.abc import Awaitable, Callable
from typing import TypeVar

from src.redis.redis_service import RedisService

T = TypeVar("T")


class RedisCacheService:

    def __init__(self):
        self.redisService = RedisService()
        self.redis_service = self.redisService

    async def getOrSet(
        self,
        key: str,
        fetcher: Callable[[], Awaitable[T]],
        ttl: int,
        lockTtl: int = 10,
        retries: int = 5,
        retryDelay: float = 0.05,
        jitter: int = 30,
    ) -> T:

        # 1. Check cache
        cached = await self.redisService.get(key)

        if cached:
            return json.loads(cached)

        # 2. Create distributed lock
        lockKey = f"lock:{key}"
        lockToken = str(uuid.uuid4())

        acquired = await self.redisService.acquireLock(
            lockKey,
            lockToken,
            lockTtl,
        )

        if acquired:
            try:
                # 3. Double-check cache
                cached = await self.redisService.get(key)

                if cached:
                    return json.loads(cached)

                # 4. Fetch from database
                data = await fetcher()

                # 5. Add TTL jitter
                finalTtl = ttl

                if jitter > 0:
                    finalTtl += random.randint(0, jitter)

                # 6. Store in Redis
                await self.redisService.set(
                    key,
                    json.dumps(data),
                    finalTtl,
                )

                return data

            finally:
                # 7. Release only our lock
                await self.redisService.releaseLock(
                    lockKey,
                    lockToken,
                )

        # 8. Another request owns the lock.
        # Wait for it to populate the cache.
        for _ in range(retries):
            await asyncio.sleep(retryDelay)

            cached = await self.redisService.get(key)

            if cached:
                return json.loads(cached)

        # 9. Lock holder failed.
        return await fetcher()

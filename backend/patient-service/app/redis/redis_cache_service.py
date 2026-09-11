import asyncio
import json
import random
import uuid
from collections.abc import Awaitable, Callable
from typing import TypeVar

from app.redis.redis_service import RedisService


T = TypeVar("T")


class RedisCacheService:

    def __init__(self):
        self.redis_service = RedisService()

    async def get_or_set(
        self,
        key: str,
        fetcher: Callable[[], Awaitable[T]],
        ttl: int,
        lock_ttl: int = 10,
        retries: int = 5,
        retry_delay: float = 0.05,
        jitter: int = 30,
    ) -> T:

        # 1. Check cache
        cached = await self.redis_service.get(key)

        if cached:
            return json.loads(cached)

        # 2. Create distributed lock
        lock_key = f"lock:{key}"
        lock_token = str(uuid.uuid4())

        acquired = await self.redis_service.acquire_lock(
            lock_key,
            lock_token,
            lock_ttl,
        )

        if acquired:
            try:
                # 3. Double-check cache
                cached = await self.redis_service.get(key)

                if cached:
                    return json.loads(cached)

                # 4. Fetch from database
                data = await fetcher()

                # 5. Add TTL jitter
                final_ttl = ttl

                if jitter > 0:
                    final_ttl += random.randint(0, jitter)

                # 6. Store in Redis
                await self.redis_service.set(
                    key,
                    json.dumps(data),
                    final_ttl,
                )

                return data

            finally:
                # 7. Release only our lock
                await self.redis_service.release_lock(
                    lock_key,
                    lock_token,
                )

        # 8. Another request owns the lock.
        # Wait for it to populate the cache.
        for _ in range(retries):
            await asyncio.sleep(retry_delay)

            cached = await self.redis_service.get(key)

            if cached:
                return json.loads(cached)

        # 9. Lock holder failed.
        return await fetcher()
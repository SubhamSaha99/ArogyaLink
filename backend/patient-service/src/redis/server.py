import redis.asyncio as redis

from src.config.settings import settings

redisClient = redis.Redis(
    host=settings.redisHostDev,
    port=settings.redisPort,
    decode_responses=True,
)


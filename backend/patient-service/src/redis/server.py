import redis.asyncio as redis

from src.config.settings import settings

redisClient = redis.Redis(
    host=settings.redisHost,
    port=settings.redisPort,
    decode_responses=True,
)


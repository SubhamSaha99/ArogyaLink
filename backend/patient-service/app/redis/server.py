import redis.asyncio as redis

from app.config.settings import settings


redis_client = redis.Redis(
    host=settings.redis_host_dev,
    port=settings.redis_port,
    decode_responses=True,
)
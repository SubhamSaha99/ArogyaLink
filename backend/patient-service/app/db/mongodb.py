from pymongo import AsyncMongoClient

from app.config.settings import settings
from app.common.logger import MongoQueryLogger

mongo_client = AsyncMongoClient(
    settings.mongodb_url,
    serverSelectionTimeoutMS=5000,
    event_listeners=[MongoQueryLogger()],
)

mongo_db = mongo_client[settings.mongodb_database]

from pymongo import AsyncMongoClient

from app.config.settings import settings

mongo_client = AsyncMongoClient(
    settings.mongodb_url,
    serverSelectionTimeoutMS=5000,
)

mongo_db = mongo_client[settings.mongodb_database]

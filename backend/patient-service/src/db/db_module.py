from src.common.logger.logger import MongoQueryLogger
from src.config.settings import settings
from pymongo import AsyncMongoClient

mongoClient = AsyncMongoClient(
    settings.mongodbUrl,
    serverSelectionTimeoutMS=5000,
    event_listeners=[MongoQueryLogger()],
)

mongoDb = mongoClient[settings.mongodbDatabase]

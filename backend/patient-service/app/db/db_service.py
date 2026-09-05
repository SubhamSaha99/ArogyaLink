from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING

from app.config.settings import settings
from app.db.mongodb import mongo_client, mongo_db
from app.common.logger import get_logger

logger = get_logger("database")

client: AsyncIOMotorClient | None = None
db = None


# * Connect Database
async def connect_database():
    try:
        await mongo_client.admin.command("ping")
        logger.info("MongoDB connected successfully")
    except Exception as error:
        logger.error(f"MongoDB connection failed: {error}")
        raise
    global client, db


# * Get Database
def get_database():
    return mongo_db


# * Close Database
async def close_database() -> None:
    try:
        await mongo_client.close()
        logger.info("MongoDB connection closed")
    except Exception as error:
        logger.error(f"Error while closing MongoDB: {error}")


# * Create DB Indexes
async def create_indexes():
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_database]

    await db.patient_profiles.create_index(
        [("patient_primary_key", ASCENDING)],
        unique=True,
        name="idx_patient_primary_key",
    )

    await db.patient_profiles.create_index(
        [("patient_id", ASCENDING)],
        unique=True,
        name="idx_patient_id",
    )
    logger.info("MongoDB indexes created")

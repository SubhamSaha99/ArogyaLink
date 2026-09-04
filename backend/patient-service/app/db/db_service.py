from app.db.mongodb import mongo_client, mongo_db
from app.common.logger import get_logger

logger = get_logger("database")


# Connect Database
async def connect_database() -> None:
    try:
        await mongo_client.admin.command("ping")
        logger.info("MongoDB connected successfully")
    except Exception as error:
        logger.error(f"MongoDB connection failed: {error}")
        raise


# Get Database
def get_database():
    return mongo_db


# Close Database
async def close_database() -> None:
    try:
        await mongo_client.close()
        logger.info("MongoDB connection closed")
    except Exception as error:
        logger.error(f"Error while closing MongoDB: {error}")

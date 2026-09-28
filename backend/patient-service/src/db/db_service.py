from src.common.logger.logger import getLogger
from src.db.db_module import mongoClient, mongoDb
from pymongo import ASCENDING

logger = getLogger("database")


# * Connect Database
async def connectDatabase():
    try:
        await mongoClient.admin.command("ping")
        logger.info("MongoDB connected successfully")
    except Exception as error:
        logger.error(f"MongoDB connection failed: {error}")
        raise


# * Get Database
def getDatabase():
    return mongoDb


# * Close Database
async def closeDatabase() -> None:
    try:
        await mongoClient.close()
        logger.info("MongoDB connection closed")
    except Exception as error:
        logger.error(f"Error while closing MongoDB: {error}")


# * Create DB Indexes
async def createIndexes():
    await mongoDb.patient_profiles.create_index(
        [("patient_primary_key", ASCENDING)],
        unique=True,
        name="idx_patient_primary_key",
    )

    await mongoDb.patient_profiles.create_index(
        [("patient_id", ASCENDING)],
        unique=True,
        name="idx_patient_id",
    )
    await mongoDb.patient_medical_records.create_index(
        [("doctor_primary_key", ASCENDING)],
        unique=False,
        name="idx_medical_record_doctor_primary_key",
    )
    await mongoDb.patient_medical_records.create_index(
        [("health_institute_primary_key", ASCENDING)],
        unique=False,
        name="idx_medical_record_health_institute_primary_key",
    )
    await mongoDb.patient_medical_records.create_index(
        [("patient_primary_key", ASCENDING)],
        unique=False,
        name="idx_medical_record_patient_primary_key",
    )
    await mongoDb.patient_medical_records.create_index(
        [("patient_id", ASCENDING)],
        unique=False,
        name="idx_medical_record_patient_id",
    )
    logger.info("MongoDB indexes created")

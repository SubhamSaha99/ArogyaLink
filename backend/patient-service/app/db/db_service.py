# app/database/database.py

from app.db.mongodb import mongo_client, mongo_db


# TODO: Connect Database
async def connect_database() -> None:
    try:
        await mongo_client.admin.command("ping")
        print("MongoDB connected successfully")
    except Exception as error:
        print(f"MongoDB connection failed: {error}")
        raise


# TODO: Get Database
def get_database():
    return mongo_db


# TODO: Close Database
async def close_database() -> None:
    try:
        await mongo_client.close()
        print("MongoDB connection closed")
    except Exception as error:
        print(f"Error while closing MongoDB: {error}")

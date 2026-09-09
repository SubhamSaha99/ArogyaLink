from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ReturnDocument

from app.common.interfaces.patient_interface import (
    PatientDetailsInterface,
    PatientProfileUpdateInterface,
)
from app.common.logger import get_logger
from app.db.db_service import get_database
from app.db.models.patient_entity import PatientProfile

logger = get_logger("patient_repository")


class PatientRepository:
    def __init__(self):
        self.db = get_database()
        self.collection = self.db["patient_profiles"]

    # * Create Patient
    async def create(
        self,
        patient_profile: PatientProfile,
    ) -> PatientProfile:

        data = patient_profile.model_dump()

        await self.collection.insert_one(data)

        return PatientProfile(**data)

    # * Get patient by patient primary key
    async def get_by_patient_primary_key(
        self,
        patient_primary_key: int,
    ) -> PatientDetailsInterface | None:

        document = await self.collection.find_one(
            {"patient_primary_key": patient_primary_key}
        )

        if not document:
            return None

        patient_details: PatientDetailsInterface = {
            "patient_profile_id": str(document.pop("_id")),
            "patient_primary_key": document["patient_primary_key"],
            "patient_id": document["patient_id"],
            "first_name": document["first_name"],
            "middle_name": document.get("middle_name"),
            "last_name": document["last_name"],
            "date_of_birth": document.get("date_of_birth"),
            "age": document.get("age"),
            "gender": document.get("gender"),
            "profile_image": document.get("profile_image"),
            "address": document.get("address"),
            "state_id": document.get("state_id"),
            "district_id": document.get("district_id"),
        }
        return patient_details

    # * Get Patient by _id
    async def get_patient_by_id(
        self,
        patient_profile_id: str,
    ) -> PatientProfile | None:
        try:
            profile_object_id = ObjectId(patient_profile_id)
        except InvalidId:
            raise ValueError("Invalid patient profile ID")

        document = await self.collection.find_one(
            {"_id": profile_object_id}, {"patient_id": 1}
        )

        if not document:
            return None

        document.pop("_id", None)

        return PatientProfile(**document)

    # * Get patient by primary key
    async def get_patient_by_primary_key(
        self, patient_primary_key: int
    ) -> PatientProfile | None:

        document = await self.collection.find_one(
            {"patient_primary_key": patient_primary_key}, {"patient_id": 1}
        )

        if not document:
            return None

        document.pop("_id", None)

        return PatientProfile(**document)

    # * Update Patient
    async def update_patient_profile(
        self,
        patient_profile_id: str,
        update_data: PatientProfileUpdateInterface,
    ) -> str | None:

        try:
            profile_object_id = ObjectId(patient_profile_id)
        except InvalidId:
            raise ValueError("Invalid patient profile ID")

        if not update_data:
            raise ValueError("No fields provided for update")

        update_query = {
            "$set": {
                **update_data,
                "updated_at": datetime.now(timezone.utc),
            }
        }

        result = await self.collection.find_one_and_update(
            {
                "_id": profile_object_id,
            },
            update_query,
            projection={
                "_id": 0,
                "patient_id": 1,
            },
            return_document=ReturnDocument.AFTER,
        )

        if not result:
            return None

        return result["patient_id"]

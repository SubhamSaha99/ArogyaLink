import re
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from pymongo import DESCENDING, ReturnDocument

from app.common.interfaces.patient_interface import (
    PatientDetailsInterface,
    PatientProfileUpdateInterface,
    PatientsListItemInterface,
    PatientsListResponseInterface,
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

        return patient_profile

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

        state_id = document.get("state_id")
        district_id = document.get("district_id")
        state_name = None
        district_name = None

        if state_id is not None:
            state_doc = await self.db["states"].find_one(
                {"state_id": state_id}, {"_id": 0, "state_name": 1}
            )
            if state_doc:
                state_name = state_doc.get("state_name")

        if district_id is not None:
            district_doc = await self.db["districts"].find_one(
                {"district_id": district_id}, {"_id": 0, "district_name": 1}
            )
            if district_doc:
                district_name = district_doc.get("district_name")

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
            "state_id": state_id,
            "state_name": state_name,
            "district_id": district_id,
            "district_name": district_name,
            "pincode": document.get("pincode"),
        }
        return patient_details

    # @ Update Patient
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

    # * Get Patients List with pagination and filters
    async def get_patients_list(
        self,
        offset: int = 0,
        limit: int = 10,
        search: str | None = None,
        state_id: int | None = None,
    ) -> PatientsListResponseInterface:
        filter_query: dict = {}

        if state_id is not None and state_id > 0:
            filter_query["state_id"] = state_id

        if search and search.strip():
            escaped_search = re.escape(search.strip())
            regex_search = {"$regex": escaped_search, "$options": "i"}
            filter_query["$or"] = [
                {"first_name": regex_search},
                {"middle_name": regex_search},
                {"last_name": regex_search},
                {"patient_id": regex_search},
            ]

        total = await self.collection.count_documents(filter_query)

        cursor = (
            self.collection.find(filter_query)
            .sort([("created_at", DESCENDING), ("_id", DESCENDING)])
            .skip(offset)
            .limit(limit)
        )

        patients: list[PatientsListItemInterface] = []
        async for doc in cursor:
            patients.append(
                {
                    "patient_primary_key": doc["patient_primary_key"],
                    "patient_id": doc["patient_id"],
                    "first_name": doc["first_name"],
                    "middle_name": doc.get("middle_name"),
                    "last_name": doc["last_name"],
                    "age": doc.get("age"),
                    "gender": doc.get("gender"),
                }
            )

        return {
            "patients": patients,
            "total": total,
            "offset": offset,
            "limit": limit,
        }

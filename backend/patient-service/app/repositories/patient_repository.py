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

    # * Get patient by patient primary key or patient id
    async def get_by_patient_primary_key(
        self,
        patient_primary_key: int | None = None,
        patient_id: str | None = None,
    ) -> PatientDetailsInterface | None:
        query: dict = {}
        if patient_primary_key is not None and patient_primary_key > 0:
            query["patient_primary_key"] = patient_primary_key
        elif patient_id and patient_id.strip():
            query["patient_id"] = patient_id.strip()
        else:
            return None

        document = await self.collection.find_one(query)

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
            "email": document["email"],
            "mobile": document["mobile"],
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
        doctor_primary_key: int | None = None,
        health_institute_primary_key: int | None = None,
    ) -> PatientsListResponseInterface:
        pipeline: list[dict] = []

        # 1. Base filtering on patient_profiles (state_id & search)
        match_query: dict = {}
        if state_id is not None and state_id > 0:
            match_query["state_id"] = state_id

        if search and search.strip():
            escaped_search = re.escape(search.strip())
            regex_search = {"$regex": escaped_search, "$options": "i"}
            match_query["$or"] = [
                {"first_name": regex_search},
                {"middle_name": regex_search},
                {"last_name": regex_search},
                {"patient_id": regex_search},
            ]

        if match_query:
            pipeline.append({"$match": match_query})

        # 2. Medical records filter (doctor_primary_key / health_institute_primary_key)
        medical_record_match: dict = {}
        if doctor_primary_key is not None and doctor_primary_key > 0:
            medical_record_match["doctor_primary_key"] = doctor_primary_key

        if (
            health_institute_primary_key is not None
            and health_institute_primary_key > 0
        ):
            medical_record_match["health_institute_primary_key"] = (
                health_institute_primary_key
            )

        if medical_record_match:
            pipeline.extend([
                {
                    "$lookup": {
                        "from": "patient_medical_records",
                        "let": {
                            "p_pk": "$patient_primary_key",
                            "p_id": "$patient_id",
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$or": [
                                            {
                                                "$eq": [
                                                    "$patient_primary_key",
                                                    "$$p_pk",
                                                ]
                                            },
                                            {"$eq": ["$patient_id", "$$p_id"]},
                                        ]
                                    },
                                    **medical_record_match,
                                }
                            },
                            {"$limit": 1},
                        ],
                        "as": "medical_records",
                    }
                },
                {
                    "$match": {
                        "medical_records.0": {"$exists": True},
                    }
                },
            ])

        # 3. Sorting
        pipeline.append(
            {"$sort": {"created_at": DESCENDING, "_id": DESCENDING}}
        )

        # 4. Pagination & Total Count Facet
        pipeline.append({
            "$facet": {
                "total_count": [{"$count": "count"}],
                "paginated_results": [
                    {"$skip": offset},
                    {"$limit": limit},
                ],
            }
        })

        cursor = await self.collection.aggregate(pipeline)
        facet_data = None
        async for doc in cursor:
            facet_data = doc
            break

        if facet_data:
            total_list = facet_data.get("total_count", [])
            total = total_list[0]["count"] if total_list else 0
            docs = facet_data.get("paginated_results", [])
        else:
            total = 0
            docs = []

        patients: list[PatientsListItemInterface] = []
        for doc in docs:
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

# app/repositories/patient_repository.py

from app.db.db_service import get_database
from app.db.models.patient_entity import PatientProfile


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
    ) -> PatientProfile | None:

        document = await self.collection.find_one(
            {"patient_primary_key": patient_primary_key}
        )

        if not document:
            return None

        document.pop("_id", None)

        return PatientProfile(**document)

    # * Update Patient
    async def update(
        self,
        patient_primary_key: int,
        update_data: dict,
    ) -> PatientProfile | None:

        result = await self.collection.find_one_and_update(
            {"patient_primary_key": patient_primary_key},
            {"$set": update_data},
            return_document=True,
        )

        if not result:
            return None

        result.pop("_id", None)

        return PatientProfile(**result)

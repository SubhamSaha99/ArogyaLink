from datetime import datetime, timezone

from app.db.models.patient_entity import PatientProfile
from app.repositories.patient_repository import PatientRepository


class PatientService:

    def __init__(self):
        self.patient_repository = PatientRepository()

    # * Create Patient Profile
    async def create_patient_profile(
        self, patient_profile: PatientProfile
    ) -> PatientProfile:

        # TODO: Check whether profile already exists
        existing_profile = await self.patient_repository.get_by_patient_primary_key(
            patient_profile.patient_primary_key
        )

        if existing_profile:
            raise ValueError("Patient profile already exists")

        # TODO: Create profile
        created_profile = await self.patient_repository.create(patient_profile)

        return created_profile

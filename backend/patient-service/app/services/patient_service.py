from datetime import datetime, timezone

from app.db.models.patient_entity import PatientProfile
from app.repositories.patient_repository import PatientRepository
from app.common.logger import get_logger

logger = get_logger("patient_service")


class PatientService:

    def __init__(self):
        self.patient_repository = PatientRepository()

    # Create Patient Profile
    async def create_patient_profile(
        self, patient_profile: PatientProfile
    ) -> PatientProfile:
        logger.info(
            f"Creating patient profile for patient_id={patient_profile.patient_id}, primary_key={patient_profile.patient_primary_key}"
        )

        existing_profile = await self.patient_repository.get_by_patient_primary_key(
            patient_profile.patient_primary_key
        )

        if existing_profile:
            logger.warning(
                f"Patient profile already exists with primary_key={patient_profile.patient_primary_key}"
            )
            raise ValueError("Patient profile already exists")

        created_profile = await self.patient_repository.create(patient_profile)
        logger.success(
            f"Patient profile created successfully with patient_id={created_profile.patient_id}"
        )

        return created_profile

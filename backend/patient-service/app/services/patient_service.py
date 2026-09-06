import json

from app.db.models.patient_entity import PatientProfile
from app.repositories.patient_repository import PatientRepository
from app.common.logger import get_logger
from app.common.interfaces.patient_interface import (
    PatientProfileUpdateInterface,
    PatientDetailsInterface,
)
from app.redis.redis_service import RedisService

logger = get_logger("patient_service")


class PatientService:

    def __init__(self):
        self.patient_repository = PatientRepository()
        self.redis_service = RedisService()

    # * Create Patient Profile
    async def create_patient_profile(
        self, patient_profile: PatientProfile
    ) -> PatientProfile:
        existing_profile = await self.patient_repository.get_by_patient_primary_key(
            patient_profile.patient_primary_key
        )

        if existing_profile:
            raise ValueError("Patient profile already exists")

        created_profile = await self.patient_repository.create(patient_profile)
        logger.success(
            f"Patient profile created successfully with patient_id={created_profile.patient_id}"
        )

        return created_profile

    # * Update patient profile
    async def update_patient_profile(
        self,
        patient_profile_id: str,
        patient_id: str,
        update_data: PatientProfileUpdateInterface,
    ) -> str:
        cache_key = f"patient:profile:{patient_id}"

        updated_patient_id = await self.patient_repository.update_patient_profile(
            patient_profile_id=patient_profile_id,
            update_data=update_data,
        )

        if updated_patient_id is None:
            raise ValueError("Patient profile not found!")

        logger.success(
            f"Patient profile updated successfully "
            f"with profile_id={patient_profile_id}"
        )

        await self.redis_service.delete(cache_key)

        return updated_patient_id

    # * Get Patient Details
    async def get_patient_details(
        self, patient_primary_key: int, patient_id: str
    ) -> PatientDetailsInterface:

        cache_key = f"patient:profile:{patient_id}"

        cached_patient = await self.redis_service.get(cache_key)

        if cached_patient:
            return json.loads(cached_patient)

        patient_details = await self.patient_repository.get_by_patient_primary_key(
            patient_primary_key
        )

        if patient_details is None:
            raise ValueError("Patient Details not found!")

        await self.redis_service.set(
            cache_key,
            json.dumps(patient_details),
            ttl=3600,
        )

        return patient_details

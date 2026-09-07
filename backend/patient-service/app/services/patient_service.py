import json

from app.common.interfaces.patient_interface import (
    PatientDetailsInterface,
    PatientProfileUpdateInterface,
)
from app.common.logger import get_logger
from app.db.models.medical_documents_entity import MedicalDocument
from app.db.models.medical_record_entity import MedicalRecord
from app.db.models.medication_entity import MedicalMedication
from app.db.models.patient_entity import PatientProfile
from app.redis.redis_service import RedisService
from app.repositories.medical_record_repository import MedicalRecordRepository
from app.repositories.patient_repository import PatientRepository

logger = get_logger("patient_service")


class PatientService:
    def __init__(self):
        self.patient_repository = PatientRepository()
        self.medical_record_repository = MedicalRecordRepository()
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
            f"Patient profile updated successfully with profile_id={patient_profile_id}"
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

    # * Create Patient Medical Record
    async def create_patient_medical_record(
        self,
        medical_record: MedicalRecord,
        medical_documents: list[MedicalDocument],
        medications: list[MedicalMedication],
    ) -> str:
        # 1. Verify patient exists
        patient = await self.patient_repository.get_by_patient_primary_key(
            medical_record.patient_primary_key
        )
        if patient is None:
            raise ValueError("Patient not found")

        # 2. Create the medical record in repository
        await self.medical_record_repository.create_medical_record(
            medical_record=medical_record,
            medical_documents=medical_documents,
            medications=medications,
        )

        logger.success(
            f"Medical record created successfully for patient_id={medical_record.patient_id}"
        )

        return medical_record.patient_id

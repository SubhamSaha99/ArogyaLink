import random

from app.common.interfaces.patient_interface import (
    MasterDataItemInterface,
    PatientDetailsInterface,
    PatientMedicalRecordDetailsResponseInterface,
    PatientMedicalRecordsResponseInterface,
    PatientProfileUpdateInterface,
    PatientsListResponseInterface,
)
from app.common.logger import get_logger
from app.db.models.medical_documents_entity import MedicalDocument
from app.db.models.medical_record_entity import MedicalRecord
from app.db.models.medication_entity import MedicalMedication
from app.db.models.patient_entity import PatientProfile
from app.repositories.master_data_repository import MasterDataRepository
from app.repositories.medical_record_repository import MedicalRecordRepository
from app.repositories.patient_repository import PatientRepository
from app.redis.redis_service import RedisService
from app.redis.redis_cache_service import RedisCacheService

logger = get_logger("patient_service")


class PatientService:
    def __init__(self):
        self.patient_repository = PatientRepository()
        self.medical_record_repository = MedicalRecordRepository()
        self.master_data_repository = MasterDataRepository()
        self.redis_service = RedisService()
        self.redis_cache_service = RedisCacheService()

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
        self,
        patient_primary_key: int,
        patient_id: str,
    ) -> PatientDetailsInterface:

        cache_key = f"patient:profile:{patient_id}"

        return await self.redis_cache_service.get_or_set(
            key=cache_key,
            fetcher=lambda: self._fetch_patient_details(patient_primary_key),
            ttl=3600,
            lock_ttl=10,
            jitter=random.randrange(300),
        )

    # * Fetch Patient Details
    async def _fetch_patient_details(
        self,
        patient_primary_key: int,
    ) -> PatientDetailsInterface:

        patient_details = await self.patient_repository.get_by_patient_primary_key(
            patient_primary_key
        )

        if patient_details is None:
            raise ValueError("Patient Details not found!")

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

    # * Get States
    async def get_states(self) -> list[MasterDataItemInterface]:
        cache_key = "states-patient-service"

        return await self.redis_cache_service.get_or_set(
            key=cache_key,
            fetcher=self.master_data_repository.get_all_states,
            ttl=3600,
            lock_ttl=10,
            jitter=random.randrange(300),
        )

    # * Get Districts
    async def get_districts(self, state_id: int) -> list[MasterDataItemInterface]:
        cache_key = f"districts-patient-service:{state_id}"

        return await self.redis_cache_service.get_or_set(
            key=cache_key,
            fetcher=lambda: self.master_data_repository.get_districts_by_state_id(
                state_id
            ),
            ttl=3600,
            lock_ttl=10,
            jitter=random.randrange(300),
        )

    # * Get Patients List
    async def get_patients_list(
        self,
        offset: int = 0,
        limit: int = 10,
        search: str | None = None,
        state_id: int | None = None,
    ) -> PatientsListResponseInterface:
        return await self.patient_repository.get_patients_list(
            offset=offset,
            limit=limit,
            search=search,
            state_id=state_id,
        )

    # * Get Patient Medical Records
    async def get_patient_medical_records(
        self,
        patient_primary_key: int,
        patient_id: str | None = None,
        offset: int = 0,
        limit: int = 10,
    ) -> PatientMedicalRecordsResponseInterface:
        return await self.medical_record_repository.get_patient_medical_records(
            patient_primary_key=patient_primary_key,
            patient_id=patient_id,
            offset=offset,
            limit=limit,
        )

    # * Get Patient Medical Record Details
    async def get_patient_medical_record_details(
        self, medical_record_id: str
    ) -> PatientMedicalRecordDetailsResponseInterface:
        cache_key = f"medical-record-id:{medical_record_id}"
        return await self.redis_cache_service.get_or_set(
            key=cache_key,
            fetcher=lambda: self.fetch_patient_medical_record_details(medical_record_id),
            ttl=3600,
            lock_ttl=10,
            jitter=random.randrange(300),
        )

    # * Fetch Patient Medical Record Details
    async def fetch_patient_medical_record_details(
        self, medical_record_id: str
    ) -> PatientMedicalRecordDetailsResponseInterface:
        record_details = (
            await self.medical_record_repository.get_medical_record_details(
                medical_record_id=medical_record_id
            )
        )
        if not record_details:
            raise ValueError("Medical record not found")
        return record_details

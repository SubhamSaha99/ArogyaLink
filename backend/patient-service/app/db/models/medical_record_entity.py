from datetime import date, datetime, timezone

from app.common.enums.medical_enums import MedicalRecordStatus
from pydantic import BaseModel, Field


class MedicalRecord(BaseModel):
    patient_primary_key: int
    patient_id: str
    doctor_primary_key: int
    doctor_id: str
    health_institute_primary_key: int
    health_institute_id: str
    title: str
    diagnosis: str
    description: str | None = None
    status: MedicalRecordStatus = MedicalRecordStatus.ACTIVE
    started_date: date
    resolved_date: date | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = None

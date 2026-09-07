from datetime import date, datetime, timezone

from app.common.enums.medical_enums import MedicationStatus
from pydantic import BaseModel, Field


class MedicalMedication(BaseModel):
    medical_record_id: str
    medication_name: str
    dosage: str
    start_date: date
    end_date: date | None = None
    status: MedicationStatus = MedicationStatus.ACTIVE
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = None

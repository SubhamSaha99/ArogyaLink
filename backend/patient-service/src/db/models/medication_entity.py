from datetime import date, datetime, timezone

from src.common.enums.medical_enums import MedicationStatus
from pydantic import BaseModel, ConfigDict, Field


class MedicalMedication(BaseModel):
    medicalRecordId: str = Field(..., alias="medical_record_id")
    medicationName: str = Field(..., alias="medication_name")
    dosage: str
    description: str | None = None
    startDate: date = Field(..., alias="start_date")
    endDate: date | None = Field(default=None, alias="end_date")
    status: MedicationStatus = MedicationStatus.ACTIVE
    createdAt: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), alias="created_at"
    )
    updatedAt: datetime | None = Field(default=None, alias="updated_at")

    model_config = ConfigDict(
        populate_by_name=True,
    )

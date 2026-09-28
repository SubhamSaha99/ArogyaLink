from datetime import date, datetime, timezone

from src.common.enums.medical_enums import MedicalRecordStatus
from pydantic import BaseModel, ConfigDict, Field


class MedicalRecord(BaseModel):
    patientPrimaryKey: int = Field(..., alias="patient_primary_key")
    patientId: str = Field(..., alias="patient_id")
    doctorPrimaryKey: int = Field(..., alias="doctor_primary_key")
    doctorId: str = Field(..., alias="doctor_id")
    healthInstitutePrimaryKey: int | None = Field(
        default=None, alias="health_institute_primary_key"
    )
    healthInstituteId: str | None = Field(default=None, alias="health_institute_id")
    title: str
    diagnosis: str
    description: str | None = None
    status: MedicalRecordStatus = MedicalRecordStatus.ACTIVE
    startedDate: date = Field(..., alias="started_date")
    resolvedDate: date | None = Field(default=None, alias="resolved_date")
    createdAt: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), alias="created_at"
    )
    updatedAt: datetime | None = Field(default=None, alias="updated_at")

    model_config = ConfigDict(
        populate_by_name=True,
    )

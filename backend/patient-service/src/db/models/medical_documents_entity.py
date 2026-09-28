from datetime import date, datetime, timezone

from src.common.enums.medical_enums import MedicalDocumentType
from pydantic import BaseModel, ConfigDict, Field


class MedicalDocument(BaseModel):
    medicalRecordId: str = Field(..., alias="medical_record_id")
    documentType: MedicalDocumentType = Field(..., alias="document_type")
    title: str
    description: str | None = None
    documentUrl: str = Field(..., alias="document_url")
    documentDate: date | None = Field(default=None, alias="document_date")
    createdAt: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), alias="created_at"
    )
    updatedAt: datetime | None = Field(default=None, alias="updated_at")

    model_config = ConfigDict(
        populate_by_name=True,
    )

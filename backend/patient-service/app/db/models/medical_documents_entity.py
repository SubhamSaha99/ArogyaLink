from datetime import date, datetime, timezone

from app.common.enums.medical_enums import MedicalDocumentType
from pydantic import BaseModel, Field


class MedicalDocument(BaseModel):
    medical_record_id: str
    document_type: MedicalDocumentType
    title: str
    document_url: str
    document_date: date | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = None

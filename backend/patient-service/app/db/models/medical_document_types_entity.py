from datetime import datetime, timezone

from pydantic import BaseModel, Field


class MedicalDocumentType(BaseModel):
    document_type_id: int
    document_type_name: str = Field(..., max_length=100)
    document_type_code: str = Field(..., max_length=50)
    description: str | None = Field(
        default=None,
        max_length=500,
    )
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

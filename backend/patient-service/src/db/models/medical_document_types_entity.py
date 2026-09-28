from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field


class MedicalDocumentType(BaseModel):
    documentTypeId: int = Field(..., alias="document_type_id")
    documentTypeName: str = Field(..., alias="document_type_name", max_length=100)
    documentTypeCode: str = Field(..., alias="document_type_code", max_length=50)
    description: str | None = Field(
        default=None,
        max_length=500,
    )
    isActive: bool = Field(default=True, alias="is_active")
    createdAt: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), alias="created_at"
    )

    model_config = ConfigDict(
        populate_by_name=True,
    )

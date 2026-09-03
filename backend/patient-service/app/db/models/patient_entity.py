from datetime import date, datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class PatientProfile(BaseModel):
    patient_primary_key: int = Field(..., description="Primary key from auth service")
    patient_id: str = Field(..., max_length=50)
    first_name: str = Field(..., max_length=255)
    middle_name: Optional[str] = Field(default=None, max_length=255)
    last_name: str = Field(..., max_length=255)
    date_of_birth: Optional[date] = None
    gender: Optional[int] = None
    profile_image: Optional[str] = Field(default=None, max_length=255)
    address: Optional[str] = Field(default=None, max_length=300)
    state_id: Optional[int] = None
    district_id: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

from datetime import date, datetime, timezone

from pydantic import BaseModel, Field


class PatientProfile(BaseModel):
    patient_primary_key: int = Field(..., description="Primary key from auth service")
    patient_id: str = Field(..., max_length=50)
    first_name: str = Field(..., max_length=255)
    middle_name: str | None = Field(default=None, max_length=255)
    last_name: str = Field(..., max_length=255)
    date_of_birth: date | None = None
    age: int | None = None
    gender: int | None = None
    profile_image: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None, max_length=300)
    state_id: int | None = None
    district_id: int | None = None
    pincode: int | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = None

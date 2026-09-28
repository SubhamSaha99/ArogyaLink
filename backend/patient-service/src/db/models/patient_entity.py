from datetime import date, datetime, timezone

from pydantic import BaseModel, ConfigDict, Field


class PatientProfile(BaseModel):
    patientPrimaryKey: int = Field(
        ..., alias="patient_primary_key", description="Primary key from auth service"
    )
    patientId: str = Field(..., alias="patient_id", max_length=50)
    firstName: str = Field(..., alias="first_name", max_length=255)
    middleName: str | None = Field(default=None, alias="middle_name", max_length=255)
    lastName: str = Field(..., alias="last_name", max_length=255)
    email: str = Field(..., max_length=255)
    mobile: str = Field(..., max_length=20)
    dateOfBirth: date | None = Field(default=None, alias="date_of_birth")
    age: int | None = None
    gender: int | None = None
    profileImage: str | None = Field(default=None, alias="profile_image", max_length=255)
    address: str | None = Field(default=None, max_length=300)
    stateId: int | None = Field(default=None, alias="state_id")
    districtId: int | None = Field(default=None, alias="district_id")
    pincode: int | None = None
    createdAt: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), alias="created_at"
    )
    updatedAt: datetime | None = Field(default=None, alias="updated_at")

    model_config = ConfigDict(
        populate_by_name=True,
    )

import re

from fastapi import Form
from pydantic import BaseModel, field_validator, Field
from typing import Optional

from src.common.enums.medical_enums import MedicalDocumentType, MedicationStatus


class GetPatientDetailsDto(BaseModel):
    """
    * @descrption get patient details dto
    """

    patientPrimaryKey: int | None = None
    patientId: str | None = None


class PatientProfileDetailsDto(BaseModel):
    """
    * @descrption update patient profile details dto
    """

    patientProfileId: str
    firstName: Optional[str] = Field(None, min_length=2, max_length=255)
    middleName: Optional[str] = Field(None, min_length=1, max_length=255)
    lastName: Optional[str] = Field(None, min_length=1, max_length=255)
    dateOfBirth: Optional[str] = None
    age: Optional[int] = Field(None, ge=0)
    gender: Optional[int] = None
    address: Optional[str] = Field(None, min_length=1, max_length=300)
    stateId: Optional[int] = None
    districtId: Optional[int] = None
    pincode: Optional[int] = None

    @field_validator(
        "firstName",
        "middleName",
        "lastName",
        "address",
        mode="before",
    )
    @classmethod
    def stripStrings(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("gender")
    @classmethod
    def validateGender(cls, value):
        if value is not None and value not in (1, 2, 3):
            raise ValueError("Gender must be 1 (Male), 2 (Female), or 3 (Other)")
        return value

    @classmethod
    def asForm(
        cls,
        patientProfileId: str = Form(...),
        firstName: str | None = Form(None),
        middleName: str | None = Form(None),
        lastName: str | None = Form(None),
        dateOfBirth: str | None = Form(None),
        age: int | None = Form(None),
        gender: int | None = Form(None),
        address: str | None = Form(None),
        stateId: int | None = Form(None),
        districtId: int | None = Form(None),
        pincode: int | None = Form(None),
    ):
        return cls(
            patientProfileId=patientProfileId,
            firstName=firstName,
            middleName=middleName,
            lastName=lastName,
            dateOfBirth=dateOfBirth,
            age=age,
            gender=gender,
            address=address,
            stateId=stateId,
            districtId=districtId,
            pincode=pincode,
        )


class GetPatientsListDto(BaseModel):
    """
    * @descrption get patients list dto
    """

    offset: Optional[int] = Field(0, ge=0)
    limit: Optional[int] = Field(10, ge=0)
    search: Optional[str] = Field(None, max_length=100)
    stateId: Optional[int] = Field(None)
    doctorPrimaryKey: Optional[int] = Field(None)
    healthInstitutePrimaryKey: Optional[int] = Field(None)


class MedicalDocumentDto(BaseModel):
    """
    * @descrption medical documents dto
    """

    medicalRecordId: Optional[str] = None
    medicalRecrodId: Optional[str] = None
    documentType: MedicalDocumentType
    title: str
    description: Optional[str] = None
    documentDate: Optional[str] = None

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_strings(cls, value):
        if isinstance(value, str):
            return value.strip()

        return value

    @field_validator("title")
    @classmethod
    def validate_title(cls, value):
        if not value:
            raise ValueError("Title cannot be empty")

        return value

    @field_validator("documentDate")
    @classmethod
    def validate_document_date(cls, value):
        if value is None:
            return value

        if not re.fullmatch(
            r"\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])",
            value,
        ):
            raise ValueError("Document date must be in YYYY-MM-DD format")

        return value


class MedicalMedicationDto(BaseModel):
    """
    * @descrption medications dto
    """

    medicationName: str
    dosage: str
    description: Optional[str] = None
    startDate: str

    @field_validator(
        "medicationName",
        "dosage",
        "description",
        mode="before",
    )
    @classmethod
    def strip_strings(cls, value):
        if isinstance(value, str):
            return value.strip()

        return value

    @field_validator("medicationName", "dosage")
    @classmethod
    def validate_required_strings(cls, value):
        if not value:
            raise ValueError("Field cannot be empty")

        return value

    @field_validator("startDate")
    @classmethod
    def validate_start_date(cls, value):
        if not re.fullmatch(
            r"\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])",
            value,
        ):
            raise ValueError("Start date must be in YYYY-MM-DD format")

        return value


class CreateMedicalRecordDto(BaseModel):
    """
    * @descrption insert medical record dto
    """

    patientPrimaryKey: int
    patientId: str
    healthInstitutePrimaryKey: Optional[int] = None
    healthInstituteId: Optional[str] = None
    doctorPrimaryKey: Optional[int] = None
    doctorId: Optional[str] = None
    title: str
    diagnosis: str
    description: Optional[str] = None
    startedDate: str
    medicalDocuments: Optional[list[MedicalDocumentDto]] = None
    medications: Optional[list[MedicalMedicationDto]] = None

    @field_validator(
        "patientId",
        "healthInstituteId",
        "doctorId",
        "title",
        "diagnosis",
        "description",
        mode="before",
    )
    @classmethod
    def strip_strings(cls, value):
        if isinstance(value, str):
            return value.strip()

        return value

    @field_validator("title", "diagnosis")
    @classmethod
    def validate_required_strings(cls, value):
        if not value:
            raise ValueError("Field cannot be empty")

        return value

    @field_validator("startedDate")
    @classmethod
    def validate_started_date(cls, value):
        if not re.fullmatch(
            r"\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])",
            value,
        ):
            raise ValueError("Started date must be in YYYY-MM-DD format")

        return value


class UpdateMedicationItemDto(BaseModel):
    """
    * @descrption medication item dto
    """
    medicationId: Optional[str] = None
    medicationName: Optional[str] = None
    dosage: Optional[str] = None
    description: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    status: Optional[MedicationStatus] = None

    @field_validator(
        "medicationId",
        "medicationName",
        "dosage",
        "description",
        "startDate",
        "endDate",
        mode="before",
    )
    @classmethod
    def strip_strings(cls, value):
        if isinstance(value, str):
            return value.strip()

        return value

    @field_validator("startDate", "endDate")
    @classmethod
    def validate_dates(cls, value):

        if value is None:
            return value

        import re

        if not re.fullmatch(
            r"\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])",
            value,
        ):
            raise ValueError("Date must be in YYYY-MM-DD format")

        return value

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, value):

        if value is None:
            return value

        try:
            status = int(value)
        except (TypeError, ValueError):
            raise ValueError(
                "Status must be 1 (Active), 2 (Completed), "
                "3 (Discontinued), or 4 (On Hold)"
            )

        if status not in (1, 2, 3, 4):
            raise ValueError(
                "Status must be 1 (Active), 2 (Completed), "
                "3 (Discontinued), or 4 (On Hold)"
            )

        return status


class UpdateMedicationsDto(BaseModel):
    """
    * @descrption update medications dto
    """

    patientId: str
    medicalRecordId: str
    medications: list[UpdateMedicationItemDto] = Field(
        ...,
        min_length=1,
    )

    @field_validator(
        "patientId",
        "medicalRecordId",
        mode="before",
    )
    @classmethod
    def strip_strings(cls, value):

        if isinstance(value, str):
            return value.strip()

        return value

    @field_validator("patientId", "medicalRecordId")
    @classmethod
    def validate_required_strings(cls, value):

        if not value:
            raise ValueError("Field cannot be empty")

        return value

class GetPatientMedicalRecordsDto(BaseModel):
    patientPrimaryKey: Optional[int] = None
    patientId: Optional[str] = None
    offset: Optional[int] = Field(default=0)
    limit: Optional[int] = Field(default=10)
from fastapi import HTTPException, Request
from starlette.datastructures import UploadFile

from src.patient.patient_dto import (
    CreateMedicalRecordDto,
    MedicalDocumentDto,
    MedicalMedicationDto,
    MedicalDocumentType,
)


async def parseMedicalRecordForm(
    request: Request,
) -> tuple[
    CreateMedicalRecordDto,
    list[tuple[int, UploadFile]],
]:
    form = await request.form()

    def getString(key: str) -> str | None:
        value = form.get(key)

        if value is None:
            return None

        if isinstance(value, UploadFile):
            return None

        return str(value).strip()

    def getRequiredString(key: str) -> str:
        value = getString(key)

        if not value:
            raise HTTPException(
                status_code=400,
                detail=f"{key} is required",
            )

        return value

    def getInt(key: str) -> int | None:
        value = getString(key)

        if value is None or value == "":
            return None

        try:
            return int(value)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"{key} must be an integer",
            )

    # ---------------------------------------------------------
    # Main medical record
    # ---------------------------------------------------------

    patientPrimaryKey = getInt("patientPrimaryKey")

    if patientPrimaryKey is None:
        raise HTTPException(
            status_code=400,
            detail="patientPrimaryKey is required",
        )

    patientId = getRequiredString("patientId")

    healthInstitutePrimaryKey = getInt("healthInstitutePrimaryKey")

    healthInstituteId = getString("healthInstituteId")

    doctorPrimaryKey = getInt("doctorPrimaryKey")

    doctorId = getString("doctorId")

    title = getRequiredString("title")

    diagnosis = getRequiredString("diagnosis")

    description = getString("description")

    startedDate = getRequiredString("startedDate")

    # ---------------------------------------------------------
    # Medical documents
    # ---------------------------------------------------------

    medicalDocuments: list[MedicalDocumentDto] = []

    documentFiles: list[tuple[int, UploadFile]] = []
    index = 0

    while True:

        documentTypeKey = f"medicalDocuments[{index}].documentType"

        titleKey = f"medicalDocuments[{index}].title"

        descriptionKey = f"medicalDocuments[{index}].description"

        documentDateKey = f"medicalDocuments[{index}].documentDate"

        fileKey = f"medicalDocuments[{index}].file"

        # Stop when this document doesn't exist
        if documentTypeKey not in form and titleKey not in form and fileKey not in form:
            break

        documentTypeValue = getInt(documentTypeKey)

        if documentTypeValue is None:
            raise HTTPException(
                status_code=400,
                detail=f"{documentTypeKey} is required",
            )

        documentTitle = getString(titleKey)

        if not documentTitle:
            raise HTTPException(
                status_code=400,
                detail=f"{titleKey} is required",
            )

        try:
            documentType = MedicalDocumentType(documentTypeValue)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid document type: {documentTypeValue}",
            )

        document = MedicalDocumentDto(
            documentType=documentType,
            title=documentTitle,
            description=getString(descriptionKey),
            documentDate=getString(documentDateKey),
        )

        medicalDocuments.append(document)

        # ---------------------------------------------
        # Get corresponding file
        # ---------------------------------------------

        uploadedFile = form.get(fileKey)

        if uploadedFile is not None:

            if not isinstance(
                uploadedFile,
                UploadFile,
            ):
                raise HTTPException(
                    status_code=400,
                    detail=f"{fileKey} must be a file",
                )

            documentFiles.append(
                (
                    index,
                    uploadedFile,
                )
            )

        index += 1

    # ---------------------------------------------------------
    # Medications
    # ---------------------------------------------------------

    medications: list[MedicalMedicationDto] = []

    index = 0

    while True:

        medicationNameKey = f"medications[{index}].medicationName"

        dosageKey = f"medications[{index}].dosage"

        descriptionKey = f"medications[{index}].description"

        startDateKey = f"medications[{index}].startDate"

        if medicationNameKey not in form:
            break

        medicationName = getRequiredString(medicationNameKey)

        dosage = getRequiredString(dosageKey)

        startDate = getRequiredString(startDateKey)

        medication = MedicalMedicationDto(
            medicationName=medicationName,
            dosage=dosage,
            description=getString(descriptionKey),
            startDate=startDate,
        )

        medications.append(medication)

        index += 1

    # ---------------------------------------------------------
    # Create DTO
    # ---------------------------------------------------------

    requestDto = CreateMedicalRecordDto(
        patientPrimaryKey=patientPrimaryKey,
        patientId=patientId,
        healthInstitutePrimaryKey=healthInstitutePrimaryKey,
        healthInstituteId=healthInstituteId,
        doctorPrimaryKey=doctorPrimaryKey,
        doctorId=doctorId,
        title=title,
        diagnosis=diagnosis,
        description=description,
        startedDate=startedDate,
        medicalDocuments=(medicalDocuments if medicalDocuments else None),
        medications=(medications if medications else None),
    )

    return requestDto, documentFiles


async def parseMedicalDocumentsForm(
    request: Request,
) -> tuple[str, str, list[tuple[MedicalDocumentDto, UploadFile | None]]]:

    form = await request.form()

    patientId = str(form["patientId"])
    medicalRecordId = str(form["medicalRecordId"])

    medicalDocuments: list[tuple[MedicalDocumentDto, UploadFile | None]] = []

    index = 0

    while True:
        documentTypeKey = f"medicalDocuments[{index}].documentType"

        titleKey = f"medicalDocuments[{index}].title"

        descriptionKey = f"medicalDocuments[{index}].description"

        documentDateKey = f"medicalDocuments[{index}].documentDate"

        fileKey = f"medicalDocuments[{index}].file"

        # Stop when the next document doesn't exist
        if documentTypeKey not in form and titleKey not in form and fileKey not in form:
            break

        documentTypeValue = form.get(documentTypeKey)
        titleValue = form.get(titleKey)

        if documentTypeValue is None:
            raise ValueError(f"{documentTypeKey} is required")

        if titleValue is None:
            raise ValueError(f"{titleKey} is required")

        try:
            documentType = MedicalDocumentType(int(str(documentTypeValue)))
        except (ValueError, TypeError):
            raise ValueError(f"Invalid document type for document {index}")

        file: UploadFile | None = None

        fileValue = form.get(fileKey)

        if isinstance(fileValue, UploadFile):
            file = fileValue

        document = MedicalDocumentDto(
            medicalRecordId=medicalRecordId,
            documentType=documentType,
            title=str(titleValue),
            description=(str(form[descriptionKey]) if descriptionKey in form else None),
            documentDate=(
                str(form[documentDateKey]) if documentDateKey in form else None
            ),
        )

        medicalDocuments.append((document, file))

        index += 1

    return (
        patientId,
        medicalRecordId,
        medicalDocuments,
    )

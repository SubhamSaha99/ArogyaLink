import random
from datetime import date
from typing import Any, cast

from bson import ObjectId
from fastapi import UploadFile, HTTPException, status
from starlette.datastructures import UploadFile as StarletteUploadFile

from src.common.logger.logger import getLogger
from src.redis.redis_service import RedisService
from src.redis.redis_cache_service import RedisCacheService
from src.patient.patient_repository import PatientRepository
from src.db.models.patient_entity import PatientProfile
from src.patient.patient_dto import (
    PatientProfileDetailsDto,
    GetPatientsListDto,
    CreateMedicalRecordDto,
    MedicalDocumentDto,
    UpdateMedicationsDto,
)
from src.common.interfaces.patient_interface import (
    PatientDetailsInterface,
    UpdatePatientResponseInterface,
    PatientProfileUpdateInterface,
    PatientsListResponseInterface,
    MasterDataItemInterface,
    UpdateMedicalRecordRsponseInterface,
    PatientMedicalRecordsResponseInterface,
    PatientMedicalRecordDetailsResponseInterface,
)
from src.config.settings import settings
from src.common.utils.multipart_config import saveFile
from src.common.utils.file_util import moveFile, deleteFile
from src.db.models.medical_documents_entity import MedicalDocument
from src.db.models.medical_record_entity import MedicalRecord
from src.db.models.medication_entity import MedicalMedication

logger = getLogger("patientService")


class PatientService:
    def __init__(self) -> None:
        self.patientRepository = PatientRepository()
        self.redisService = RedisService()
        self.redisCacheService = RedisCacheService()

    async def createPatient(self, patientProfile: PatientProfile) -> PatientProfile:
        """
        * @description create patient service
        * @params self, patientProfile
        * @returns PatientProfile
        """
        existingProfile = await self.patientRepository.getPatientDetails(
            patientProfile.patientPrimaryKey
        )

        if existingProfile:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Patient profile already exists!",
            )

        createdProfile = await self.patientRepository.createPatient(patientProfile)

        return createdProfile

    async def updatePatientProfileDetails(
        self,
        request: PatientProfileDetailsDto,
        patientId: str,
        profileImage: UploadFile | None = None,
    ) -> UpdatePatientResponseInterface:
        """
        * @description update patient profile details service
        * @params request, user, profileImage
        * @returns: updatePatientResponseInterface
        """
        profileImagePath = None
        try:
            if profileImage:
                filename = await saveFile(profileImage)

                profileImagePath = await moveFile(
                    f"uploads/temp/{filename}",
                    f"patient-profile/{patientId}",
                )

            updateData = cast(
                PatientProfileUpdateInterface,
                request.model_dump(exclude_none=True),
            )
            if profileImagePath:
                updateData["profileImage"] = profileImagePath

            result = await self.patientRepository.updatePatientProfile(
                patientProfileId=request.patientProfileId,
                updateData=updateData,
            )

            if result is None:
                raise HTTPException(
                    status_code=status.HTTP_417_EXPECTATION_FAILED,
                    detail="Patient profile update failed!",
                )

            return {"patientId": result}
        except Exception:
            if profileImagePath:
                await deleteFile(profileImagePath)
            raise

    async def getPatientDetails(
        self,
        patientPrimaryKey: int | None = None,
        patientId: str | None = None,
    ) -> PatientDetailsInterface:
        """
        * @description get patient details service
        * @params self, patientPrimaryKey, patientId
        * @returns PatientDetailsInterface
        """

        cacheKey = f"patient:profile:{patientId}"

        async def fetchPatient() -> PatientDetailsInterface:
            patientDetails = await self.patientRepository.getPatientDetails(
                patientPrimaryKey
            )

            if patientDetails is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Patient Details not found!",
                )

            profileImagePath = patientDetails.get("profileImage")
            profileImage = (
                f"{settings.apiBaseUrl}/uploads/{profileImagePath}"
                if profileImagePath
                else None
            )
            patientDetails["profileImage"] = profileImage

            return patientDetails

        return await self.redisCacheService.getOrSet(
            key=cacheKey,
            fetcher=lambda: fetchPatient(),
            ttl=3600,
            lockTtl=10,
            jitter=random.randrange(300),
        )

    async def getPatientList(
        self,
        request: GetPatientsListDto,
        doctorPrimaryKey: int | None = None,
        healthInstitutePrimaryKey: int | None = None,
    ) -> PatientsListResponseInterface:
        """
        * @decription get patient list service
        * @params request, doctorPrimaryKey, healthInstitutePrimaryKey
        * returns PatientsListResponseInterface
        """
        return await self.patientRepository.getPatientsList(
            request=request,
            doctorPrimaryKey=doctorPrimaryKey,
            healthInstitutePrimaryKey=healthInstitutePrimaryKey,
        )

    async def getStates(self) -> list[MasterDataItemInterface]:
        """
        * @description get states list service
        * @params self
        * @returns MasterDataItemInterface[]
        """
        cache_key = "states-patient-service"

        return await self.redisCacheService.getOrSet(
            key=cache_key,
            fetcher=lambda: self.patientRepository.getStates(),
            ttl=3600,
            lockTtl=10,
            jitter=random.randrange(300),
        )

    async def getDistricts(self, id: int) -> list[MasterDataItemInterface]:
        """
        * @description get district list service
        * @params self, id
        * returns MasterDataItemInterface[]
        """
        cache_key = f"districts-patient-service:{id}"

        return await self.redisCacheService.getOrSet(
            key=cache_key,
            fetcher=lambda: self.patientRepository.getDistricts(id),
            ttl=3600,
            lockTtl=10,
            jitter=random.randrange(300),
        )

    async def createPatientMedicalRecord(
        self,
        request: CreateMedicalRecordDto,
        doctorPrimaryKey: int | None = None,
        doctorId: str | None = None,
        healthInstitutePrimaryKey: int | None = None,
        healthInstituteId: str | None = None,
        files: list[tuple[int, StarletteUploadFile]] | None = None,
    ) -> UpdateMedicalRecordRsponseInterface:
        """
        * @description create patient medical record service
        * @params self, request, doctorPrimaryKey, doctorId, healthInstitutePrimaryKey, healthInstituteId, files
        * @returns CreateMedicalRecordResposneInterface
        """
        movedFiles: list[str] = []
        try:
            patient = await self.patientRepository.getPatientDetails(
                request.patientPrimaryKey
            )

            if patient is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Patient Details not found!",
                )

            medicalRecord = MedicalRecord(
                patient_primary_key=request.patientPrimaryKey,
                patient_id=request.patientId,
                doctor_primary_key=cast(int, doctorPrimaryKey),
                doctor_id=cast(str, doctorId),
                health_institute_primary_key=healthInstitutePrimaryKey,
                health_institute_id=healthInstituteId,
                title=request.title,
                diagnosis=request.diagnosis,
                description=request.description,
                started_date=date.fromisoformat(request.startedDate),
            )

            medicalRecordId = str(ObjectId())
            medicalDocuments: list[MedicalDocument] = []

            requestDocuments = request.medicalDocuments or []
            uploadedFiles = dict(files or [])

            for index, document in enumerate(requestDocuments):

                documentPath = None
                file = uploadedFiles.get(index)

                if file is not None and file.filename:

                    filename = await saveFile(file)

                    tempPath = f"uploads/temp/{filename}"

                    documentPath = await moveFile(
                        tempPath,
                        f"medical-record/{request.patientId}",
                    )

                    movedFiles.append(f"uploads/{documentPath}")

                medicalDocument = MedicalDocument(
                    medical_record_id=medicalRecordId,
                    document_type=document.documentType,
                    title=document.title,
                    description=document.description,
                    document_date=(
                        date.fromisoformat(document.documentDate)
                        if document.documentDate is not None
                        else None
                    ),
                    document_url=documentPath or "",
                )

                medicalDocuments.append(medicalDocument)

            medications: list[MedicalMedication] = []

            for medication in request.medications or []:

                medicalMedication = MedicalMedication(
                    medical_record_id=medicalRecordId,
                    medication_name=medication.medicationName,
                    dosage=medication.dosage,
                    description=medication.description,
                    start_date=date.fromisoformat(medication.startDate),
                )

                medications.append(medicalMedication)

            await self.patientRepository.createMedicalRecord(
                medicalRecord=medicalRecord,
                medicalDocuments=medicalDocuments,
                medications=medications,
                medicalRecordId=medicalRecordId,
            )
            return {"medicalRecordId": medicalRecordId}

        except Exception as error:

            logger.error(f"Failed to create medical record: {error}")
            for filePath in movedFiles:
                await deleteFile(filePath)
            raise

    async def uploadMedicalDocuments(
        self,
        patientId: str,
        medicalRecordId: str,
        medicalDocuments: list[tuple[MedicalDocumentDto, StarletteUploadFile | None]],
    ) -> UpdateMedicalRecordRsponseInterface:
        """
        * @description upload medical documents service
        * @params self, patientId, medicalRecordId, medicalDocuments
        * @returns UpdateMedicalRecordRsponseInterface
        """
        movedFiles: list[str] = []

        try:

            documents: list[MedicalDocument] = []

            for document, file in medicalDocuments:

                documentUrl = ""

                if file is not None and file.filename:

                    filename = await saveFile(file)
                    tempPath = f"uploads/temp/{filename}"
                    documentUrl = await moveFile(
                        tempPath,
                        f"medical-record/{patientId}",
                    )

                    movedFiles.append(f"uploads/{documentUrl}")

                medicalDocument = MedicalDocument(
                    medical_record_id=medicalRecordId,
                    document_type=document.documentType,
                    title=document.title,
                    description=document.description,
                    document_date=(
                        date.fromisoformat(document.documentDate)
                        if document.documentDate is not None
                        else None
                    ),
                    document_url=documentUrl,
                )

                documents.append(medicalDocument)
            medicalRecordId = await self.patientRepository.uploadMedicalDocuments(
                patientId=patientId,
                medicalRecordId=medicalRecordId,
                medicalDocuments=documents,
            )

            return {"medicalRecordId": medicalRecordId}

        except Exception as error:

            logger.error(f"Failed to upload medical documents: {error}")
            for filePath in movedFiles:
                await deleteFile(filePath)

            raise

    async def updateMedications(
        self,
        request: UpdateMedicationsDto,
    ) -> UpdateMedicalRecordRsponseInterface:
        """
        * @description update medications service
        * @params self, request
        * @returns UpdateMedicalRecordRsponseInterface
        """
        try:
            medications: list[dict | MedicalMedication] = []

            for medication in request.medications:

                medicationData: dict[str, Any] = {
                    "medication_id": (medication.medicationId),
                    "medication_name": (medication.medicationName),
                    "dosage": medication.dosage,
                    "description": medication.description,
                    "start_date": medication.startDate,
                    "end_date": medication.endDate,
                    "status": (
                        int(medication.status)
                        if medication.status is not None
                        else None
                    ),
                }

                medications.append(
                    cast(dict[str, Any] | MedicalMedication, medicationData)
                )

            result = await self.patientRepository.updateMedications(
                medicalRecordId=request.medicalRecordId,
                medications=medications,
            )

            return {"medicalRecordId": result}

        except Exception as error:
            logger.error(
                f"Failed to update medications for medical record "
                f"(id={request.medicalRecordId}): {error}"
            )
            raise

    async def getPatientMedicalRecords(
        self,
        patientPrimaryKey: int | None,
        patientId: str | None,
        offset: int = 0,
        limit: int = 10,
    ) -> PatientMedicalRecordsResponseInterface:
        """
        * @description get patient medical records service
        * @params patientPrimaryKey, patientId, offset, limit
        * @returns PatientMedicalRecordsResponseInterface
        """
        if patientPrimaryKey is None:
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE,
                detail="Patient Primary key is required!",
            )
        if patientId is None:
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE,
                detail="Patient ID is required!",
            )

        return await self.patientRepository.getPatientMedicalRecords(
            patientPrimaryKey=patientPrimaryKey,
            patientId=patientId,
            offset=offset,
            limit=limit,
        )

    async def getPatientMedicalRecordDetails(
        self, medicalRecordId: str
    ) -> PatientMedicalRecordDetailsResponseInterface:
        """
        * @description get patient medical record details service
        * @params medicalRecordId
        * @returns PatientMedicalRecordDetailsResponseInterface
        """
        cacheKey = f"medical:record:{medicalRecordId}"

        async def fetchPatientMedicalRecordDetails() -> (
            PatientMedicalRecordDetailsResponseInterface
        ):
            recordDetails = await self.patientRepository.getPatientMedicalRecordDetails(
                medicalRecordId=medicalRecordId
            )
            medicalDocument = recordDetails["medicalDocuments"]

            for doc in medicalDocument:
                documentPath = doc["documentUrl"]

                if documentPath:
                    doc["documentUrl"] = f"{settings.apiBaseUrl}/uploads/{documentPath}"

            return recordDetails

        return await self.redisCacheService.getOrSet(
            key=cacheKey,
            fetcher=lambda: fetchPatientMedicalRecordDetails(),
            ttl=3600,
            lockTtl=10,
            jitter=random.randrange(300),
        )

from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, Request
from fastapi.params import Body, File

from src.common.interfaces.jwt_playload_interface import JwtPayload
from src.common.auth.dependencies import requireRoles
from src.patient.patient_dto import (
    GetPatientDetailsDto,
    PatientProfileDetailsDto,
    GetPatientsListDto,
    UpdateMedicationsDto,
    GetPatientMedicalRecordsDto,
)
from src.patient.patient_service import PatientService
from src.common.enums.user_enums import UserRole
from src.patient.patient_multipart_parser import (
    parseMedicalRecordForm,
    parseMedicalDocumentsForm,
)

router = APIRouter(
    prefix="/patient",
    tags=["Patient"],
)
patientService = PatientService()


@router.post("/patient-profile-details")
async def updatePatientProfileDetails(
    request: PatientProfileDetailsDto = Depends(PatientProfileDetailsDto.asForm),
    user: JwtPayload = Depends(requireRoles(UserRole.PATIENT)),
    profileImage: Annotated[UploadFile | None, File()] = None,
):
    """
    * @description update patient profile details controller
    * @params request, user, profileImage
    * @returns json
    """
    result = await patientService.updatePatientProfileDetails(
        request=request,
        patientId=user.userBusinessId,
        profileImage=profileImage,
    )

    return {
        "success": True,
        "message": "Patient Profile Details Updated Successfully.",
        "data": result,
    }


@router.post("/patient-details")
async def getPatientDetails(
    request: Annotated[GetPatientDetailsDto | None, Body()] = None,
    user: JwtPayload = Depends(
        requireRoles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.HEALTH_INSTITUTE)
    ),
):
    """
    * @description get patient details controller
    * @params request, user
    * @returns json
    """
    if user.role == UserRole.PATIENT:
        patientPrimaryKey = user.userPrimaryKey
        patientId = user.userBusinessId

    else:
        if request is None:
            raise HTTPException(
                status_code=400,
                detail="Request body is required",
            )

        patientPrimaryKey = request.patientPrimaryKey
        patientId = request.patientId

    result = await patientService.getPatientDetails(
        patientPrimaryKey,
        patientId,
    )

    return {
        "success": True,
        "message": "Patient Details Fetched Successfully.",
        "data": result,
    }


@router.post("/patients-list")
async def getPatientList(
    request: GetPatientsListDto,
    user: JwtPayload = Depends(
        requireRoles(UserRole.DOCTOR, UserRole.HEALTH_INSTITUTE)
    ),
):
    """
    * @decription get patient list controller
    * @params request, user
    * returns json
    """
    doctorPrimaryKey: int | None = None
    healthInstitutePrimaryKey: int | None = None

    if user.role == UserRole.DOCTOR:
        doctorPrimaryKey = request.doctorPrimaryKey
    if user.role == UserRole.HEALTH_INSTITUTE:
        healthInstitutePrimaryKey = request.healthInstitutePrimaryKey

    result = await patientService.getPatientList(
        request=request,
        doctorPrimaryKey=doctorPrimaryKey,
        healthInstitutePrimaryKey=healthInstitutePrimaryKey,
    )

    return {
        "success": True,
        "message": "Patients List Fetched Successfully.",
        "data": result,
    }


@router.get("/states-master-data")
async def getStates(_: JwtPayload = Depends(requireRoles(UserRole.PATIENT))):
    """
    * @description get states list controller
    * @returns json
    """
    result = await patientService.getStates()

    return {
        "success": True,
        "message": "States List Fetched Successfully.",
        "data": result,
    }


@router.get("/districts-master-data/{id}")
async def getDistricts(
    id: str, _: JwtPayload = Depends(requireRoles(UserRole.PATIENT))
):
    """
    * @description get district list controller
    * @params id
    * @returns json
    """
    result = await patientService.getDistricts(int(id))

    return {
        "success": True,
        "message": "Districts List Fetched Successfully.",
        "data": result,
    }


@router.post("/patient-medical-record")
async def createPatientMedicalRecord(
    request: Request,
    user: JwtPayload = Depends(
        requireRoles(
            UserRole.DOCTOR,
            UserRole.HEALTH_INSTITUTE,
        )
    ),
):
    """
    * @description create patient medical record controller
    * @params request, user
    * @returns json
    """
    medicalRecordRequest, documentFiles = await parseMedicalRecordForm(request)

    doctorPrimaryKey: int | None = None
    doctorId: str | None = None
    healthInstitutePrimaryKey: int | None = None
    healthInstituteId: str | None = None

    match user.role:
        case UserRole.DOCTOR:

            doctorPrimaryKey = user.userPrimaryKey
            doctorId = user.userBusinessId

            healthInstitutePrimaryKey = medicalRecordRequest.healthInstitutePrimaryKey

            healthInstituteId = medicalRecordRequest.healthInstituteId

        case UserRole.HEALTH_INSTITUTE:

            healthInstitutePrimaryKey = user.userPrimaryKey
            healthInstituteId = user.userBusinessId

            doctorPrimaryKey = medicalRecordRequest.doctorPrimaryKey

            doctorId = medicalRecordRequest.doctorId

    result = await patientService.createPatientMedicalRecord(
        request=medicalRecordRequest,
        doctorPrimaryKey=doctorPrimaryKey,
        doctorId=doctorId,
        healthInstitutePrimaryKey=healthInstitutePrimaryKey,
        healthInstituteId=healthInstituteId,
        files=documentFiles,
    )

    return {
        "success": True,
        "message": "Patient Medical Record Created Successfully.",
        "data": result,
    }


@router.post("/medical-documents")
async def uploadMedicalDocuments(
    request: Request,
    _: JwtPayload = Depends(
        requireRoles(
            UserRole.DOCTOR,
            UserRole.HEALTH_INSTITUTE,
        )
    ),
):
    """
    * @description upload medical documents controller
    * @params request
    * @returns json
    """
    (
        patientId,
        medicalRecordId,
        medicalDocuments,
    ) = await parseMedicalDocumentsForm(request)

    result = await patientService.uploadMedicalDocuments(
        patientId=patientId,
        medicalRecordId=medicalRecordId,
        medicalDocuments=medicalDocuments,
    )

    return {
        "success": True,
        "message": "Medical Documents Uploaded Successfully.",
        "data": result,
    }


@router.post("/medications")
async def updateMedications(
    request: UpdateMedicationsDto,
    _: JwtPayload = Depends(
        requireRoles(
            UserRole.DOCTOR,
            UserRole.HEALTH_INSTITUTE,
        )
    ),
):
    """
    * @description update medications controller
    * @params request
    * @returns json
    """
    result = await patientService.updateMedications(request=request)

    return {
        "success": True,
        "message": "Medications Updated Successfully.",
        "data": result,
    }


@router.post("/patient-medical-records")
async def getPatientMedicalRecords(
    request: GetPatientMedicalRecordsDto,
    user: JwtPayload = Depends(
        requireRoles(UserRole.DOCTOR, UserRole.HEALTH_INSTITUTE, UserRole.PATIENT)
    ),
):
    """
    * @description get patient medical records controller
    * @params request, user
    * @returns json
    """
    patientPrimaryKey: int | None = None
    patientId: str | None = None

    if user.role == UserRole.PATIENT:
        patientPrimaryKey = user.userPrimaryKey
        patientId = user.userBusinessId
    else:
        patientPrimaryKey = request.patientPrimaryKey
        patientId = request.patientId

    result = await patientService.getPatientMedicalRecords(
        patientPrimaryKey=patientPrimaryKey,
        patientId=patientId,
        offset=request.offset or 0,
        limit=request.limit or 10,
    )
    return {
        "success": True,
        "message": "Patient medications",
        "data": result,
    }


@router.get("/patient-medical-record-details/{id}")
async def getPatientMedicalRecordDetails(
    id: str,
    _: JwtPayload = Depends(
        requireRoles(UserRole.DOCTOR, UserRole.HEALTH_INSTITUTE, UserRole.PATIENT)
    ),
):
    """
    * @description get patient medical record details controller
    * @params id
    * @returns json
    """
    result = await patientService.getPatientMedicalRecordDetails(medicalRecordId=id)

    return {
        "success": True,
        "message": "Medical Record Details",
        "data": result,
    }

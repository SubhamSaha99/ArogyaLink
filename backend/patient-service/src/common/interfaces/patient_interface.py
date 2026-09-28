from typing import TypedDict


class UpdatePatientResponseInterface(TypedDict, total=False):
    patientId: str

class UpdateMedicalRecordRsponseInterface(TypedDict, total=False):
    medicalRecordId: str
    
class PatientProfileUpdateInterface(TypedDict, total=False):
    firstName: str
    middleName: str | None
    lastName: str
    dateOfBirth: str | None
    age: int | None
    gender: int | None
    profileImage: str | None
    address: str | None
    stateId: int | None
    districtId: int | None
    pincode: int | None


class PatientDetailsInterface(TypedDict, total=False):
    patientProfileId: str
    patientPrimaryKey: int
    patientId: str
    firstName: str
    middleName: str | None
    lastName: str
    email: str
    mobile: str
    dateOfBirth: str | None
    age: int | None
    gender: int | None
    profileImage: str | None
    address: str | None
    stateId: int | None
    stateName: str | None
    districtId: int | None
    districtName: str | None
    pincode: int | None


class MasterDataItemInterface(TypedDict):
    id: int
    name: str
    code: str


class PatientsListItemInterface(TypedDict):
    patientPrimaryKey: int
    patientId: str
    firstName: str
    middleName: str | None
    lastName: str
    age: int | None
    gender: int | None


class PatientsListResponseInterface(TypedDict):
    patients: list[PatientsListItemInterface]
    total: int
    offset: int
    limit: int


class PatientMedicalRecordListItemInterface(TypedDict):
    patientMedicalRecordId: str
    doctorPrimaryKey: int
    doctorId: str
    healthInstitutePrimaryKey: int
    healthInstituteId: str
    title: str
    diagnosis: str
    status: int


class PatientMedicalRecordsResponseInterface(TypedDict):
    medicalRecords: list[PatientMedicalRecordListItemInterface]
    total: int
    offset: int
    limit: int


class PatientMedicalDocumentItemInterface(TypedDict):
    patientMedicalDocumentId: str
    documentType: int
    documentTypeName: str
    title: str
    description: str | None
    documentUrl: str
    documentDate: str


class PatientMedicationItemInterface(TypedDict):
    patientMedicationId: str
    medicationName: str
    dosage: str
    description: str | None
    startDate: str
    endDate: str | None
    status: int


class PatientMedicalRecordDetailsResponseInterface(TypedDict):
    patientMedicalRecordId: str
    title: str
    diagnosis: str
    status: int
    startedDate: str
    resolvedDate: str | None
    medicalDocuments: list[PatientMedicalDocumentItemInterface]
    medications: list[PatientMedicationItemInterface]

from typing import TypedDict


class PatientProfileUpdateInterface(TypedDict, total=False):
    first_name: str
    middle_name: str | None
    last_name: str
    date_of_birth: str | None
    age: int | None
    gender: int | None
    profile_image: str | None
    address: str | None
    state_id: int | None
    district_id: int | None
    pincode: int | None


class PatientDetailsInterface(TypedDict):
    patient_profile_id: str
    patient_primary_key: int
    patient_id: str
    first_name: str
    middle_name: str | None
    last_name: str
    date_of_birth: str | None
    age: int | None
    gender: int | None
    profile_image: str | None
    address: str | None
    state_id: int | None
    state_name: str | None
    district_id: int | None
    district_name: str | None
    pincode: int | None


class MasterDataItemInterface(TypedDict):
    id: int
    name: str
    code: str


class PatientsListItemInterface(TypedDict):
    patient_primary_key: int
    patient_id: str
    first_name: str
    middle_name: str | None
    last_name: str
    age: int | None
    gender: int | None


class PatientsListResponseInterface(TypedDict):
    patients: list[PatientsListItemInterface]
    total: int
    offset: int
    limit: int


class PatientMedicalRecordListItemInterface(TypedDict):
    patient_medical_record_id: str
    doctor_primary_key: int
    doctor_id: str
    health_institute_primary_key: int
    health_institute_id: str
    title: str
    diagnosis: str
    status: int


class PatientMedicalRecordsResponseInterface(TypedDict):
    medical_records: list[PatientMedicalRecordListItemInterface]
    total: int
    offset: int
    limit: int


class PatientMedicalDocumentItemInterface(TypedDict):
    patient_medical_document_id: str
    document_type: int
    document_type_name: str
    title: str
    document_url: str
    document_date: str


class PatientMedicationItemInterface(TypedDict):
    patient_medication_id: str
    medication_name: str
    dosage: str
    start_date: str
    end_date: str | None
    status: int


class PatientMedicalRecordDetailsResponseInterface(TypedDict):
    patient_medical_record_id: str
    title: str
    diagnosis: str
    status: int
    started_date: str
    resolved_date: str | None
    medical_documents: list[PatientMedicalDocumentItemInterface]
    medications: list[PatientMedicationItemInterface]



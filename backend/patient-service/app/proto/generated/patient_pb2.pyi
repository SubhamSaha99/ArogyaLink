from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class PatientProfileReq(_message.Message):
    __slots__ = ("patientPrimaryKey", "patientId", "email", "mobile", "firstName", "middleName", "lastName")
    PATIENTPRIMARYKEY_FIELD_NUMBER: _ClassVar[int]
    PATIENTID_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    MOBILE_FIELD_NUMBER: _ClassVar[int]
    FIRSTNAME_FIELD_NUMBER: _ClassVar[int]
    MIDDLENAME_FIELD_NUMBER: _ClassVar[int]
    LASTNAME_FIELD_NUMBER: _ClassVar[int]
    patientPrimaryKey: int
    patientId: str
    email: str
    mobile: str
    firstName: str
    middleName: str
    lastName: str
    def __init__(self, patientPrimaryKey: _Optional[int] = ..., patientId: _Optional[str] = ..., email: _Optional[str] = ..., mobile: _Optional[str] = ..., firstName: _Optional[str] = ..., middleName: _Optional[str] = ..., lastName: _Optional[str] = ...) -> None: ...

class PatientProfileRes(_message.Message):
    __slots__ = ("patientId",)
    PATIENTID_FIELD_NUMBER: _ClassVar[int]
    patientId: str
    def __init__(self, patientId: _Optional[str] = ...) -> None: ...

class UpdatePatientProfileDetailsReq(_message.Message):
    __slots__ = ("patientProfileId", "patientId", "firstName", "middleName", "lastName", "dateOfBirth", "age", "gender", "profileImage", "address", "stateId", "districtId", "pincode")
    PATIENTPROFILEID_FIELD_NUMBER: _ClassVar[int]
    PATIENTID_FIELD_NUMBER: _ClassVar[int]
    FIRSTNAME_FIELD_NUMBER: _ClassVar[int]
    MIDDLENAME_FIELD_NUMBER: _ClassVar[int]
    LASTNAME_FIELD_NUMBER: _ClassVar[int]
    DATEOFBIRTH_FIELD_NUMBER: _ClassVar[int]
    AGE_FIELD_NUMBER: _ClassVar[int]
    GENDER_FIELD_NUMBER: _ClassVar[int]
    PROFILEIMAGE_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    STATEID_FIELD_NUMBER: _ClassVar[int]
    DISTRICTID_FIELD_NUMBER: _ClassVar[int]
    PINCODE_FIELD_NUMBER: _ClassVar[int]
    patientProfileId: str
    patientId: str
    firstName: str
    middleName: str
    lastName: str
    dateOfBirth: str
    age: int
    gender: int
    profileImage: str
    address: str
    stateId: int
    districtId: int
    pincode: int
    def __init__(self, patientProfileId: _Optional[str] = ..., patientId: _Optional[str] = ..., firstName: _Optional[str] = ..., middleName: _Optional[str] = ..., lastName: _Optional[str] = ..., dateOfBirth: _Optional[str] = ..., age: _Optional[int] = ..., gender: _Optional[int] = ..., profileImage: _Optional[str] = ..., address: _Optional[str] = ..., stateId: _Optional[int] = ..., districtId: _Optional[int] = ..., pincode: _Optional[int] = ...) -> None: ...

class UpdatePatientProfileDetailsRes(_message.Message):
    __slots__ = ("patientId",)
    PATIENTID_FIELD_NUMBER: _ClassVar[int]
    patientId: str
    def __init__(self, patientId: _Optional[str] = ...) -> None: ...

class GetPatientDetailsReq(_message.Message):
    __slots__ = ("patientPrimaryKey", "patientId")
    PATIENTPRIMARYKEY_FIELD_NUMBER: _ClassVar[int]
    PATIENTID_FIELD_NUMBER: _ClassVar[int]
    patientPrimaryKey: int
    patientId: str
    def __init__(self, patientPrimaryKey: _Optional[int] = ..., patientId: _Optional[str] = ...) -> None: ...

class PatientDetails(_message.Message):
    __slots__ = ("patientProfileId", "firstName", "middleName", "lastName", "email", "mobile", "dateOfBirth", "age", "gender", "profileImage", "address", "stateId", "stateName", "districtId", "districtName", "pincode")
    PATIENTPROFILEID_FIELD_NUMBER: _ClassVar[int]
    FIRSTNAME_FIELD_NUMBER: _ClassVar[int]
    MIDDLENAME_FIELD_NUMBER: _ClassVar[int]
    LASTNAME_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    MOBILE_FIELD_NUMBER: _ClassVar[int]
    DATEOFBIRTH_FIELD_NUMBER: _ClassVar[int]
    AGE_FIELD_NUMBER: _ClassVar[int]
    GENDER_FIELD_NUMBER: _ClassVar[int]
    PROFILEIMAGE_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    STATEID_FIELD_NUMBER: _ClassVar[int]
    STATENAME_FIELD_NUMBER: _ClassVar[int]
    DISTRICTID_FIELD_NUMBER: _ClassVar[int]
    DISTRICTNAME_FIELD_NUMBER: _ClassVar[int]
    PINCODE_FIELD_NUMBER: _ClassVar[int]
    patientProfileId: str
    firstName: str
    middleName: str
    lastName: str
    email: str
    mobile: str
    dateOfBirth: str
    age: int
    gender: int
    profileImage: str
    address: str
    stateId: int
    stateName: str
    districtId: int
    districtName: str
    pincode: int
    def __init__(self, patientProfileId: _Optional[str] = ..., firstName: _Optional[str] = ..., middleName: _Optional[str] = ..., lastName: _Optional[str] = ..., email: _Optional[str] = ..., mobile: _Optional[str] = ..., dateOfBirth: _Optional[str] = ..., age: _Optional[int] = ..., gender: _Optional[int] = ..., profileImage: _Optional[str] = ..., address: _Optional[str] = ..., stateId: _Optional[int] = ..., stateName: _Optional[str] = ..., districtId: _Optional[int] = ..., districtName: _Optional[str] = ..., pincode: _Optional[int] = ...) -> None: ...

class GetPatientDetailsRes(_message.Message):
    __slots__ = ("patientPrimaryKey", "patientId", "patientProfile")
    PATIENTPRIMARYKEY_FIELD_NUMBER: _ClassVar[int]
    PATIENTID_FIELD_NUMBER: _ClassVar[int]
    PATIENTPROFILE_FIELD_NUMBER: _ClassVar[int]
    patientPrimaryKey: int
    patientId: str
    patientProfile: PatientDetails
    def __init__(self, patientPrimaryKey: _Optional[int] = ..., patientId: _Optional[str] = ..., patientProfile: _Optional[_Union[PatientDetails, _Mapping]] = ...) -> None: ...

class PatientMedicalRecord(_message.Message):
    __slots__ = ("patientPrimaryKey", "patientId", "doctorPrimaryKey", "doctorId", "healthInstitutePrimaryKey", "healthInstituteId", "title", "diagnosis", "description", "startedDate")
    PATIENTPRIMARYKEY_FIELD_NUMBER: _ClassVar[int]
    PATIENTID_FIELD_NUMBER: _ClassVar[int]
    DOCTORPRIMARYKEY_FIELD_NUMBER: _ClassVar[int]
    DOCTORID_FIELD_NUMBER: _ClassVar[int]
    HEALTHINSTITUTEPRIMARYKEY_FIELD_NUMBER: _ClassVar[int]
    HEALTHINSTITUTEID_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    DIAGNOSIS_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    STARTEDDATE_FIELD_NUMBER: _ClassVar[int]
    patientPrimaryKey: int
    patientId: str
    doctorPrimaryKey: int
    doctorId: str
    healthInstitutePrimaryKey: int
    healthInstituteId: str
    title: str
    diagnosis: str
    description: str
    startedDate: str
    def __init__(self, patientPrimaryKey: _Optional[int] = ..., patientId: _Optional[str] = ..., doctorPrimaryKey: _Optional[int] = ..., doctorId: _Optional[str] = ..., healthInstitutePrimaryKey: _Optional[int] = ..., healthInstituteId: _Optional[str] = ..., title: _Optional[str] = ..., diagnosis: _Optional[str] = ..., description: _Optional[str] = ..., startedDate: _Optional[str] = ...) -> None: ...

class PatientMedicalDocuments(_message.Message):
    __slots__ = ("documentType", "title", "documentUrl", "description", "documentDate")
    DOCUMENTTYPE_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    DOCUMENTURL_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    DOCUMENTDATE_FIELD_NUMBER: _ClassVar[int]
    documentType: int
    title: str
    documentUrl: str
    description: str
    documentDate: str
    def __init__(self, documentType: _Optional[int] = ..., title: _Optional[str] = ..., documentUrl: _Optional[str] = ..., description: _Optional[str] = ..., documentDate: _Optional[str] = ...) -> None: ...

class PatientMedication(_message.Message):
    __slots__ = ("medicationName", "dosage", "startDate")
    MEDICATIONNAME_FIELD_NUMBER: _ClassVar[int]
    DOSAGE_FIELD_NUMBER: _ClassVar[int]
    STARTDATE_FIELD_NUMBER: _ClassVar[int]
    medicationName: str
    dosage: str
    startDate: str
    def __init__(self, medicationName: _Optional[str] = ..., dosage: _Optional[str] = ..., startDate: _Optional[str] = ...) -> None: ...

class CreatePatientMedicalRecordReq(_message.Message):
    __slots__ = ("medicalRecord", "medicalDocuments", "medications")
    MEDICALRECORD_FIELD_NUMBER: _ClassVar[int]
    MEDICALDOCUMENTS_FIELD_NUMBER: _ClassVar[int]
    MEDICATIONS_FIELD_NUMBER: _ClassVar[int]
    medicalRecord: PatientMedicalRecord
    medicalDocuments: _containers.RepeatedCompositeFieldContainer[PatientMedicalDocuments]
    medications: _containers.RepeatedCompositeFieldContainer[PatientMedication]
    def __init__(self, medicalRecord: _Optional[_Union[PatientMedicalRecord, _Mapping]] = ..., medicalDocuments: _Optional[_Iterable[_Union[PatientMedicalDocuments, _Mapping]]] = ..., medications: _Optional[_Iterable[_Union[PatientMedication, _Mapping]]] = ...) -> None: ...

class CreatePatientMedicalRecordRes(_message.Message):
    __slots__ = ("patientId",)
    PATIENTID_FIELD_NUMBER: _ClassVar[int]
    patientId: str
    def __init__(self, patientId: _Optional[str] = ...) -> None: ...

class MasterDataItem(_message.Message):
    __slots__ = ("id", "name", "code")
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    CODE_FIELD_NUMBER: _ClassVar[int]
    id: int
    name: str
    code: str
    def __init__(self, id: _Optional[int] = ..., name: _Optional[str] = ..., code: _Optional[str] = ...) -> None: ...

class GetStatesReq(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...

class GetStatesRes(_message.Message):
    __slots__ = ("states",)
    STATES_FIELD_NUMBER: _ClassVar[int]
    states: _containers.RepeatedCompositeFieldContainer[MasterDataItem]
    def __init__(self, states: _Optional[_Iterable[_Union[MasterDataItem, _Mapping]]] = ...) -> None: ...

class GetDistrictsReq(_message.Message):
    __slots__ = ("stateId",)
    STATEID_FIELD_NUMBER: _ClassVar[int]
    stateId: int
    def __init__(self, stateId: _Optional[int] = ...) -> None: ...

class GetDistrictsRes(_message.Message):
    __slots__ = ("districts",)
    DISTRICTS_FIELD_NUMBER: _ClassVar[int]
    districts: _containers.RepeatedCompositeFieldContainer[MasterDataItem]
    def __init__(self, districts: _Optional[_Iterable[_Union[MasterDataItem, _Mapping]]] = ...) -> None: ...

class GetPatientsListReq(_message.Message):
    __slots__ = ("offset", "limit", "search", "stateId", "doctorPrimaryKey", "healthInstitutePrimaryKey")
    OFFSET_FIELD_NUMBER: _ClassVar[int]
    LIMIT_FIELD_NUMBER: _ClassVar[int]
    SEARCH_FIELD_NUMBER: _ClassVar[int]
    STATEID_FIELD_NUMBER: _ClassVar[int]
    DOCTORPRIMARYKEY_FIELD_NUMBER: _ClassVar[int]
    HEALTHINSTITUTEPRIMARYKEY_FIELD_NUMBER: _ClassVar[int]
    offset: int
    limit: int
    search: str
    stateId: int
    doctorPrimaryKey: int
    healthInstitutePrimaryKey: int
    def __init__(self, offset: _Optional[int] = ..., limit: _Optional[int] = ..., search: _Optional[str] = ..., stateId: _Optional[int] = ..., doctorPrimaryKey: _Optional[int] = ..., healthInstitutePrimaryKey: _Optional[int] = ...) -> None: ...

class PatientsListData(_message.Message):
    __slots__ = ("patientPrimaryKey", "patientId", "firstName", "middleName", "lastName", "age", "gender")
    PATIENTPRIMARYKEY_FIELD_NUMBER: _ClassVar[int]
    PATIENTID_FIELD_NUMBER: _ClassVar[int]
    FIRSTNAME_FIELD_NUMBER: _ClassVar[int]
    MIDDLENAME_FIELD_NUMBER: _ClassVar[int]
    LASTNAME_FIELD_NUMBER: _ClassVar[int]
    AGE_FIELD_NUMBER: _ClassVar[int]
    GENDER_FIELD_NUMBER: _ClassVar[int]
    patientPrimaryKey: int
    patientId: str
    firstName: str
    middleName: str
    lastName: str
    age: int
    gender: int
    def __init__(self, patientPrimaryKey: _Optional[int] = ..., patientId: _Optional[str] = ..., firstName: _Optional[str] = ..., middleName: _Optional[str] = ..., lastName: _Optional[str] = ..., age: _Optional[int] = ..., gender: _Optional[int] = ...) -> None: ...

class GetPatientsListRes(_message.Message):
    __slots__ = ("patients", "total", "offset", "limit")
    PATIENTS_FIELD_NUMBER: _ClassVar[int]
    TOTAL_FIELD_NUMBER: _ClassVar[int]
    OFFSET_FIELD_NUMBER: _ClassVar[int]
    LIMIT_FIELD_NUMBER: _ClassVar[int]
    patients: _containers.RepeatedCompositeFieldContainer[PatientsListData]
    total: int
    offset: int
    limit: int
    def __init__(self, patients: _Optional[_Iterable[_Union[PatientsListData, _Mapping]]] = ..., total: _Optional[int] = ..., offset: _Optional[int] = ..., limit: _Optional[int] = ...) -> None: ...

class GetPatientMedicalRecordsReq(_message.Message):
    __slots__ = ("patientPrimaryKey", "patientId", "offset", "limit")
    PATIENTPRIMARYKEY_FIELD_NUMBER: _ClassVar[int]
    PATIENTID_FIELD_NUMBER: _ClassVar[int]
    OFFSET_FIELD_NUMBER: _ClassVar[int]
    LIMIT_FIELD_NUMBER: _ClassVar[int]
    patientPrimaryKey: int
    patientId: str
    offset: int
    limit: int
    def __init__(self, patientPrimaryKey: _Optional[int] = ..., patientId: _Optional[str] = ..., offset: _Optional[int] = ..., limit: _Optional[int] = ...) -> None: ...

class PatientMedicalRecordsList(_message.Message):
    __slots__ = ("patientMedicalRecordId", "doctorPrimaryKey", "doctorId", "healthInstitutePrimaryKey", "healthInstituteId", "title", "diagnosis", "status")
    PATIENTMEDICALRECORDID_FIELD_NUMBER: _ClassVar[int]
    DOCTORPRIMARYKEY_FIELD_NUMBER: _ClassVar[int]
    DOCTORID_FIELD_NUMBER: _ClassVar[int]
    HEALTHINSTITUTEPRIMARYKEY_FIELD_NUMBER: _ClassVar[int]
    HEALTHINSTITUTEID_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    DIAGNOSIS_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    patientMedicalRecordId: str
    doctorPrimaryKey: int
    doctorId: str
    healthInstitutePrimaryKey: int
    healthInstituteId: str
    title: str
    diagnosis: str
    status: int
    def __init__(self, patientMedicalRecordId: _Optional[str] = ..., doctorPrimaryKey: _Optional[int] = ..., doctorId: _Optional[str] = ..., healthInstitutePrimaryKey: _Optional[int] = ..., healthInstituteId: _Optional[str] = ..., title: _Optional[str] = ..., diagnosis: _Optional[str] = ..., status: _Optional[int] = ...) -> None: ...

class GetPatientMedicalRecordsRes(_message.Message):
    __slots__ = ("medicalRecords", "total", "offset", "limit")
    MEDICALRECORDS_FIELD_NUMBER: _ClassVar[int]
    TOTAL_FIELD_NUMBER: _ClassVar[int]
    OFFSET_FIELD_NUMBER: _ClassVar[int]
    LIMIT_FIELD_NUMBER: _ClassVar[int]
    medicalRecords: _containers.RepeatedCompositeFieldContainer[PatientMedicalRecordsList]
    total: int
    offset: int
    limit: int
    def __init__(self, medicalRecords: _Optional[_Iterable[_Union[PatientMedicalRecordsList, _Mapping]]] = ..., total: _Optional[int] = ..., offset: _Optional[int] = ..., limit: _Optional[int] = ...) -> None: ...

class GetPatientMedicalRecordDetailsReq(_message.Message):
    __slots__ = ("medicalRecordId",)
    MEDICALRECORDID_FIELD_NUMBER: _ClassVar[int]
    medicalRecordId: str
    def __init__(self, medicalRecordId: _Optional[str] = ...) -> None: ...

class GetPateintMedicalDocuments(_message.Message):
    __slots__ = ("patientMedicalDocumentId", "documentType", "documentTypeName", "title", "documentUrl", "documentDate", "description")
    PATIENTMEDICALDOCUMENTID_FIELD_NUMBER: _ClassVar[int]
    DOCUMENTTYPE_FIELD_NUMBER: _ClassVar[int]
    DOCUMENTTYPENAME_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    DOCUMENTURL_FIELD_NUMBER: _ClassVar[int]
    DOCUMENTDATE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    patientMedicalDocumentId: str
    documentType: int
    documentTypeName: str
    title: str
    documentUrl: str
    documentDate: str
    description: str
    def __init__(self, patientMedicalDocumentId: _Optional[str] = ..., documentType: _Optional[int] = ..., documentTypeName: _Optional[str] = ..., title: _Optional[str] = ..., documentUrl: _Optional[str] = ..., documentDate: _Optional[str] = ..., description: _Optional[str] = ...) -> None: ...

class GetPatientMedications(_message.Message):
    __slots__ = ("patientMedicationId", "medicationName", "dosage", "startDate", "endDate", "status")
    PATIENTMEDICATIONID_FIELD_NUMBER: _ClassVar[int]
    MEDICATIONNAME_FIELD_NUMBER: _ClassVar[int]
    DOSAGE_FIELD_NUMBER: _ClassVar[int]
    STARTDATE_FIELD_NUMBER: _ClassVar[int]
    ENDDATE_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    patientMedicationId: str
    medicationName: str
    dosage: str
    startDate: str
    endDate: str
    status: int
    def __init__(self, patientMedicationId: _Optional[str] = ..., medicationName: _Optional[str] = ..., dosage: _Optional[str] = ..., startDate: _Optional[str] = ..., endDate: _Optional[str] = ..., status: _Optional[int] = ...) -> None: ...

class GetPatientMedicalRecordDetailsRes(_message.Message):
    __slots__ = ("patientMedicalRecordId", "title", "diagnosis", "status", "startedDate", "resolvedDate", "medicalDocuments", "medications")
    PATIENTMEDICALRECORDID_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    DIAGNOSIS_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    STARTEDDATE_FIELD_NUMBER: _ClassVar[int]
    RESOLVEDDATE_FIELD_NUMBER: _ClassVar[int]
    MEDICALDOCUMENTS_FIELD_NUMBER: _ClassVar[int]
    MEDICATIONS_FIELD_NUMBER: _ClassVar[int]
    patientMedicalRecordId: str
    title: str
    diagnosis: str
    status: int
    startedDate: str
    resolvedDate: str
    medicalDocuments: _containers.RepeatedCompositeFieldContainer[GetPateintMedicalDocuments]
    medications: _containers.RepeatedCompositeFieldContainer[GetPatientMedications]
    def __init__(self, patientMedicalRecordId: _Optional[str] = ..., title: _Optional[str] = ..., diagnosis: _Optional[str] = ..., status: _Optional[int] = ..., startedDate: _Optional[str] = ..., resolvedDate: _Optional[str] = ..., medicalDocuments: _Optional[_Iterable[_Union[GetPateintMedicalDocuments, _Mapping]]] = ..., medications: _Optional[_Iterable[_Union[GetPatientMedications, _Mapping]]] = ...) -> None: ...

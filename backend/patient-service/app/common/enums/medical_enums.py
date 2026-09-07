from enum import IntEnum


class MedicalDocumentType(IntEnum):
    PRESCRIPTION = 1
    MEDICAL_SCAN = 2
    LAB_REPORT = 3
    DISCHARGE_SUMMARY = 4
    CONSULTATION_REPORT = 5
    MEDICAL_CERTIFICATE = 6
    OTHER = 7

class MedicalRecordStatus(IntEnum):
    ACTIVE = 1
    COMPLETED = 2

class MedicationStatus(IntEnum):
    ACTIVE = 1
    COMPLETED = 2
    DISCONTINUED = 3
    ON_HOLD = 4

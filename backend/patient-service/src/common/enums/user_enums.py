from enum import StrEnum


class UserRole(StrEnum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    HEALTH_INSTITUTE = "HEALTH_INSTITUTE"
    ADMIN = "ADMIN"

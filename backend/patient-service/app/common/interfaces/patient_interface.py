from datetime import date
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

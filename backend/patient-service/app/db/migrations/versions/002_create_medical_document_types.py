from datetime import datetime, timezone

from pymongo import ASCENDING, UpdateOne

from app.db.db_service import get_database


async def up():
    db = get_database()
    medical_document_types_collection = db["medical_document_types"]

    MEDICAL_DOCUMENT_TYPES = [
        {
            "document_type_id": 1,
            "document_type_name": "Prescription",
            "document_type_code": "PRESCRIPTION",
            "description": "Doctor-issued prescription",
        },
        {
            "document_type_id": 2,
            "document_type_name": "Laboratory Report",
            "document_type_code": "LAB_REPORT",
            "description": "Blood test and other laboratory reports",
        },
        {
            "document_type_id": 3,
            "document_type_name": "Medical Scan",
            "document_type_code": "MEDICAL_SCAN",
            "description": "General medical imaging document",
        },
        {
            "document_type_id": 4,
            "document_type_name": "X-Ray Report",
            "document_type_code": "XRAY_REPORT",
            "description": "X-ray report or image",
        },
        {
            "document_type_id": 5,
            "document_type_name": "MRI Report",
            "document_type_code": "MRI_REPORT",
            "description": "MRI scan report",
        },
        {
            "document_type_id": 6,
            "document_type_name": "CT Scan Report",
            "document_type_code": "CT_SCAN_REPORT",
            "description": "CT scan report",
        },
        {
            "document_type_id": 7,
            "document_type_name": "Ultrasound Report",
            "document_type_code": "ULTRASOUND_REPORT",
            "description": "Ultrasound report",
        },
        {
            "document_type_id": 8,
            "document_type_name": "Discharge Summary",
            "document_type_code": "DISCHARGE_SUMMARY",
            "description": "Hospital discharge summary",
        },
        {
            "document_type_id": 9,
            "document_type_name": "Consultation Report",
            "document_type_code": "CONSULTATION_REPORT",
            "description": "Doctor consultation report",
        },
        {
            "document_type_id": 10,
            "document_type_name": "Operation Report",
            "document_type_code": "OPERATION_REPORT",
            "description": "Surgical operation report",
        },
        {
            "document_type_id": 11,
            "document_type_name": "Procedure Report",
            "document_type_code": "PROCEDURE_REPORT",
            "description": "Medical procedure report",
        },
        {
            "document_type_id": 12,
            "document_type_name": "Medical Certificate",
            "document_type_code": "MEDICAL_CERTIFICATE",
            "description": "Doctor-issued medical certificate",
        },
        {
            "document_type_id": 13,
            "document_type_name": "Vaccination Record",
            "document_type_code": "VACCINATION_RECORD",
            "description": "Vaccination or immunization record",
        },
        {
            "document_type_id": 14,
            "document_type_name": "Pathology Report",
            "document_type_code": "PATHOLOGY_REPORT",
            "description": "Pathology and tissue examination report",
        },
        {
            "document_type_id": 15,
            "document_type_name": "ECG Report",
            "document_type_code": "ECG_REPORT",
            "description": "Electrocardiogram report",
        },
        {
            "document_type_id": 16,
            "document_type_name": "Diet Plan",
            "document_type_code": "DIET_PLAN",
            "description": "Doctor or nutritionist diet plan",
        },
        {
            "document_type_id": 17,
            "document_type_name": "Referral Letter",
            "document_type_code": "REFERRAL_LETTER",
            "description": "Referral letter from a doctor or institute",
        },
        {
            "document_type_id": 18,
            "document_type_name": "Insurance Document",
            "document_type_code": "INSURANCE_DOCUMENT",
            "description": "Medical insurance-related document",
        },
        {
            "document_type_id": 19,
            "document_type_name": "Other",
            "document_type_code": "OTHER",
            "description": "Other medical document types",
        },
    ]

    await medical_document_types_collection.create_index(
        [("document_type_id", ASCENDING)],
        name="idx_medical_document_type_id",
        unique=True,
    )

    await medical_document_types_collection.bulk_write(
        [
            UpdateOne(
                {"document_type_id": medical_document_type["document_type_id"]},
                {"$set": medical_document_type},
                upsert=True,
            )
            for medical_document_type in MEDICAL_DOCUMENT_TYPES
        ]
    )


async def down() -> None:
    db = get_database()
    await db["medical_document_types"].delete_many({})

from app.common.logger import get_logger
from app.db.db_service import get_database
from app.db.models.medical_documents_entity import MedicalDocument
from app.db.models.medical_record_entity import MedicalRecord
from app.db.models.medication_entity import MedicalMedication

logger = get_logger("medical_record_repository")


class MedicalRecordRepository:
    def __init__(self):
        self.db = get_database()
        self.medical_records_collection = self.db["patient_medical_records"]
        self.medical_documents_collection = self.db["patient_medical_documents"]
        self.medications_collection = self.db["patient_medications"]

    async def create_medical_record(
        self,
        medical_record: MedicalRecord,
        medical_documents: list[MedicalDocument],
        medications: list[MedicalMedication],
    ) -> str:
        # 1. Insert main medical record
        record_data = medical_record.model_dump(mode="json")
        record_result = await self.medical_records_collection.insert_one(record_data)
        medical_record_id = str(record_result.inserted_id)

        # 2. Insert medical documents if present
        if medical_documents:
            docs_data = []
            for doc in medical_documents:
                doc_dict = doc.model_dump(mode="json")
                doc_dict["medical_record_id"] = medical_record_id
                docs_data.append(doc_dict)
            await self.medical_documents_collection.insert_many(docs_data)

        # 3. Insert medications if present
        if medications:
            meds_data = []
            for med in medications:
                med_dict = med.model_dump(mode="json")
                med_dict["medical_record_id"] = medical_record_id
                meds_data.append(med_dict)
            await self.medications_collection.insert_many(meds_data)

        logger.success(
            f"Created medical record (id={medical_record_id}) for patient {medical_record.patient_id} "
            f"with {len(medical_documents)} documents and {len(medications)} medications."
        )

        return medical_record_id

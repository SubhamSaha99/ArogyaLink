from pymongo import ASCENDING

from app.common.interfaces.patient_interface import MasterDataItemInterface
from app.common.logger import get_logger
from app.db.db_service import get_database

logger = get_logger("master_data_repository")


class MasterDataRepository:
    def __init__(self):
        self.db = get_database()
        self.states_collection = self.db["states"]
        self.districts_collection = self.db["districts"]

    async def get_all_states(self) -> list[MasterDataItemInterface]:
        cursor = self.states_collection.find(
            {},
            {"_id": 0, "state_id": 1, "state_name": 1, "state_code": 1},
        ).sort("state_id", ASCENDING)

        states: list[MasterDataItemInterface] = []
        async for doc in cursor:
            states.append(
                {
                    "id": doc["state_id"],
                    "name": doc["state_name"],
                    "code": doc["state_code"],
                }
            )
        return states

    async def get_districts_by_state_id(
        self, state_id: int
    ) -> list[MasterDataItemInterface]:
        cursor = self.districts_collection.find(
            {"state_id": state_id},
            {"_id": 0, "district_id": 1, "district_name": 1, "district_code": 1},
        ).sort("district_id", ASCENDING)

        districts: list[MasterDataItemInterface] = []
        async for doc in cursor:
            districts.append(
                {
                    "id": doc["district_id"],
                    "name": doc["district_name"],
                    "code": doc["district_code"],
                }
            )
        return districts


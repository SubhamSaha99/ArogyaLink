from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field

class Districts(BaseModel):
    districtId: int = Field(..., alias="district_id")
    stateId: int = Field(..., alias="state_id")
    districtName: str = Field(..., alias="district_name")
    districtCode: str = Field(..., alias="district_code")
    createdAt: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), alias="created_at"
    )

    model_config = ConfigDict(
        populate_by_name=True,
    )
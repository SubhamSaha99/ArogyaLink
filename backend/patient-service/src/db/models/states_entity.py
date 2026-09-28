from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field

class States(BaseModel):
    stateId: int = Field(..., alias="state_id")
    stateName: str = Field(..., alias="state_name")
    stateCode: str = Field(..., alias="state_code")
    createdAt: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), alias="created_at"
    )

    model_config = ConfigDict(
        populate_by_name=True,
    )
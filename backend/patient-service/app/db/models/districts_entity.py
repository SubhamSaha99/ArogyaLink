from datetime import datetime, timezone

from pydantic import BaseModel, Field

class Districts(BaseModel):
    district_id: int
    state_id: int
    district_name: str
    district_code: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
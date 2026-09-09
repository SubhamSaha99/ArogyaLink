from datetime import datetime, timezone

from pydantic import BaseModel, Field

class States(BaseModel):
    state_id: int
    state_name: str
    state_code: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
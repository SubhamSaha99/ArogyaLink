from pydantic import BaseModel, ConfigDict, Field

from src.common.enums.user_enums import UserRole


class JwtPayload(BaseModel):

    sessionId: str = Field(alias="sessionId")
    userPrimaryKey: int = Field(alias="userPrimaryKey")
    userBusinessId: str = Field(alias="userBusinessId")
    role: UserRole
    iat: int | None = None
    exp: int | None = None

    model_config = ConfigDict(
        populate_by_name=True,
    )

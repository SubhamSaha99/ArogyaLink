from fastapi import HTTPException, status
from jose import JWTError, jwt

from src.common.interfaces.jwt_playload_interface import JwtPayload
from src.config.settings import settings


# * Authenticate User
async def authenticateUser(token: str) -> JwtPayload:
    try:
        payload = jwt.decode(
            token,
            settings.jwtAccessSecret,
            algorithms=[settings.jwtAlgorithm],
        )

        return JwtPayload(**payload)

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )


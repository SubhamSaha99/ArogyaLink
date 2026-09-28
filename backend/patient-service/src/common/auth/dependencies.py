from fastapi import Depends, HTTPException, status
from collections.abc import Callable
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.common.auth.jwt import authenticateUser
from src.common.interfaces.jwt_playload_interface import JwtPayload
from src.common.enums.user_enums import UserRole

bearerScheme = HTTPBearer()


# * Get Current User
async def getCurrentUser(
    credentials: HTTPAuthorizationCredentials = Depends(bearerScheme),
) -> JwtPayload:

    return await authenticateUser(credentials.credentials)



# * Verify Role Access
def requireRoles(*allowedRoles: UserRole) -> Callable:

    async def roleChecker(
        currentUser: JwtPayload = Depends(getCurrentUser),
    ) -> JwtPayload:

        if currentUser.role not in allowedRoles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this resource.",
            )

        return currentUser

    return roleChecker


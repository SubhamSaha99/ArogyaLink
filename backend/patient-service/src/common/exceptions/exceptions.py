class AppException(Exception):

    def __init__(
        self,
        message: str,
        statusCode: int = 500,
    ):
        self.message = message
        self.statusCode = statusCode
        self.status_code = statusCode

        super().__init__(message)


class BadRequestException(AppException):

    def __init__(self, message: str):
        super().__init__(
            message,
            statusCode=400,
        )


class UnauthorizedException(AppException):

    def __init__(self, message: str = "Unauthorized"):
        super().__init__(
            message,
            statusCode=401,
        )


class ForbiddenException(AppException):

    def __init__(
        self,
        message: str = "You are not authorized to access this resource.",
    ):
        super().__init__(
            message,
            statusCode=403,
        )


class NotFoundException(AppException):

    def __init__(self, message: str):
        super().__init__(
            message,
            statusCode=404,
        )


class ConflictException(AppException):

    def __init__(self, message: str):
        super().__init__(
            message,
            statusCode=409,
        )
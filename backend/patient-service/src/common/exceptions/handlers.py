from datetime import datetime, timezone

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.common.logger.logger import getLogger

logger = getLogger("ExceptionHandler")


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


async def httpExceptionHandler(
    request: Request,
    exc: Exception,
) -> JSONResponse:

    if isinstance(exc, StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "statusCode": exc.status_code,
                "message": exc.detail,
                "timestamp": _timestamp(),
            },
        )

    return JSONResponse(
        status_code=500,
        content={
            "statusCode": 500,
            "message": "Internal server error",
            "timestamp": _timestamp(),
        },
    )


async def validationExceptionHandler(
    request: Request,
    exc: Exception,
) -> JSONResponse:

    if not isinstance(exc, RequestValidationError):
        return JSONResponse(
            status_code=500,
            content={
                "statusCode": 500,
                "message": "Internal server error",
                "timestamp": _timestamp(),
            },
        )

    errors = [
        {
            "field": ".".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        }
        for error in exc.errors()
    ]

    return JSONResponse(
        status_code=422,
        content={
            "statusCode": 422,
            "message": "Validation failed",
            "errors": errors,
            "timestamp": _timestamp(),
        },
    )


async def generalExceptionHandler(
    request: Request,
    exc: Exception,
) -> JSONResponse:

    logger.exception(f"Unhandled exception: {request.method} {request.url.path}")

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "statusCode": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "message": "Internal server error",
            "timestamp": _timestamp(),
        },
    )


def registerExceptionHandlers(app: FastAPI) -> None:

    app.add_exception_handler(
        StarletteHTTPException,
        httpExceptionHandler,
    )

    app.add_exception_handler(
        RequestValidationError,
        validationExceptionHandler,
    )

    app.add_exception_handler(
        Exception,
        generalExceptionHandler,
    )

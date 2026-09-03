import functools
import logging
import traceback
import grpc

logger = logging.getLogger("patient_grpc_error_handler")


def grpc_error_handler(func):
    """
    Global decorator for async gRPC servicer methods in patient-service.
    Catches Python exceptions and converts them into standardized gRPC status code aborts.
    """
    @functools.wraps(func)
    async def wrapper(self, request, context: grpc.aio.ServicerContext, *args, **kwargs):
        try:
            return await func(self, request, context, *args, **kwargs)
        except grpc.RpcError:
            # If already an active gRPC error/abort, let it pass through
            raise
        except ValueError as val_err:
            err_msg = str(val_err)
            logger.warning(f"Validation / Conflict error in {func.__name__}: {err_msg}")
            
            status_code = (
                grpc.StatusCode.ALREADY_EXISTS
                if "already exists" in err_msg.lower() or "duplicate" in err_msg.lower()
                else grpc.StatusCode.INVALID_ARGUMENT
            )
            await context.abort(status_code, err_msg)
            
        except (KeyError, LookupError, FileNotFoundError) as not_found_err:
            err_msg = str(not_found_err).strip("'\"")
            logger.warning(f"Resource not found in {func.__name__}: {err_msg}")
            await context.abort(
                grpc.StatusCode.NOT_FOUND,
                f"Resource not found: {err_msg}",
            )
            
        except PermissionError as perm_err:
            logger.warning(f"Permission denied in {func.__name__}: {perm_err}")
            await context.abort(
                grpc.StatusCode.PERMISSION_DENIED,
                str(perm_err) or "Permission denied to perform this operation.",
            )
            
        except TimeoutError as timeout_err:
            logger.warning(f"Timeout error in {func.__name__}: {timeout_err}")
            await context.abort(
                grpc.StatusCode.DEADLINE_EXCEEDED,
                "The requested patient operation timed out.",
            )
            
        except (ConnectionError, OSError) as conn_err:
            logger.error(f"Database/Network connection error in {func.__name__}: {conn_err}")
            await context.abort(
                grpc.StatusCode.UNAVAILABLE,
                "Database or dependent service is temporarily unavailable.",
            )
            
        except Exception as unhandled_err:
            logger.error(
                f"Unhandled exception in {func.__name__}: {unhandled_err}\n"
                f"{traceback.format_exc()}"
            )
            await context.abort(
                grpc.StatusCode.INTERNAL,
                "An internal server error occurred while processing the patient request.",
            )

    return wrapper

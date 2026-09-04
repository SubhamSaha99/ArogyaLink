import functools
import time
import traceback
import grpc
from app.common.logger import get_logger

logger = get_logger("grpc_handler")


def grpc_error_handler(func):
    """
    Global decorator for async gRPC servicer methods in patient-service.
    - Catches Python exceptions and converts them into standardized gRPC status code aborts.
    - Logs successful RPC executions in GREEN and errors in RED with timing.
    """
    @functools.wraps(func)
    async def wrapper(self, request, context: grpc.aio.ServicerContext, *args, **kwargs):
        start_time = time.perf_counter()
        rpc_name = func.__name__

        try:
            result = await func(self, request, context, *args, **kwargs)
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            logger.success(f"RPC {rpc_name} succeeded ({duration_ms:.2f}ms)")
            return result

        except grpc.RpcError:
            # If already an active gRPC error/abort, let it pass through
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            logger.error(f"RPC {rpc_name} failed with gRPC RpcError ({duration_ms:.2f}ms)")
            raise

        except ValueError as val_err:
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            err_msg = str(val_err)
            
            status_code = (
                grpc.StatusCode.ALREADY_EXISTS
                if "already exists" in err_msg.lower() or "duplicate" in err_msg.lower()
                else grpc.StatusCode.INVALID_ARGUMENT
            )
            logger.warning(
                f"RPC {rpc_name} validation/conflict ({duration_ms:.2f}ms) -> {err_msg} [{status_code.name}]"
            )
            await context.abort(status_code, err_msg)

        except (KeyError, LookupError, FileNotFoundError) as not_found_err:
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            err_msg = str(not_found_err).strip("'\"")
            logger.warning(
                f"RPC {rpc_name} not found ({duration_ms:.2f}ms) -> {err_msg} [NOT_FOUND]"
            )
            await context.abort(
                grpc.StatusCode.NOT_FOUND,
                f"Resource not found: {err_msg}",
            )

        except PermissionError as perm_err:
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            logger.warning(
                f"RPC {rpc_name} permission denied ({duration_ms:.2f}ms) -> {perm_err} [PERMISSION_DENIED]"
            )
            await context.abort(
                grpc.StatusCode.PERMISSION_DENIED,
                str(perm_err) or "Permission denied to perform this operation.",
            )

        except TimeoutError as timeout_err:
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            logger.error(
                f"RPC {rpc_name} timeout ({duration_ms:.2f}ms) -> {timeout_err} [DEADLINE_EXCEEDED]"
            )
            await context.abort(
                grpc.StatusCode.DEADLINE_EXCEEDED,
                "The requested patient operation timed out.",
            )

        except (ConnectionError, OSError) as conn_err:
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            logger.error(
                f"RPC {rpc_name} database/network error ({duration_ms:.2f}ms) -> {conn_err} [UNAVAILABLE]"
            )
            await context.abort(
                grpc.StatusCode.UNAVAILABLE,
                "Database or dependent service is temporarily unavailable.",
            )

        except Exception as unhandled_err:
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            logger.error(
                f"RPC {rpc_name} unhandled exception ({duration_ms:.2f}ms): {unhandled_err}\n"
                f"{traceback.format_exc()}"
            )
            await context.abort(
                grpc.StatusCode.INTERNAL,
                "An internal server error occurred while processing the patient request.",
            )

    return wrapper

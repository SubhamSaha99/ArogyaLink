import functools
import time
import traceback

import grpc

from src.common.logger.logger import getLogger

logger = getLogger("grpcErrorHandler")


def grpcErrorHandler(func):
    """
    Global decorator for async gRPC servicer methods in patient-service.
    - Catches Python exceptions and converts them into standardized gRPC status code aborts.
    - Logs successful RPC executions in GREEN and errors in RED with timing.
    """

    @functools.wraps(func)
    async def wrapper(
        self, request, context: grpc.aio.ServicerContext, *args, **kwargs
    ):
        startTime = time.perf_counter()
        rpcName = func.__name__

        try:
            result = await func(self, request, context, *args, **kwargs)
            durationMs = (time.perf_counter() - startTime) * 1000.0
            logger.success(f"RPC {rpcName} succeeded ({durationMs:.2f}ms)")
            return result

        except grpc.RpcError:
            # If already an active gRPC error/abort, let it pass through
            durationMs = (time.perf_counter() - startTime) * 1000.0
            logger.error(
                f"RPC {rpcName} failed with gRPC RpcError ({durationMs:.2f}ms)"
            )
            raise

        except ValueError as valErr:
            durationMs = (time.perf_counter() - startTime) * 1000.0
            errMsg = str(valErr)

            statusCode = (
                grpc.StatusCode.ALREADY_EXISTS
                if "already exists" in errMsg.lower() or "duplicate" in errMsg.lower()
                else grpc.StatusCode.INVALID_ARGUMENT
            )
            logger.warning(
                f"RPC {rpcName} validation/conflict ({durationMs:.2f}ms) -> {errMsg} [{statusCode.name}]"
            )
            await context.abort(statusCode, errMsg)

        except (KeyError, LookupError, FileNotFoundError) as notFoundErr:
            durationMs = (time.perf_counter() - startTime) * 1000.0
            errMsg = str(notFoundErr).strip("'\"")
            logger.warning(
                f"RPC {rpcName} not found ({durationMs:.2f}ms) -> {errMsg} [NOT_FOUND]"
            )
            await context.abort(
                grpc.StatusCode.NOT_FOUND,
                f"Resource not found: {errMsg}",
            )

        except PermissionError as permErr:
            durationMs = (time.perf_counter() - startTime) * 1000.0
            logger.warning(
                f"RPC {rpcName} permission denied ({durationMs:.2f}ms) -> {permErr} [PERMISSION_DENIED]"
            )
            await context.abort(
                grpc.StatusCode.PERMISSION_DENIED,
                str(permErr) or "Permission denied to perform this operation.",
            )

        except TimeoutError as timeoutErr:
            durationMs = (time.perf_counter() - startTime) * 1000.0
            logger.error(
                f"RPC {rpcName} timeout ({durationMs:.2f}ms) -> {timeoutErr} [DEADLINE_EXCEEDED]"
            )
            await context.abort(
                grpc.StatusCode.DEADLINE_EXCEEDED,
                "The requested patient operation timed out.",
            )

        except (ConnectionError, OSError) as connErr:
            durationMs = (time.perf_counter() - startTime) * 1000.0
            logger.error(
                f"RPC {rpcName} database/network error ({durationMs:.2f}ms) -> {connErr} [UNAVAILABLE]"
            )
            await context.abort(
                grpc.StatusCode.UNAVAILABLE,
                "Database or dependent service is temporarily unavailable.",
            )

        except Exception as unhandledErr:
            durationMs = (time.perf_counter() - startTime) * 1000.0
            logger.error(
                f"RPC {rpcName} unhandled exception ({durationMs:.2f}ms): {unhandledErr}\n"
                f"{traceback.format_exc()}"
            )
            await context.abort(
                grpc.StatusCode.INTERNAL,
                "An internal server error occurred while processing the patient request.",
            )

    return wrapper


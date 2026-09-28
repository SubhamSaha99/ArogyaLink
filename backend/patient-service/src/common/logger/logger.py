import logging
import sys
from datetime import datetime
from typing import Any

from pymongo.monitoring import (
    CommandFailedEvent,
    CommandListener,
    CommandStartedEvent,
    CommandSucceededEvent,
)


class AnsiColors:
    # High-intensity / Bright Colors
    GREEN_BOLD = "\033[1;92m"
    GREEN = "\033[92m"
    RED_BOLD = "\033[1;91m"
    RED = "\033[91m"
    YELLOW_BOLD = "\033[1;93m"
    YELLOW = "\033[93m"
    CYAN_BOLD = "\033[1;96m"
    CYAN = "\033[96m"
    MAGENTA_BOLD = "\033[1;95m"
    MAGENTA = "\033[95m"
    GRAY = "\033[90m"
    BOLD = "\033[1m"
    RESET = "\033[0m"


# Define SUCCESS level (between INFO and WARNING)
SUCCESS_LEVEL_NUM = 25
logging.addLevelName(SUCCESS_LEVEL_NUM, "SUCCESS")


class ServiceLogger(logging.Logger):
    def success(self, message, *args, **kws):
        if self.isEnabledFor(SUCCESS_LEVEL_NUM):
            self._log(SUCCESS_LEVEL_NUM, message, args, **kws)


logging.setLoggerClass(ServiceLogger)


class ColoredFormatter(logging.Formatter):
    """
    Service-wide log formatter:
    - SUCCESS & INFO: Bright Green
    - ERROR & CRITICAL: Bright Red
    - WARNING: Bright Yellow
    - DEBUG: Cyan
    """

    FORMATS = {
        logging.DEBUG: f"{AnsiColors.CYAN_BOLD}[DEBUG]{AnsiColors.RESET} {AnsiColors.GRAY}[%(asctime)s.%(msecs)03d]{AnsiColors.RESET} {AnsiColors.CYAN}[%(name)s]{AnsiColors.RESET} %(message)s",
        logging.INFO: f"{AnsiColors.GREEN_BOLD}[INFO]{AnsiColors.RESET}  {AnsiColors.GRAY}[%(asctime)s.%(msecs)03d]{AnsiColors.RESET} {AnsiColors.CYAN}[%(name)s]{AnsiColors.RESET} {AnsiColors.GREEN}%(message)s{AnsiColors.RESET}",
        SUCCESS_LEVEL_NUM: f"{AnsiColors.GREEN_BOLD}[SUCCESS]{AnsiColors.RESET} {AnsiColors.GRAY}[%(asctime)s.%(msecs)03d]{AnsiColors.RESET} {AnsiColors.CYAN}[%(name)s]{AnsiColors.RESET} {AnsiColors.GREEN_BOLD}%(message)s{AnsiColors.RESET}",
        logging.WARNING: f"{AnsiColors.YELLOW_BOLD}[WARN]{AnsiColors.RESET}  {AnsiColors.GRAY}[%(asctime)s.%(msecs)03d]{AnsiColors.RESET} {AnsiColors.CYAN}[%(name)s]{AnsiColors.RESET} {AnsiColors.YELLOW}%(message)s{AnsiColors.RESET}",
        logging.ERROR: f"{AnsiColors.RED_BOLD}[ERROR]{AnsiColors.RESET} {AnsiColors.GRAY}[%(asctime)s.%(msecs)03d]{AnsiColors.RESET} {AnsiColors.CYAN}[%(name)s]{AnsiColors.RESET} {AnsiColors.RED_BOLD}%(message)s{AnsiColors.RESET}",
        logging.CRITICAL: f"{AnsiColors.RED_BOLD}[FATAL]{AnsiColors.RESET} {AnsiColors.GRAY}[%(asctime)s.%(msecs)03d]{AnsiColors.RESET} {AnsiColors.CYAN}[%(name)s]{AnsiColors.RESET} {AnsiColors.RED_BOLD}%(message)s{AnsiColors.RESET}",
    }

    def format(self, record: logging.LogRecord) -> str:
        log_fmt = self.FORMATS.get(record.levelno, self.FORMATS[logging.INFO])
        formatter = logging.Formatter(log_fmt, datefmt="%Y-%m-%d %H:%M:%S")
        return formatter.format(record)


# Root Logger Configuration
_rootConfigured = False


def configureGlobalLogging(level: int = logging.INFO) -> None:
    global _rootConfigured
    if _rootConfigured:
        return

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(ColoredFormatter())

    rootLogger = logging.getLogger()
    rootLogger.setLevel(level)

    # Remove existing handlers to avoid duplicates
    for h in rootLogger.handlers[:]:
        rootLogger.removeHandler(h)

    rootLogger.addHandler(handler)
    _rootConfigured = True


def getLogger(name: str = "patient-service") -> ServiceLogger:
    """
    Get a pre-configured colored logger for any service component.
    """
    configureGlobalLogging()
    return logging.getLogger(name)  # type: ignore[return-value]


# Global service logger instance
appLogger = getLogger("patient-service")


class MongoQueryLogger(CommandListener):
    """
    Automatic PyMongo query and command monitoring listener.
    Logs every MongoDB operation executed by the patient service:
    - Successful queries logged in GREEN with execution duration and filter/payload details.
    - Failed queries logged in RED with execution duration and failure error message.
    """

    def __init__(self, ignoreInternalCommands: bool = True):
        self._activeCommands: dict[int, dict] = {}
        self._ignoreInternal = ignoreInternalCommands
        self._internalCommands = {
            "ping",
            "ismaster",
            "hello",
            "buildinfo",
            "saslstart",
            "saslcontinue",
            "getlasterror",
            "endrepsession",
        }

    def _formatCommandDetails(
        self, commandName: str, commandDoc: Any
    ) -> tuple[str, str]:
        """
        Extract collection name and relevant query filter/payload details from the PyMongo command doc.
        """
        if not isinstance(commandDoc, dict):
            return "", ""

        collection = commandDoc.get(commandName)
        if not isinstance(collection, str):
            collection = commandDoc.get("collection", "")

        detailsList = []

        # Find / Delete / Update filter
        if "filter" in commandDoc and commandDoc["filter"]:
            detailsList.append(f"filter={commandDoc['filter']}")

        # Insert operations
        if "documents" in commandDoc:
            docs = commandDoc["documents"]
            docCount = len(docs)
            if docCount == 1:
                detailsList.append(f"doc={docs[0]}")
            else:
                detailsList.append(f"docs_count={docCount} sample={docs[:1]}")

        # Update operations
        if "updates" in commandDoc:
            detailsList.append(f"updates={commandDoc['updates']}")
        elif "update" in commandDoc and isinstance(commandDoc.get("update"), dict):
            detailsList.append(f"update={commandDoc['update']}")

        # findAndModify operations
        if "query" in commandDoc:
            detailsList.append(f"query={commandDoc['query']}")
        if "update" in commandDoc and not isinstance(commandDoc.get("update"), str):
            detailsList.append(f"update={commandDoc['update']}")

        # Delete operations
        if "deletes" in commandDoc:
            detailsList.append(f"deletes={commandDoc['deletes']}")

        # Aggregation pipeline
        if "pipeline" in commandDoc:
            detailsList.append(f"pipeline={commandDoc['pipeline']}")

        # Sorting, Limit, Projection
        if "sort" in commandDoc and commandDoc["sort"]:
            detailsList.append(f"sort={commandDoc['sort']}")
        if "projection" in commandDoc and commandDoc["projection"]:
            detailsList.append(f"projection={commandDoc['projection']}")
        if "limit" in commandDoc:
            detailsList.append(f"limit={commandDoc['limit']}")

        detailsStr = " | ".join(detailsList) if detailsList else ""
        return str(collection), detailsStr

    def started(self, event: CommandStartedEvent) -> None:
        cmdName = event.command_name.lower()
        if self._ignoreInternal and cmdName in self._internalCommands:
            return

        collection, details = self._formatCommandDetails(
            event.command_name, event.command
        )

        # Store command metadata correlated by request_id
        self._activeCommands[event.request_id] = {
            "collection": collection,
            "details": details,
            "db": event.database_name,
            "cmd": event.command_name,
            "started_at": datetime.now(),
        }

        # Prevent memory leaks if map grows too large
        if len(self._activeCommands) > 1000:
            oldestKeys = list(self._activeCommands.keys())[:200]
            for k in oldestKeys:
                self._activeCommands.pop(k, None)

    def succeeded(self, event: CommandSucceededEvent) -> None:
        cmdName = event.command_name.lower()
        if self._ignoreInternal and cmdName in self._internalCommands:
            return

        info = self._activeCommands.pop(event.request_id, None)
        durationMs = event.duration_micros / 1000.0
        ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]

        if info:
            collection = info["collection"]
            target = f"{info['db']}.{collection}" if collection else info["db"]
            cmd = info["cmd"]
            details = f" -> {info['details']}" if info["details"] else ""
        else:
            target = event.database_name or "mongodb"
            cmd = event.command_name
            details = ""

        # GREEN log output for successful queries
        logLine = (
            f"{AnsiColors.GREEN_BOLD}[DB SUCCESS]{AnsiColors.RESET} "
            f"{AnsiColors.GRAY}[{ts}]{AnsiColors.RESET} "
            f"{AnsiColors.CYAN_BOLD}{target}.{cmd}{AnsiColors.RESET} "
            f"{AnsiColors.GREEN}({durationMs:.2f}ms){AnsiColors.RESET}"
            f"{details}"
        )
        print(logLine, flush=True)

    def failed(self, event: CommandFailedEvent) -> None:
        cmdName = event.command_name.lower()
        if self._ignoreInternal and cmdName in self._internalCommands:
            return

        info = self._activeCommands.pop(event.request_id, None)
        durationMs = event.duration_micros / 1000.0
        ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]

        if info:
            collection = info["collection"]
            target = f"{info['db']}.{collection}" if collection else info["db"]
            cmd = info["cmd"]
            details = f" | {info['details']}" if info["details"] else ""
        else:
            target = event.database_name or "mongodb"
            cmd = event.command_name
            details = ""

        # RED log output for failed queries
        errorMsg = str(event.failure)
        logLine = (
            f"{AnsiColors.RED_BOLD}[DB ERROR]{AnsiColors.RESET} "
            f"{AnsiColors.GRAY}[{ts}]{AnsiColors.RESET} "
            f"{AnsiColors.CYAN_BOLD}{target}.{cmd}{AnsiColors.RESET} "
            f"{AnsiColors.RED_BOLD}({durationMs:.2f}ms) FAILED{AnsiColors.RESET} -> "
            f"{AnsiColors.RED}Error: {errorMsg}{AnsiColors.RESET}"
            f"{details}"
        )
        print(logLine, flush=True)


# Manual query logger helper functions
def logDbSuccess(
    operation: str, collection: str, durationMs: float, details: str = ""
) -> None:
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    print(
        f"{AnsiColors.GREEN_BOLD}[DB SUCCESS]{AnsiColors.RESET} "
        f"{AnsiColors.GRAY}[{ts}]{AnsiColors.RESET} "
        f"{AnsiColors.CYAN_BOLD}{collection}.{operation}{AnsiColors.RESET} "
        f"{AnsiColors.GREEN}({durationMs:.2f}ms){AnsiColors.RESET}"
        + (f" -> {details}" if details else ""),
        flush=True,
    )

def logDbError(
    operation: str,
    collection: str,
    error: Exception | str,
    durationMs: float = 0.0,
    details: str = "",
) -> None:
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    print(
        f"{AnsiColors.RED_BOLD}[DB ERROR]{AnsiColors.RESET} "
        f"{AnsiColors.GRAY}[{ts}]{AnsiColors.RESET} "
        f"{AnsiColors.CYAN_BOLD}{collection}.{operation}{AnsiColors.RESET} "
        f"{AnsiColors.RED_BOLD}({durationMs:.2f}ms) FAILED{AnsiColors.RESET} -> "
        f"{AnsiColors.RED}Error: {error}{AnsiColors.RESET}"
        + (f" | {details}" if details else ""),
        flush=True,
    )

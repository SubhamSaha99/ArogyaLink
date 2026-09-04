import sys
import logging
from datetime import datetime
from typing import Any
from pymongo.monitoring import (
    CommandListener,
    CommandStartedEvent,
    CommandSucceededEvent,
    CommandFailedEvent,
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
_root_configured = False


def configure_global_logging(level: int = logging.INFO) -> None:
    global _root_configured
    if _root_configured:
        return

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(ColoredFormatter())

    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Remove existing handlers to avoid duplicates
    for h in root_logger.handlers[:]:
        root_logger.removeHandler(h)

    root_logger.addHandler(handler)
    _root_configured = True


def get_logger(name: str = "patient-service") -> ServiceLogger:
    """
    Get a pre-configured colored logger for any service component.
    """
    configure_global_logging()
    return logging.getLogger(name)  # type: ignore[return-value]


# Global service logger instance
app_logger = get_logger("patient-service")


class MongoQueryLogger(CommandListener):
    """
    Automatic PyMongo query and command monitoring listener.
    Logs every MongoDB operation executed by the patient service:
    - Successful queries logged in GREEN with execution duration and filter/payload details.
    - Failed queries logged in RED with execution duration and failure error message.
    """

    def __init__(self, ignore_internal_commands: bool = True):
        self._active_commands: dict[int, dict] = {}
        self._ignore_internal = ignore_internal_commands
        self._internal_commands = {
            "ping",
            "ismaster",
            "hello",
            "buildinfo",
            "saslstart",
            "saslcontinue",
            "getlasterror",
            "endrepsession",
        }

    def _format_command_details(
        self, command_name: str, command_doc: Any
    ) -> tuple[str, str]:
        """
        Extract collection name and relevant query filter/payload details from the PyMongo command doc.
        """
        if not isinstance(command_doc, dict):
            return "", ""

        collection = command_doc.get(command_name)
        if not isinstance(collection, str):
            collection = command_doc.get("collection", "")

        details_list = []

        # Find / Delete / Update filter
        if "filter" in command_doc and command_doc["filter"]:
            details_list.append(f"filter={command_doc['filter']}")

        # Insert operations
        if "documents" in command_doc:
            docs = command_doc["documents"]
            doc_count = len(docs)
            if doc_count == 1:
                details_list.append(f"doc={docs[0]}")
            else:
                details_list.append(f"docs_count={doc_count} sample={docs[:1]}")

        # Update operations
        if "updates" in command_doc:
            details_list.append(f"updates={command_doc['updates']}")
        elif "update" in command_doc and isinstance(command_doc.get("update"), dict):
            details_list.append(f"update={command_doc['update']}")

        # findAndModify operations
        if "query" in command_doc:
            details_list.append(f"query={command_doc['query']}")
        if "update" in command_doc and not isinstance(command_doc.get("update"), str):
            details_list.append(f"update={command_doc['update']}")

        # Delete operations
        if "deletes" in command_doc:
            details_list.append(f"deletes={command_doc['deletes']}")

        # Aggregation pipeline
        if "pipeline" in command_doc:
            details_list.append(f"pipeline={command_doc['pipeline']}")

        # Sorting, Limit, Projection
        if "sort" in command_doc and command_doc["sort"]:
            details_list.append(f"sort={command_doc['sort']}")
        if "projection" in command_doc and command_doc["projection"]:
            details_list.append(f"projection={command_doc['projection']}")
        if "limit" in command_doc:
            details_list.append(f"limit={command_doc['limit']}")

        details_str = " | ".join(details_list) if details_list else ""
        return str(collection), details_str

    def started(self, event: CommandStartedEvent) -> None:
        cmd_name = event.command_name.lower()
        if self._ignore_internal and cmd_name in self._internal_commands:
            return

        collection, details = self._format_command_details(event.command_name, event.command)

        # Store command metadata correlated by request_id
        self._active_commands[event.request_id] = {
            "collection": collection,
            "details": details,
            "db": event.database_name,
            "cmd": event.command_name,
            "started_at": datetime.now(),
        }

        # Prevent memory leaks if map grows too large
        if len(self._active_commands) > 1000:
            oldest_keys = list(self._active_commands.keys())[:200]
            for k in oldest_keys:
                self._active_commands.pop(k, None)

    def succeeded(self, event: CommandSucceededEvent) -> None:
        cmd_name = event.command_name.lower()
        if self._ignore_internal and cmd_name in self._internal_commands:
            return

        info = self._active_commands.pop(event.request_id, None)
        duration_ms = event.duration_micros / 1000.0
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
        log_line = (
            f"{AnsiColors.GREEN_BOLD}[DB SUCCESS]{AnsiColors.RESET} "
            f"{AnsiColors.GRAY}[{ts}]{AnsiColors.RESET} "
            f"{AnsiColors.CYAN_BOLD}{target}.{cmd}{AnsiColors.RESET} "
            f"{AnsiColors.GREEN}({duration_ms:.2f}ms){AnsiColors.RESET}"
            f"{details}"
        )
        print(log_line, flush=True)

    def failed(self, event: CommandFailedEvent) -> None:
        cmd_name = event.command_name.lower()
        if self._ignore_internal and cmd_name in self._internal_commands:
            return

        info = self._active_commands.pop(event.request_id, None)
        duration_ms = event.duration_micros / 1000.0
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
        error_msg = str(event.failure)
        log_line = (
            f"{AnsiColors.RED_BOLD}[DB ERROR]{AnsiColors.RESET} "
            f"{AnsiColors.GRAY}[{ts}]{AnsiColors.RESET} "
            f"{AnsiColors.CYAN_BOLD}{target}.{cmd}{AnsiColors.RESET} "
            f"{AnsiColors.RED_BOLD}({duration_ms:.2f}ms) FAILED{AnsiColors.RESET} -> "
            f"{AnsiColors.RED}Error: {error_msg}{AnsiColors.RESET}"
            f"{details}"
        )
        print(log_line, flush=True)


# Manual query logger helper functions
def log_db_success(operation: str, collection: str, duration_ms: float, details: str = "") -> None:
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    print(
        f"{AnsiColors.GREEN_BOLD}[DB SUCCESS]{AnsiColors.RESET} "
        f"{AnsiColors.GRAY}[{ts}]{AnsiColors.RESET} "
        f"{AnsiColors.CYAN_BOLD}{collection}.{operation}{AnsiColors.RESET} "
        f"{AnsiColors.GREEN}({duration_ms:.2f}ms){AnsiColors.RESET}"
        + (f" -> {details}" if details else ""),
        flush=True,
    )


def log_db_error(operation: str, collection: str, error: Exception | str, duration_ms: float = 0.0, details: str = "") -> None:
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    print(
        f"{AnsiColors.RED_BOLD}[DB ERROR]{AnsiColors.RESET} "
        f"{AnsiColors.GRAY}[{ts}]{AnsiColors.RESET} "
        f"{AnsiColors.CYAN_BOLD}{collection}.{operation}{AnsiColors.RESET} "
        f"{AnsiColors.RED_BOLD}({duration_ms:.2f}ms) FAILED{AnsiColors.RESET} -> "
        f"{AnsiColors.RED}Error: {error}{AnsiColors.RESET}"
        + (f" | {details}" if details else ""),
        flush=True,
    )

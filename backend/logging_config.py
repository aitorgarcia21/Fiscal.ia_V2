"""Central logging configuration with masking filter and rotation.

Sensitive data masked: emails, JWT/Bearer tokens, IBANs (FR, BE, CH, etc.).
The log file rotates at 1 MiB, keeping 30 backups. Railway collects stdout/stderr,
so we attach the same handlers to the root logger and Uvicorn access logs.
"""
from __future__ import annotations

import logging
import os
import re
from logging.handlers import RotatingFileHandler

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
JWT_RE = re.compile(r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}")
IBAN_RE = re.compile(r"\b([A-Z]{2}[0-9]{2}[A-Z0-9]{11,30})\b")

SENSITIVE_PATTERNS = [EMAIL_RE, JWT_RE, IBAN_RE]

class MaskFilter(logging.Filter):
    """Redacts sensitive patterns from log records."""

    MASK = "[REDACTED]"

    def filter(self, record: logging.LogRecord) -> bool:  # noqa: D401
        msg = str(record.getMessage())
        for pattern in SENSITIVE_PATTERNS:
            msg = pattern.sub(self.MASK, msg)
        # Replace the message in the record
        record.msg = msg
        if record.args:
            record.args = ()
        return True

def setup_logging() -> None:
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Console handler (Railway captures stdout)
    ch = logging.StreamHandler()
    ch.setLevel(log_level)
    ch.addFilter(MaskFilter())
    formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s")
    ch.setFormatter(formatter)
    root_logger.addHandler(ch)

    # Rotating file handler (in container FS; Railway keeps last deploy lifetime)
    fh = RotatingFileHandler("logs/app.log", maxBytes=1 * 1024 * 1024, backupCount=30)
    fh.setLevel(log_level)
    fh.addFilter(MaskFilter())
    fh.setFormatter(formatter)
    root_logger.addHandler(fh)

    # Reduce noise from dependencies
    logging.getLogger("botocore").setLevel("WARNING")
    logging.getLogger("boto3").setLevel("WARNING")
    logging.getLogger("httpx").setLevel("WARNING")

    # Uvicorn access logger inherits root handlers
    logging.getLogger("uvicorn.access").addFilter(MaskFilter())

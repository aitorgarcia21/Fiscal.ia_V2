"""Utility to redact personally identifiable information (PII) from user text before
sending it to third-party LLM providers (e.g., Mistral).

The function currently masks:
- Email addresses
- IBAN numbers (basic pattern)
- French phone numbers
You can extend `PATTERNS` for names or other PII later.
"""
from __future__ import annotations

import re

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
IBAN_RE = re.compile(r"\b([A-Z]{2}[0-9]{2}[A-Z0-9]{11,30})\b")
PHONE_RE = re.compile(r"\b\+?\d[\d\s\-]{8,}\d\b")  # simple rule


PATTERNS = [EMAIL_RE, IBAN_RE, PHONE_RE]

MASK = "[PII]"

def sanitize_text(text: str) -> str:
    """Return *text* with PII redacted."""
    redacted = text
    for pattern in PATTERNS:
        redacted = pattern.sub(MASK, redacted)
    return redacted

__all__ = ["sanitize_text"]

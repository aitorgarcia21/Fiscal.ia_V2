#!/usr/bin/env python3
"""fetch_official_docs.py

Utility to download official fiscal documents (PDF or HTML) from a given list of
URLs, extract their plain text, split it into coherent chunks (~3 000 chars) and
save them into the expected directory structure so that the embedding generator
can process them.

Current focus: Luxembourg (LIR + TVA) but script is generic and can be reused
for Switzerland / Andorra.

Usage (example for Luxembourg):
    python backend/fetch_official_docs.py --country LU \
        --url https://impotsdirects.public.lu/fr/legislation/LIR.html \
        --url https://legilux.public.lu/eli/etat/leg/loi/2009/12/12/n1/jo

Environment:
    The script writes to data/<country>_chunks_text/  (created if necessary).

Dependencies:
    pip install requests beautifulsoup4 pdfminer.six tqdm

"""
from __future__ import annotations

import argparse
import os
import re
import textwrap
from pathlib import Path
from typing import List

import requests
from bs4 import BeautifulSoup
from pdfminer.high_level import extract_text  # type: ignore
from tqdm import tqdm

# ---------------------------------------------------------------------------
# Constants and helpers
# ---------------------------------------------------------------------------

CHUNK_SIZE = 3000  # characters
RE_SPACES = re.compile(r"\s+")


def clean_text(text: str) -> str:
    """Normalise whitespace and remove excessive blank lines."""
    text = RE_SPACES.sub(" ", text)
    # Limit consecutive newlines to max 2
    text = re.sub(r"(\n\s*){3,}", "\n\n", text)
    return text.strip()


def chunkify(text: str, chunk_size: int = CHUNK_SIZE) -> List[str]:
    """Split text into ~chunk_size char pieces, on sentence boundaries if possible."""
    sentences = re.split(r"(?<=[.!?])\s", text)
    chunks: List[str] = []
    current: List[str] = []
    current_len = 0
    for sent in sentences:
        if current_len + len(sent) + 1 > chunk_size and current:
            chunks.append(" ".join(current))
            current = [sent]
            current_len = len(sent) + 1
        else:
            current.append(sent)
            current_len += len(sent) + 1
    if current:
        chunks.append(" ".join(current))
    return chunks


def fetch_url(url: str) -> bytes:
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    return resp.content


def extract_text_from_pdf(content: bytes) -> str:
    from io import BytesIO

    with BytesIO(content) as f:
        return extract_text(f)


def extract_text_from_html(content: bytes) -> str:
    soup = BeautifulSoup(content, "html.parser")
    # Remove scripts / styles
    for t in soup(["script", "style", "noscript"]):
        t.decompose()
    text = soup.get_text("\n")
    return text


# ---------------------------------------------------------------------------
# Main routine
# ---------------------------------------------------------------------------

def process_url(url: str) -> str:
    """Download URL and return plain text extracted."""
    content = fetch_url(url)
    if url.lower().endswith(".pdf") or b"%PDF" in content[:10]:
        text = extract_text_from_pdf(content)
    else:
        text = extract_text_from_html(content)
    return clean_text(text)


def save_chunks(text: str, dest_dir: Path, base_name: str):
    dest_dir.mkdir(parents=True, exist_ok=True)
    chunks = chunkify(text)
    for idx, chunk in enumerate(chunks):
        path = dest_dir / f"{base_name}_{idx:04d}.txt"
        path.write_text(chunk, encoding="utf-8")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Fetch official fiscal documents and split into chunks.")
    parser.add_argument("--country", required=True, help="ISO code: LU, CH, AD …")
    parser.add_argument("--url", action="append", required=True, help="URL to fetch. Can be repeated.")
    args = parser.parse_args()

    dest_dir = Path("data") / f"{args.country.lower()}_chunks_text"

    print(f"Destination directory: {dest_dir}")
    for url in tqdm(args.url, desc="Downloading & processing"):
        try:
            print(f"\n→ {url}")
            text = process_url(url)
            if not text:
                print("  ⚠️  No text extracted.")
                continue
            base_name = re.sub(r"[^a-zA-Z0-9]+", "_", url.split("//", 1)[-1])[:50]
            save_chunks(text, dest_dir, base_name)
            print(f"  Saved chunks for {url}")
        except Exception as e:
            print(f"  ❌ Error processing {url}: {e}")

    print("\n✅ All done.")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""generate_luxembourg_embeddings.py

Generate embeddings for official Luxembourg fiscal text chunks previously saved
in `data/lu_chunks_text/` by `fetch_official_docs.py`.
The resulting .npy files are stored in `data/luxembourg_embeddings/` with the
same numeric order so that `mistral_luxembourg_embeddings.py` can load them.
"""
from __future__ import annotations

import os
import time
import logging
from pathlib import Path
from typing import List

import numpy as np
from mistralai.client import MistralClient
from tqdm import tqdm

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("luxembourg-embeddings")

CHUNKS_DIR = Path("data/lu_chunks_text")
EMBEDDINGS_DIR = Path("data/luxembourg_embeddings")
MODEL_NAME = "mistral-embed"


class LuxembourgEmbeddingsGenerator:
    def __init__(self):
        api_key = os.getenv("MISTRAL_API_KEY")
        if not api_key:
            raise EnvironmentError("MISTRAL_API_KEY must be set to generate embeddings.")
        self.client = MistralClient(api_key=api_key)
        EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)

    def _list_chunks(self) -> List[Path]:
        if not CHUNKS_DIR.exists():
            raise FileNotFoundError(f"Chunks directory {CHUNKS_DIR} does not exist.")
        return sorted(CHUNKS_DIR.glob("*.txt"))

    def _embedding_path(self, chunk_file: Path) -> Path:
        return EMBEDDINGS_DIR / (chunk_file.stem + ".npy")

    def generate(self, batch_delay: float = 1.5):
        chunks = self._list_chunks()
        logger.info("Found %d Luxembourg chunks", len(chunks))
        for idx, chunk_file in enumerate(tqdm(chunks, desc="Embedding LU chunks")):
            emb_path = self._embedding_path(chunk_file)
            if emb_path.exists():
                continue
            text = chunk_file.read_text(encoding="utf-8")
            # Empty check
            if not text.strip():
                logger.warning("Chunk %s is empty, skipping.", chunk_file.name)
                continue
            # Request embedding
            response = self.client.embeddings(model=MODEL_NAME, input=[text])
            emb = np.array(response.data[0].embedding, dtype=np.float32)
            np.save(emb_path, emb)
            if (idx + 1) % 10 == 0:
                time.sleep(batch_delay)
        logger.info("✅ Luxembourg embeddings generation completed.")


if __name__ == "__main__":
    generator = LuxembourgEmbeddingsGenerator()
    generator.generate()

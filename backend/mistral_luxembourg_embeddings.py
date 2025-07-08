import os
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple
from functools import lru_cache

from mistralai.client import MistralClient

"""mistral_luxembourg_embeddings.py
Utilities to load Luxembourg fiscal text chunks and perform similarity search.
Embeddings are generated via `generate_luxembourg_embeddings.py` and stored in
`backend/data/luxembourg_embeddings`.
"""

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    raise ValueError("MISTRAL_API_KEY doit être définie pour utiliser les embeddings Luxembourg.")

client = MistralClient(api_key=MISTRAL_API_KEY)

CHUNKS_DIR = Path("data/luxembourg_chunks_text")
EMBEDDINGS_DIR = Path("data/luxembourg_embeddings")


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Return cosine similarity between two vectors."""
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


@lru_cache(maxsize=256)
def get_query_embedding(query: str) -> np.ndarray:
    """Compute and cache query embedding using Mistral embed model."""
    resp = client.embeddings(model="mistral-embed", input=[query])
    return np.array(resp.data[0].embedding, dtype=np.float32)


def search_similar_chunks(query: str, top_k: int = 5) -> List[Dict]:
    """Return the top_k Luxembourg chunks most similar to the query.

    Returns a list of dicts with keys: chunk, similarity, text, file
    """
    if not EMBEDDINGS_DIR.exists():
        raise FileNotFoundError(
            "Embeddings Luxembourg introuvables. Lancez generate_luxembourg_embeddings.py d'abord."
        )

    query_emb = get_query_embedding(query)
    results: List[Tuple[str, float]] = []

    for emb_path in EMBEDDINGS_DIR.glob("luxembourg_chunk_*.npy"):
        emb = np.load(emb_path)
        sim = cosine_similarity(query_emb, emb)
        results.append((emb_path.stem, sim))

    # Sort by similarity descending
    results.sort(key=lambda x: x[1], reverse=True)

    top_results: List[Dict] = []
    for stem, score in results[:top_k]:
        txt_file = CHUNKS_DIR / f"{stem}.txt"
        snippet = txt_file.read_text(encoding="utf-8")[:500] if txt_file.exists() else ""
        top_results.append({
            "chunk": stem,
            "similarity": score,
            "text": snippet,
            "file": txt_file.name if txt_file.exists() else stem,
        })
    return top_results


if __name__ == "__main__":
    sample_q = "Quel est le barème de l'impôt sur le revenu au Luxembourg en 2025 ?"
    for r in search_similar_chunks(sample_q):
        print(r["chunk"], r["similarity"])

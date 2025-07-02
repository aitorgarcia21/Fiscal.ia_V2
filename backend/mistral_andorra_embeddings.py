import os
from pathlib import Path
import json
from typing import List, Dict, Tuple
import numpy as np
from functools import lru_cache
from mistralai.client import MistralClient

"""
Chargement et recherche de similarité pour les textes fiscaux andorrans.
Les embeddings sont générés à l'aide de generate_andorra_embeddings.py
et stockés dans backend/data/andorra_embeddings.
"""

MISTRAL_API_KEY = os.getenv('MISTRAL_API_KEY')
if not MISTRAL_API_KEY:
    raise ValueError("MISTRAL_API_KEY doit être définie.")

client = MistralClient(api_key=MISTRAL_API_KEY)

CHUNKS_DIR = Path('data/andorra_chunks_text')
EMBEDDINGS_DIR = Path('data/andorra_embeddings')


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


@lru_cache(maxsize=256)
def get_query_embedding(query: str) -> np.ndarray:
    resp = client.embeddings(model="mistral-embed", input=[query])
    return np.array(resp.data[0].embedding, dtype=np.float32)


def search_similar_chunks(query: str, top_k: int = 5) -> List[Dict]:
    """Retourne les chunks les plus pertinents."""
    if not EMBEDDINGS_DIR.exists():
        raise FileNotFoundError("Embeddings andorrans introuvables. Lancez generate_andorra_embeddings.py d'abord.")

    query_emb = get_query_embedding(query)
    results: List[Tuple[str, float]] = []

    for emb_path in EMBEDDINGS_DIR.glob('andorra_chunk_*.npy'):
        emb = np.load(emb_path)
        sim = cosine_similarity(query_emb, emb)
        results.append((emb_path.stem, sim))

    # top_k trié
    results.sort(key=lambda x: x[1], reverse=True)
    top_results = []
    for stem, score in results[:top_k]:
        txt_file = CHUNKS_DIR / f"{stem}.txt"
        snippet = txt_file.read_text(encoding='utf-8')[:500] if txt_file.exists() else ""
        top_results.append({
            'chunk': stem,
            'similarity': score,
            'text': snippet
        })
    return top_results


if __name__ == '__main__':
    sample_q = "Quel est le taux de l'IRPF en Andorre en 2025 ?"
    for r in search_similar_chunks(sample_q):
        print(r['chunk'], r['similarity']) 
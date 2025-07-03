import os, time
import numpy as np
from pathlib import Path
from tqdm import tqdm

"""
Génération d'embeddings Mistral pour les chunks de fiscalité andorrane.
Réutilise la logique de generate_bofip_embeddings.py.
Usage :
    python generate_andorra_embeddings.py
Pré-requis :
    • Les chunks texte doivent être présents dans backend/data/andorra_chunks_text/
      (fichiers andorra_chunk_XXXX.txt)
    • La variable d'environnement MISTRAL_API_KEY doit être définie.
Les embeddings sont créés dans backend/data/andorra_embeddings/
"""

# Choix dynamique du backend embeddings : Ollama (local) ou API Mistral
USE_LOCAL = bool(os.getenv("LLM_ENDPOINT"))

if USE_LOCAL:
    from backend.ollama_client import embed as embed_local
else:
    from mistralai.client import MistralClient

MODEL_NAME = "nomic-embed-text" if USE_LOCAL else "mistral-embed"
CHUNKS_DIR = Path('data/andorra_chunks_text')
EMBEDDINGS_DIR = Path('data/andorra_embeddings')

if not USE_LOCAL:
    MISTRAL_API_KEY = os.getenv('MISTRAL_API_KEY')
    if not MISTRAL_API_KEY:
        raise ValueError("Spécifiez MISTRAL_API_KEY ou configurez LLM_ENDPOINT pour un backend local.")
    client = MistralClient(api_key=MISTRAL_API_KEY)
else:
    client = None


def get_embedding(text: str, retries: int = 3, delay: float = 1.0) -> np.ndarray:
    for attempt in range(retries):
        try:
            if USE_LOCAL:
                vecs = embed_local(text)
                return np.array(vecs[0], dtype=np.float32)
            else:
                resp = client.embeddings(model=MODEL_NAME, input=[text])
                return np.array(resp.data[0].embedding, dtype=np.float32)
        except Exception as e:
            if attempt == retries - 1:
                raise e
            wait = delay * (2 ** attempt)
            print(f"⏳ Tentative {attempt+1}/{retries} échouée, nouvelle tentative dans {wait}s…")
            time.sleep(wait)
    raise RuntimeError("Impossible d'obtenir l'embedding après plusieurs tentatives")


def generate_embeddings():
    if not CHUNKS_DIR.exists():
        raise FileNotFoundError(f"Dossier chunks introuvable : {CHUNKS_DIR}. Exécutez d'abord extract_andorra_tax_docs.py")
    EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)

    chunk_files = sorted(CHUNKS_DIR.glob('andorra_chunk_*.txt'))
    processed, errors = 0, 0
    for txt_file in tqdm(chunk_files, desc="Embeddings Andorre"):
        emb_file = EMBEDDINGS_DIR / txt_file.with_suffix('.npy').name
        if emb_file.exists():
            continue  # Skip existing
        text = txt_file.read_text(encoding='utf-8')
        if not text.strip():
            print(f"⚠️ Chunk vide : {txt_file.name}")
            continue
        try:
            emb = get_embedding(text)
            np.save(emb_file, emb)
            processed += 1
            time.sleep(0.3)
        except Exception as e:
            print(f"❌ Erreur embedding {txt_file.name}: {e}")
            errors += 1
    print(f"✅ Embeddings créés : {processed} | Erreurs : {errors}")


if __name__ == '__main__':
    generate_embeddings() 
import os
import numpy as np
from pathlib import Path
from tqdm import tqdm
import time
from mistralai.client import MistralClient

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

MODEL_NAME = "mistral-embed"
CHUNKS_DIR = Path('data/andorra_chunks_text')
EMBEDDINGS_DIR = Path('data/andorra_embeddings')

MISTRAL_API_KEY = os.getenv('MISTRAL_API_KEY')
if not MISTRAL_API_KEY:
    raise ValueError("MISTRAL_API_KEY manquante. Définissez-la avant d'exécuter ce script.")

client = MistralClient(api_key=MISTRAL_API_KEY)


def get_embedding(text: str, retries: int = 3, delay: float = 1.0) -> np.ndarray:
    for attempt in range(retries):
        try:
            resp = client.embeddings(model=MODEL_NAME, input=[text])
            return np.array(resp.data[0].embedding, dtype=np.float32)
        except Exception as e:
            if attempt == retries - 1:
                raise e
            wait = delay * (2 ** attempt)
            print(f"⏳ Tentative {attempt+1}/{retries} échouée, nouvelle tentative dans {wait}s…")
            time.sleep(wait)
    raise RuntimeError("Échec de l'obtention de l'embedding après plusieurs tentatives")


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
import os
import numpy as np
from tqdm import tqdm
import time
import re
from mistralai.client import MistralClient

# Configuration
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY") 
if not MISTRAL_API_KEY:
    # Tenter de récupérer la clé depuis le script original si non définie en variable d'env
    # Ceci est une solution de repli temporaire et devrait être géré proprement avec des variables d'env
    print("Avertissement: MISTRAL_API_KEY non définie dans l'environnement. Tentative de récupération alternative...")
    # MISTRAL_API_KEY = "8SZTNsTAi2JUAxdj7wDXa3rCxf7Txcod" # Clé du script original, à supprimer à terme
    # if not MISTRAL_API_KEY: # Si toujours pas de clé après la tentative de repli
    raise ValueError("La variable d'environnement MISTRAL_API_KEY doit être définie. "
                     "Elle n'a pas été trouvée dans l'environnement ni en fallback.")

MODEL_NAME = "mistral-embed"

SOURCE_TEXT_FILE = os.path.join("data", "bofip_extracted_text.txt")
BOFIP_CHUNKS_TEXT_DIR = os.path.join("data", "bofip_chunks_text")
BOFIP_EMBEDDINGS_DIR = os.path.join("data", "bofip_embeddings")

client = MistralClient(api_key=MISTRAL_API_KEY)

def get_embedding_mistral(text_chunk: str, max_retries: int = 3, delay: float = 1.0) -> np.ndarray:
    """Obtient l'embedding d'un morceau de texte via l'API Mistral en utilisant le client officiel."""
    for attempt in range(max_retries):
        try:
            embeddings_batch_response = client.embeddings(
                model=MODEL_NAME,
                input=[text_chunk]
            )
            return np.array(embeddings_batch_response.data[0].embedding, dtype=np.float32)
        except Exception as e:
            # Tentative de gestion plus fine de l'erreur 429 pour le client officiel
            is_rate_limit_error = False
            if hasattr(e, 'response') and e.response is not None: # Pour les erreurs HTTP
                 if hasattr(e.response, 'status_code') and e.response.status_code == 429:
                    is_rate_limit_error = True
            elif "429" in str(e): # Pour les cas où l'erreur est une chaîne contenant le code
                is_rate_limit_error = True

            if is_rate_limit_error:
                wait_time = delay * (2 ** attempt)
                print(f"\n[ATTENTE] Limite de taux atteinte (ou erreur assimilée). Attente de {wait_time:.1f} secondes...")
                time.sleep(wait_time)
                continue
            elif attempt == max_retries - 1:
                print(f"Erreur finale lors de l'obtention de l'embedding pour le chunk après {max_retries} tentatives: {e}")
                raise e
            else:
                print(f"Tentative {attempt + 1} échouée, nouvelle tentative dans {delay}s: {e}")
                time.sleep(delay)
    raise Exception("Nombre maximum de tentatives atteint pour l'obtention de l'embedding.")

def chunk_text_by_paragraph(text: str, min_chunk_size: int = 50, max_chunk_size: int = 1000) -> list[str]:
    """Découpe le texte en paragraphes, avec des tailles min et max pour les chunks."""
    raw_paragraphs = text.split('\n\n')
    
    processed_chunks = []
    current_chunk = ""

    for p_text in raw_paragraphs:
        p_stripped = p_text.strip()
        if not p_stripped: # Ignorer les paragraphes complètement vides
            continue

        # Si le paragraphe lui-même est plus grand que max_chunk_size, on essaie de le diviser davantage
        # (par phrase, ou simplement le couper, bien que couper au milieu d'une phrase soit moins idéal)
        if len(p_stripped) > max_chunk_size:
            # Stratégie de découpage simple pour les très longs paragraphes : couper à max_chunk_size
            # Une meilleure stratégie impliquerait de découper par phrases.
            for i in range(0, len(p_stripped), max_chunk_size):
                sub_chunk = p_stripped[i:i+max_chunk_size].strip()
                if len(sub_chunk) >= min_chunk_size:
                    processed_chunks.append(sub_chunk)
            # Si après un découpage, il y avait un chunk en cours, on le sauvegarde s'il est valide
            if len(current_chunk) >= min_chunk_size:
                processed_chunks.append(current_chunk)
                current_chunk = ""
            continue # Passer au paragraphe suivant après avoir traité le long paragraphe

        # Logique de fusion des petits paragraphes
        if len(current_chunk) + len(p_stripped) + 1 <= max_chunk_size: # +1 pour l'espace ou \n\n
            if current_chunk: # Ajouter un séparateur si current_chunk n'est pas vide
                current_chunk += "\n\n" + p_stripped
            else:
                current_chunk = p_stripped
        else:
            # Le nouveau paragraphe ferait dépasser la taille max, donc on sauvegarde le chunk actuel (s'il est valide)
            if len(current_chunk) >= min_chunk_size:
                processed_chunks.append(current_chunk)
            # Le nouveau paragraphe devient le début du prochain chunk
            current_chunk = p_stripped if len(p_stripped) >= min_chunk_size else ""
            
    # Ajouter le dernier chunk en cours s'il est valide
    if len(current_chunk) >= min_chunk_size:
        processed_chunks.append(current_chunk)

    final_chunks = [chunk for chunk in processed_chunks if len(chunk.strip()) >= min_chunk_size]
    print(f"Texte découpé en {len(final_chunks)} chunks finaux.")
    return final_chunks

def generate_bofip_embeddings():
    """Génère les embeddings pour le texte du BOFIP découpé en chunks."""
    os.makedirs(BOFIP_CHUNKS_TEXT_DIR, exist_ok=True)
    os.makedirs(BOFIP_EMBEDDINGS_DIR, exist_ok=True)

    try:
        with open(SOURCE_TEXT_FILE, 'r', encoding='utf-8') as f:
            bofip_text = f.read()
    except FileNotFoundError:
        print(f"Erreur : Le fichier texte source {SOURCE_TEXT_FILE} n'a pas été trouvé.")
        return

    chunks = chunk_text_by_paragraph(bofip_text, min_chunk_size=100, max_chunk_size=1500) # Ajustement des tailles
    
    processed_count = 0
    error_count = 0

    # Filtrer les chunks déjà traités
    existing_embeddings_files = os.listdir(BOFIP_EMBEDDINGS_DIR)
    chunks_to_process = []
    for i, chunk in enumerate(chunks):
        chunk_filename_base = f"bofip_chunk_{i:04d}"
        embedding_chunk_path = os.path.join(BOFIP_EMBEDDINGS_DIR, f"{chunk_filename_base}.npy")
        if not os.path.exists(embedding_chunk_path):
            chunks_to_process.append((i, chunk))
        else:
            # Sauvegarder aussi le fichier texte si l'embedding existe déjà (pour complétude)
            text_chunk_path = os.path.join(BOFIP_CHUNKS_TEXT_DIR, f"{chunk_filename_base}.txt")
            if not os.path.exists(text_chunk_path):
                 with open(text_chunk_path, 'w', encoding='utf-8') as f_text:
                    f_text.write(chunk)

    if not chunks_to_process:
        print("Aucun nouveau chunk à traiter. Tous les embeddings semblent déjà générés.")
        return
    
    print(f"{len(chunks_to_process)} nouveaux chunks à traiter.")

    for i, chunk in tqdm(chunks_to_process, desc="Génération des embeddings BOFIP"):
        original_index = i # Garder l'index original pour le nommage du fichier
        chunk_filename_base = f"bofip_chunk_{original_index:04d}"
        text_chunk_path = os.path.join(BOFIP_CHUNKS_TEXT_DIR, f"{chunk_filename_base}.txt")
        embedding_chunk_path = os.path.join(BOFIP_EMBEDDINGS_DIR, f"{chunk_filename_base}.npy")

        # Sauvegarder le chunk texte (même si l'embedding échoue, pour analyse)
        with open(text_chunk_path, 'w', encoding='utf-8') as f_text:
            f_text.write(chunk)
        
        try:
            embedding = get_embedding_mistral(chunk)
            np.save(embedding_chunk_path, embedding)
            processed_count += 1
            time.sleep(0.3) # Délai légèrement augmenté
        except Exception as e:
            print(f"[ERREUR] Impossible de générer l'embedding pour {chunk_filename_base}: {e}")
            error_count += 1
    
    print(f"\nTraitement terminé. {processed_count} nouveaux embeddings BOFIP générés.")
    if error_count > 0:
        print(f"{error_count} erreurs rencontrées durant la génération des embeddings.")

if __name__ == "__main__":
    print("Démarrage de la génération des embeddings pour le BOFIP...")
    generate_bofip_embeddings()
    print("Génération des embeddings BOFIP terminée.") 
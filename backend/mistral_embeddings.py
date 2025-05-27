import os
import requests
import json
import numpy as np
from tqdm import tqdm
from pathlib import Path
from typing import List, Dict, Tuple
import argparse
import time

MISTRAL_API_KEY = "8SZTNsTAi2JUAxdj7wDXa3rCxf7Txcod"
MISTRAL_API_URL = "https://api.mistral.ai/v1/embeddings"
CHUNKS_DIR = "data/cgi_chunks"
EMBEDDINGS_DIR = "data/embeddings"

headers = {
    "Authorization": f"Bearer {MISTRAL_API_KEY}",
    "Content-Type": "application/json"
}

def get_embedding(text: str, max_retries: int = 3, delay: float = 1.0) -> np.ndarray:
    """Obtient l'embedding d'un texte via l'API Mistral avec gestion des erreurs et délai."""
    for attempt in range(max_retries):
        try:
            req = {
                "model": "mistral-embed",
                "input": [text]
            }
            response = requests.post(MISTRAL_API_URL, headers=headers, json=req)
            
            if response.status_code == 200:
                return np.array(response.json()["data"][0]["embedding"], dtype=np.float32)
            elif response.status_code == 429:  # Rate limit
                wait_time = delay * (2 ** attempt)  # Exponential backoff
                print(f"\n[ATTENTE] Limite de taux atteinte. Attente de {wait_time:.1f} secondes...")
                time.sleep(wait_time)
                continue
            else:
                raise Exception(f"Erreur API: {response.status_code} - {response.text}")
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            time.sleep(delay)
    raise Exception("Nombre maximum de tentatives atteint")

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Calcule la similarité cosinus entre deux vecteurs."""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def format_article_for_display(article_data: Dict) -> str:
    """Formate un article pour l'affichage avec sa structure."""
    chunks = article_data.get('chunks', [])
    if not chunks:
        return f"Article {article_data['article_number']} (pas de contenu)"
    
    return f"Article {article_data['article_number']}\n\n" + '\n\n'.join(chunks)

def search_similar_articles(query: str, top_k: int = 5) -> List[Dict]:
    """Recherche les articles les plus similaires à une question."""
    # Obtenir l'embedding de la question
    query_embedding = get_embedding(query)
    
    # Charger tous les embeddings et calculer les similarités
    similarities = []
    for emb_file in Path(EMBEDDINGS_DIR).glob("*.npy"):
        article_embedding = np.load(emb_file)
        similarity = cosine_similarity(query_embedding, article_embedding)
        
        # Charger le texte de l'article correspondant
        article_file = Path(CHUNKS_DIR) / (emb_file.stem + '.json')
        with open(article_file, 'r') as f:
            article_data = json.load(f)
        
        similarities.append({
            'file': article_file.name,
            'similarity': similarity,
            'article_data': article_data,
            'formatted_text': format_article_for_display(article_data)
        })
    
    # Trier par similarité et retourner les top_k résultats
    similarities.sort(key=lambda x: x['similarity'], reverse=True)
    return similarities[:top_k]

def generate_all_embeddings():
    """Génère les embeddings pour tous les articles avec logs détaillés."""
    os.makedirs(EMBEDDINGS_DIR, exist_ok=True)
    files = [f for f in os.listdir(CHUNKS_DIR) if f.endswith('.json')]
    total, saved, skipped = 0, 0, 0
    
    # Vérifier les fichiers déjà traités
    existing_embeddings = set(f.replace('.npy', '.json') for f in os.listdir(EMBEDDINGS_DIR))
    files_to_process = [f for f in files if f not in existing_embeddings]
    
    print(f"\nFichiers déjà traités : {len(existing_embeddings)}")
    print(f"Fichiers restants à traiter : {len(files_to_process)}")
    
    for filename in tqdm(files_to_process, desc="Génération des embeddings"):
        path = os.path.join(CHUNKS_DIR, filename)
        with open(path, 'r') as f:
            data = json.load(f)
            # Utiliser le texte formaté pour l'embedding
            text = format_article_for_display(data)
            total += 1
            if not text.strip():
                print(f"[SKIP] {filename} : texte vide.")
                skipped += 1
                continue
            try:
                print(f"[EMBED] {filename} : {len(text)} caractères.")
                emb = get_embedding(text)
                out_path = os.path.join(EMBEDDINGS_DIR, filename.replace('.json', '.npy'))
                np.save(out_path, emb)
                print(f"[OK] Embedding sauvegardé : {out_path}")
                saved += 1
                time.sleep(0.5)  # Délai entre chaque requête
            except Exception as e:
                print(f"[ERREUR] {filename} : {str(e)}")
    
    print(f"\nTotal articles : {total} | Embeddings sauvegardés : {saved} | Skipped : {skipped}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gestion des embeddings Mistral pour le CGI")
    parser.add_argument("--mode", choices=["generate", "search"], required=True,
                      help="Mode d'exécution : 'generate' pour générer les embeddings, 'search' pour rechercher")
    parser.add_argument("--query", help="Question pour la recherche (mode 'search' uniquement)")
    parser.add_argument("--context", action="store_true", help="Afficher le contexte complet des articles")
    args = parser.parse_args()

    if args.mode == "generate":
        print("Génération des embeddings...")
        generate_all_embeddings()
        print("\nTous les embeddings ont été générés et sauvegardés dans data/embeddings/")
    elif args.mode == "search":
        if not args.query:
            print("Erreur : --query est requis en mode 'search'")
            exit(1)
        print(f"\nRecherche pour : {args.query}")
        results = search_similar_articles(args.query)
        
        print("\nArticles les plus pertinents :")
        for i, result in enumerate(results, 1):
            print(f"\n{i}. {result['file']} (similarité : {result['similarity']:.3f})")
            if args.context:
                print(f"\nTexte complet :\n{result['formatted_text']}\n")
                print("-" * 80)
            else:
                print(f"Texte : {result['formatted_text'][:200]}...")

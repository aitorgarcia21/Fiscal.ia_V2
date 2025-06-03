import os
from pathlib import Path
import json
from typing import List, Dict, Tuple
import numpy as np
from dotenv import load_dotenv
from functools import lru_cache
import hashlib

load_dotenv()

# Configuration
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    raise ValueError("MISTRAL_API_KEY doit être définie dans les variables d'environnement")

# Chemins des fichiers
CHUNKS_DIR = Path('data/cgi_chunks')
EMBEDDINGS_DIR = Path('data/embeddings')  # Dossier des embeddings existants

def load_articles() -> List[Dict]:
    """Charge tous les articles depuis les fichiers JSON."""
    articles = []
    for json_file in CHUNKS_DIR.glob('*.json'):
        with open(json_file, 'r', encoding='utf-8') as f:
            article_data = json.load(f)
            articles.append(article_data)
    return articles

def load_embeddings() -> Dict[str, Dict]:
    """Charge tous les embeddings existants."""
    embeddings = {}
    
    # Charger tous les articles une seule fois
    articles_dict = {}
    for article in load_articles():
        article_num = str(article.get('article_number', '')).strip()
        if article_num:
            articles_dict[article_num] = article
    
    # Charger les embeddings et les associer aux articles
    for npy_file in EMBEDDINGS_DIR.glob('CGI_*.npy'):
        article_num = npy_file.stem.replace('CGI_', '')
        embedding = np.load(npy_file)
        
        # Trouver l'article correspondant dans le dictionnaire
        if article_num in articles_dict:
            article = articles_dict[article_num]
            embeddings[article_num] = {
                "article_number": article_num,
                "embeddings": embedding.tolist(),
                "text": article.get('full_text', ''),
                "hierarchy": article.get('hierarchy', {})
            }
    
    return embeddings

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calcule la similarité cosinus entre deux vecteurs."""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

@lru_cache(maxsize=128)
def get_query_embedding(query: str) -> List[float]:
    """Génère l'embedding d'une requête avec cache."""
    from mistralai.client import MistralClient
    client = MistralClient(api_key=os.getenv("MISTRAL_API_KEY"))
    response = client.embeddings(
        model="mistral-embed",
        input=query
    )
    return response.data[0].embedding

def search_similar_articles(query: str, embeddings: Dict[str, Dict], top_k: int = 3) -> List[Tuple[Dict, float]]:
    """Recherche les articles les plus similaires à la requête et renvoie une liste de tuples (article_data, similarité)."""
    # Utiliser le cache pour l'embedding de la requête
    query_embedding = get_query_embedding(query)
    scored_articles: List[Tuple[Dict, float]] = []

    # Calculer la similarité pour chaque article
    for article_num, article_data in embeddings.items():
        similarity = cosine_similarity(query_embedding, article_data['embeddings'])
        scored_articles.append((article_data, similarity))

    # Trier par similarité décroissante
    scored_articles.sort(key=lambda x: x[1], reverse=True)

    return scored_articles[:top_k]

if __name__ == "__main__":
    # Test de chargement des embeddings
    embeddings = load_embeddings()
    print(f"✅ {len(embeddings)} embeddings chargés avec succès !") 
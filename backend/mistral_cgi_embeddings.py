import os
from pathlib import Path
import json
from typing import List, Dict
import numpy as np
from dotenv import load_dotenv

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
    for npy_file in EMBEDDINGS_DIR.glob('CGI_*.npy'):
        article_num = npy_file.stem.replace('CGI_', '')
        embedding = np.load(npy_file)
        
        # Trouver l'article correspondant
        for article in load_articles():
            if str(article.get('article_number', '')).strip() == article_num:
                embeddings[article_num] = {
                    "article_number": article_num,
                    "embeddings": embedding.tolist(),
                    "text": article.get('full_text', ''),
                    "hierarchy": article.get('hierarchy', {})
                }
                break
    
    return embeddings

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calcule la similarité cosinus entre deux vecteurs."""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def search_similar_articles(query: str, embeddings: Dict[str, Dict], top_k: int = 3) -> List[Dict]:
    """Recherche les articles les plus similaires à la requête."""
    # Générer l'embedding de la requête avec Mistral
    from mistralai.client import MistralClient
    client = MistralClient(api_key=os.getenv("MISTRAL_API_KEY"))
    query_embedding = client.embeddings(
        model="mistral-embed",
        input=query
    ).data[0].embedding
    
    scored_articles = []
    for article_num, article_data in embeddings.items():
        similarity = cosine_similarity(query_embedding, article_data['embeddings'])
        scored_articles.append((article_data, similarity))
    
    # Trier par similarité décroissante
    scored_articles.sort(key=lambda x: x[1], reverse=True)
    
    return [article for article, _ in scored_articles[:top_k]]

if __name__ == "__main__":
    # Test de chargement des embeddings
    embeddings = load_embeddings()
    print(f"✅ {len(embeddings)} embeddings chargés avec succès !") 
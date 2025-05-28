import os
import json
import numpy as np
from pathlib import Path
from typing import List, Dict
import requests
import time
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage

# Configuration
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
EMBEDDINGS_DIR = "data/embeddings"
CHUNKS_DIR = "data/cgi_chunks"

# Initialisation du client Mistral
client = MistralClient(api_key=MISTRAL_API_KEY) if MISTRAL_API_KEY else None

def get_embedding(text: str) -> np.ndarray:
    """Obtient l'embedding d'un texte via l'API Mistral."""
    if not client:
        raise Exception("Client Mistral non initialisé")
    
    response = client.embeddings(
        model="mistral-embed",
        input=[text]
    )
    return np.array(response.data[0].embedding)

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
    """Recherche les articles les plus similaires à la requête."""
    try:
        # Vérifier si les dossiers existent
        if not os.path.exists(EMBEDDINGS_DIR) or not os.path.exists(CHUNKS_DIR):
            print(f"Dossiers manquants: {EMBEDDINGS_DIR} ou {CHUNKS_DIR}")
            return []
        
        # Obtenir l'embedding de la requête
        query_embedding = get_embedding(query)
        
        # Charger tous les embeddings et chunks
        similarities = []
        embeddings_path = Path(EMBEDDINGS_DIR)
        chunks_path = Path(CHUNKS_DIR)
        
        if not embeddings_path.exists() or not chunks_path.exists():
            return []
        
        for embedding_file in embeddings_path.glob("*.npy"):
            try:
                # Charger l'embedding
                embedding = np.load(embedding_file)
                
                # Calculer la similarité
                similarity = cosine_similarity(query_embedding, embedding)
                
                # Charger le chunk correspondant
                chunk_file = chunks_path / f"{embedding_file.stem}.json"
                if chunk_file.exists():
                    with open(chunk_file, 'r', encoding='utf-8') as f:
                        chunk_data = json.load(f)
                    
                    similarities.append({
                        'similarity': similarity,
                        'content': chunk_data.get('content', ''),
                        'source': chunk_data.get('source', ''),
                        'article_id': chunk_data.get('article_id', '')
                    })
            except Exception as e:
                print(f"Erreur lors du traitement de {embedding_file}: {e}")
                continue
        
        # Trier par similarité et retourner les top_k
        similarities.sort(key=lambda x: x['similarity'], reverse=True)
        return similarities[:top_k]
    
    except Exception as e:
        print(f"Erreur dans search_similar_articles: {e}")
        return []

def create_prompt(query: str, similar_articles: List[Dict]) -> str:
    """Crée le prompt pour l'assistant fiscal."""
    context = "\n\n".join([
        f"Article {article.get('article_id', 'N/A')}: {article['content']}"
        for article in similar_articles
    ])
    
    prompt = f"""Tu es un assistant fiscal expert. Réponds à la question suivante en te basant sur les articles du Code Général des Impôts fournis.

Question: {query}

Articles pertinents du CGI:
{context}

Instructions:
- Réponds de manière précise et professionnelle
- Cite les articles du CGI utilisés
- Si les informations ne sont pas suffisantes, indique-le clairement
- Utilise un langage accessible tout en restant technique

Réponse:"""
    
    return prompt

def get_fiscal_response(query: str) -> str:
    """Obtient une réponse de l'assistant fiscal."""
    try:
        if not client:
            return "Erreur: Client Mistral non configuré"
        
        # Rechercher les articles similaires
        similar_articles = search_similar_articles(query)
        
        if not similar_articles:
            return "Aucun article pertinent trouvé dans la base de données."
        
        # Créer le prompt
        prompt = create_prompt(query, similar_articles)
        
        # Obtenir la réponse de Mistral
        messages = [ChatMessage(role="user", content=prompt)]
        
        response = client.chat(
            model="mistral-large-latest",
            messages=messages,
            temperature=0.1,
            max_tokens=1000
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        print(f"Erreur dans get_fiscal_response: {e}")
        return f"Erreur lors de la génération de la réponse: {str(e)}"

def main():
    print("Assistant Fiscal Expert (tapez 'quit' pour quitter)")
    print("=" * 50)
    
    while True:
        query = input("\nVotre question : ").strip()
        if query.lower() == 'quit':
            break
            
        try:
            response = get_fiscal_response(query)
            print("\nRéponse :")
            print("-" * 50)
            print(response)
            print("-" * 50)
        except Exception as e:
            print(f"Erreur : {str(e)}")
        
        time.sleep(1)  # Délai entre les requêtes

if __name__ == "__main__":
    if not MISTRAL_API_KEY:
        print("Erreur : La clé API Mistral n'est pas définie (MISTRAL_API_KEY)")
        exit(1)
    main() 
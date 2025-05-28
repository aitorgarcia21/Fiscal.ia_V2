import os
import json
import numpy as np
from pathlib import Path
from typing import List, Dict
import requests
import time
from mistralai import Mistral

# Configuration
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
EMBEDDINGS_DIR = "data/embeddings"
CHUNKS_DIR = "data/cgi_chunks"

# Initialisation du client Mistral
client = Mistral(api_key=MISTRAL_API_KEY) if MISTRAL_API_KEY else None

def get_embedding(text: str) -> np.ndarray:
    """Obtient l'embedding d'un texte via l'API Mistral."""
    if not client:
        raise Exception("Client Mistral non initialisé")
    
    response = client.embeddings.create(
        model="mistral-embed",
        inputs=[text]
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
    """Recherche les articles les plus similaires à une question."""
    # Vérifier si les dossiers existent
    if not Path(EMBEDDINGS_DIR).exists() or not Path(CHUNKS_DIR).exists():
        print(f"Attention: Les dossiers de données n'existent pas ({EMBEDDINGS_DIR}, {CHUNKS_DIR})")
        return []
    
    if not client:
        print("Attention: Client Mistral non initialisé")
        return []
    
    try:
        query_embedding = get_embedding(query)
        similarities = []
        
        for emb_file in Path(EMBEDDINGS_DIR).glob("*.npy"):
            try:
                article_embedding = np.load(emb_file)
                similarity = cosine_similarity(query_embedding, article_embedding)
                
                article_file = Path(CHUNKS_DIR) / (emb_file.stem + '.json')
                if article_file.exists():
                    with open(article_file, 'r') as f:
                        article_data = json.load(f)
                    
                    similarities.append({
                        'file': article_file.name,
                        'similarity': similarity,
                        'article_data': article_data,
                        'formatted_text': format_article_for_display(article_data)
                    })
            except Exception as e:
                print(f"Erreur lors du traitement de {emb_file}: {e}")
                continue
        
        similarities.sort(key=lambda x: x['similarity'], reverse=True)
        return similarities[:top_k]
    except Exception as e:
        print(f"Erreur lors de la recherche: {e}")
        return []

def create_prompt(query: str, context: List[Dict]) -> str:
    """Crée le prompt pour l'assistant avec le contexte."""
    if not context:
        return f"""Tu es Francis, un expert en fiscalité française avec plus de 20 ans d'expérience. 

Question de l'utilisateur : {query}

IMPORTANT : Les données de référence ne sont pas disponibles actuellement. Réponds en te basant sur tes connaissances générales en fiscalité française, mais précise que tu n'as pas accès aux articles spécifiques du CGI pour cette réponse."""
    
    context_text = "\n\n".join([f"---\n{result['formatted_text']}" for result in context])
    
    return f"""Tu es Francis, un expert en fiscalité française avec plus de 20 ans d'expérience. Tu dois répondre à la question de l'utilisateur en te basant uniquement sur les articles du Code Général des Impôts fournis ci-dessous.

Articles pertinents du CGI :
{context_text}

Question de l'utilisateur : {query}

IMPORTANT - Instructions de réponse :
1. Réponds DIRECTEMENT à la question posée, sans faire de digressions
2. Si la question est simple, donne une réponse simple
3. Si la question demande des détails, explique en détail
4. Commence toujours par la réponse principale
5. Utilise les articles comme base de ta réponse mais NE LES CITE PAS
6. Évite le jargon juridique complexe
7. Si tu ne peux pas répondre avec certitude, dis-le clairement
8. Sois professionnel mais accessible, comme un expert qui explique à un client

Format de réponse souhaité :
- Réponse principale : [réponse directe à la question]
- Détails : [si nécessaire, explications supplémentaires]"""

def get_assistant_response(query: str) -> str:
    """Obtient la réponse de l'assistant avec le contexte."""
    if not client:
        return "Erreur: Le service Mistral n'est pas disponible."
    
    try:
        # Recherche des articles pertinents
        context = search_similar_articles(query)
        
        # Création du prompt avec le contexte
        prompt = create_prompt(query, context)
        
        # Appel à l'API Mistral
        messages = [
            {"role": "system", "content": "Tu es un assistant fiscal expert en droit fiscal français."},
            {"role": "user", "content": prompt}
        ]
        
        response = client.chat.complete(
            model="mistral-large-latest",
            messages=messages,
            temperature=0.3  # Température basse pour des réponses plus précises
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"Erreur lors de la génération de la réponse: {str(e)}"

def main():
    print("Assistant Fiscal Expert (tapez 'quit' pour quitter)")
    print("=" * 50)
    
    while True:
        query = input("\nVotre question : ").strip()
        if query.lower() == 'quit':
            break
            
        try:
            response = get_assistant_response(query)
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
import os
import json
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple
import requests
import time
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage

# Importer la nouvelle fonction de recherche pour le BOFIP
# et s'assurer que les variables de chemin sont bien définies au niveau du module si nécessaire.
from mistral_embeddings import search_similar_bofip_chunks, get_embedding as get_embedding_from_mistral_script, cosine_similarity as cosine_similarity_from_mistral_script

# Configuration
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# Pour les articles CGI (existants)
CGI_EMBEDDINGS_DIR = Path("data/embeddings") # Utiliser Path pour la cohérence
CGI_CHUNKS_DIR = Path("data/cgi_chunks")

# Pour les chunks BOFIP (nouveaux)
# Ces chemins sont déjà utilisés par search_similar_bofip_chunks, mais les redéfinir ici peut être utile pour la clarté
# ou si on voulait accéder aux fichiers directement depuis ce script à l'avenir.
BOFIP_CHUNKS_TEXT_DIR = Path("data/bofip_chunks_text")
BOFIP_EMBEDDINGS_DIR = Path("data/bofip_embeddings")


# Initialisation du client Mistral
client = MistralClient(api_key=MISTRAL_API_KEY) if MISTRAL_API_KEY else None

# Utiliser les fonctions get_embedding et cosine_similarity du script mistral_embeddings
# pour éviter la redéfinition et assurer la cohérence.
# Si get_embedding est spécifique à ce fichier (par exemple, gestion d'erreur différente), 
# il faudrait le clarifier ou le fusionner.
# Pour l'instant, supposons que celle de mistral_embeddings.py est la référence.
get_embedding = get_embedding_from_mistral_script
cosine_similarity = cosine_similarity_from_mistral_script


def format_article_for_display(article_data: Dict) -> str:
    """Formate un article du CGI pour l'affichage avec sa structure."""
    chunks = article_data.get('chunks', [])
    if not chunks:
        return f"Article {article_data.get('article_number', 'N/A')} (pas de contenu)"
    
    return f"Article {article_data.get('article_number', 'N/A')}\n\n" + '\n\n'.join(chunks)

def search_similar_cgi_articles(query: str, top_k: int = 3) -> List[Dict]: # Renommage pour clarté
    """Recherche les articles du CGI les plus similaires à la requête."""
    try:
        if not client: # Vérifier si le client est initialisé
            print("Erreur: Client Mistral non initialisé pour la recherche CGI.")
            return []
            
        if not CGI_EMBEDDINGS_DIR.exists() or not CGI_CHUNKS_DIR.exists():
            print(f"Dossiers CGI manquants: {CGI_EMBEDDINGS_DIR} ou {CGI_CHUNKS_DIR}")
            return []
        
        query_embedding = get_embedding(query)
        similarities = []
        
        for embedding_file in CGI_EMBEDDINGS_DIR.glob("*.npy"):
            try:
                embedding = np.load(embedding_file)
                similarity = cosine_similarity(query_embedding, embedding)
                chunk_file = CGI_CHUNKS_DIR / f"{embedding_file.stem}.json"
                if chunk_file.exists():
                    with open(chunk_file, 'r', encoding='utf-8') as f:
                        chunk_data = json.load(f)
                    similarities.append({
                        'similarity': similarity,
                        'content': format_article_for_display(chunk_data), # Utiliser le formatage pour le contexte
                        'source': f"CGI Article {chunk_data.get('article_number', 'N/A')}",
                        'article_id': chunk_data.get('article_number', 'N/A')
                    })
            except Exception as e:
                print(f"Erreur lors du traitement du fichier CGI {embedding_file}: {e}")
                continue
        
        similarities.sort(key=lambda x: x['similarity'], reverse=True)
        return similarities[:top_k]
    except Exception as e:
        print(f"Erreur dans search_similar_cgi_articles: {e}")
        return []

def create_prompt(query: str, cgi_articles: List[Dict], bofip_chunks: List[Dict]) -> str:
    """Crée le prompt pour l'assistant fiscal avec contextes CGI et BOFIP."""
    
    cgi_context_str = "N/A"
    if cgi_articles:
        cgi_context_str = "\n\n".join([
            f"Source: {article.get('source', 'CGI N/A')}\nContenu: {article['content']}"
            for article in cgi_articles
        ])

    bofip_context_str = "N/A"
    if bofip_chunks:
        bofip_context_str = "\n\n".join([
            f"Source: BOFIP (fichier: {chunk.get('file', 'N/A')}, similarité: {chunk.get('similarity', 0):.3f})\nContenu: {chunk['text']}"
            for chunk in bofip_chunks
        ])
    
    prompt = f"""Tu es Francis, un assistant fiscal expert hautement spécialisé en fiscalité française, créé par la société Fiscal.ia. 

Question: {query}

Contexte du Code Général des Impôts (CGI):
---
{cgi_context_str}
---

Contexte du BOFIP:
---
{bofip_context_str}
---

Instructions:
- Tu es un expert fiscal et tu DOIS aider l'utilisateur en répondant à sa question de manière claire et pratique.
- Utilise prioritairement les informations fournies du CGI et du BOFIP pour construire ta réponse.
- Si les contextes contiennent des éléments pertinents, même partiels, utilise-les pour donner une réponse utile.
- Synthétise les informations disponibles et donne des conseils pratiques.
- Tu peux mentionner tes sources (ex: "Selon l'article X du CGI" ou "D'après le BOFIP") mais ce n'est pas obligatoire.
- ÉVITE les formules trop formelles comme "En tant que Francis..." ou "les informations ne me permettent pas".
- Sois direct, utile et professionnel.
- Si tu n'as vraiment aucune information pertinente, donne quand même une réponse générale basée sur tes connaissances fiscales françaises.

Réponds directement à la question:"""
    
    return prompt

def get_fiscal_response(query: str) -> Tuple[str, List[str], float]:
    """Obtient une réponse de l'assistant fiscal et les sources utilisées."""
    all_sources_for_api = []
    # Estimer une confiance globale simple. Peut être affiné plus tard.
    # Par exemple, basée sur la similarité moyenne des chunks retenus, ou si des chunks ont été trouvés.
    confidence_score = 0.5 

    try:
        if not client:
            return "Erreur: Client Mistral non configuré", [], 0.0
        
        similar_cgi_articles = search_similar_cgi_articles(query, top_k=2)
        similar_bofip_chunks = search_similar_bofip_chunks(query, top_k=2)

        if similar_cgi_articles:
            all_sources_for_api.extend([art.get('source', 'CGI inconnu') for art in similar_cgi_articles])
            confidence_score = max(confidence_score, 0.7) # Augmenter la confiance si CGI trouvé
        if similar_bofip_chunks:
            all_sources_for_api.extend([f"BOFIP: {chunk.get('file', 'Chunk inconnu')}" for chunk in similar_bofip_chunks])
            confidence_score = max(confidence_score, 0.75) # Augmenter un peu plus si BOFIP trouvé

        if not similar_cgi_articles and not similar_bofip_chunks:
            print("Aucun article CGI ni chunk BOFIP pertinent trouvé.")
            # Pourrait retourner une réponse indiquant l'absence d'info, ou laisser Mistral le dire.
            # Si on veut que Mistral le dise, on envoie un prompt sans contexte spécifique.
            # prompt = f"Tu es un assistant fiscal expert. Réponds à la question suivante au mieux de tes connaissances générales: {query}" 
            # Pour l'instant, on s'en tient au prompt strict et on s'attend à ce que Mistral dise qu'il ne sait pas.
            confidence_score = 0.2

        prompt = create_prompt(query, similar_cgi_articles, similar_bofip_chunks)
        
        messages = [ChatMessage(role="user", content=prompt)]
        
        chat_response = client.chat(
            model="mistral-large-latest",
            messages=messages,
            temperature=0.5,
            max_tokens=1500
        )
        
        answer = chat_response.choices[0].message.content

        # Si Mistral dit qu'il ne peut pas répondre, on peut baisser la confiance.
        if "ne me permettent pas de répondre" in answer or "pas d'informations suffisantes" in answer:
            confidence_score = min(confidence_score, 0.4) # Baisser la confiance si l'IA elle-même est incertaine
        elif similar_cgi_articles or similar_bofip_chunks: # Si on a fourni du contexte et que l'IA n'a pas dit "je ne sais pas"
            confidence_score = 0.85 # Bonne confiance si contexte utilisé

        return answer, list(set(all_sources_for_api)), confidence_score
    
    except Exception as e:
        print(f"Erreur dans get_fiscal_response: {e}")
        return "Je rencontre des difficultés pour traiter votre demande. Veuillez réessayer plus tard.", [], 0.1

def main():
    print("Assistant Fiscal Expert (tapez 'quit' pour quitter)")
    print("=" * 50)
    
    while True:
        query = input("\nVotre question : ").strip()
        if query.lower() == 'quit':
            break
            
        try:
            # La fonction main est surtout pour le test en CLI, 
            # la structure de retour de get_fiscal_response a changé.
            answer, sources, confidence = get_fiscal_response(query)
            print("\nRéponse de Francis:")
            print("-" * 50)
            print(answer)
            print("-" * 50)
            if sources:
                print(f"Sources potentielles: {', '.join(sources)}")
            print(f"Confiance (estimation): {confidence:.2f}")
            print("-" * 50)
        except Exception as e:
            print(f"Erreur : {str(e)}")
        
        # time.sleep(1) # Délai entre les requêtes, peut-être moins nécessaire en CLI

if __name__ == "__main__":
    if not MISTRAL_API_KEY:
        print("Erreur : La clé API Mistral n'est pas définie (MISTRAL_API_KEY).")
        exit(1)
    if not client:
        print("Erreur : Le client Mistral n'a pas pu être initialisé. Vérifiez la clé API.")
        exit(1)
    main() 
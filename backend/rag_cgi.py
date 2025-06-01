import os
from pathlib import Path
import json
from typing import List, Dict
import logging
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from dotenv import load_dotenv
from mistral_cgi_embeddings import load_embeddings, search_similar_articles

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()

# Configuration Mistral
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    raise ValueError("MISTRAL_API_KEY doit être définie dans les variables d'environnement")

# Initialisation du client Mistral
client = MistralClient(api_key=MISTRAL_API_KEY)

def format_article_for_gpt(article: Dict) -> str:
    """Formate un article pour l'inclusion dans le prompt."""
    hierarchy = article.get('hierarchy', {})
    hierarchy_str = " > ".join(filter(None, [
        hierarchy.get('livre', ''),
        hierarchy.get('titre', ''),
        hierarchy.get('chapitre', ''),
        hierarchy.get('section', '')
    ]))
    text = article.get('text', '')
    if len(text) > 5000:
        text = text[:5000] + "..."
    return f"""
Article {article.get('article_number', '')}
Hiérarchie : {hierarchy_str}
Texte : {text}
"""

def get_relevant_articles(query: str, n_results: int = 3) -> str:
    """Récupère les articles les plus pertinents pour une question donnée."""
    embeddings = load_embeddings()
    if not embeddings:
        return "Aucun embedding trouvé. Veuillez d'abord générer les embeddings."
    
    relevant_articles = search_similar_articles(query, embeddings, n_results)
    if not relevant_articles:
        return "Aucun article pertinent trouvé."
    
    # Concaténer les textes des articles les plus pertinents
    context = "\n\n".join([
        format_article_for_gpt(article) for article in relevant_articles
    ])
    return context

def ask_mistral_with_context(question: str, context: str) -> str:
    """Pose une question à Mistral avec le contexte des articles CGI."""
    prompt = f"""
Tu es un assistant fiscaliste pédagogue. Voici plusieurs extraits du Code Général des Impôts. Utilise uniquement ces extraits pour répondre à la question.

Extraits du CGI :
{context}

Question :
{question}

Instructions pour ta réponse :
1. Commence par "D'après l'article X du CGI :" suivi de la définition exacte (ou des articles concernés)
2. Explique ensuite en termes très simples, comme si tu expliquais à quelqu'un qui n'y connaît rien en fiscalité
3. Utilise des exemples concrets si possible
4. Évite le jargon fiscal complexe
5. Structure ta réponse avec des points clairs et courts
6. Si plusieurs articles sont cités, précise leur articulation
7. IMPORTANT : Ne fais pas le calcul toi-même, explique simplement comment le calcul doit être fait

Réponse :
"""
    messages = [ChatMessage(role="user", content=prompt)]
    response = client.chat(
        model="mistral-large-latest",
        messages=messages,
        temperature=0.2,
        max_tokens=800
    )
    return response.choices[0].message.content.strip()

def get_cgi_response(question: str) -> tuple[str, List[str], float]:
    """Fonction principale pour obtenir une réponse basée sur le CGI."""
    try:
        # Récupérer les articles pertinents
        context = get_relevant_articles(question)
        
        # Obtenir la réponse de Mistral
        answer = ask_mistral_with_context(question, context)
        
        # Extraire les sources (numéros d'articles)
        sources = []
        for line in answer.split('\n'):
            if "Article" in line and "du CGI" in line:
                article_num = line.split("Article")[1].split("du")[0].strip()
                sources.append(f"Article {article_num}")
        
        # Calculer un score de confiance basé sur la présence de sources
        confidence = min(1.0, len(sources) / 3.0) if sources else 0.5
        
        return answer, sources, confidence
        
    except Exception as e:
        logger.error(f"Erreur lors du traitement de la question : {str(e)}")
        return f"Erreur lors du traitement de la question : {str(e)}", [], 0.0

if __name__ == "__main__":
    print("\n=== Assistant Fiscaliste CGI ===\n")
    question = input("Votre question sur le CGI : ")
    answer, sources, confidence = get_cgi_response(question)
    print("\nRéponse :\n")
    print(answer)
    print("\nSources :", sources)
    print("Confiance :", confidence) 
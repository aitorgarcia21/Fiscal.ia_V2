import os
import json
from pathlib import Path
import logging
from typing import List, Dict
import re
import openai
import sys

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration OpenAI
openai.api_key = "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"

# Chemins des fichiers
CHUNKS_DIR = Path('data/cgi_chunks')

def load_articles() -> List[Dict]:
    """Charge tous les articles depuis les fichiers JSON."""
    articles = []
    for json_file in CHUNKS_DIR.glob('*.json'):
        with open(json_file, 'r', encoding='utf-8') as f:
            article_data = json.load(f)
            articles.append(article_data)
    return articles

def search_articles(query, articles, top_k=3):
    """Recherche les articles les plus pertinents pour une question donnée."""
    # Mots-clés importants pour le régime mère-fille
    keywords = {
        'mère': 5,
        'fille': 5,
        'société': 4,
        'participation': 4,
        'dividende': 4,
        'capital': 3,
        'détention': 3,
        'régime': 3,
        'fiscal': 3
    }
    
    # Bonus pour les articles spécifiques
    article_bonus = {
        '145': 10,  # Article sur le régime mère-fille
        '216': 8,   # Article référencé pour le régime mère-fille
        '210': 5    # Articles liés aux opérations de groupe
    }
    
    scored_articles = []
    
    for article in articles:
        score = 0
        text = article.get('full_text', '').lower()
        article_num = article.get('article_number', '')
        
        # Bonus pour les articles spécifiques
        if article_num in article_bonus:
            score += article_bonus[article_num]
        
        # Score basé sur les mots-clés
        for keyword, weight in keywords.items():
            if keyword in text:
                score += weight
                # Bonus pour la proximité des mots-clés
                if 'mère' in text and 'fille' in text:
                    score += 3
                if 'société' in text and 'participation' in text:
                    score += 2
        
        # Score pour la correspondance exacte avec la requête
        query_terms = query.lower().split()
        for term in query_terms:
            if term in text:
                score += 2
        
        if score > 0:
            scored_articles.append((article, score))
    
    # Trier par score décroissant
    scored_articles.sort(key=lambda x: x[1], reverse=True)
    
    return [article for article, _ in scored_articles[:top_k]]

def format_article_for_gpt(article: Dict) -> str:
    hierarchy = article['hierarchy']
    hierarchy_str = " > ".join(filter(None, [
        hierarchy.get('livre', ''),
        hierarchy.get('titre', ''),
        hierarchy.get('chapitre', ''),
        hierarchy.get('section', '')
    ]))
    text = article['full_text']
    if len(text) > 5000:
        text = text[:5000] + "..."
    return f"""
Article {article['article_number']}
Hiérarchie : {hierarchy_str}
Texte : {text}
"""

def get_relevant_articles(query: str, n_results: int = 3) -> str:
    articles = load_articles()
    mots_cles_tmi = ["tmi", "taux marginal", "tranche", "barème", "impôt sur le revenu"]
    if any(mot in query.lower() for mot in mots_cles_tmi):
        # Chercher l'article 197
        for a in articles:
            if str(a.get('article_number', '')).strip() == "197":
                return a.get('full_text', '')
    # Sinon, recherche classique
    relevant_articles = search_articles(query, articles, n_results)
    if not relevant_articles:
        return "Aucun article pertinent trouvé."
    # Concaténer les textes des 3 articles les plus pertinents
    context = "\n\n".join([
        f"Article {a.get('article_number', '')} :\n{a.get('full_text', '')}" for a in relevant_articles
    ])
    return context

def ask_gpt_with_context(question: str, context: str) -> str:
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
    client = openai.OpenAI(api_key=openai.api_key)
    response = client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=800
    )
    return response.choices[0].message.content.strip()

def main():
    print("\n=== Assistant Fiscaliste CGI ===\n")
    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:])
    else:
        question = input("Votre question sur le CGI : ")
    print(f"\nRecherche des articles pertinents...")
    context = get_relevant_articles(question, n_results=5)
    print("\nContexte extrait :\n")
    print(context[:2000] + ("..." if len(context) > 2000 else ""))
    print("\nAppel à GPT...\n")
    reponse = ask_gpt_with_context(question, context)
    print("\nRéponse de GPT :\n")
    print(reponse)
    print("\n" + "="*50 + "\n")

if __name__ == '__main__':
    main() 
import os
import json
from typing import List, Dict, Tuple
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage

# Imports pour les embeddings CGI
try:
    from mistral_cgi_embeddings import load_embeddings, search_similar_articles
    CGI_EMBEDDINGS_AVAILABLE = True
except ImportError:
    CGI_EMBEDDINGS_AVAILABLE = False

# Configuration
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# Initialisation du client Mistral
client = MistralClient(api_key=MISTRAL_API_KEY) if MISTRAL_API_KEY else None

# Cache global pour éviter de recharger les embeddings
_embeddings_cache = None
_cache_loaded = False

def get_quick_answer(query: str) -> tuple[str, bool]:
    """Retourne toujours une réponse vide pour forcer une recherche approfondie."""
    return "", False

def clean_markdown_formatting(text: str) -> str:
    """Nettoie automatiquement le formatage markdown d'un texte."""
    import re
    
    # Supprimer les astérisques pour le gras et l'italique
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)  # **texte** -> texte
    text = re.sub(r'\*([^*]+)\*', r'\1', text)      # *texte* -> texte
    
    # Supprimer les underscores pour le gras et l'italique
    text = re.sub(r'__([^_]+)__', r'\1', text)      # __texte__ -> texte
    text = re.sub(r'_([^_]+)_', r'\1', text)        # _texte_ -> texte
    
    # Supprimer les backticks pour le code
    text = re.sub(r'`([^`]+)`', r'\1', text)        # `code` -> code
    text = re.sub(r'```[^`]*```', r'', text)        # ```bloc``` -> supprimé
    
    # Supprimer les # pour les titres
    text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
    
    # Nettoyer les liens markdown [texte](url)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    
    return text.strip()

def get_fiscal_response(query: str, conversation_history: List[Dict] = None):
    """Génère une réponse fiscale précise basée sur le CGI."""
    try:
        # Initialisation du client Mistral
        client = MistralClient(api_key=MISTRAL_API_KEY) if MISTRAL_API_KEY else None
        if not client:
            return "Erreur: Clé API Mistral non configurée", [], 0.0
        
        # Rechercher les articles CGI pertinents EN PREMIER
        cgi_articles = search_cgi_embeddings(query, max_results=5)  # Plus d'articles pour plus de contexte
        
        # Construire le contexte avec les articles CGI trouvés
        context = ""
        sources = []
        
        if cgi_articles:
            context = "ARTICLES DU CODE GÉNÉRAL DES IMPÔTS PERTINENTS:\n\n"
            for article in cgi_articles:
                article_content = article['content']
                article_source = article['source']
                context += f"{article_source}:\n{article_content}\n\n"
                sources.append(article_source)
            context += "\n---\n\n"
        
        # Construire le prompt avec le contexte CGI et instructions anti-markdown
        prompt = f"""{context}Tu es Francis, un expert fiscal français sympathique et accessible, avec 20 ans d'expérience. Tu parles de manière naturelle et conversationnelle, comme à un collègue ou un ami.

Question de l'utilisateur : {query}

INSTRUCTIONS IMPORTANTES :

1. FORMATAGE OBLIGATOIRE - AUCUN MARKDOWN :
   - INTERDIT ABSOLU : astérisques (*), underscores (_), dièses (#), backticks (`), crochets []
   - UTILISE SEULEMENT : lettres, chiffres, espaces, points, virgules, tirets simples (-), deux points (:)
   - Pour mettre en valeur : utilise des MAJUSCULES
   - Pour structurer : utilise des numéros (1., 2., 3.) et des tirets (-)
   - AUCUN formatage markdown autorisé

2. TON DE LA RÉPONSE :
   - Naturel et conversationnel, comme une discussion entre collègues
   - Utilise des formulations courantes et évite le jargon administratif inutile
   - N'hésite pas à être chaleureux et humain

3. CONTENU :
   - Donne toujours les informations les plus précises et à jour (2025)
   - Si tu as des articles CGI pertinents, cite-les clairement
   - Complète avec ton expertise quand c'est pertinent
   - Fournis des exemples concrets et des chiffres précis

4. DÉMARCHE :
   - Si la question est vague, n'hésite pas à demander des précisions
   - Propose des exemples ou des cas pratiques
   - Relie les informations pour donner une vision complète

Exemple de ton style SANS FORMATAGE :
"Ah, excellente question ! Pour le barème 2025, on est sur du 0 pour cent jusqu'à 11 294 euros, puis ça monte progressivement. Par exemple, pour un célibataire à 50 000 euros, on serait sur..."

RAPPEL : AUCUN ASTÉRISQUE, UNDERSCORE OU AUTRE FORMATAGE MARKDOWN AUTORISÉ"""

        messages = [ChatMessage(role="user", content=prompt)]
        response = client.chat(
            model="mistral-medium",
            messages=messages,
            temperature=0.3,  # Température plus basse pour plus de précision
            max_tokens=2048   # Augmenté pour des réponses plus complètes
        )
        
        answer = response.choices[0].message.content
        
        # Nettoyer automatiquement le formatage markdown
        answer = clean_markdown_formatting(answer)
        
        # Si pas d'articles CGI trouvés, ajouter Mistral comme source
        if not sources:
            sources = ["Expertise Francis - Données fiscales 2025"]
        else:
            sources.append("Expertise Francis")
            
        confidence = 0.95 if cgi_articles else 0.9
        
        return answer, sources, confidence
    except Exception as e:
        return f"Erreur Mistral: {e}", [], 0.0

def get_fiscal_response_stream(query: str, conversation_history: List[Dict] = None):
    """Version streaming ultra-simplifiée pour Railway."""
    try:
        # Statut initial
        yield json.dumps({
            "type": "status",
            "message": " Francis analyse votre question...",
            "progress": 50
        }) + "\n"
        
        # Obtenir la réponse normale
        answer, sources, confidence = get_fiscal_response(query, conversation_history)
        
        # Simuler un streaming rapide
        yield json.dumps({
            "type": "start_response",
            "message": " Réponse de Francis",
            "progress": 80
        }) + "\n"
        
        # Envoyer la réponse (déjà nettoyée dans get_fiscal_response)
        yield json.dumps({
            "type": "content",
            "content": answer,
            "progress": 95
        }) + "\n"
        
        # Finaliser
        yield json.dumps({
            "type": "complete",
            "sources": sources,
            "confidence": confidence,
            "progress": 100
        }) + "\n"
        
    except Exception as e:
        yield json.dumps({
            "type": "error",
            "message": f"Erreur: {str(e)[:100]}"
        }) + "\n"

def search_cgi_embeddings(query: str, max_results: int = 3) -> List[Dict]:
    """Recherche intelligente dans les embeddings CGI avec cache."""
    global _embeddings_cache, _cache_loaded
    
    if not CGI_EMBEDDINGS_AVAILABLE:
        return []
    
    try:
        # Cache des embeddings pour éviter le rechargement
        if not _cache_loaded:
            _embeddings_cache = load_embeddings()
            _cache_loaded = True
        
        if not _embeddings_cache:
            return []
        
        # Amélioration de la requête pour plus de précision
        query_lower = query.lower().strip()
        
        # Extraction des mots-clés importants
        keywords = []
        
        # Requêtes ciblées selon le type de question avec mots-clés élargis
        if any(term in query_lower for term in ['tmi', 'tranche', 'marginal', 'imposition', 'barème', 'impôt sur le revenu', 'ir']):
            enhanced_query = "article 197 CGI impôt sur le revenu barème progressif tranches marginales taux imposition"
            keywords = ['197', 'barème', 'tranche', 'taux', 'impôt', 'revenu']
        elif any(term in query_lower for term in ['tva', 'taxe valeur ajoutée', 'taux tva']):
            enhanced_query = "article 278 279 CGI TVA taux normal réduit super-réduit taxe valeur ajoutée"
            keywords = ['278', '279', 'tva', 'taux', 'taxe']
        elif any(term in query_lower for term in ['réduction', 'crédit', 'déduction', 'avantage fiscal']):
            enhanced_query = "article 199 200 CGI réduction crédit impôt déduction fiscale avantage"
            keywords = ['199', '200', 'réduction', 'crédit', 'déduction']
        elif any(term in query_lower for term in ['plus-value', 'cession', 'vente']):
            enhanced_query = "article 150 CGI plus-value cession vente immobilier actions"
            keywords = ['150', 'plus-value', 'cession', 'vente']
        elif any(term in query_lower for term in ['sci', 'société civile', 'immobilier']):
            enhanced_query = "CGI société civile immobilière SCI régime fiscal imposition"
            keywords = ['sci', 'société', 'civile', 'immobilière']
        else:
            # Pour les autres cas, utiliser la requête originale enrichie
            enhanced_query = f"CGI code général impôts {query}"
            # Extraire les mots significatifs de la requête
            keywords = [word for word in query_lower.split() if len(word) > 3]
        
        # Recherche avec plus de résultats pour filtrage
        similar_articles = search_similar_articles(enhanced_query, _embeddings_cache, top_k=max_results * 4)
        
        # Scoring et filtrage avancé des résultats
        scored_articles = []
        for article_data in similar_articles:
            content = article_data.get('text', '').lower()
            article_num = article_data.get('article_number', '')
            
            # Score basé sur la présence des mots-clés
            keyword_score = sum(1 for keyword in keywords if keyword in content) / max(len(keywords), 1)
            
            # Score bonus si l'article est mentionné directement
            article_mention_score = 1.0 if f"article {article_num}" in query_lower else 0.0
            
            # Score combiné
            final_score = (article_data.get('similarity', 0) * 0.7) + (keyword_score * 0.2) + (article_mention_score * 0.1)
            
            scored_articles.append({
                **article_data,
                'final_score': final_score
            })
        
        # Trier par score final et prendre les meilleurs
        scored_articles.sort(key=lambda x: x['final_score'], reverse=True)
        
        # Formatage des résultats avec plus de contexte
        results = []
        for i, article_data in enumerate(scored_articles[:max_results]):
            # Pour les 3 premiers articles, prendre TOUT le texte
            if i < 3:
                text = article_data.get('text', '')  # Texte complet sans limitation
            else:
                # Pour les articles suivants, extraire la partie pertinente
                text = article_data.get('text', '')
                if len(text) > 3000:
                    # Chercher les paragraphes contenant les mots-clés
                    paragraphs = text.split('\n')
                    relevant_paragraphs = []
                    for para in paragraphs:
                        if any(keyword in para.lower() for keyword in keywords):
                            relevant_paragraphs.append(para)
                    
                    if relevant_paragraphs:
                        text = '\n'.join(relevant_paragraphs[:5])[:3000]
                    else:
                        text = text[:3000]
            
            results.append({
                'content': text,
                'source': f"CGI Article {article_data.get('article_number', 'N/A')}",
                'article_id': article_data.get('article_number', 'N/A')
            })
        
        return results
    except Exception as e:
        print(f"Erreur dans search_cgi_embeddings: {e}")
        return []  # Fallback silencieux

def main():
    """Test principal pour développement local."""
    query = "Quelle est ma TMI si je gagne 50000€ ?"
    answer, sources, confidence = get_fiscal_response(query)
    print(f"Réponse: {answer}")
    print(f"Sources: {sources}")
    print(f"Confiance: {confidence}")

if __name__ == "__main__":
    main()
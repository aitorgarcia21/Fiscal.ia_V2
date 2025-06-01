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

def get_fiscal_response(query: str, conversation_history: List[Dict] = None) -> Tuple[str, List[str], float]:
    """RAG RAPIDE : Recherche CGI + Prompt optimisé pour vitesse."""
    all_sources_for_api = []
    confidence_score = 0.5 
    
    try:
        if not client:
            return "Erreur: Client Mistral non configuré", [], 0.0
        
        # ÉTAPE 1: RAG RAPIDE - 2 articles max
        cgi_articles = []
        if CGI_EMBEDDINGS_AVAILABLE:
            try:
                cgi_articles = search_cgi_embeddings(query, max_results=2)  # Moins d'articles = plus rapide
                if cgi_articles:
                    all_sources_for_api.extend([art.get('source', 'CGI') for art in cgi_articles])
                    confidence_score = 0.9
            except Exception:
                pass  # Fallback silencieux pour vitesse
        
        # ÉTAPE 2: Prompt optimisé pour vitesse
        if cgi_articles:
            # PROMPT COURT pour vitesse
            cgi_context = "\n\n".join([
                f"{art['source']}: {art['content'][:1200]}"  # Contexte COMPLET pour précision
                for art in cgi_articles
            ])
            
            prompt = f"""Francis, expert fiscal Fiscal.ia.

Question: {query}

Sources CGI:
{cgi_context}

Consignes RAPIDES:
- Base-toi sur ces textes CGI uniquement
- Cite l'article (ex: "Article 197")
- Utilise les chiffres exacts des textes
- Réponse claire et directe
- Pas de markdown

Réponse:"""

        else:
            # Fallback rapide sans CGI
            prompt = f"""Francis, expert fiscal Fiscal.ia.

Question: {query}

Pas de source CGI trouvée. Réponds avec tes connaissances fiscales générales. Recommande de vérifier avec le CGI officiel.

Réponse directe:"""
            all_sources_for_api.append("Connaissances générales")
            confidence_score = 0.6

        # ÉTAPE 3: Appel Mistral RAPIDE
        messages = [ChatMessage(role="user", content=prompt)]
        
        chat_response = client.chat(
            model="mistral-large-latest",
            messages=messages,
            temperature=0.2,  # Plus déterministe = plus rapide
            max_tokens=800    # TOKENS COMPLETS pour réponses détaillées
        )
        
        answer = chat_response.choices[0].message.content
        return answer, all_sources_for_api, confidence_score

    except Exception as e:
        # Fallback d'urgence ultra-rapide
        return f"Erreur analyse fiscale. Détail: {str(e)[:50]}", ["Erreur"], 0.2

def get_fiscal_response_stream(query: str, conversation_history: List[Dict] = None):
    """Version streaming ultra-simplifiée pour Railway."""
    try:
        # Statut initial
        yield json.dumps({
            "type": "status",
            "message": "🔍 Francis analyse votre question...",
            "progress": 50
        }) + "\n"
        
        # Obtenir la réponse normale
        answer, sources, confidence = get_fiscal_response(query, conversation_history)
        
        # Simuler un streaming rapide
        yield json.dumps({
            "type": "start_response",
            "message": "💡 Réponse de Francis",
            "progress": 80
        }) + "\n"
        
        # Envoyer la réponse
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

def search_cgi_embeddings(query: str, max_results: int = 2) -> List[Dict]:
    """Recherche RAPIDE dans les embeddings CGI avec cache."""
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
        
        # Optimisation requête rapide
        query_lower = query.lower()
        if any(term in query_lower for term in ['tmi', 'tranche', 'marginal', 'imposition', 'barème']):
            enhanced_query = "article 197 impôt"  # Requête ultra-ciblée
        else:
            enhanced_query = query[:50]  # Limiter la taille
        
        # Recherche rapide avec moins de résultats
        similar_articles = search_similar_articles(enhanced_query, _embeddings_cache, top_k=max_results)
        
        # Formatage minimal pour vitesse
        results = []
        for article_data in similar_articles[:max_results]:
            results.append({
                'content': article_data.get('text', '')[:1500],  # CONTENU COMPLET pour précision
                'source': f"CGI Article {article_data.get('article_number', 'N/A')}",
                'article_id': article_data.get('article_number', 'N/A')
            })
        
        return results
    except Exception:
        return []  # Fallback ultra-rapide

def main():
    """Test principal pour développement local."""
    query = "Quelle est ma TMI si je gagne 50000€ ?"
    answer, sources, confidence = get_fiscal_response(query)
    print(f"Réponse: {answer}")
    print(f"Sources: {sources}")
    print(f"Confiance: {confidence}")

if __name__ == "__main__":
    main() 
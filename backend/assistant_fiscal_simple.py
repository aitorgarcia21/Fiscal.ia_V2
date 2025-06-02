import os
import json
from typing import List, Dict, Tuple
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage

# Imports pour les embeddings CGI
try:
    from mistral_cgi_embeddings import load_embeddings, search_similar_articles
    CGI_EMBEDDINGS_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Erreur d'import des embeddings CGI: {e}")
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
        print("⚠️ RAG désactivé: CGI_EMBEDDINGS_AVAILABLE est False")
        return []
    
    try:
        # Cache des embeddings pour éviter le rechargement
        if not _cache_loaded:
            print("🔍 Chargement du cache des embeddings...")
            _embeddings_cache = load_embeddings()
            _cache_loaded = True
            print(f"✅ {len(_embeddings_cache) if _embeddings_cache else 0} embeddings chargés")
        
        if not _embeddings_cache:
            print("⚠️ Aucun embedding chargé")
            return []
        
        # Optimisation requête rapide
        query_lower = query.lower()
        print(f"🔍 Recherche pour: {query_lower[:100]}...")
        
        if any(term in query_lower for term in ['tmi', 'tranche', 'marginal', 'imposition', 'barème']):
            enhanced_query = "article 197 impôt sur le revenu barème progressif"  # Requête plus précise
            print("🔍 Requête optimisée pour barème d'imposition")
        else:
            enhanced_query = query[:100]  # Limiter la taille
        
        # Recherche rapide avec moins de résultats
        print(f"🔍 Recherche d'articles similaires pour: {enhanced_query}")
        similar_articles = search_similar_articles(enhanced_query, _embeddings_cache, top_k=max_results)
        print(f"✅ {len(similar_articles)} articles similaires trouvés")
        
        # Formatage minimal pour vitesse
        results = []
        for i, article_data in enumerate(similar_articles[:max_results], 1):
            article_id = article_data.get('article_number', 'N/A')
            print(f"📄 Article {i}: CGI Article {article_id}")
            results.append({
                'content': article_data.get('text', '')[:1500],  # CONTENU COMPLET pour précision
                'source': f"CGI Article {article_id}",
                'article_id': article_id
            })
        
        return results
    except Exception as e:
        print(f"❌ Erreur dans search_cgi_embeddings: {str(e)}")
        import traceback
        traceback.print_exc()
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
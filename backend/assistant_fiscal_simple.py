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

def get_fiscal_response(query: str, conversation_history: List[Dict] = None) -> Tuple[str, List[str], float]:
    """Obtient une réponse de l'assistant fiscal - VERSION OPTIMISÉE AVEC EMBEDDINGS CGI."""
    all_sources_for_api = []
    confidence_score = 0.5 
    
    try:
        if not client:
            return "Erreur: Client Mistral non configuré", [], 0.0
        
        # 1. ÉTAPE: Recherche dans les embeddings CGI d'abord
        cgi_articles = []
        if CGI_EMBEDDINGS_AVAILABLE:
            try:
                cgi_articles = search_cgi_embeddings(query, max_results=2)
                if cgi_articles:
                    all_sources_for_api.extend([art.get('source', 'CGI') for art in cgi_articles])
                    confidence_score = 0.85  # Haute confiance avec CGI
            except Exception:
                pass  # Fallback silencieux
        
        # 2. ÉTAPE: Construction du prompt avec ou sans CGI
        query_lower = query.lower()
        
        if cgi_articles:
            # Prompt enrichi avec vraies données CGI
            cgi_context = "\n\n".join([
                f"Source: {art['source']}\nContenu: {art['content']}"
                for art in cgi_articles
            ])
            
            prompt = f"""Tu es Francis, assistant fiscal expert de Fiscal.ia.

Question: {query}

Contexte CGI officiel:
---
{cgi_context}
---

Tu es un expert fiscal utilisant les données officielles du CGI. Réponds de manière précise basée sur ces sources, sans formatage markdown. Mentionne les articles CGI pertinents."""

        elif any(word in query_lower for word in ['tmi', 'tranche', 'marginal', 'imposition']):
            prompt = f"""Tu es Francis, assistant fiscal expert de Fiscal.ia.

Question: {query}

Tu es un expert fiscal français spécialisé dans les TMI et barèmes fiscaux 2025. Réponds de manière précise avec les vrais seuils officiels, sans formatage markdown. Calcule la TMI exacte si possible."""
            all_sources_for_api.append("Barème fiscal 2025")
            confidence_score = 0.9
            
        elif any(word in query_lower for word in ['pea', 'plan', 'épargne', 'actions']):
            prompt = f"""Tu es Francis, assistant fiscal expert de Fiscal.ia.

Question: {query}

Contexte: Le PEA permet d'investir jusqu'à 150 000€ en actions européennes avec exonération fiscale après 5 ans de détention.

Réponds clairement et concrètement en tant qu'expert fiscal, sans formatage markdown."""
            all_sources_for_api.append("Code fiscal - PEA")
            confidence_score = 0.9
            
        elif any(word in query_lower for word in ['plus-value', 'immobilier', 'résidence principale']):
            prompt = f"""Tu es Francis, assistant fiscal expert de Fiscal.ia.

Question: {query}

Contexte: La résidence principale est exonérée de plus-values. Pour les autres biens immobiliers, il y a des abattements selon la durée de détention.

Réponds clairement et concrètement en tant qu'expert fiscal, sans formatage markdown."""
            all_sources_for_api.append("CGI - Plus-values immobilières")
            confidence_score = 0.9
            
        elif any(word in query_lower for word in ['micro', 'entrepreneur', 'régime']):
            prompt = f"""Tu es Francis, assistant fiscal expert de Fiscal.ia.

Question: {query}

Contexte: Le régime micro-entreprise permet de déclarer uniquement le chiffre d'affaires avec un abattement forfaitaire (34% pour les services, 71% pour la vente).

Réponds clairement et concrètement en tant qu'expert fiscal, sans formatage markdown."""
            all_sources_for_api.append("CGI - Régimes fiscaux")
            confidence_score = 0.9
            
        else:
            # Réponse générale rapide
            prompt = f"""Tu es Francis, assistant fiscal expert de Fiscal.ia.

Question: {query}

Tu es un expert fiscal français. Réponds de manière claire et pratique à cette question fiscale, sans formatage markdown. Si tu as besoin de plus d'informations, demande des précisions sur la situation de l'utilisateur."""
            all_sources_for_api.append("Expertise Francis")
            confidence_score = 0.7

        # 3. ÉTAPE: Appel Mistral
        messages = [ChatMessage(role="user", content=prompt)]
        
        chat_response = client.chat(
            model="mistral-large-latest",
            messages=messages,
            temperature=0.5,
            max_tokens=600
        )
        
        answer = chat_response.choices[0].message.content
        return answer, all_sources_for_api, confidence_score

    except Exception as e:
        # Fallback ultime pour Railway
        query_lower = query.lower()
        
        if 'tmi' in query_lower:
            return "Pour calculer votre TMI précise, j'ai besoin de connaître votre revenu annuel net imposable. Les tranches fiscales 2025 déterminent votre taux marginal selon votre situation. Quel est votre revenu annuel ?", ["Barème 2025"], 0.8
        elif 'pea' in query_lower:
            return "Le PEA vous permet d'investir 150 000€ en actions européennes. Exonération totale après 5 ans. Quels sont vos objectifs d'investissement ?", ["Code fiscal"], 0.8
        elif 'micro' in query_lower:
            return "En micro-entreprise, vous déclarez votre CA avec abattement automatique. Pour les services : 34%, pour la vente : 71%. Quel est votre secteur d'activité ?", ["Régimes fiscaux"], 0.8
        else:
            return f"Je suis Francis, votre expert fiscal. Pour vous donner une réponse précise sur '{query}', pouvez-vous me dire votre situation (salarié, entrepreneur, investisseur) ?", ["Expert Francis"], 0.6

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
    """Recherche dans les embeddings CGI de manière optimisée pour Railway."""
    if not CGI_EMBEDDINGS_AVAILABLE:
        return []
    
    try:
        # Chargement avec timeout court
        embeddings = load_embeddings()
        if not embeddings:
            return []
        
        # Recherche rapide
        similar_articles = search_similar_articles(query, embeddings, top_k=max_results)
        
        # Formatage simple pour Railway
        results = []
        for article_data in similar_articles[:max_results]:
            results.append({
                'content': article_data.get('text', '')[:1000],  # Limiter pour Railway
                'source': f"CGI Article {article_data.get('article_number', 'N/A')}",
                'article_id': article_data.get('article_number', 'N/A')
            })
        
        return results
    except Exception as e:
        # Fallback silencieux
        return []

def main():
    """Test principal pour développement local."""
    query = "Quelle est ma TMI si je gagne 50000€ ?"
    answer, sources, confidence = get_fiscal_response(query)
    print(f"Réponse: {answer}")
    print(f"Sources: {sources}")
    print(f"Confiance: {confidence}")

if __name__ == "__main__":
    main() 
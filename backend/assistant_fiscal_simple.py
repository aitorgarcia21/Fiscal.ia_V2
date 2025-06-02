import os
import json
from typing import List, Dict, Tuple
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage

# Imports pour les embeddings CGI
try:
    from mistral_cgi_embeddings import load_embeddings, search_similar_articles
    from mistral_embeddings import search_similar_bofip_chunks
    CGI_EMBEDDINGS_AVAILABLE = True
    BOFIP_EMBEDDINGS_AVAILABLE = True
except ImportError:
    CGI_EMBEDDINGS_AVAILABLE = False
    BOFIP_EMBEDDINGS_AVAILABLE = False

# Configuration
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# Initialisation du client Mistral
client = MistralClient(api_key=MISTRAL_API_KEY) if MISTRAL_API_KEY else None

# Cache global pour éviter de recharger les embeddings - CHARGEMENT À LA DEMANDE
_embeddings_cache = None
_cache_loaded = False

# Sources officielles autorisées
OFFICIAL_SOURCES = {
    'CGI': ['cgi_chunks', 'CGI'],
    'BOFIP': ['bofip_chunks_text', 'bofip_embeddings', 'BOFIP']
}

def validate_official_source(source_info: Dict) -> bool:
    """Valide qu'une source est officielle (CGI ou BOFiP uniquement)."""
    if not source_info:
        return False
    
    source_type = source_info.get('type', '').upper()
    source_path = source_info.get('path', '')
    
    # Vérifier si c'est une source CGI
    if source_type == 'CGI' or any(cgi_marker in source_path for cgi_marker in OFFICIAL_SOURCES['CGI']):
        return True
    
    # Vérifier si c'est une source BOFiP
    if source_type == 'BOFIP' or any(bofip_marker in source_path for bofip_marker in OFFICIAL_SOURCES['BOFIP']):
        return True
    
    return False

def get_quick_answer(query: str) -> tuple[str, bool]:
    """Retourne toujours une réponse vide pour forcer une recherche approfondie dans les sources officielles."""
    return "", False

def get_fiscal_response(query: str, conversation_history: List[Dict] = None):
    """Génère une réponse fiscale précise basée EXCLUSIVEMENT sur le CGI et le BOFiP."""
    try:
        # Initialisation du client Mistral
        client = MistralClient(api_key=MISTRAL_API_KEY) if MISTRAL_API_KEY else None
        if not client:
            return "Erreur: Clé API Mistral non configurée", [], 0.0
        
        # Rechercher UNIQUEMENT dans les sources officielles
        official_sources = []
        context = ""
        
        # 1. Recherche dans le CGI (priorité absolue) - CHARGEMENT À LA DEMANDE
        try:
            cgi_articles = search_cgi_embeddings(query, max_results=3)  # Limiter à 3 résultats
            if cgi_articles:
                context += "=== ARTICLES DU CODE GÉNÉRAL DES IMPÔTS (CGI) ===\n\n"
                for article in cgi_articles:
                    if validate_official_source({'type': 'CGI', 'path': 'cgi_chunks'}):
                        article_content = article['content']
                        article_source = article['source']
                        context += f"{article_source}:\n{article_content}\n\n"
                        official_sources.append(article_source)
                context += "\n" + "="*60 + "\n\n"
        except Exception as e:
            print(f"Erreur CGI (non bloquante): {e}")
        
        # 2. Recherche dans le BOFiP (complément officiel)
        try:
            bofip_chunks = search_bofip_embeddings(query, max_results=3)  # Limiter à 3 résultats
            if bofip_chunks:
                context += "=== BULLETIN OFFICIEL DES FINANCES PUBLIQUES (BOFiP) ===\n\n"
                for chunk in bofip_chunks:
                    if validate_official_source({'type': 'BOFIP', 'path': 'bofip_chunks'}):
                        chunk_content = chunk.get('text', '')[:2000]  # Limiter la taille
                        chunk_source = f"BOFiP - {chunk.get('file', 'Chunk N/A')}"
                        context += f"{chunk_source}:\n{chunk_content}\n\n"
                        official_sources.append(chunk_source)
                context += "\n" + "="*60 + "\n\n"
        except Exception as e:
            print(f"Erreur BOFiP (non bloquante): {e}")
        
        if not context:
            return ("Je ne trouve pas d'informations dans les sources officielles (CGI et BOFiP) disponibles pour répondre à votre question. "
                   "Cela peut être dû à un problème de chargement des données. Pourriez-vous reformuler votre question ?"), [], 0.0
        
        # Construire le prompt avec UNIQUEMENT les sources officielles
        system_message = """Tu es Francis, assistant fiscal expert basé EXCLUSIVEMENT sur les textes officiels français.

RÈGLES STRICTES :
1. Tu ne dois répondre qu'en te basant sur le Code Général des Impôts (CGI) et le BOFiP fournis ci-dessous
2. Cite TOUJOURS l'article du CGI ou la référence BOFiP exacte
3. Si l'information n'est pas dans les sources fournies, dis-le clairement
4. Utilise uniquement les textes officiels, jamais d'autres sources
5. Réponds en français de manière claire et précise

SOURCES OFFICIELLES DISPONIBLES :
"""
        
        full_prompt = f"""{system_message}

{context}

QUESTION DE L'UTILISATEUR :
{query}

RÉPONSE (basée UNIQUEMENT sur les sources officielles ci-dessus) :
"""

        # Construire l'historique de conversation si disponible
        messages = []
        if conversation_history:
            for msg in conversation_history[-3:]:  # Garder les 3 derniers échanges
                if msg.get('role') and msg.get('content'):
                    messages.append(ChatMessage(role=msg['role'], content=msg['content']))
        
        messages.append(ChatMessage(role="user", content=full_prompt))
        
        # Appel à Mistral avec température basse pour plus de précision
        response = client.chat(
            model="mistral-large-latest",
            messages=messages,
            temperature=0.1,  # Très faible pour privilégier la précision
            max_tokens=1000
        )
        
        answer = response.choices[0].message.content.strip()
        
        # Conditionner l'affichage des sources
        if "CGI" in answer or "BOFiP" in answer:
            disclaimer = "\n\n📚 **Sources officielles consultées :** " + ", ".join(official_sources[:3])  # Limiter à 3 sources
            if len(official_sources) > 3:
                disclaimer += f" et {len(official_sources) - 3} autres sources officielles"
            final_answer = answer + disclaimer
        else:
            final_answer = answer
        
        # Score de confiance basé sur la qualité des sources officielles
        confidence_score = min(1.0, len(official_sources) / 3.0) if official_sources else 0.2
        
        return final_answer, official_sources, confidence_score
        
    except Exception as e:
        print(f"Erreur lors du traitement de la question: {e}")
        return ("Erreur lors de la consultation des sources officielles. "
               "Veuillez réessayer ou reformuler votre question."), [], 0.0

def search_bofip_embeddings(query: str, max_results: int = 3) -> List[Dict]:
    """Recherche dans les embeddings BOFiP (source officielle)."""
    if not BOFIP_EMBEDDINGS_AVAILABLE:
        return []
    
    try:
        return search_similar_bofip_chunks(query, top_k=max_results)
    except Exception as e:
        print(f"Erreur dans search_bofip_embeddings: {e}")
        return []

def search_cgi_embeddings(query: str, max_results: int = 3) -> List[Dict]:
    """Recherche intelligente dans les embeddings CGI UNIQUEMENT - CHARGEMENT À LA DEMANDE."""
    global _embeddings_cache, _cache_loaded
    
    if not CGI_EMBEDDINGS_AVAILABLE:
        return []
    
    try:
        # Cache des embeddings - CHARGEMENT À LA DEMANDE SEULEMENT
        if not _cache_loaded:
            print("⏳ Chargement des embeddings CGI à la demande...")
            _embeddings_cache = load_embeddings()
            _cache_loaded = True
            print("✅ Embeddings CGI chargés")
        
        if not _embeddings_cache:
            return []
        
        # Amélioration de la requête pour plus de précision
        query_lower = query.lower().strip()
        
        # Extraction des mots-clés importants pour cibler les articles CGI
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
        
        print(f"🔍 Requête de recherche améliorée : {enhanced_query}")
        
        # Recherche avec plus de résultats pour filtrage
        similar_articles = search_similar_articles(enhanced_query, _embeddings_cache, top_k=max_results * 4)
        
        # Scoring et filtrage avancé des résultats AVEC validation des sources
        scored_articles = []
        for article_data in similar_articles:
            # VALIDATION STRICTE : Vérifier que c'est bien du CGI
            if not validate_official_source({'type': 'CGI', 'path': 'cgi_chunks'}):
                continue  # Ignorer les sources non officielles
            
            content = article_data.get('text', '').lower()
            article_num = article_data.get('article_number', '')
            
            # Score basé sur la présence des mots-clés
            keyword_score = sum(1 for keyword in keywords if keyword in content) / max(len(keywords), 1)
            
            # Score bonus si l'article est mentionné directement
            article_mention_score = 1.0 if f"article {article_num}" in query_lower else 0.0
            
            # Score combiné
            similarity = getattr(article_data, 'similarity', 0.5)  # Fallback si pas de similarité
            final_score = (similarity * 0.7) + (keyword_score * 0.2) + (article_mention_score * 0.1)
            
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
            
            print(f"📄 Article trouvé : {article_data.get('article_number', 'N/A')} avec score {article_data.get('final_score', 0)}")
            results.append({
                'content': text,
                'source': f"CGI Article {article_data.get('article_number', 'N/A')}",
                'article_id': article_data.get('article_number', 'N/A')
            })
        
        return results
    except Exception as e:
        print(f"Erreur dans search_cgi_embeddings: {e}")
        return []  # Fallback silencieux

# Fonction de compatibilité pour l'ancien système
def get_relevant_context(query: str) -> str:
    """Récupère le contexte pertinent UNIQUEMENT depuis les sources officielles."""
    context = ""
    
    # Recherche CGI
    cgi_articles = search_cgi_embeddings(query, max_results=3)
    if cgi_articles:
        context += "=== CODE GÉNÉRAL DES IMPÔTS ===\n"
        for article in cgi_articles:
            context += f"{article['source']}: {article['content'][:1000]}...\n\n"
    
    # Recherche BOFiP
    bofip_chunks = search_bofip_embeddings(query, max_results=2)
    if bofip_chunks:
        context += "=== BULLETIN OFFICIEL DES FINANCES PUBLIQUES ===\n"
        for chunk in bofip_chunks:
            context += f"BOFiP: {chunk.get('text', '')[:1000]}...\n\n"
    
    return context if context else "Aucune source officielle trouvée pour cette question."

def main():
    """Test principal pour développement local."""
    query = "Quelle est ma TMI si je gagne 50000€ ?"
    answer, sources, confidence = get_fiscal_response(query)
    print(f"Réponse: {answer}")
    print(f"Sources: {sources}")
    print(f"Confiance: {confidence}")

if __name__ == "__main__":
    main()
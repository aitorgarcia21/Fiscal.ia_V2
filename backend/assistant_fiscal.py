import os
import json
import asyncio
import signal
from typing import List, Dict, Tuple
from groq import Groq
from mistralai.client import MistralClient  # Keep for fallback
from mistralai.models.chat_completion import ChatMessage

# Imports pour les embeddings
try:
    from mistral_cgi_embeddings import load_embeddings, search_similar_articles  # type: ignore
    from mistral_embeddings import search_similar_bofip_chunks  # type: ignore
    from rag_swiss import SwissRAGSystem  # type: ignore
    CGI_EMBEDDINGS_AVAILABLE = True
    BOFIP_EMBEDDINGS_AVAILABLE = True
    SWISS_RAG_AVAILABLE = True
except ImportError:
    CGI_EMBEDDINGS_AVAILABLE = False
    BOFIP_EMBEDDINGS_AVAILABLE = False
    SWISS_RAG_AVAILABLE = False

# Configuration
# Configuration API hybride
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# Chat principal = Mistral (besoin RAG/embeddings)
client = MistralClient(api_key=MISTRAL_API_KEY) if MISTRAL_API_KEY else None

# Client Groq pour Francis vocal uniquement
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

if client:
    print("🎯 Chat/RAG: Mistral API (avec embeddings)")
if groq_client:
    print("🚀 Francis vocal: Groq API (gratuit, sans RAG)")
if not client and not groq_client:
    print("❌ Aucune clé API disponible")

# PII sanitizer
from pii_sanitizer import sanitize_text

# Sources officielles autorisées UNIQUEMENT
OFFICIAL_SOURCES = {
    'CGI': ['cgi_chunks', 'CGI'],
    'BOFIP': ['bofip_chunks_text', 'bofip_embeddings', 'BOFIP'],
    'SWISS': ['swiss_chunks_text', 'swiss_embeddings', 'SWISS']
}

# Initialisation du système RAG suisse
swiss_rag = None
if SWISS_RAG_AVAILABLE:
    try:
        swiss_rag = SwissRAGSystem()
    except Exception as e:
        print(f"Erreur initialisation RAG suisse: {e}")
        SWISS_RAG_AVAILABLE = False

def validate_official_source(source_info: Dict) -> bool:
    """Valide qu'une source est officielle (CGI, BOFiP ou fiscalité suisse)."""
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
    
    # Vérifier si c'est une source fiscalité suisse
    if source_type == 'SWISS' or any(swiss_marker in source_path for swiss_marker in OFFICIAL_SOURCES['SWISS']):
        return True
    
    return False

def search_similar_cgi_articles(query: str, top_k: int = 3) -> List[Dict]:
    """Recherche les articles du CGI les plus similaires à la requête EXCLUSIVEMENT."""
    try:
        # Ces imports peuvent échouer en environnement de test ou si les embeddings ne sont pas générés.
        if not CGI_EMBEDDINGS_AVAILABLE:
            return []
        
        embeddings = load_embeddings()
        if not embeddings:
            return []
        
        similar_articles_raw = search_similar_articles(query, embeddings, top_k=top_k*2)
        
        # Filtrer STRICTEMENT les articles CGI pertinents et officiels
        filtered_articles = []
        for article_tuple in similar_articles_raw:
            if isinstance(article_tuple, tuple) and len(article_tuple) == 2:
                article_data, similarity_score = article_tuple
                
                # VALIDATION STRICTE : Doit être du CGI ET avoir une bonne similarité
                if (similarity_score >= 0.65 and 
                    validate_official_source({'type': 'CGI', 'path': 'cgi_chunks'})):
                    filtered_articles.append(article_data)
            else:
                # Gérer le cas où le format n'est pas celui attendu
                pass 
        
        # Formater pour la compatibilité avec le reste du code
        results = []
        for article_data in filtered_articles[:top_k]: 
            results.append({
                'content': article_data.get('text', ''),
                'source': f"CGI Article {article_data.get('article_number', 'N/A')}",
                'article_id': article_data.get('article_number', 'N/A')
            })
        
        return results
    except Exception as e:
        print(f"Erreur recherche CGI: {e}")
        return []

def search_similar_bofip_chunks_filtered(query: str, top_k: int = 3) -> List[Dict]:
    """Recherche les chunks BOFiP avec validation stricte."""
    try:
        # Ces imports peuvent échouer en environnement de test ou si les embeddings ne sont pas générés.
        if not BOFIP_EMBEDDINGS_AVAILABLE:
            return []
        
        bofip_chunks_raw = search_similar_bofip_chunks(query, top_k=top_k*2)
        
        # Filtrer STRICTEMENT les chunks BOFiP officiels
        filtered_chunks = []
        for chunk in bofip_chunks_raw:
            if (chunk.get('similarity', 0) >= 0.6 and
                validate_official_source({'type': 'BOFIP', 'path': 'bofip_chunks'})):
                
                filtered_chunks.append({
                    'text': chunk.get('text', ''),
                    'file': chunk.get('file', ''),
                    'similarity': chunk.get('similarity', 0),
                    'reference': f"BOFiP - {chunk.get('file', 'N/A')}"
                })
        
        return filtered_chunks[:top_k]
    except Exception as e:
        print(f"Erreur recherche BOFiP: {e}")
        return []

def search_swiss_fiscal_knowledge(query: str, top_k: int = 3) -> Dict:
    """Recherche dans la base de connaissances fiscales suisses."""
    try:
        if not SWISS_RAG_AVAILABLE or not swiss_rag:
            return {}
        
        # Vérifier si c'est une question fiscale suisse
        if not swiss_rag.is_swiss_fiscal_question(query):
            return {}
        
        # Rechercher dans la base de connaissances suisse
        result = swiss_rag.answer_swiss_fiscal_question(query, top_k=top_k)
        
        # Valider la qualité de la réponse
        if result.get('confidence', 0) >= 0.3:
            return result
        
        return {}
    except Exception as e:
        print(f"Erreur recherche fiscalité suisse: {e}")
        return {}

def is_swiss_fiscal_question(query: str) -> bool:
    """Détermine si une question concerne la fiscalité suisse."""
    swiss_keywords = [
        'suisse', 'swiss', 'canton', 'cantonal', 'communal',
        'pilier 3a', 'lpp', 'avs', 'ai', 'afc', 'chf',
        'genève', 'zurich', 'vaud', 'valais', 'berne',
        'fédéral', 'confédération', 'impôt à la source',
        'prévoyance', 'cotisations sociales', 'frontalier'
    ]
    
    query_lower = query.lower()
    return any(keyword in query_lower for keyword in swiss_keywords)

def create_prompt(query: str, cgi_articles: List[Dict], bofip_chunks: List[Dict], swiss_result: Dict = None, conversation_history: List[Dict] = None) -> str:
    """Crée un prompt basé EXCLUSIVEMENT sur les sources officielles."""
    
    # Construction du contexte officiel UNIQUEMENT
    context = ""
    
    if cgi_articles:
        context += "=== CODE GÉNÉRAL DES IMPÔTS (CGI) - SOURCES OFFICIELLES ===\n\n"
        for article in cgi_articles:
            context += f"{article['source']}:\n{article['content']}\n\n"
        context += "="*60 + "\n\n"
    
    if bofip_chunks:
        context += "=== BULLETIN OFFICIEL DES FINANCES PUBLIQUES (BOFiP) - SOURCES OFFICIELLES ===\n\n"
        for chunk in bofip_chunks:
            context += f"{chunk['reference']}:\n{chunk['text'][:1500]}\n\n"
        context += "="*60 + "\n\n"
    
    if swiss_result and swiss_result.get('answer'):
        context += "=== FISCALITÉ SUISSE - SOURCES OFFICIELLES ===\n\n"
        context += f"Réponse spécialisée fiscalité suisse:\n{swiss_result['answer']}\n\n"
        if swiss_result.get('sources'):
            context += "Sources consultées:\n"
            for source in swiss_result['sources']:
                context += f"- {source.get('chunk_id', 'N/A')} (similarité: {source.get('similarity', 0):.3f})\n"
        context += "="*60 + "\n\n"
    
    if not context:
        context = "AUCUNE SOURCE OFFICIELLE TROUVÉE pour cette question.\n\n"
    
    # Système de prompt adapté
    if swiss_result and swiss_result.get('answer'):
        system_prompt = """Tu es Francis, assistant fiscal expert spécialisé en fiscalité française ET suisse.

RÈGLES IMPÉRATIVES :
1. Tu te bases EXCLUSIVEMENT sur le CGI, le BOFiP et les sources officielles fiscales suisses
2. Pour la fiscalité française : cite l'article du CGI ou la référence BOFiP exacte
3. Pour la fiscalité suisse : utilise les informations spécialisées fournies
4. Si l'information n'est pas dans les sources fournies, dis clairement : "Cette information n'est pas disponible dans les sources officielles consultées"
5. INTERDICTION ABSOLUE d'utiliser d'autres sources ou tes connaissances générales
6. Réponds en français, de manière claire et précise

SOURCES OFFICIELLES DISPONIBLES :
"""
    else:
        system_prompt = """Tu es Francis, assistant fiscal expert qui se base EXCLUSIVEMENT sur le Code Général des Impôts (CGI) et le Bulletin Officiel des Finances Publiques (BOFiP).

RÈGLES IMPÉRATIVES :
1. Tu ne peux répondre qu'en te basant sur le CGI et le BOFiP fournis ci-dessous
2. Cite OBLIGATOIREMENT l'article du CGI ou la référence BOFiP exacte
3. Si l'information n'est pas dans les sources fournies, dis clairement : "Cette information n'est pas disponible dans les sources officielles consultées"
4. INTERDICTION ABSOLUE d'utiliser d'autres sources ou tes connaissances générales
5. Réponds en français, de manière claire et précise

SOURCES OFFICIELLES DISPONIBLES :
"""

    # Historique de conversation (limité)
    history_context = ""
    if conversation_history:
        recent_history = conversation_history[-2:]  # 2 derniers échanges max
        for msg in recent_history:
            if msg.get('role') and msg.get('content'):
                history_context += f"{msg['role'].upper()}: {msg['content'][:200]}...\n"
    
    if history_context:
        history_context = f"\n=== CONTEXTE DE CONVERSATION ===\n{history_context}\n"
    
    # Prompt final
    final_prompt = f"""{system_prompt}

{context}

{history_context}

QUESTION UTILISATEUR : {query}

RÉPONSE (basée UNIQUEMENT sur les sources officielles ci-dessus) :
"""
    
    return final_prompt

from pii_sanitizer import sanitize_text

def get_fiscal_response(query: str, conversation_history: List[Dict] = None) -> Tuple[str, List[str], float]:
    """Obtient une réponse de l'assistant fiscal basée EXCLUSIVEMENT sur les sources officielles."""
    all_sources_for_api = []
    confidence_score = 0.5 

    try:
        if not client:
            return "Erreur: Client Mistral non configuré", [], 0.0
        
        # Vérifier si c'est une question fiscale suisse
        swiss_result = {}
        if is_swiss_fiscal_question(query):
            swiss_result = search_swiss_fiscal_knowledge(query, top_k=3)
            
            # Si on a une réponse suisse de bonne qualité, on peut l'utiliser directement
            if swiss_result and swiss_result.get('confidence', 0) >= 0.7:
                sources = [f"Fiscalité Suisse - {source.get('chunk_id', 'N/A')}" 
                          for source in swiss_result.get('sources', [])]
                return swiss_result['answer'], sources, swiss_result['confidence']
        
        # Recherche STRICTE des articles CGI officiels
        similar_cgi_articles = search_similar_cgi_articles(query, top_k=3)
        
        # Recherche STRICTE des BOFiP officiels
        similar_bofip_chunks = search_similar_bofip_chunks_filtered(query, top_k=3)
        
        # Vérification qu'on a au moins une source officielle
        if not similar_cgi_articles and not similar_bofip_chunks and not swiss_result:
            return ("Je ne trouve aucune information dans les sources officielles (CGI, BOFiP et fiscalité suisse) "
                   "pour répondre à votre question. Pourriez-vous reformuler ou être plus spécifique ?"), [], 0.3
        
                # --- Sanitize content before sending to LLM ---
        sanitized_query = sanitize_text(query)
        sanitized_history = None
        if conversation_history:
            sanitized_history = []
            for m in conversation_history[-10:]:
                sanitized_history.append({
                    "role": m.get("role", "user"),
                    "content": sanitize_text(m.get("content", ""))
                })

        # Création du prompt avec le contexte RAG officiel UNIQUEMENT (PII protégées)
        prompt = create_prompt(sanitized_query, similar_cgi_articles, similar_bofip_chunks, swiss_result, sanitized_history)
        
        # Appel à Mistral pour chat/RAG (besoin embeddings)
        messages = [ChatMessage(role="user", content=prompt)]
        response = client.chat(
            model="mistral-large-latest",
            messages=messages,
            temperature=0.15,  # Très bas pour privilégier la précision
            max_tokens=1000
        )
        
        answer = response.choices[0].message.content.strip()
        
        # Extraction des sources OFFICIELLES uniquement
        for article in similar_cgi_articles:
            source_name = f"Article {article.get('article_id', 'N/A')} du CGI"
            all_sources_for_api.append(source_name)
        
        for chunk in similar_bofip_chunks:
            source_name = chunk.get('reference', 'BOFiP N/A')
            all_sources_for_api.append(source_name)
        
        # Ajouter disclaimer sur les sources officielles
        if all_sources_for_api:
            disclaimer = f"\n\n📚 Sources officielles consultées : {', '.join(all_sources_for_api[:3])}"
            if len(all_sources_for_api) > 3:
                disclaimer += f" et {len(all_sources_for_api) - 3} autres"
            answer += disclaimer
        
        # Calcul du score de confiance basé UNIQUEMENT sur les sources officielles
        confidence_score = min(0.95, len(all_sources_for_api) / 4.0) if all_sources_for_api else 0.3
        
        return answer, all_sources_for_api, confidence_score
    
    except Exception as e:
        print(f"Erreur lors du traitement de la question : {str(e)}")
        return ("Erreur lors de la consultation des sources officielles. "
               "Veuillez réessayer."), [], 0.0


def get_francis_vocal_response(query: str, conversation_history: List[Dict] = None) -> Tuple[str, List[str], float]:
    """
    Fonction spécifique pour Francis vocal - utilise Groq (gratuit) pour l'extraction d'infos client.
    Pas besoin de RAG/embeddings, juste de l'extraction sémantique pure.
    """
    if not groq_client:
        # Fallback vers Mistral si Groq indisponible
        if not client:
            return ("Service IA non disponible. Configurez GROQ_API_KEY ou MISTRAL_API_KEY.", [], 0.0)
        print("⚠️ Groq indisponible, fallback Mistral pour Francis vocal")
        # Utiliser la fonction normale avec Mistral
        return get_fiscal_response(query, conversation_history)
    
    try:
        # Sanitize l'input pour Francis
        sanitized_query = sanitize_text(query)
        sanitized_history = None
        if conversation_history:
            sanitized_history = []
            for m in conversation_history[-5:]:  # Limite historique pour vocal
                sanitized_history.append({
                    "role": m.get("role", "user"),
                    "content": sanitize_text(m.get("content", ""))
                })
        
        # Construction des messages pour Groq (OpenAI-compatible)
        messages = [{"role": "user", "content": sanitized_query}]
        
        # Ajouter l'historique si disponible
        if sanitized_history:
            # Insérer l'historique avant la question actuelle
            for msg in sanitized_history:
                messages.insert(-1, msg)
        
        # Appel à Groq pour Francis vocal
        response = groq_client.chat.completions.create(
            model="llama3-8b-8192",  # Modèle Groq gratuit et performant
            messages=messages,
            temperature=0.15,  # Bas pour précision extraction
            max_tokens=1024
        )
        
        answer = response.choices[0].message.content.strip()
        
        # Sources pour Francis vocal (pas de RAG)
        sources = ["Francis IA - Extraction vocale", "Groq Llama3-8B"]
        confidence = 0.8  # Confiance élevée pour extraction pure
        
        return answer, sources, confidence
        
    except Exception as e:
        print(f"Erreur Francis vocal (Groq): {str(e)}")
        # Tentative de fallback vers Mistral
        if client:
            print("🔄 Fallback vers Mistral pour Francis vocal")
            return get_fiscal_response(query, conversation_history)
        return ("Erreur lors de l'extraction vocale Francis. Veuillez réessayer.", [], 0.0)

def get_fiscal_response_stream(query: str, conversation_history: List[Dict] = None):
    """Version streaming qui utilise EXCLUSIVEMENT les sources officielles."""
    try:
        # Envoyer le statut initial
        yield json.dumps({
            "type": "status",
            "message": "🔍 Recherche dans les sources officielles (CGI, BOFiP et fiscalité suisse)...",
            "progress": 10
        }) + "\n"
        
        if not client:
            yield json.dumps({
                "type": "error",
                "message": "Erreur: Client Mistral non configuré"
            }) + "\n"
            return

        # Variables pour les sources OFFICIELLES uniquement
        similar_cgi_articles = []
        similar_bofip_chunks = []
        swiss_result = {}
        all_sources = []
        confidence_score = 0.5
        
        # === RECHERCHE FISCALITÉ SUISSE ===
        if is_swiss_fiscal_question(query):
            yield json.dumps({
                "type": "status",
                "message": "🇨🇭 Consultation de la base fiscale suisse...",
                "progress": 15
            }) + "\n"
            
            try:
                swiss_result = search_swiss_fiscal_knowledge(query, top_k=3)
                
                # Si on a une réponse suisse de très bonne qualité, on peut l'utiliser directement
                if swiss_result and swiss_result.get('confidence', 0) >= 0.8:
                    sources = [f"Fiscalité Suisse - {source.get('chunk_id', 'N/A')}" 
                              for source in swiss_result.get('sources', [])]
                    
                    yield json.dumps({
                        "type": "complete",
                        "content": swiss_result['answer'],
                        "sources": sources,
                        "confidence": swiss_result['confidence'],
                        "progress": 100
                    }) + "\n"
                    return
                    
            except Exception as e:
                print(f"Erreur fiscalité suisse: {e}")

        # === RECHERCHE CGI AVEC TIMEOUT ===
        yield json.dumps({
            "type": "status", 
            "message": "📖 Consultation du Code Général des Impôts...",
            "progress": 25
        }) + "\n"
        
        try:
            def timeout_handler(signum, frame):
                raise TimeoutError("Search timeout")
            
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(4)  # 4 secondes pour CGI
            
            similar_cgi_articles = search_similar_cgi_articles(query, top_k=3)
            signal.alarm(0)
            
            if similar_cgi_articles:
                all_sources.extend([art.get('source', 'CGI inconnu') for art in similar_cgi_articles])
                confidence_score = max(confidence_score, 0.8)
                
        except (TimeoutError, Exception) as e:
            print(f"Timeout/Erreur CGI: {e}")

        # === RECHERCHE BOFIP AVEC TIMEOUT ===
        yield json.dumps({
            "type": "status",
            "message": "📚 Consultation du Bulletin Officiel des Finances Publiques...",
            "progress": 45
        }) + "\n"
        
        try:
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(4)  # 4 secondes pour BOFiP
            
            similar_bofip_chunks = search_similar_bofip_chunks_filtered(query, top_k=3)
            signal.alarm(0)
            
            if similar_bofip_chunks:
                all_sources.extend([chunk.get('reference', 'BOFiP inconnu') for chunk in similar_bofip_chunks])
                confidence_score = max(confidence_score, 0.8)
                
        except (TimeoutError, Exception) as e:
            print(f"Timeout/Erreur BOFiP: {e}")

        # Vérification qu'on a des sources officielles
        if not similar_cgi_articles and not similar_bofip_chunks and not swiss_result:
            yield json.dumps({
                "type": "complete",
                "content": "Je ne trouve aucune information dans les sources officielles (CGI, BOFiP et fiscalité suisse) pour répondre à votre question. Pourriez-vous reformuler ou être plus spécifique ?",
                "sources": ["Sources officielles consultées mais aucun résultat pertinent"],
                "confidence": 0.3,
                "progress": 100
            }) + "\n"
            return

        # === PRÉPARATION DU PROMPT OFFICIEL ===
        yield json.dumps({
            "type": "status",
            "message": "🤖 Francis analyse les textes officiels...",
            "progress": 65
        }) + "\n"

        # Prompt basé UNIQUEMENT sur les sources officielles
        prompt = create_prompt(query, similar_cgi_articles, similar_bofip_chunks, swiss_result, conversation_history)

        yield json.dumps({
            "type": "status",
            "message": "✍️ Génération de la réponse basée sur les sources officielles...",
            "progress": 80
        }) + "\n"

        # === GÉNÉRATION DE LA RÉPONSE ===
        try:
            signal.alarm(10)  # 10 secondes pour Mistral
            
            messages = [ChatMessage(role="user", content=prompt)]
            response = client.chat(
                model="mistral-large-latest",
                messages=messages,
                temperature=0.15,
                max_tokens=1000
            )
            
            signal.alarm(0)
            answer = response.choices[0].message.content.strip()
            
            # Ajouter disclaimer sur sources officielles
            if all_sources:
                disclaimer = f"\n\n📚 Sources officielles : {', '.join(all_sources[:3])}"
                if len(all_sources) > 3:
                    disclaimer += f" et {len(all_sources) - 3} autres"
                answer += disclaimer
            
            # Finaliser avec les sources officielles
            yield json.dumps({
                "type": "complete",
                "content": answer,
                "sources": all_sources,
                "confidence": confidence_score,
                "progress": 100
            }) + "\n"
            
        except (TimeoutError, Exception) as e:
            print(f"Erreur génération: {e}")
            yield json.dumps({
                "type": "error",
                "message": f"Erreur lors de la génération de la réponse basée sur les sources officielles : {str(e)[:100]}"
            }) + "\n"
            
    except Exception as e:
        yield json.dumps({
            "type": "error",
            "message": f"Erreur générale : {str(e)[:100]}"
        }) + "\n"

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
        exit(1)
    if not client:
        exit(1)
    main() 
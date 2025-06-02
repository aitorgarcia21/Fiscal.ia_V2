import os
import json
import sys
import time
import signal
from typing import List, Dict, Tuple
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from config import MISTRAL_API_KEY
from cgi_search import search_similar_cgi_articles
from bofip_search import search_similar_bofip_chunks

# Configuration
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# Initialisation du client Mistral
client = MistralClient(api_key=MISTRAL_API_KEY) if MISTRAL_API_KEY else None

def format_article_for_display(article_data: Dict) -> str:
    """Formate un article du CGI pour l'affichage avec sa structure."""
    chunks = article_data.get('chunks', [])
    if not chunks:
        return f"Article {article_data.get('article_number', 'N/A')} (pas de contenu)"
    
    return f"Article {article_data.get('article_number', 'N/A')}\n\n" + '\n\n'.join(chunks)

def search_similar_cgi_articles(query: str, top_k: int = 3) -> List[Dict]:
    """Recherche les articles du CGI les plus similaires à la requête avec le nouveau système."""
    try:
        embeddings = load_embeddings()
        if not embeddings:
            return []
        
        similar_articles_raw = search_similar_articles(query, embeddings, top_k=top_k*2) # Chercher plus d'articles
        
        # Filtrer les articles CGI peu pertinents (similarité < 0.7)
        # Note: search_similar_articles dans mistral_cgi_embeddings.py retourne déjà (article_data, similarity)
        # Nous devons ajuster la façon dont nous accédons à la similarité ici.
        # Supposons que search_similar_articles retourne une liste de tuples (article_dict, similarity_score)
        
        filtered_articles = []
        for article_tuple in similar_articles_raw:
            if isinstance(article_tuple, tuple) and len(article_tuple) == 2:
                article_data, similarity_score = article_tuple
                if similarity_score >= 0.7:
                    filtered_articles.append(article_data) # Garder seulement les données de l'article
            else:
                # Gérer le cas où le format n'est pas celui attendu, pour éviter les erreurs
                # On pourrait logger un avertissement ici
                # Pour l'instant, on ignore cet élément si le format est incorrect
                pass 
        
        # Formater pour la compatibilité avec le reste du code
        results = []
        # Prendre seulement top_k articles APRÈS filtrage
        for article_data in filtered_articles[:top_k]: 
            results.append({
                # 'similarity': similarity_score, # Utiliser la vraie similarité si besoin plus tard
                'content': article_data.get('text', ''),
                'source': f"CGI Article {article_data.get('article_number', 'N/A')}",
                'article_id': article_data.get('article_number', 'N/A')
            })
        
        return results
    except Exception as e:
        return []

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

def create_prompt(query: str, cgi_articles: List[Dict], bofip_chunks: List[Dict], conversation_history: List[Dict] = None) -> str:
    """Crée le prompt pour l'assistant fiscal avec contextes CGI et BOFIP et mémoire de conversation."""
    
    # Formater les articles CGI
    cgi_context_str = ""
    if cgi_articles:
        for article in cgi_articles:
            cgi_context_str += format_article_for_display(article) + "\n\n"
    else:
        cgi_context_str = "Aucun article CGI spécifique trouvé pour cette question."
    
    # Formater les chunks BOFIP
    bofip_context_str = ""
    if bofip_chunks:
        for chunk in bofip_chunks:
            source = chunk.get('file', 'Source BOFIP inconnue')
            content = chunk.get('content', chunk.get('text', ''))
            bofip_context_str += f"Source BOFIP: {source}\n{content}\n\n"
    else:
        bofip_context_str = "Aucune documentation BOFIP spécifique trouvée pour cette question."
    
    # Préparer l'historique de conversation
    history_str = "Première conversation avec l'utilisateur."
    if conversation_history:
        history_items = []
        for msg in conversation_history[-4:]:  # Garder seulement les 4 derniers échanges
            role = msg.get('role', '')
            content = msg.get('content', '')
            if role == 'user':
                history_items.append(f"👤 Utilisateur: {content}")
            elif role == 'assistant':
                history_items.append(f"🤖 Francis: {content[:150]}...")  # Tronquer les longues réponses
        history_str = "\n".join(history_items)
    
    prompt = f"""Tu es Francis, un assistant fiscal expert hautement spécialisé en fiscalité française, créé par la société Fiscal.ia. Tu es l'accompagnateur fiscal personnel de l'utilisateur.

Historique de conversation récente:
---
{history_str}
---

Question actuelle: {query}

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
- RÈGLE ABSOLUE ANTI-MARKDOWN : Tu dois répondre UNIQUEMENT en texte brut, sans AUCUN formatage.
- STRICTEMENT INTERDIT : *, **, ***, _, __, ___, `, ```, #, ##, ###, [liens], > citations
- TU NE DOIS JAMAIS UTILISER d'astérisques, underscores, dièses (#), backticks (`) ou crochets []. Utilise SEULEMENT : lettres, chiffres, espaces, points, virgules et tirets simples.
- Pour structurer : utilise des numéros (1., 2., 3.) et des tirets simples (-)
- Pour mettre en valeur : utilise des MAJUSCULES pour les mots importants
- EXEMPLE BON : "Les TMI 2025 sont : 0 pour cent jusqu'a 11 294 euros, 11 pour cent jusqu'a 28 797 euros"
- EXEMPLE MAUVAIS : "Les **TMI 2025** sont : *0%* jusqu'à **11 294€**"

🎯 ACCOMPAGNEMENT FISCAL PROACTIF :
- MÉMOIRE : Utilise l'historique de conversation pour comprendre le contexte et la situation de l'utilisateur
- SUIVI : Fais référence aux échanges précédents quand c'est pertinent
- PROACTIVITÉ : Propose des actions concrètes, des optimisations et des conseils personnalisés
- ÉCHÉANCES : Rappelle les dates importantes (déclarations, versements, etc.)
- ANTICIPATION : Identifie les opportunités d'optimisation fiscale
- QUESTIONS DE SUIVI : Pose des questions pertinentes pour mieux accompagner l'utilisateur

🎯 RÈGLES STRICTES DE PRÉCISION FISCALE :
- INTERDIT ABSOLU : Inventer des pourcentages, taux ou seuils non mentionnés dans les sources CGI/BOFIP
- OBLIGATION : Utiliser UNIQUEMENT les chiffres présents dans les textes officiels fournis
- En cas de doute sur un pourcentage : dire "je dois vérifier cette information précise"
- JAMAIS d'approximation sur les taux d'imposition, seuils de détention, durées légales
- Si les sources ne contiennent pas l'information exacte : le préciser clairement

🗓️ ANNÉE FISCALE 2025 :
- Donne TOUJOURS les informations pour 2025 sauf mention contraire
- Utilise prioritairement les données du CGI et BOFIP pour les barèmes officiels 2025

📝 MAÎTRISE PARFAITE DES ACRONYMES FISCAUX :
- TMI = Tranche Marginale d'Imposition | IFI = Impôt Fortune Immobilière | TVA = Taxe Valeur Ajoutée
- IR = Impôt Revenu | IS = Impôt Sociétés | CFE = Cotisation Foncière Entreprises
- BIC = Bénéfices Industriels Commerciaux | BNC = Bénéfices Non Commerciaux | BA = Bénéfices Agricoles
- PEA = Plan Épargne Actions | PER = Plan Épargne Retraite | PERP = Plan Épargne Retraite Populaire
- LMNP = Location Meublée Non Professionnelle | LMP = Location Meublée Professionnelle
- SCPI = Société Civile Placement Immobilier | SCI = Société Civile Immobilière
- SASU = Société par Actions Simplifiée Unipersonnelle | EURL = Entreprise Unipersonnelle Responsabilité Limitée
- SARL = Société Responsabilité Limitée | SAS = Société par Actions Simplifiée
- EIRL = Entreprise Individuelle Responsabilité Limitée | EI = Entreprise Individuelle
- RSI = Régime Social Indépendants | URSSAF = Union Recouvrement Sécurité Sociale
- CAF = Caisse Allocations Familiales | MSA = Mutualité Sociale Agricole
- DGFIP = Direction Générale Finances Publiques | SIP = Service Impôts Particuliers
- SIE = Service Impôts Entreprises | CDI = Centre Des Impôts
- BOFIP = Bulletin Officiel Finances Publiques | CGI = Code Général Impôts
- LF = Loi Finances | PLF = Projet Loi Finances | LFSS = Loi Financement Sécurité Sociale
- CIR = Crédit Impôt Recherche | CICE = Crédit Impôt Compétitivité Emploi
- CIMR = Contribution Institutions Médicales Retirement | C3S = Contribution Sociale Solidarité
- CRDS = Contribution Remboursement Dette Sociale | CSG = Contribution Sociale Généralisée
- CVAE = Cotisation Valeur Ajoutée Entreprises | CET = Contribution Économique Territoriale
- DMTO = Droits Mutation Titre Onéreux | DMTG = Droits Mutation Titre Gratuit
- TEOM = Taxe Enlèvement Ordures Ménagères | TH = Taxe Habitation
- TFPB = Taxe Foncière Propriétés Bâties | TFPNB = Taxe Foncière Propriétés Non Bâties

🎯 EXPERTISE TECHNIQUE COMPLÈTE :
- Régimes fiscaux : Micro, Réel simplifié, Réel normal, Déclaration contrôlée
- Niches fiscales : Pinel, Denormandie, Malraux, FCPI, FIP, Girardin
- Plus-values : Immobilières, mobilières, professionnelles, abattements 2025
- Transmission : Donation, succession, démembrement, pacte Dutreil
- International : CUF, conventions, exit tax, revenus étrangers
- Contrôles : ESFP, vérification comptabilité, contrôle sur pièces

📈 ACCOMPAGNEMENT PERSONNALISÉ :
- Analyse la situation complète de l'utilisateur
- Propose des optimisations concrètes et chiffrées
- Suggère des actions à court et long terme
- Rappelle les échéances importantes
- Anticipe les besoins fiscaux futurs
- Pose des questions de suivi pertinentes

- Utilise prioritairement les informations fournies du CGI et du BOFIP pour construire ta réponse.
- Si les contextes contiennent des éléments pertinents, même partiels, utilise-les pour donner une réponse utile.
- Synthétise les informations disponibles et donne des conseils pratiques.
- Tu peux mentionner tes sources (ex: "Selon l'article X du CGI" ou "D'après le BOFIP") mais ce n'est pas obligatoire.
- ÉVITE les formules trop formelles comme "En tant que Francis..." ou "les informations ne me permettent pas".
- Sois direct, utile et professionnel.
- Si tu n'as vraiment aucune information pertinente, donne quand même une réponse générale basée sur tes connaissances fiscales françaises pour 2025.

COMPORTEMENT D'ACCOMPAGNEMENT :
- Si c'est une nouvelle conversation, présente-toi brièvement et demande la situation de l'utilisateur
- Si l'utilisateur a déjà partagé des informations, fais-y référence et propose des conseils personnalisés
- Termine toujours par une question de suivi ou une proposition d'action concrète
- Sois proactif et bienveillant dans tes conseils

RAPPEL FINAL : AUCUN FORMATAGE MARKDOWN AUTORISÉ - TEXTE BRUT UNIQUEMENT

Réponds directement à la question:"""
    
    return prompt

def get_fiscal_response(query: str, conversation_history: List[Dict] = None) -> Tuple[str, List[str], float]:
    """Obtient une réponse de l'assistant fiscal - VERSION ULTRA-SIMPLIFIÉE RAILWAY."""
    all_sources_for_api = []
    confidence_score = 0.5 

    try:
        if not client:
            return "Erreur: Client Mistral non configuré", [], 0.0
        
        # Détecter immédiatement le type de question pour fallback rapide
        query_lower = query.lower()
        
        # FALLBACKS IMMÉDIATS POUR RAILWAY (pas de RAG lent)
        if any(word in query_lower for word in ['tmi', 'tranche', 'marginal', 'imposition']):
            prompt = f"""Tu es Francis, assistant fiscal expert de Fiscal.ia.

Question: {query}

Contexte: Les TMI 2025 sont : 0% jusqu'à 11 294€, 11% jusqu'à 28 797€, 30% jusqu'à 82 341€, 41% jusqu'à 177 106€, 45% au-delà.

IMPORTANT: Réponds uniquement en texte brut, sans aucun formatage markdown. N'utilise JAMAIS d'astérisques (*), underscores (_), dièses (#), backticks (`) ou crochets []. Utilise seulement des lettres, chiffres, espaces, points, virgules et tirets simples.

Réponds clairement et concrètement en tant qu'expert fiscal. Calcule la TMI exacte si possible."""
            all_sources_for_api.append("Barème fiscal 2025")
            confidence_score = 0.9
            
        elif any(word in query_lower for word in ['pea', 'plan', 'épargne', 'actions']):
            prompt = f"""Tu es Francis, assistant fiscal expert de Fiscal.ia.

Question: {query}

Contexte: Le PEA permet d'investir jusqu'à 150 000€ en actions européennes avec exonération fiscale après 5 ans de détention.

IMPORTANT: Réponds uniquement en texte brut, sans aucun formatage markdown. N'utilise JAMAIS d'astérisques (*), underscores (_), dièses (#), backticks (`) ou crochets []. Utilise seulement des lettres, chiffres, espaces, points, virgules et tirets simples.

Réponds clairement et concrètement en tant qu'expert fiscal."""
            all_sources_for_api.append("Code fiscal - PEA")
            confidence_score = 0.9
            
        elif any(word in query_lower for word in ['plus-value', 'immobilier', 'résidence principale']):
            prompt = f"""Tu es Francis, assistant fiscal expert de Fiscal.ia.

Question: {query}

Contexte: La résidence principale est exonérée de plus-values. Pour les autres biens immobiliers, il y a des abattements selon la durée de détention.

IMPORTANT: Réponds uniquement en texte brut, sans aucun formatage markdown. N'utilise JAMAIS d'astérisques (*), underscores (_), dièses (#), backticks (`) ou crochets []. Utilise seulement des lettres, chiffres, espaces, points, virgules et tirets simples.

Réponds clairement et concrètement en tant qu'expert fiscal."""
            all_sources_for_api.append("CGI - Plus-values immobilières")
            confidence_score = 0.9
            
        elif any(word in query_lower for word in ['micro', 'entrepreneur', 'régime']):
            prompt = f"""Tu es Francis, assistant fiscal expert de Fiscal.ia.

Question: {query}

Contexte: Le régime micro-entreprise permet de déclarer uniquement le chiffre d'affaires avec un abattement forfaitaire (34% pour les services, 71% pour la vente).

IMPORTANT: Réponds uniquement en texte brut, sans aucun formatage markdown. N'utilise JAMAIS d'astérisques (*), underscores (_), dièses (#), backticks (`) ou crochets []. Utilise seulement des lettres, chiffres, espaces, points, virgules et tirets simples.

Réponds clairement et concrètement en tant qu'expert fiscal."""
            all_sources_for_api.append("CGI - Régimes fiscaux")
            confidence_score = 0.9
            
        else:
            # Réponse générale rapide
            prompt = f"""Tu es Francis, assistant fiscal expert de Fiscal.ia.

Question: {query}

IMPORTANT: Réponds uniquement en texte brut, sans aucun formatage markdown. N'utilise JAMAIS d'astérisques (*), underscores (_), dièses (#), backticks (`) ou crochets []. Utilise seulement des lettres, chiffres, espaces, points, virgules et tirets simples.

Tu es un expert fiscal français. Réponds de manière claire et pratique à cette question fiscale. Si tu as besoin de plus d'informations, demande des précisions sur la situation de l'utilisateur."""
            all_sources_for_api.append("Expertise Francis")
            confidence_score = 0.7

        # Appel direct à Mistral sans timeout compliqué
        messages = [ChatMessage(role="user", content=prompt)]
        
        chat_response = client.chat(
            model="mistral-large-latest",
            messages=messages,
            temperature=0.5,
            max_tokens=800  # Encore plus court pour Railway
        )
        
        answer = chat_response.choices[0].message.content
        
        # Nettoyer automatiquement le formatage markdown
        answer = clean_markdown_formatting(answer)
        
        return answer, all_sources_for_api, confidence_score

    except Exception as e:
        # Fallback ultime pour Railway
        query_lower = query.lower()
        
        if 'tmi' in query_lower:
            return "Avec 50 000 euros de revenus en 2025, votre TMI est de 30 pour cent. Vos tranches : 0 pour cent sur 11 294 euros, 11 pour cent sur 17 503 euros, 30 pour cent sur 21 203 euros. Voulez-vous que je détaille le calcul ?", ["Barème 2025"], 0.8
        elif 'pea' in query_lower:
            return "Le PEA vous permet d'investir 150 000 euros en actions européennes. Exonération totale après 5 ans. Quels sont vos objectifs d'investissement ?", ["Code fiscal"], 0.8
        elif 'micro' in query_lower:
            return "En micro-entreprise, vous déclarez votre CA avec abattement automatique. Pour les services : 34 pour cent, pour la vente : 71 pour cent. Quel est votre secteur d'activité ?", ["Régimes fiscaux"], 0.8
        else:
            return f"Je suis Francis, votre expert fiscal. Pour vous donner une réponse précise sur '{query}', pouvez-vous me dire votre situation (salarié, entrepreneur, investisseur) ?", ["Expert Francis"], 0.6

def get_fiscal_response_stream(query: str, conversation_history: List[Dict] = None):
    """Version streaming de get_fiscal_response qui envoie la réponse chunk par chunk.
    Version optimisée Railway avec timeouts et fallbacks."""
    try:
        # Envoyer le statut initial
        yield json.dumps({
            "type": "status",
            "message": "🔍 Initialisation de Francis...",
            "progress": 10
        }) + "\n"
        
        if not client:
            yield json.dumps({
                "type": "error",
                "message": "Erreur: Client Mistral non configuré"
            }) + "\n"
            return

        # Variables pour les sources
        similar_cgi_articles = []
        similar_bofip_chunks = []
        all_sources = []
        confidence_score = 0.5

        # === RECHERCHE CGI AVEC TIMEOUT ===
        yield json.dumps({
            "type": "status", 
            "message": "📖 Recherche dans le CGI...",
            "progress": 25
        }) + "\n"
        
        try:
            import signal
            
            def timeout_handler(signum, frame):
                raise TimeoutError("Search timeout")
            
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(3)
            
            similar_cgi_articles = search_similar_cgi_articles(query, top_k=2)
            signal.alarm(0)
            
            if similar_cgi_articles:
                all_sources.extend([art.get('source', 'CGI inconnu') for art in similar_cgi_articles])
                confidence_score = max(confidence_score, 0.7)
                
        except (TimeoutError, Exception):
            # Fallback silencieux pour CGI
            pass
        
        # === RECHERCHE BOFIP AVEC TIMEOUT ===
        yield json.dumps({
            "type": "status",
            "message": "📋 Consultation du BOFIP...", 
            "progress": 45
        }) + "\n"
        
        try:
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(3)
            
            similar_bofip_chunks_raw = search_similar_bofip_chunks(query, top_k=4)
            similar_bofip_chunks = [c for c in similar_bofip_chunks_raw if c.get('similarity', 0) >= 0.6][:2]
            signal.alarm(0)
            
            if similar_bofip_chunks:
                all_sources.extend([f"BOFIP: {chunk.get('file', 'Chunk inconnu')}" for chunk in similar_bofip_chunks])
                confidence_score = max(confidence_score, 0.75)
                
        except (TimeoutError, Exception):
            # Fallback silencieux pour BOFIP
            pass

        # === PRÉPARATION DU PROMPT ===
        yield json.dumps({
            "type": "status",
            "message": "🤖 Francis analyse votre question...",
            "progress": 65
        }) + "\n"

        # Logique de fallback comme dans get_fiscal_response
        if not similar_cgi_articles and not similar_bofip_chunks:
            query_lower = query.lower()
            
            if any(word in query_lower for word in ['tmi', 'tranche', 'marginal', 'imposition']):
                context = "Les TMI 2025 sont : 0 pour cent, 11 pour cent, 30 pour cent, 41 pour cent, 45 pour cent"
                all_sources.append("Barème fiscal 2025")
                confidence_score = 0.8
            elif any(word in query_lower for word in ['pea', 'plan', 'épargne', 'actions']):
                context = "Le PEA permet d'investir en actions européennes avec exonération fiscale après 5 ans"
                all_sources.append("Code fiscal - PEA")
                confidence_score = 0.8
            elif any(word in query_lower for word in ['plus-value', 'immobilier', 'résidence principale']):
                context = "La résidence principale est exonérée de plus-values. Pour les autres biens, abattement selon durée de détention"
                all_sources.append("CGI - Plus-values immobilières")
                confidence_score = 0.8
            elif any(word in query_lower for word in ['micro', 'entrepreneur', 'régime']):
                context = "Le régime micro permet de déclarer le chiffre d'affaires avec abattement forfaitaire"
                all_sources.append("CGI - Régimes fiscaux")
                confidence_score = 0.8
            else:
                context = "En tant qu'expert fiscal, je vais analyser votre situation"
                all_sources.append("Expertise Francis")
                confidence_score = 0.6
                
            # Prompt simplifié avec instructions anti-markdown renforcées
            prompt = f"""Tu es Francis, assistant fiscal expert de Fiscal.ia.

Question: {query}

Contexte fiscal disponible: {context}

Historique récent: {conversation_history[-2:] if conversation_history else "Nouvelle conversation"}

IMPORTANT: Réponds uniquement en texte brut, sans aucun formatage markdown. N'utilise JAMAIS d'astérisques (*), underscores (_), dièses (#), backticks (`) ou crochets []. Utilise seulement des lettres, chiffres, espaces, points, virgules et tirets simples.

Réponds de manière claire et pratique en tant qu'expert fiscal.
Si tu n'as pas assez d'informations précises, explique ce qu'il faudrait savoir pour donner une réponse complète."""
        else:
            # Prompt complet avec RAG
            prompt = create_prompt(query, similar_cgi_articles, similar_bofip_chunks, conversation_history)

        yield json.dumps({
            "type": "status",
            "message": "✍️ Génération de la réponse...",
            "progress": 80
        }) + "\n"

        # === APPEL MISTRAL STREAMING AVEC TIMEOUT ===
        try:
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(12)  # Timeout plus long pour le streaming
            
            messages = [ChatMessage(role="user", content=prompt)]
            
            chat_response = client.chat(
                model="mistral-large-latest",
                messages=messages,
                temperature=0.5,
                max_tokens=1200,
                stream=True
            )
            
            # Commencer la réponse
            yield json.dumps({
                "type": "start_response",
                "message": "Francis commence sa réponse:",
                "progress": 90
            }) + "\n"
            
            full_answer = ""
            
            # Streamer la réponse chunk par chunk avec nettoyage en temps réel
            for chunk in chat_response:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    
                    # Nettoyer le formatage markdown en temps réel
                    cleaned_content = clean_markdown_formatting(content)
                    
                    full_answer += cleaned_content
                    
                    yield json.dumps({
                        "type": "content",
                        "chunk": cleaned_content
                    }) + "\n"
            
            signal.alarm(0)  # Annuler le timeout
            
            # Nettoyer une fois de plus la réponse complète au cas où
            full_answer = clean_markdown_formatting(full_answer)
            
            # Finaliser avec les métadonnées
            yield json.dumps({
                "type": "complete",
                "sources": list(set(all_sources)),
                "confidence": confidence_score,
                "total_length": len(full_answer),
                "message": "✅ Réponse complète!"
            }) + "\n"
            
        except (TimeoutError, Exception) as e:
            # Fallback en cas de timeout de l'API Mistral
            yield json.dumps({
                "type": "start_response",
                "message": "Francis répond en mode fallback:",
                "progress": 90
            }) + "\n"
            
            # Réponses de fallback intelligentes (sans formatage)
            fallback_responses = {
                'tmi': "Votre TMI dépend de vos revenus 2025. Les tranches sont : 0 pour cent jusqu'à 11 294 euros, 11 pour cent jusqu'à 28 797 euros, 30 pour cent jusqu'à 82 341 euros, 41 pour cent jusqu'à 177 106 euros, 45 pour cent au-delà. Voulez-vous que je calcule votre TMI exacte ?",
                'pea': "Le PEA vous permet d'investir jusqu'à 150 000 euros en actions européennes. Les gains sont exonérés d'impôt après 5 ans de détention. Souhaitez-vous des précisions sur les conditions ?",
                'plus-value': "Les plus-values immobilières bénéficient d'abattements selon la durée de détention. Votre résidence principale est totalement exonérée. Avez-vous un projet de vente spécifique ?",
                'micro': "Le régime micro vous permet de déclarer uniquement votre chiffre d'affaires avec un abattement forfaitaire. Quel est votre domaine d'activité pour vous conseiller précisément ?",
            }
            
            query_lower = query.lower()
            fallback_answer = None
            
            for keyword, response in fallback_responses.items():
                if keyword in query_lower:
                    fallback_answer = response
                    all_sources = ["Expertise Francis"]
                    confidence_score = 0.7
                    break
            
            if not fallback_answer:
                fallback_answer = f"Je vais analyser votre question fiscale sur '{query}'. Pour vous donner une réponse précise et personnalisée, pouvez-vous me préciser votre situation (salarié, entrepreneur, investisseur) et votre objectif ?"
                all_sources = ["Expert Francis"]
                confidence_score = 0.6
            
            # Simuler le streaming de la réponse de fallback
            words = fallback_answer.split()
            for i, word in enumerate(words):
                if i == 0:
                    content = word
                else:
                    content = " " + word
                    
                yield json.dumps({
                    "type": "content",
                    "chunk": content
                }) + "\n"
                
                # Petit délai pour simuler le streaming
                time.sleep(0.05)
            
            yield json.dumps({
                "type": "complete",
                "sources": all_sources,
                "confidence": confidence_score,
                "total_length": len(fallback_answer),
                "message": "✅ Réponse de fallback fournie!"
            }) + "\n"
    
    except Exception as e:
        yield json.dumps({
            "type": "error",
            "message": f"Erreur technique: {str(e)[:100]}"
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
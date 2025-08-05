import os
import json
from typing import List, Dict, Tuple, AsyncGenerator, Optional, Literal
import typing

# Imports pour les embeddings CGI
try:
    from mistral_cgi_embeddings import load_embeddings, search_similar_articles
    from mistral_embeddings import search_similar_bofip_chunks
    CGI_EMBEDDINGS_AVAILABLE = True
    BOFIP_EMBEDDINGS_AVAILABLE = True
except ImportError:
    CGI_EMBEDDINGS_AVAILABLE = False
    BOFIP_EMBEDDINGS_AVAILABLE = False

# 📚 SYSTÈME MULTI-PROFILS VECTORISÉ
try:
    from multi_profile_search import multi_profile_search
    from profile_detector import profile_detector
    from knowledge_base_multi_profiles import ProfileType, RegimeFiscal, ThemeFiscal
    MULTI_PROFILE_AVAILABLE = True
    print("✅ Système multi-profils chargé avec succès")
except ImportError as e:
    MULTI_PROFILE_AVAILABLE = False
    print(f"⚠️ Système multi-profils non disponible : {e}")

# Import des embeddings andorrans
try:
    from backend.mistral_andorra_embeddings import (
        search_similar_chunks as search_similar_andorra_chunks,
    )
    ANDORRA_EMBEDDINGS_AVAILABLE = True
except ImportError:
    # Fallback si le chemin absolu échoue (exécution depuis backend)
    try:
        from mistral_andorra_embeddings import (
            search_similar_chunks as search_similar_andorra_chunks,
        )
        ANDORRA_EMBEDDINGS_AVAILABLE = True
    except ImportError:
        ANDORRA_EMBEDDINGS_AVAILABLE = False

# Import des embeddings luxembourgeois
try:
    from backend.mistral_luxembourg_embeddings import (
        search_similar_chunks as search_similar_lux_chunks,
    )
    LUXEMBOURG_EMBEDDINGS_AVAILABLE = True
except ImportError:
    # Fallback si le chemin absolu échoue (exécution depuis backend)
    try:
        from mistral_luxembourg_embeddings import (
            search_similar_chunks as search_similar_lux_chunks,
        )
        LUXEMBOURG_EMBEDDINGS_AVAILABLE = True
    except ImportError:
        LUXEMBOURG_EMBEDDINGS_AVAILABLE = False

# Configuration
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# -----------------------------------------
# Sélection dynamique du backend LLM
# -----------------------------------------
# Si LLM_ENDPOINT est défini *ou* si la clé Mistral est absente,
# on bascule en mode local (Ollama ou proxy LiteLLM compatible).
USE_LOCAL_LLM = bool(os.getenv("LLM_ENDPOINT")) or not MISTRAL_API_KEY

if USE_LOCAL_LLM:
    # Client local (Ollama / LiteLLM proxy)
    from ollama_client import generate as _local_generate  # type: ignore
    ChatMessage = None  # Placeholder pour éviter les références inutiles
    client = None
else:
    # Client Mistral officiel
    from mistralai.client import MistralClient  # type: ignore
    from mistralai.models.chat_completion import ChatMessage  # type: ignore
    client = MistralClient(api_key=MISTRAL_API_KEY) if MISTRAL_API_KEY else None

# Cache global pour éviter de recharger les embeddings - CHARGEMENT À LA DEMANDE
_embeddings_cache = None
_cache_loaded = False

# Embeddings de base pour les questions essentielles (fallback)
BASE_EMBEDDINGS_FR = {
    "tmi": {
        "content": """Article 197 du CGI - Calcul de l'impôt sur le revenu

L'impôt sur le revenu est calculé en appliquant le barème progressif aux revenus imposables.

Barème de l'impôt sur le revenu 2025 :
┌─────────────────────────────┬──────────────────────────┐
│ Tranche de revenu imposable │ Taux marginal (TMI)      │
├─────────────────────────────┼──────────────────────────┤
│ Jusqu'à 11 497 €           │ 0%                       │
│ De 11 498 € à 29 315 €     │ 11%                      │
│ De 29 316 € à 83 823 €     │ 30%                      │
│ De 83 824 € à 180 294 €    │ 41%                      │
│ Au-delà de 180 294 €       │ 45%                      │
└─────────────────────────────┴──────────────────────────┘

Le taux marginal d'imposition (TMI) correspond au taux de la tranche la plus élevée dans laquelle se situe le revenu imposable.

Exemples pratiques :
• Revenu imposable de 30 000 € → TMI de 30% (tranche de 29 316 € à 83 823 €)
• Revenu imposable de 100 000 € → TMI de 41% (tranche de 83 824 € à 180 294 €)
• Revenu imposable de 200 000 € → TMI de 45% (tranche au-delà de 180 294 €)""",
        "source": "CGI Article 197"
    },
    "tva": {
        "content": """Article 278 du CGI - Taxe sur la valeur ajoutée

La TVA est un impôt indirect sur la consommation. Les taux applicables sont :

- Taux normal : 20% (majorité des biens et services)
- Taux réduit : 10% (restauration, transports, travaux d'amélioration énergétique)
- Taux réduit : 5,5% (produits alimentaires, livres, spectacles)
- Taux spécial : 2,1% (médicaments remboursés, presse)

La TVA est collectée par les entreprises et reversée à l'État.""",
        "source": "CGI Article 278"
    },
    "plus_value": {
        "content": """Article 150 du CGI - Plus-values immobilières

Les plus-values immobilières sont imposables selon les règles suivantes :

- Calcul : Prix de vente - Prix d'achat - Frais
- Abattement : 6% par année de détention (après 5 ans)
- Taux : 19% + 17,2% de prélèvements sociaux

Pour les plus-values mobilières :
- Abattement : 50% après 2 ans de détention
- Taux : 12,8% + 17,2% de prélèvements sociaux""",
        "source": "CGI Article 150"
    }
}

# -----------------------------
# Embeddings de base Andorre
# -----------------------------

BASE_EMBEDDINGS_AD = {
    "irpf": {
        "content": """Llei 5/2014, article 83 – Barème de l'impôt sur le revenu (IRPF)

Le barème appliqué au revenu net imposable est le suivant (2025) :
• 0 % jusqu'à 24 000 €
• 5 % de 24 001 € à 40 000 €
• 10 % au-delà de 40 000 €

Exemple : pour 55 000 €, l'impôt est 2 300 € :
0 € (≤ 24 000 €) + 800 € (5 % de 16 000 €) + 1 500 € (10 % de 15 000 €).""",
        "source": "Llei 5/2014 – Art. 83"
    },
    "igi": {
        "content": """Llei 11/2012, articles 47 à 52 – Impost General Indirecte (IGI)

Taux applicables :
• 4,5 % général
• 1 % réduit (alimentation, santé, livres…)
• 2,5 % spécial restauration
• 9,5 % majoré pour services financiers
• 0 % exportations et secteurs exonérés.""",
        "source": "Llei 11/2012 – Art. 47-52"
    }
}

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

def get_fiscal_response(query: str, conversation_history: List[Dict] = None, user_profile_context: Optional[Dict[str, typing.Any]] = None, jurisdiction: Literal["FR", "AD", "CH", "LU"] = "FR"):
    """
    Génère une réponse fiscale en utilisant RAG avec les sources officielles.
    """
    if not client and not USE_LOCAL_LLM:
        return ("Service Mistral non disponible et aucun backend local détecté. Configurez MISTRAL_API_KEY ou LLM_ENDPOINT.", [], 0.0)
    
    # Construction du contexte utilisateur si fourni
    user_context_str = ""
    if user_profile_context:
        user_context_str = f"\n\nContexte utilisateur:\n{json.dumps(user_profile_context, indent=2, ensure_ascii=False)}"
    
    # Si juridiction = AD (Andorre), on utilise les embeddings andorrans
    if jurisdiction == "AD":
        context_from_sources = ""
        official_sources = []

        try:
            if ANDORRA_EMBEDDINGS_AVAILABLE:
                print(f"🔍 Recherche Lois Andorranes pour: {query[:100]}...")
                andorra_chunks = search_similar_andorra_chunks(query, top_k=3)
                print(f"📄 Chunks Andorre trouvés: {len(andorra_chunks)}")

                if andorra_chunks:
                    context_from_sources += "=== LÉGISLATION FISCALE ANDORRANE ===\n\n"
                    for chunk in andorra_chunks:
                        chunk_content = chunk.get('text', '')[:2000]
                        chunk_source = chunk.get('file', 'Texte Andorran')
                        context_from_sources += f"{chunk_source}:\n{chunk_content}\n\n"
                        official_sources.append(chunk_source)
                    context_from_sources += "\n" + "="*60 + "\n\n"
                else:
                    print("⚠️ Aucun chunk Andorran trouvé")
            else:
                print("❌ Embeddings Andorrans non disponibles")
        except Exception as e:
            print(f"❌ Erreur lors de la recherche Andorre: {e}")

    # Si juridiction = LU (Luxembourg), on utilise les embeddings de base Luxembourg
    elif jurisdiction == "LU":
        context_from_sources = ""
        official_sources = []
        
        # Tentative de récupération depuis les embeddings Luxembourg
        try:
            if LUXEMBOURG_EMBEDDINGS_AVAILABLE:
                print(f"🔍 Recherche Lois Luxembourg pour: {query[:100]}...")
                lux_chunks = search_similar_lux_chunks(query, top_k=3)
                print(f"📄 Chunks Luxembourg trouvés: {len(lux_chunks)}")

                if lux_chunks:
                    context_from_sources += "=== LÉGISLATION FISCALE LUXEMBOURGEOISE ===\n\n"
                    for chunk in lux_chunks:
                        chunk_content = chunk.get('text', '')[:2000]
                        chunk_source = chunk.get('file', 'Texte Luxembourg')
                        context_from_sources += f"{chunk_source}:\n{chunk_content}\n\n"
                        official_sources.append(chunk_source)
                    context_from_sources += "\n" + "="*60 + "\n\n"
                else:
                    print("⚠️ Aucun chunk Luxembourg trouvé")
            else:
                print("❌ Embeddings Luxembourg non disponibles")
        except Exception as e:
            print(f"❌ Erreur lors de la recherche Luxembourg: {e}")

        # Embeddings de base pour Luxembourg
        BASE_EMBEDDINGS_LU = {
            "ir": {
                "content": """Impôt sur le revenu Luxembourg 2025

Le barème progressif appliqué au revenu net imposable :
• 0 % jusqu'à 11 294 €
• 8 % de 11 295 € à 19 932 €  
• 9 % de 19 933 € à 28 032 €
• 10 % de 28 033 € à 46 484 €
• 11 % de 46 485 € à 100 002 €
• 12 % au-delà de 100 002 €

Le taux marginal d'imposition (TMI) correspond au taux de la tranche la plus élevée.""",
                "source": "Code fiscal luxembourgeois 2025"
            },
            "tva": {
                "content": """TVA Luxembourg 2025

Taux applicables :
• 17 % taux normal (majorité des biens et services)
• 14 % taux réduit (restauration, transports)
• 8 % taux super-réduit (produits alimentaires, livres)
• 3 % taux spécial (médicaments, presse)

La TVA est collectée par les entreprises et reversée à l'État.""",
                "source": "Code TVA luxembourgeois 2025"
            }
        }
        
        query_lower = query.lower()
        if any(term in query_lower for term in ['impôt', 'impot', 'revenu', 'ir', 'barème', 'tranche']):
            base = BASE_EMBEDDINGS_LU['ir']
            context_from_sources += "=== FISCALITÉ LUXEMBOURGEOISE – IR ===\n\n" + f"{base['source']}:\n{base['content']}\n\n"
            official_sources.append(base['source'])
        elif any(term in query_lower for term in ['tva', 'taxe', 'consommation']):
            base = BASE_EMBEDDINGS_LU['tva']
            context_from_sources += "=== FISCALITÉ LUXEMBOURGEOISE – TVA ===\n\n" + f"{base['source']}:\n{base['content']}\n\n"
            official_sources.append(base['source'])

    # Si juridiction = CH (Suisse), on utilise les embeddings suisses
    elif jurisdiction == "CH":
        context_from_sources = ""
        official_sources = []
        
        # Embeddings de base pour Suisse
        BASE_EMBEDDINGS_CH = {
            "ir": {
                "content": """Impôt fédéral direct Suisse 2025

Le barème progressif appliqué au revenu imposable :
• 0 % jusqu'à 14 500 CHF
• 0,77 % de 14 501 CHF à 31 600 CHF
• 0,88 % de 31 601 CHF à 41 400 CHF
• 2,64 % de 41 401 CHF à 55 200 CHF
• 2,97 % de 55 201 CHF à 267 600 CHF
• 3,5 % de 267 601 CHF à 725 400 CHF
• 11,5 % au-delà de 725 400 CHF

S'ajoutent les impôts cantonaux et communaux.""",
                "source": "Loi fédérale sur l'impôt fédéral direct 2025"
            },
            "tva": {
                "content": """TVA Suisse 2025

Taux applicables :
• 7,7 % taux normal (majorité des biens et services)
• 2,5 % taux réduit (produits alimentaires, livres, médicaments)
• 3,7 % taux spécial (hébergement touristique)

La TVA est collectée par les entreprises et reversée à la Confédération.""",
                "source": "Loi fédérale sur la TVA 2025"
            }
        }
        
        query_lower = query.lower()
        if any(term in query_lower for term in ['impôt', 'impot', 'revenu', 'fédéral', 'cantonal']):
            base = BASE_EMBEDDINGS_CH['ir']
            context_from_sources += "=== FISCALITÉ SUISSE – IR ===\n\n" + f"{base['source']}:\n{base['content']}\n\n"
            official_sources.append(base['source'])
        elif any(term in query_lower for term in ['tva', 'taxe', 'consommation']):
            base = BASE_EMBEDDINGS_CH['tva']
            context_from_sources += "=== FISCALITÉ SUISSE – TVA ===\n\n" + f"{base['source']}:\n{base['content']}\n\n"
            official_sources.append(base['source'])

    else:
        # France (FR) - logique enrichie avec système multi-profils
        context_from_sources = ""
        official_sources = []
        
        # 🎯 DÉTECTION DE PROFIL UTILISATEUR
        profile_context = ""
        if MULTI_PROFILE_AVAILABLE:
            try:
                print(f"🔍 Détection de profil pour: {query[:100]}...")
                profile_matches = profile_detector.detect_profile(query)
                
                if profile_matches:
                    best_match = profile_matches[0]
                    profile_type = best_match['profile']
                    confidence = best_match['confidence']
                    detected_keywords = best_match['detected_keywords']
                    
                    print(f"👤 Profil détecté: {profile_type.value} (confiance: {confidence:.2f})")
                    print(f"📝 Mots-clés: {detected_keywords}")
                    
                    # Recherche dans la base multi-profils
                    profile_results = multi_profile_search.search_knowledge(
                        query=query,
                        detected_profiles=profile_matches[:3],  # Top 3 profils
                        max_results=5
                    )
                    
                    if profile_results:
                        context_from_sources += "=== EXPERTISE FRANCIS - CONNAISSANCES SPÉCIALISÉES ===\n\n"
                        for result in profile_results:
                            chunk = result['chunk']
                            score = result['weighted_score']
                            context_from_sources += f"📋 {chunk.profile.value} - {chunk.theme.value} (Score: {score:.3f})\n"
                            context_from_sources += f"{chunk.content}\n"
                            if chunk.examples:
                                context_from_sources += f"💡 Exemple: {chunk.examples[0]}\n"
                            context_from_sources += f"🔖 Tags: {', '.join(chunk.tags)}\n\n"
                            
                        official_sources.append("Expertise Francis - Base de connaissances multi-profils")
                        context_from_sources += "\n" + "="*60 + "\n\n"
                        
                        # Contexte pour le prompt
                        profile_context = f"\n\n=== CONTEXTE PROFIL UTILISATEUR ===\nProfil principal: {profile_type.value}\nConfiance: {confidence:.2f}\nMots-clés détectés: {', '.join(detected_keywords)}\n"
                    else:
                        print("⚠️ Aucun résultat multi-profils trouvé")
                else:
                    print("⚠️ Aucun profil détecté")
                    
            except Exception as e:
                print(f"❌ Erreur système multi-profils: {e}")

        # 📚 RECHERCHE CGI (sources officielles)
        try:
            if CGI_EMBEDDINGS_AVAILABLE:
                print(f"🔍 Recherche CGI pour: {query[:100]}...")
                cgi_chunks = search_cgi_embeddings(query, max_results=5)  # Augmenté à 5
                print(f"📄 Chunks CGI trouvés: {len(cgi_chunks)}")

                if cgi_chunks:
                    context_from_sources += "=== CODE GÉNÉRAL DES IMPÔTS (CGI) ===\n\n"
                    for chunk in cgi_chunks:
                        chunk_content = chunk.get('content', '')[:3000]  # Augmenté à 3000
                        chunk_source = chunk.get('source', 'CGI Article N/A')
                        context_from_sources += f"{chunk_source}:\n{chunk_content}\n\n"
                        official_sources.append(chunk_source)
                    context_from_sources += "\n" + "="*60 + "\n\n"
                else:
                    print("⚠️ Aucun chunk CGI trouvé")
        except Exception as e:
            print(f"❌ Erreur lors de la recherche CGI: {e}")

        # 2. Recherche dans le BOFiP (complément officiel)
        try:
            if BOFIP_EMBEDDINGS_AVAILABLE:
                print(f"🔍 Recherche BOFiP pour: {query[:100]}...")
                bofip_chunks = search_bofip_embeddings(query, max_results=3)
                print(f"📄 Chunks BOFiP trouvés: {len(bofip_chunks)}")

                if bofip_chunks:
                    context_from_sources += "=== BULLETIN OFFICIEL DES FINANCES PUBLIQUES (BOFiP) ===\n\n"
                    for chunk in bofip_chunks:
                        if validate_official_source({'type': 'BOFIP', 'path': 'bofip_chunks'}):
                            chunk_content = chunk.get('text', '')[:2000]
                            chunk_source = f"BOFiP - {chunk.get('file', 'Chunk N/A')}"
                            context_from_sources += f"{chunk_source}:\n{chunk_content}\n\n"
                            official_sources.append(chunk_source)
                    context_from_sources += "\n" + "="*60 + "\n\n"
                else:
                    print("⚠️ Aucun chunk BOFiP trouvé")
        except Exception as e:
            print(f"❌ Erreur lors de la recherche BOFiP: {e}")
    
    # 3. Fallback vers les embeddings de base si aucune source trouvée
    if jurisdiction == "AD" and not context_from_sources:
        print("🔄 Fallback Andorre simplifié…")
        query_lower = query.lower()
        if any(term in query_lower for term in ['irpf', 'impôt sur le revenu', 'impot sur le revenu']):
            base = BASE_EMBEDDINGS_AD['irpf']
            context_from_sources += "=== FISCALITÉ ANDORRANE – IRPF ===\n\n" + f"{base['source']}:\n{base['content']}\n\n"
            official_sources.append(base['source'])
        elif any(term in query_lower for term in ['igi', 'tva', 'taxe', 'indirect']):
            base = BASE_EMBEDDINGS_AD['igi']
            context_from_sources += "=== FISCALITÉ ANDORRANE – IGI ===\n\n" + f"{base['source']}:\n{base['content']}\n\n"
            official_sources.append(base['source'])

    if jurisdiction == "FR" and not context_from_sources:
        print("🔄 Utilisation des embeddings de base...")
        query_lower = query.lower()
        if any(term in query_lower for term in ['tmi', 'taux marginal', 'tranche', 'impôt', 'impot']):
            base_embedding = BASE_EMBEDDINGS_FR['tmi']
            context_from_sources += "=== CODE GÉNÉRAL DES IMPÔTS (CGI) ===\n\n"
            context_from_sources += f"{base_embedding['source']}:\n{base_embedding['content']}\n\n"
            official_sources.append(base_embedding['source'])
            context_from_sources += "\n" + "="*60 + "\n\n"
        elif any(term in query_lower for term in ['tva', 'taxe valeur ajoutée']):
            base_embedding = BASE_EMBEDDINGS_FR['tva']
            context_from_sources += "=== CODE GÉNÉRAL DES IMPÔTS (CGI) ===\n\n"
            context_from_sources += f"{base_embedding['source']}:\n{base_embedding['content']}\n\n"
            official_sources.append(base_embedding['source'])
            context_from_sources += "\n" + "="*60 + "\n\n"
        elif any(term in query_lower for term in ['plus-value', 'plusvalue', 'plus value']):
            base_embedding = BASE_EMBEDDINGS_FR['plus_value']
            context_from_sources += "=== CODE GÉNÉRAL DES IMPÔTS (CGI) ===\n\n"
            context_from_sources += f"{base_embedding['source']}:\n{base_embedding['content']}\n\n"
            official_sources.append(base_embedding['source'])
            context_from_sources += "\n" + "="*60 + "\n\n"
    
    if not context_from_sources:
        # Fallback : répondre tout de même en mode "expert conseil" sans citation précise
        print(f"⚠️ Aucune source officielle trouvée pour : {query} – utilisation du mode conseil générique")
        context_from_sources = "=== EXPERTISE FISCALE GÉNÉRALE ===\n\n" \
                             + "Les informations suivantes reposent sur les principes généraux du droit fiscal français, " \
                             + "les pratiques courantes de planification patrimoniale et l'expérience de Francis en tant que conseiller CGP.\n\n"
    
    # Adapter le message système selon la juridiction
    if jurisdiction == "AD":
        system_message = """Tu es Francis, expert fiscal spécialiste du droit fiscal andorran.

RÈGLES DE RÉPONSE :
1. Base-toi PRIORITAIREMENT sur les textes officiels andorrans fournis ci-dessous.
2. Si tu as des informations limitées mais pertinentes, donne des conseils généraux basés sur les principes fiscaux andorrans.
3. Pour les questions transfrontalières (France ↔ Andorre), explique les principes et conventions applicables.
4. Cite les sources (articles de loi, décrets) LORSQUE NÉCESSAIRE pour appuyer tes réponses.
5. Utilise des TABLEAUX ASCII élégants (avec caractères ┌┐└┘├┤┬┴┼─│) pour présenter barèmes, comparaisons et calculs de manière claire et professionnelle.
6. Utilise ton expertise pour donner des conseils complets et précis basés sur ta connaissance du droit fiscal andorran.
7. Sois toujours utile et informatif, même avec des informations partielles.
8. Réponds en français de manière claire, structurée et professionnelle.
9. JAMAIS de formatage markdown (pas de #, *, -, etc.) - utilise uniquement du texte simple avec des puces • pour les listes.
10. Pour les calculs fiscaux, sois TRÈS précis et explique ta méthode avec des exemples chiffrés.
11. Vérifie tes calculs avant de répondre.
12. Structure ta réponse avec des paragraphes clairs, des puces • pour les énumérations, et commence toujours par "Bonjour".

SOURCES OFFICIELLES DISPONIBLES :
"""
    elif jurisdiction == "LU":
        system_message = """Tu es Francis, expert fiscal spécialiste du droit fiscal luxembourgeois.

RÈGLES DE RÉPONSE :
1. Base-toi PRIORITAIREMENT sur les textes officiels luxembourgeois fournis ci-dessous.
2. Si tu as des informations limitées mais pertinentes, donne des conseils généraux basés sur les principes fiscaux luxembourgeois.
3. Pour les questions transfrontalières (France ↔ Luxembourg), explique les principes et conventions applicables.
4. Cite les sources (articles de loi, décrets) LORSQUE NÉCESSAIRE pour appuyer tes réponses.
5. Utilise des TABLEAUX ASCII élégants (avec caractères ┌┐└┘├┤┬┴┼─│) pour présenter barèmes, comparaisons et calculs de manière claire et professionnelle.
6. Utilise ton expertise pour donner des conseils complets et précis basés sur ta connaissance du droit fiscal luxembourgeois.
7. Sois toujours utile et informatif, même avec des informations partielles.
8. Réponds en français de manière claire, structurée et professionnelle.
9. JAMAIS de formatage markdown (pas de #, *, -, etc.) - utilise uniquement du texte simple avec des puces • pour les listes.
10. Pour les calculs fiscaux, sois TRÈS précis et explique ta méthode avec des exemples chiffrés.
11. Vérifie tes calculs avant de répondre.
12. Structure ta réponse avec des paragraphes clairs, des puces • pour les énumérations, et commence toujours par "Bonjour".

SOURCES OFFICIELLES DISPONIBLES :
"""
    elif jurisdiction == "CH":
        system_message = """Tu es Francis, expert fiscal spécialiste du droit fiscal suisse.

RÈGLES DE RÉPONSE :
1. Base-toi PRIORITAIREMENT sur les textes officiels suisses fournis ci-dessous.
2. Si tu as des informations limitées mais pertinentes, donne des conseils généraux basés sur les principes fiscaux suisses.
3. Pour les questions transfrontalières (France ↔ Suisse), explique les principes et conventions applicables.
4. Cite les sources (articles de loi, décrets) LORSQUE NÉCESSAIRE pour appuyer tes réponses
5. Utilise des TABLEAUX ASCII élégants (avec caractères ┌┐└┘├┤┬┴┼─│) pour présenter barèmes, comparaisons et calculs de manière claire et professionnelle
6. Donne des réponses DIRECTES et PRATIQUES - Jamais "je ne peux pas" ou "consultez un expert"
7. Utilise les données 2025 et ton expertise pour compléter si nécessaire
8. Sois utile et informatif, toujours prêt à aider
9. Réponds en français de manière claire et professionnelle
10. Format avec chiffres en gras et exemples concrets chiffrés
11. JAMAIS de formatage markdown (pas de #, *, -, etc.) - utilise uniquement du texte simple avec des puces • pour les listes
12. Pour les calculs fiscaux, sois TRÈS précis et explique ta méthode avec des exemples chiffrés
13. Vérifie tes calculs avant de répondre
14. Structure ta réponse avec des paragraphes clairs, des puces • pour les énumérations, et commence toujours par "Bonjour"

SOURCES OFFICIELLES DISPONIBLES :
"""
    else:
        # 🎯 PROMPT ENRICHI AVEC CONTEXTE MULTI-PROFILS
        profile_instructions = ""
        if MULTI_PROFILE_AVAILABLE and profile_context:
            profile_instructions = f"""\n\n🎯 CONTEXTE UTILISATEUR DÉTECTÉ :
{profile_context}

INSTRUCTIONS SPÉCIALISÉES :
- Adapte ta réponse au profil détecté (expertise pointue)
- Utilise les connaissances spécialisées fournies dans les sources
- Donne des conseils concrets et actionnables pour ce profil
- Propose des optimisations spécifiques au contexte identifié
- Cite les exemples pratiques quand disponibles"""
        
        system_message = f"""Tu es Francis, copilote fiscal et patrimonial ultra-spécialisé dans le droit fiscal français.

🚀 MISSION : Expert fiscal de référence pour les conseillers en gestion de patrimoine. Tes conseils constituent une expertise fiscale professionnelle complète basée sur :
• Sources officielles (CGI, BOFiP)
• Base de connaissances multi-profils spécialisée
• Détection intelligente du profil utilisateur
• Exemples concrets et optimisations ciblées{profile_instructions}

RÈGLES DE RÉPONSE EXCELLENCE :
1. 📚 Base-toi PRIORITAIREMENT sur les textes officiels du CGI et BOFiP fournis
2. 🎯 Utilise les connaissances spécialisées multi-profils pour enrichir ta réponse
3. 💡 Donne des conseils CONCRETS et ACTIONNABLES, jamais vagues
4. 📊 Utilise des chiffres précis en gras et des exemples pratiques
5. 🔍 Cite les sources (articles CGI, BOFiP) pour appuyer tes réponses
6. 📋 Utilise des TABLEAUX pour présenter barèmes, comparaisons, calculs
7. ⚡ Complète TOUJOURS avec ton expertise approfondie (ne jamais dire "pas d'info")
8. 🎨 Format professionnel français, texte simple (JAMAIS de markdown)
9. 🔢 Calculs fiscaux ULTRA-PRÉCIS avec méthode détaillée
10. ✅ Vérifie tes calculs et cohérence avant réponse
11. 🏗️ Structure claire avec paragraphes simples
12. 💼 Ton expertise = celle d'un expert-comptable + CGP senior combinés

SOURCES OFFICIELLES ET SPÉCIALISÉES DISPONIBLES :
"""
        
    full_prompt = f"""{system_message}
{context_from_sources}
{user_context_str}QUESTION DE L'UTILISATEUR :
{query}

RÉPONSE (basée UNIQUEMENT sur les sources officielles et le contexte utilisateur pour l'interprétation) :
"""

    # Construire l'historique de conversation si disponible
    if USE_LOCAL_LLM:
        history_str = ""
        if conversation_history:
            for msg in conversation_history[-10:]:
                role = msg.get("role", "user").capitalize()
                content = msg.get("content", "")[:400]
                history_str += f"{role}: {content}\n"
        # Prompt final pour un modèle simple type chat-instruct
        local_prompt = (
            f"{history_str}Utilisateur: {full_prompt}\nAssistant:"  # On reste cohérent en français
        )
        try:
            answer = _local_generate(
                local_prompt,
                model=os.getenv("LLM_LOCAL_MODEL", "mistral"),
                max_tokens=1000,
                temperature=0.1,
            ).strip()
        except Exception as e:
            # 🔄 Fallback automatique vers l'API Mistral si une clé est dispo
            if MISTRAL_API_KEY:
                try:
                    from mistralai.client import MistralClient  # type: ignore
                    from mistralai.models.chat_completion import ChatMessage as _ChatMessage  # type: ignore

                    _client_fallback = MistralClient(api_key=MISTRAL_API_KEY)
                    messages_fallback = [_ChatMessage(role="user", content=full_prompt)]
                    response_fb = _client_fallback.chat(
                        model="mistral-large-latest",
                        messages=messages_fallback,
                        temperature=0.1,
                        max_tokens=1000,
                    )
                    answer = response_fb.choices[0].message.content.strip()
                except Exception as e2:
                    return (f"Erreur LLM local puis fallback API Mistral : {e} / {e2}", [], 0.0)
            else:
                return (f"Erreur lors de l'appel au LLM local et aucune API Mistral disponible : {e}", [], 0.0)
    else:
        # --------------------
        # Appel API Mistral
        # --------------------
        messages_for_api = []
        if conversation_history and ChatMessage is not None:
            for msg in conversation_history[-10:]:
                if msg.get("role") and msg.get("content"):
                    truncated_content = msg["content"][:400]
                    messages_for_api.append(ChatMessage(role=msg["role"], content=truncated_content))

        if ChatMessage is not None:
            messages_for_api.append(ChatMessage(role="user", content=full_prompt))

        if not client:
            return ("Service Mistral non disponible. Configurez MISTRAL_API_KEY ou un LLM local.", [], 0.0)

        response = client.chat(
            model="mistral-large-latest",
            messages=messages_for_api,
            temperature=0.1,
            max_tokens=1000,
        )

        answer = response.choices[0].message.content.strip()

    # Supprimer la logique d'ajout du disclaimer. Francis gère les citations.
    final_answer = answer
    
    # Score de confiance basé sur la qualité des sources officielles
    confidence_score = min(1.0, len(official_sources) / 2.0) if official_sources else 0.1
    
    return final_answer, list(set(official_sources)), confidence_score

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
        
        # ----------------------
        # Détection du sujet
        # ----------------------
        TOPIC_MAP = [
            {
                "match": ['tmi', 'tranche', 'marginal', 'imposition', 'barème', 'impôt sur le revenu', 'ir', 'impôt', 'impots', 'payer', 'quotient', 'part'],
                "enhanced": "article 197 CGI impôt sur le revenu barème progressif tranches marginales taux imposition",
                "keywords": ['197', 'barème', 'tranche', 'taux', 'impôt', 'revenu', 'quotient', 'part']
            },
            {
                "match": ['tva', 'taxe valeur ajoutée', 'taux tva'],
                "enhanced": "article 278 279 CGI TVA taux normal réduit super-réduit taxe valeur ajoutée",
                "keywords": ['278', '279', 'tva', 'taux', 'taxe']
            },
            {
                "match": ['réduction', 'crédit', 'déduction', 'avantage fiscal', 'credit d\'impôt', 'crédit d\'impot'],
                "enhanced": "article 199 200 CGI réduction crédit impôt déduction fiscale avantage",
                "keywords": ['199', '200', 'réduction', 'crédit', 'déduction']
            },
            {
                "match": ['plus-value', 'plus value', 'cession', 'vente', 'pv', 'plusvalues'],
                "enhanced": "article 150 CGI plus-value cession vente immobilier actions",
                "keywords": ['150', 'plus-value', 'cession', 'vente']
            },
            {
                "match": ['sci', 'société civile', 'immobilier', 'sci familiale'],
                "enhanced": "CGI société civile immobilière SCI régime fiscal imposition",
                "keywords": ['sci', 'société', 'civile', 'immobilière']
            },
            {
                "match": ['is', 'impôt sur les sociétés', 'impot sur les societes', 'bénéfice imposable', 'resultat fiscal'],
                "enhanced": "article 209 CGI impôt sur les sociétés base imposable taux",
                "keywords": ['209', 'impôt', 'sociétés', 'is', 'taux']
            },
            {
                "match": ['ifi', 'fortune', 'immobilière', 'impôt sur la fortune immobilière'],
                "enhanced": "article 964 CGI impôt sur la fortune immobilière assiette exonérations",
                "keywords": ['964', 'ifi', 'fortune', 'immobilière']
            },
            {
                "match": ['cvae', 'cfe', 'cotisation foncière', 'cotisation sur la valeur ajoutée'],
                "enhanced": "article 1586 CGI cfe cvae cotisation locale valeur ajoutée entreprises",
                "keywords": ['1586', 'cfe', 'cvae', 'cotisation']
            }
        ]

        enhanced_query = None
        keywords = []
        for topic in TOPIC_MAP:
            if any(term in query_lower for term in topic["match"]):
                enhanced_query = topic["enhanced"]
                keywords = topic["keywords"]
                break

        # Fallback générique
        if enhanced_query is None:
            # Utiliser directement la requête de l'utilisateur (sans préfixe générique)
            enhanced_query = query  # Pas de préfixe "CGI ..." pour éviter un bruit inutile
            keywords = [word for word in query_lower.split() if len(word) > 3]
        
        # print(f"🔍 Requête de recherche améliorée : {enhanced_query}") # Supprimé car trop verbeux
        
        # Recherche avec plus de résultats pour filtrage
        similar_articles_raw = search_similar_articles(enhanced_query, _embeddings_cache, top_k=max_results * 4)
        
        # Gérer le nouveau format éventuel (tuples) et préserver la similarité
        similar_articles = []
        for art in similar_articles_raw:
            if isinstance(art, tuple) and len(art) >= 2:
                article_data, sim_score = art[0], art[1]
                # Conserver la similarité pour le scoring
                article_data['similarity'] = sim_score
                similar_articles.append(article_data)
            else:
                similar_articles.append(art)
        
        # Scoring et filtrage avancé des résultats AVEC validation des sources
        scored_articles = []
        for article_data in similar_articles[:max_results]:
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
            
            # print(f"📄 Article trouvé : {article_data.get('article_number', 'N/A')} avec score {article_data.get('final_score', 0)}") # Supprimé car trop verbeux
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

# NOUVELLE FONCTION STREAMING
async def get_fiscal_response_stream(query: str, conversation_history: List[Dict] = None, user_profile_context: Optional[Dict[str, typing.Any]] = None, jurisdiction: Literal["FR", "AD", "CH", "LU"] = "FR") -> AsyncGenerator[str, None]:
    """Génère une réponse fiscale en streaming (actuellement, une seule réponse complète)."""
    try:
        answer, sources, confidence = get_fiscal_response(query, conversation_history, user_profile_context, jurisdiction)
        
        response_data = {
            "type": "full_response",
            "answer": answer,
            "sources": sources,
            "confidence": confidence,
            "status": "success"
        }
        yield json.dumps(response_data) + "\n"
        
    except Exception as e:
        error_message = f"Erreur lors du traitement de la question en streaming: {str(e)}"
        print(error_message)
        error_response = {
            "type": "error",
            "message": error_message,
            "status": "error"
        }
        yield json.dumps(error_response) + "\n"

def main():
    """Test principal pour développement local."""
    query = "Quelle est ma TMI si je gagne 50000€ ?"
    answer, sources, confidence = get_fiscal_response(query)
    print(f"Réponse: {answer}")
    print(f"Sources: {sources}")
    print(f"Confiance: {confidence}")

if __name__ == "__main__":
    main()

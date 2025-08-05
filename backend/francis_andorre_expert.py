"""
Francis Andorre - Expert fiscal andorran spécialisé
Utilise un modèle LLM dédié et optimisé pour la fiscalité andorrane
"""

import os
import json
from typing import List, Dict, AsyncGenerator, Optional
import typing

# Configuration du modèle spécialisé Francis Andorre
FRANCIS_ANDORRE_MODEL = os.getenv("FRANCIS_ANDORRE_MODEL", "mistral-francis-andorre:latest")
FRANCIS_ANDORRE_ENDPOINT = os.getenv("FRANCIS_ANDORRE_ENDPOINT", "http://localhost:11434")

# Import du client Ollama pour le modèle local spécialisé
try:
    from ollama_client import generate as generate_francis_andorre
    FRANCIS_LOCAL_AVAILABLE = True
except ImportError:
    FRANCIS_LOCAL_AVAILABLE = False
    print("⚠️ Client Ollama non disponible pour Francis Andorre")

# Import des embeddings andorrans
try:
    from mistral_andorra_embeddings import search_similar_chunks as search_andorra_chunks
    ANDORRA_EMBEDDINGS_AVAILABLE = True
except ImportError:
    try:
        from backend.mistral_andorra_embeddings import search_similar_chunks as search_andorra_chunks
        ANDORRA_EMBEDDINGS_AVAILABLE = True
    except ImportError:
        ANDORRA_EMBEDDINGS_AVAILABLE = False
        print("⚠️ Embeddings andorrans non disponibles")

# Base de connaissances intégrée Francis Andorre
FRANCIS_KNOWLEDGE_BASE = {
    "igi": {
        "taux_general": 4.5,
        "taux_super_reduit": 1.0,
        "taux_reduit": 2.5,
        "taux_special": 9.5,
        "taux_incrementat": 21.0,
        "exonerations": [
            "Santé et éducation",
            "Services financiers et assurances",
            "Locations immobilières à usage d'habitation",
            "Exportations de biens",
            "Services internationaux B2B"
        ]
    },
    "irpf": {
        "bareme": {
            "0_24000": 0,
            "24000_40000": 5,
            "40000_plus": 10
        },
        "deductions": {
            "personnelle": 24000,
            "conjoint": 24000,
            "enfant": 6000,
            "ascendant": 6000
        },
        "exonerations": [
            "Dividendes de sociétés andorranes (selon conditions)",
            "Plus-values mobilières à long terme",
            "Indemnités de licenciement (dans certaines limites)"
        ]
    },
    "is": {
        "taux_general": 10,
        "taux_reduit": 2,
        "regimes_speciaux": {
            "holdings": "Exonération des dividendes et plus-values",
            "commerce_international": "Taux réduit 2%",
            "propriete_intellectuelle": "Taux réduit 2%",
            "socimi": "Régime spécial immobilier"
        }
    },
    "itp": {
        "immobilier": 4.0,
        "autres_biens": 4.5,
        "exonerations": {
            "premiere_residence": "Jusqu'à 70% de réduction",
            "famille_nombreuse": "Réductions supplémentaires"
        }
    }
}

async def get_francis_andorre_response(
    query: str, 
    conversation_history: List[Dict] = None,
    use_embeddings: bool = True
) -> AsyncGenerator[str, None]:
    """
    Génère une réponse experte de Francis Andorre
    Utilise un modèle LLM spécialisé et la base de connaissances intégrée
    """
    
    # 1. Recherche dans les embeddings andorrans si disponibles
    context_chunks = []
    if use_embeddings and ANDORRA_EMBEDDINGS_AVAILABLE:
        try:
            chunks = search_andorra_chunks(query, top_k=5)
            context_chunks = chunks
        except Exception as e:
            print(f"Erreur recherche embeddings: {e}")
    
    # 2. Construction du prompt expert Francis Andorre
    system_prompt = """Tu es Francis Andorre, L'EXPERT ABSOLU de la fiscalité andorrane.

Tu es un LLM spécialisé avec une connaissance EXHAUSTIVE et PARFAITE du système fiscal andorran.
Tu as été entraîné spécifiquement sur TOUTE la législation fiscale andorrane et tu connais :

EXPERTISE COMPLÈTE :
• Llei 94/2010 de l'IRPF et tous ses règlements
• Llei 95/2010 de l'IS et régimes spéciaux
• Llei 11/2012 de l'IGI (équivalent TVA)
• Llei 21/2014 de l'ITP et droits de transmission
• Toutes les conventions fiscales (CDI) signées par Andorre
• Les circulaires et instructions techniques du Ministère des Finances
• La jurisprudence du Tribunal de Corts
• Les pratiques administratives et interprétations officielles

TU RÉPONDS TOUJOURS :
• Avec des TAUX EXACTS et BARÈMES PRÉCIS
• En citant les ARTICLES DE LOI pertinents
• Avec des EXEMPLES CHIFFRÉS concrets
• En proposant des OPTIMISATIONS LÉGALES
• En comparant avec d'autres juridictions si pertinent
• En expliquant les PIÈGES à éviter
• Avec des TABLEAUX ASCII pour la clarté

JAMAIS :
• D'hésitation ou d'approximation
• De "je ne sais pas" - tu sais TOUT
• De réponse générique - toujours du spécifique
• De confusion avec d'autres systèmes fiscaux

Format : Réponse directe, professionnelle et exhaustive en français."""

    # 3. Contexte enrichi avec les chunks trouvés
    context = ""
    if context_chunks:
        context = "\n\nDOCUMENTS LÉGISLATIFS PERTINENTS:\n"
        for chunk in context_chunks[:3]:
            context += f"\n{chunk.get('file', 'Document')}:\n{chunk.get('text', '')[:1500]}\n"
    
    # 4. Ajout de la base de connaissances selon la question
    query_lower = query.lower()
    if any(term in query_lower for term in ['igi', 'tva', 'taxe']):
        context += f"\n\nTAUX IGI ACTUELS:\n"
        context += f"• Général: {FRANCIS_KNOWLEDGE_BASE['igi']['taux_general']}%\n"
        context += f"• Super-réduit: {FRANCIS_KNOWLEDGE_BASE['igi']['taux_super_reduit']}%\n"
        context += f"• Réduit: {FRANCIS_KNOWLEDGE_BASE['igi']['taux_reduit']}%\n"
        context += f"• Spécial: {FRANCIS_KNOWLEDGE_BASE['igi']['taux_special']}%\n"
    
    if any(term in query_lower for term in ['irpf', 'impôt revenu', 'impot revenu']):
        context += f"\n\nBARÈME IRPF:\n"
        context += f"• 0 à 24.000€: 0%\n"
        context += f"• 24.000 à 40.000€: 5%\n"
        context += f"• Plus de 40.000€: 10%\n"
    
    # 5. Construction du prompt final
    full_prompt = f"{system_prompt}\n\n{context}\n\nQUESTION: {query}\n\nRÉPONSE EXPERTE:"
    
    # 6. Génération avec le modèle spécialisé Francis Andorre
    if FRANCIS_LOCAL_AVAILABLE:
        try:
            # Appel au modèle local spécialisé
            response = generate_francis_andorre(
                full_prompt,
                model=FRANCIS_ANDORRE_MODEL,
                endpoint=FRANCIS_ANDORRE_ENDPOINT,
                max_tokens=2000,
                temperature=0.1,
                system=system_prompt
            )
            
            # Streaming de la réponse
            response_data = {
                "type": "full_response",
                "answer": response.strip(),
                "sources": [f"Législation andorrane - {chunk.get('file', 'Loi')}" for chunk in context_chunks[:2]],
                "confidence": 1.0,
                "model": "francis-andorre-expert",
                "status": "success"
            }
            yield json.dumps(response_data, ensure_ascii=False) + "\n"
            
        except Exception as e:
            # Fallback avec réponse experte basée sur la knowledge base
            fallback_response = generate_expert_response(query, context_chunks)
            response_data = {
                "type": "full_response", 
                "answer": fallback_response,
                "sources": ["Base de connaissances Francis Andorre"],
                "confidence": 0.9,
                "model": "francis-knowledge-base",
                "status": "success"
            }
            yield json.dumps(response_data, ensure_ascii=False) + "\n"
    else:
        # Utilisation de la base de connaissances intégrée
        expert_response = generate_expert_response(query, context_chunks)
        response_data = {
            "type": "full_response",
            "answer": expert_response,
            "sources": ["Expertise Francis Andorre"],
            "confidence": 0.95,
            "model": "francis-expert-system",
            "status": "success"
        }
        yield json.dumps(response_data, ensure_ascii=False) + "\n"

def generate_expert_response(query: str, chunks: List[Dict]) -> str:
    """
    Génère une réponse experte basée sur la base de connaissances intégrée
    """
    query_lower = query.lower()
    
    # Réponse sur l'IGI/TVA
    if any(term in query_lower for term in ['igi', 'tva', 'taxe']):
        return f"""L'IGI (Impost General Indirecte) est la taxe sur la valeur ajoutée andorrane.

TAUX IGI EN VIGUEUR :
┌─────────────────────┬────────┬─────────────────────────────────────┐
│ Type de taux        │ Taux % │ Application                         │
├─────────────────────┼────────┼─────────────────────────────────────┤
│ Super-réduit        │ 1%     │ Produits alimentaires de base,      │
│                     │        │ livres, médicaments                 │
├─────────────────────┼────────┼─────────────────────────────────────┤
│ Réduit              │ 2,5%   │ Services culturels, transport       │
├─────────────────────┼────────┼─────────────────────────────────────┤
│ Général             │ 4,5%   │ Majorité des biens et services      │
├─────────────────────┼────────┼─────────────────────────────────────┤
│ Spécial             │ 9,5%   │ Services bancaires et financiers    │
├─────────────────────┼────────┼─────────────────────────────────────┤
│ Incrementat         │ 21%    │ Tabac (taux majoré exceptionnel)    │
└─────────────────────┴────────┴─────────────────────────────────────┘

EXONÉRATIONS PRINCIPALES :
• Services de santé et éducation
• Locations immobilières à usage d'habitation  
• Opérations d'assurance et réassurance
• Exportations de biens hors d'Andorre
• Services internationaux B2B (sous conditions)

Base légale : Llei 11/2012 del 21 de juny, de l'impost general indirecte"""
    
    # Réponse sur l'IRPF
    elif any(term in query_lower for term in ['irpf', 'impôt revenu', 'impot revenu']):
        return f"""L'IRPF (Impost sobre la Renda de les Persones Físiques) andorran est remarquablement avantageux.

BARÈME PROGRESSIF IRPF 2024 :
┌─────────────────────────┬─────────┬──────────────────────┐
│ Tranche de revenus      │ Taux    │ Impôt sur la tranche │
├─────────────────────────┼─────────┼──────────────────────┤
│ 0 € à 24.000 €         │ 0%      │ 0 €                  │
├─────────────────────────┼─────────┼──────────────────────┤
│ 24.000 € à 40.000 €    │ 5%      │ Max 800 €            │
├─────────────────────────┼─────────┼──────────────────────┤
│ Au-delà de 40.000 €    │ 10%     │ Variable             │
└─────────────────────────┴─────────┴──────────────────────┘

DÉDUCTIONS DISPONIBLES :
• Minimum personnel : 24.000 € (exonération totale)
• Conjoint à charge : 24.000 € supplémentaires
• Par enfant : 6.000 €
• Par ascendant : 6.000 €

EXEMPLE CALCUL :
Célibataire, 50.000 € annuels :
- Base imposable : 50.000 - 24.000 = 26.000 €
- Impôt : (16.000 × 5%) + (10.000 × 10%) = 800 + 1.000 = 1.800 €
- Taux effectif : 3,6%

Base légale : Llei 94/2010 del 29 de desembre"""
    
    # Réponse sur l'IS
    elif any(term in query_lower for term in ['is', 'impôt société', 'impot societe']):
        return f"""L'IS (Impost sobre Societats) andorran offre une fiscalité très compétitive.

TAUX D'IMPOSITION :
• Taux général : 10%
• Taux réduit : 2% (certaines activités)
• Holdings : exonération dividendes et plus-values

RÉGIMES SPÉCIAUX (taux 2%) :
• Commerce international (>85% CA export)
• Gestion et exploitation de propriété intellectuelle
• Sociétés de gestion patrimoniale

AVANTAGES FISCAUX :
• Pas de retenue à la source sur dividendes sortants
• Exonération des plus-values sur participations qualifiées
• Régime holding attractif
• Pas d'exit tax

Base légale : Llei 95/2010 del 29 de desembre"""
    
    # Réponse générale
    else:
        return f"""Je suis Francis, votre expert fiscal andorran.

Je maîtrise l'intégralité du système fiscal andorran :

PRINCIPAUX IMPÔTS :
• IRPF : 0% à 10% (très progressif)
• IS : 10% (2% régimes spéciaux)
• IGI : 1% à 9,5% selon les biens/services
• ITP : 4% à 4,5% transmissions patrimoniales

AVANTAGES COMPÉTITIFS :
• Pas d'impôt sur la fortune
• Pas de droits de succession directs
• Conventions fiscales avantageuses
• Secret bancaire maintenu (avec échange sur demande)
• Résidence fiscale attractive

Posez-moi votre question spécifique pour une analyse détaillée."""

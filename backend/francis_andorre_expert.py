"""
Francis Andorre Expert - Système LLM spécialisé fiscalité andorrane
"""
import os
import json
from typing import List, Dict, AsyncGenerator, Optional
import httpx
from datetime import datetime

# Base de connaissances fiscales andorranes exhaustive
ANDORRA_TAX_KNOWLEDGE = {
    "IGI": {
        "description": "Impost General Indirecte (TVA andorrane)",
        "taux": {
            "super_reduit": {"taux": "0%", "application": "Produits de première nécessité, santé, éducation"},
            "special": {"taux": "1%", "application": "Alimentation, boissons non alcoolisées, livres"},
            "reduit": {"taux": "2.5%", "application": "Transport de personnes, culture, sport"},
            "intermediaire": {"taux": "4.5%", "application": "Services généraux, restauration, hôtellerie"},
            "normal": {"taux": "9.5%", "application": "Prestations de services bancaires et financiers"},
            "incrementat": {"taux": "21%", "application": "Tabac, alcool (sauf vin/bière), parfums"}
        },
        "exonerations": [
            "Services médicaux et hospitaliers",
            "Services éducatifs",
            "Services sociaux",
            "Opérations d'assurance et réassurance",
            "Location d'immeubles à usage d'habitation",
            "Exportations de biens et services"
        ],
        "obligations": {
            "declaration": "Mensuelle ou trimestrielle selon CA",
            "seuil_assujettissement": "40.000€ de CA annuel",
            "delai_paiement": "Avant le 20 du mois suivant"
        },
        "base_legale": "Llei 11/2012 del 21 de juny, de l'impost general indirecte"
    },
    
    "IRPF": {
        "description": "Impost sobre la Renda de les Persones Físiques",
        "bareme_2024": [
            {"tranche": "0 à 24.000€", "taux": "0%"},
            {"tranche": "24.001€ à 40.000€", "taux": "5%"},
            {"tranche": "Plus de 40.000€", "taux": "10%"}
        ],
        "deductions": {
            "personnelle": "24.000€ (minimum non imposable)",
            "conjoint": "12.000€",
            "enfants": "6.000€ par enfant",
            "ascendants": "6.000€ par ascendant à charge",
            "handicap": "75% des dépenses, max 8.000€",
            "logement": "Intérêts hypothécaires jusqu'à 15.000€/an"
        },
        "revenus_exoneres": [
            "Indemnités de licenciement dans la limite légale",
            "Prestations de sécurité sociale",
            "Bourses d'études publiques",
            "Prix littéraires, artistiques ou scientifiques"
        ],
        "retenues_source": {
            "salaries": "Barème progressif mensuel",
            "independants": "15% (acomptes trimestriels)",
            "capital_mobilier": "10%",
            "plus_values": "10%"
        },
        "base_legale": "Llei 94/2010 del 29 de desembre, de l'impost sobre la renda de les persones físiques"
    },
    
    "IS": {
        "description": "Impost de Societats",
        "taux": {
            "general": "10%",
            "reduit_nouvelles_entreprises": "5% (3 premières années)",
            "commerce_international": "2% (conditions spécifiques)",
            "holdings": "0% sur dividendes et plus-values (conditions)",
            "socimi": "0% (sociétés immobilières cotées)"
        },
        "deductions": {
            "R&D": "20% des dépenses",
            "creation_emploi": "1.500€ par emploi créé",
            "investissements": "5% à 10% selon nature",
            "formation": "15% des dépenses"
        },
        "regime_holding": {
            "conditions": [
                "Participation minimum 5% ou valeur acquisition > 1M€",
                "Détention minimum 1 an",
                "Filiale soumise à IS équivalent",
                "Activité économique réelle"
            ],
            "avantages": [
                "Exonération dividendes reçus",
                "Exonération plus-values de cession",
                "Pas de retenue à la source sur dividendes distribués"
            ]
        },
        "base_legale": "Llei 95/2010 del 29 de desembre, de l'impost de societats"
    },
    
    "ITP": {
        "description": "Impost sobre Transmissions Patrimonials",
        "taux": {
            "immobilier": "4%",
            "premiere_residence": {
                "general": "3.5%",
                "jeunes_moins_35": "3%",
                "familles_nombreuses": "3%",
                "handicapes": "1%"
            },
            "meubles": "4%",
            "vehicules": "4%",
            "droits_reels": "1%"
        },
        "exemptions": [
            "Transmissions entre époux",
            "Transmissions aux descendants directs (réduction 100%)",
            "Transmissions aux ascendants directs (réduction 100%)",
            "Transmissions d'entreprises familiales (conditions)"
        ],
        "base_calcul": "Valeur réelle du bien ou prix déclaré (le plus élevé)",
        "delai_declaration": "1 mois depuis la transmission",
        "base_legale": "Llei 21/2014 del 16 d'octubre, de bases de l'ordenament tributari"
    },
    
    "RESIDENCE_FISCALE": {
        "types": {
            "active": {
                "description": "Résidence active avec activité économique",
                "conditions": [
                    "Résider min. 90 jours/an en Andorre",
                    "Exercer une activité économique",
                    "Être administrateur société andorrane avec 10% capital",
                    "Ou être salarié en Andorre"
                ],
                "depot_garantie": "15.000€ AFA + 10.000€/personne à charge"
            },
            "passive": {
                "description": "Résidence passive sans activité lucrative",
                "conditions": [
                    "Résider min. 90 jours/an en Andorre",
                    "Investir min. 600.000€ (immobilier, société, AFA)",
                    "Ne pas exercer d'activité lucrative"
                ],
                "depot_garantie": "47.500€ AFA + 9.500€/personne à charge"
            }
        },
        "avantages_fiscaux": [
            "IRPF max 10%",
            "Pas d'impôt sur la fortune",
            "Pas d'impôt sur les successions",
            "Pas d'impôt sur les donations",
            "Conventions fiscales favorables"
        ]
    },
    
    "CONVENTIONS_FISCALES": {
        "pays": [
            "Espagne", "France", "Portugal", "Luxembourg",
            "Liechtenstein", "Malte", "Émirats Arabes Unis",
            "Saint-Marin", "Chypre"
        ],
        "principes": {
            "residence": "Critère principal d'imposition",
            "etablissement_stable": "Imposition dans pays d'activité",
            "dividendes": "0-5-10% selon participation",
            "interets": "0-5% maximum",
            "royalties": "0-5% maximum"
        }
    }
}


def extract_keywords(query: str) -> List[str]:
    """Extrait les mots-clés pertinents d'une question"""
    keywords = []
    query_lower = query.lower()
    
    # Mots-clés fiscaux importants
    tax_keywords = {
        "igi", "tva", "impost general", "taxe",
        "irpf", "impôt revenu", "salaire", "renda",
        "is", "societat", "société", "empresa",
        "itp", "transmission", "immobilier", "patrimonial",
        "résidence", "residència", "fiscal",
        "holding", "dividende", "convention", "cdi"
    }
    
    for keyword in tax_keywords:
        if keyword in query_lower:
            keywords.append(keyword)
    
    # Détection des montants et pourcentages
    import re
    amounts = re.findall(r'\d+\.?\d*\s*(?:€|euros?|%)', query_lower)
    keywords.extend(amounts)
    
    return keywords


def search_knowledge_base(keywords: List[str]) -> Dict:
    """Recherche dans la base de connaissances fiscales"""
    results = {}
    
    for keyword in keywords:
        keyword_lower = keyword.lower()
        
        # Recherche IGI/TVA
        if any(term in keyword_lower for term in ["igi", "tva", "impost general"]):
            results["IGI"] = ANDORRA_TAX_KNOWLEDGE["IGI"]
        
        # Recherche IRPF
        if any(term in keyword_lower for term in ["irpf", "revenu", "salaire", "renda"]):
            results["IRPF"] = ANDORRA_TAX_KNOWLEDGE["IRPF"]
        
        # Recherche IS
        if any(term in keyword_lower for term in ["is", "societat", "société", "empresa"]):
            results["IS"] = ANDORRA_TAX_KNOWLEDGE["IS"]
        
        # Recherche ITP
        if any(term in keyword_lower for term in ["itp", "transmission", "immobilier"]):
            results["ITP"] = ANDORRA_TAX_KNOWLEDGE["ITP"]
        
        # Recherche résidence
        if any(term in keyword_lower for term in ["résidence", "residència"]):
            results["RESIDENCE"] = ANDORRA_TAX_KNOWLEDGE["RESIDENCE_FISCALE"]
        
        # Recherche holding
        if "holding" in keyword_lower:
            results["HOLDING"] = ANDORRA_TAX_KNOWLEDGE["IS"]["regime_holding"]
        
        # Recherche conventions
        if any(term in keyword_lower for term in ["convention", "cdi"]):
            results["CONVENTIONS"] = ANDORRA_TAX_KNOWLEDGE["CONVENTIONS_FISCALES"]
    
    return results


def format_knowledge_response(knowledge: Dict) -> str:
    """Formate les connaissances extraites pour le contexte LLM"""
    context_parts = []
    
    for category, data in knowledge.items():
        if isinstance(data, dict):
            context_parts.append(f"\n{category}:")
            context_parts.append(json.dumps(data, ensure_ascii=False, indent=2))
    
    return "\n".join(context_parts)


async def generate_francis_andorre_response(
    question: str,
    conversation_history: List[Dict[str, str]],
    use_embeddings: bool = True
) -> AsyncGenerator[str, None]:
    """
    Génère une réponse spécialisée Francis Andorre avec un VRAI LLM
    """
    try:
        # 1. Extraire le contexte pertinent de la base de connaissances
        knowledge_context = ""
        keywords = extract_keywords(question.lower())
        relevant_knowledge = search_knowledge_base(keywords)
        
        if relevant_knowledge:
            knowledge_context = format_knowledge_response(relevant_knowledge)
            
        # 2. Construire le prompt pour le LLM
        system_prompt = f"""Tu es Francis Andorre, l'expert fiscal andorran le plus pointu et compétent.
        
Tu disposes de connaissances EXHAUSTIVES sur:
- IGI (TVA andorrane) : tous les taux (0%, 1%, 2.5%, 4.5%, 9.5%, 21%), exonérations, obligations
- IRPF : barème progressif (0% jusqu'à 24k€, 5% jusqu'à 40k€, 10% au-delà), déductions, cas pratiques
- IS : taux général 10%, régimes spéciaux (holdings, commerce international 2%, SOCIMI)
- ITP : 4% immobilier avec réductions première résidence
- Conventions fiscales avec 9 pays
- Résidence fiscale et ses types
- Optimisations légales et structuration

CONTEXTE SPÉCIFIQUE EXTRAIT:
{knowledge_context}

INSTRUCTIONS:
1. Réponds TOUJOURS avec des informations précises et chiffrées
2. Cite les articles de loi pertinents (ex: Art. 55 Llei 94/2010)
3. Donne des exemples de calculs détaillés quand pertinent
4. Structure ta réponse avec des tableaux et listes
5. Sois absolument certain de tes informations - tu es L'EXPERT
6. Utilise un ton professionnel mais accessible
7. Si tu fais un calcul, détaille chaque étape"""
        
        user_prompt = f"Question: {question}"
        
        # 3. Appeler le LLM (Mistral API par défaut)
        async for chunk in call_mistral_api(system_prompt, user_prompt):
            yield chunk
                
    except Exception as e:
        print(f"Erreur Francis Andorre Expert: {e}")
        yield "Je suis désolé, une erreur s'est produite. Veuillez reformuler votre question."


async def call_mistral_api(system_prompt: str, user_prompt: str) -> AsyncGenerator[str, None]:
    """Appel à l'API Mistral pour générer une réponse"""
    try:
        api_key = os.getenv("MISTRAL_API_KEY")
        if not api_key:
            # Si pas de clé Mistral, utiliser la base de connaissances seule
            yield "⚠️ Configuration LLM manquante. Voici les informations de la base de connaissances:\n\n"
            if "CONTEXTE SPÉCIFIQUE EXTRAIT:" in system_prompt:
                context = system_prompt.split("CONTEXTE SPÉCIFIQUE EXTRAIT:")[1].split("INSTRUCTIONS:")[0].strip()
                yield context
            return
            
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.mistral.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "mistral-large-latest",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "stream": True,
                    "temperature": 0.3,
                    "max_tokens": 2000
                },
                timeout=30.0
            )
            
            response.raise_for_status()
            
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    if line == "data: [DONE]":
                        break
                    try:
                        data = json.loads(line[6:])
                        if content := data.get("choices", [{}])[0].get("delta", {}).get("content"):
                            yield content
                    except:
                        pass
                        
    except httpx.HTTPStatusError as e:
        print(f"Erreur HTTP Mistral API: {e.response.status_code} - {e.response.text}")
        yield "Erreur de connexion au service LLM"
    except Exception as e:
        print(f"Erreur Mistral API: {e}")
        yield "Erreur de connexion au service LLM"


# Fonction d'exemple de calcul fiscal
def calculate_irpf_example(salaire_brut: float) -> str:
    """Exemple de calcul IRPF détaillé"""
    
    # Déduction personnelle
    deduction_personnelle = 24000
    
    # Base imposable
    base_imposable = max(0, salaire_brut - deduction_personnelle)
    
    # Calcul de l'impôt
    if base_imposable == 0:
        impot = 0
        taux_effectif = 0
    elif base_imposable <= 16000:  # De 24k à 40k
        impot = base_imposable * 0.05
        taux_effectif = (impot / salaire_brut) * 100
    else:  # Plus de 40k
        impot = 16000 * 0.05 + (base_imposable - 16000) * 0.10
        taux_effectif = (impot / salaire_brut) * 100
    
    return f"""
📊 CALCUL DÉTAILLÉ IRPF ANDORRE:

Salaire brut annuel: {salaire_brut:,.2f}€
Déduction personnelle: {deduction_personnelle:,.2f}€
Base imposable: {base_imposable:,.2f}€

Calcul de l'impôt:
- Tranche 0-24.000€: 0% = 0€
- Tranche 24.001-40.000€: 5% = {min(base_imposable, 16000) * 0.05:,.2f}€
- Tranche >40.000€: 10% = {max(0, (base_imposable - 16000) * 0.10):,.2f}€

TOTAL IMPÔT: {impot:,.2f}€
Taux effectif: {taux_effectif:.2f}%
Net après impôt: {salaire_brut - impot:,.2f}€
"""

import os
import json
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple
import requests
import time
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage

# Importer les nouveaux modules RAG
from mistral_embeddings import search_similar_bofip_chunks, get_embedding as get_embedding_from_mistral_script, cosine_similarity as cosine_similarity_from_mistral_script
from rag_cgi import get_cgi_response
from mistral_cgi_embeddings import load_embeddings, search_similar_articles

# Configuration
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# Pour les articles CGI (existants)
CGI_EMBEDDINGS_DIR = Path("data/embeddings") # Utiliser Path pour la cohérence
CGI_CHUNKS_DIR = Path("data/cgi_chunks")

# Pour les chunks BOFIP (nouveaux)
# Ces chemins sont déjà utilisés par search_similar_bofip_chunks, mais les redéfinir ici peut être utile pour la clarté
# ou si on voulait accéder aux fichiers directement depuis ce script à l'avenir.
BOFIP_CHUNKS_TEXT_DIR = Path("data/bofip_chunks_text")
BOFIP_EMBEDDINGS_DIR = Path("data/bofip_embeddings")


# Initialisation du client Mistral
client = MistralClient(api_key=MISTRAL_API_KEY) if MISTRAL_API_KEY else None

# Utiliser les fonctions get_embedding et cosine_similarity du script mistral_embeddings
# pour éviter la redéfinition et assurer la cohérence.
# Si get_embedding est spécifique à ce fichier (par exemple, gestion d'erreur différente), 
# il faudrait le clarifier ou le fusionner.
# Pour l'instant, supposons que celle de mistral_embeddings.py est la référence.
get_embedding = get_embedding_from_mistral_script
cosine_similarity = cosine_similarity_from_mistral_script


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
            print("Aucun embedding CGI trouvé.")
            return []
        
        similar_articles = search_similar_articles(query, embeddings, top_k)
        
        # Formater pour la compatibilité avec le reste du code
        results = []
        for article in similar_articles:
            results.append({
                'similarity': 0.9,  # Score factice, la recherche vectorielle a déjà fait le tri
                'content': article.get('text', ''),
                'source': f"CGI Article {article.get('article_number', 'N/A')}",
                'article_id': article.get('article_number', 'N/A')
            })
        
        return results
    except Exception as e:
        print(f"Erreur dans search_similar_cgi_articles: {e}")
        return []

def create_prompt(query: str, cgi_articles: List[Dict], bofip_chunks: List[Dict], conversation_history: List[Dict] = None) -> str:
    """Crée le prompt pour l'assistant fiscal avec contextes CGI et BOFIP et mémoire de conversation."""
    
    cgi_context_str = "N/A"
    if cgi_articles:
        cgi_context_str = "\n\n".join([
            f"Source: {article.get('source', 'CGI N/A')}\nContenu: {article['content']}"
            for article in cgi_articles
        ])

    bofip_context_str = "N/A"
    if bofip_chunks:
        bofip_context_str = "\n\n".join([
            f"Source: BOFIP (fichier: {chunk.get('file', 'N/A')}, similarité: {chunk.get('similarity', 0):.3f})\nContenu: {chunk['text']}"
            for chunk in bofip_chunks
        ])
    
    # Construire l'historique de conversation
    history_str = "N/A"
    if conversation_history and len(conversation_history) > 1:
        history_items = []
        for msg in conversation_history[-6:]:  # Garder les 6 derniers messages maximum
            role = "Utilisateur" if msg.get('role') == 'user' else "Francis"
            content = msg.get('content', '')[:200] + "..." if len(msg.get('content', '')) > 200 else msg.get('content', '')
            history_items.append(f"{role}: {content}")
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
- RÈGLE ABSOLUE : N'utilise JAMAIS d'astérisques (*), de formatage markdown, de gras, d'italique ou de caractères spéciaux de mise en forme dans tes réponses.
- Écris EXCLUSIVEMENT en texte simple, clair et lisible.
- Utilise uniquement des mots, des chiffres, des points, des virgules et des tirets simples pour structurer.
- INTERDIT : *, **, ___, `, #, etc.
- AUTORISÉ : texte simple avec numérotation (1., 2., 3.) et tirets (-) pour les listes.

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

Réponds directement à la question:"""
    
    return prompt

def get_fiscal_response(query: str, conversation_history: List[Dict] = None) -> Tuple[str, List[str], float]:
    """Obtient une réponse de l'assistant fiscal et les sources utilisées avec mémoire de conversation."""
    all_sources_for_api = []
    # Estimer une confiance globale simple. Peut être affiné plus tard.
    # Par exemple, basée sur la similarité moyenne des chunks retenus, ou si des chunks ont été trouvés.
    confidence_score = 0.5 

    try:
        if not client:
            return "Erreur: Client Mistral non configuré", [], 0.0
        
        similar_cgi_articles = search_similar_cgi_articles(query, top_k=2)
        similar_bofip_chunks = search_similar_bofip_chunks(query, top_k=2)

        if similar_cgi_articles:
            all_sources_for_api.extend([art.get('source', 'CGI inconnu') for art in similar_cgi_articles])
            confidence_score = max(confidence_score, 0.7) # Augmenter la confiance si CGI trouvé
        if similar_bofip_chunks:
            all_sources_for_api.extend([f"BOFIP: {chunk.get('file', 'Chunk inconnu')}" for chunk in similar_bofip_chunks])
            confidence_score = max(confidence_score, 0.75) # Augmenter un peu plus si BOFIP trouvé

        if not similar_cgi_articles and not similar_bofip_chunks:
            print("Aucun article CGI ni chunk BOFIP pertinent trouvé.")
            # Pourrait retourner une réponse indiquant l'absence d'info, ou laisser Mistral le dire.
            # Si on veut que Mistral le dise, on envoie un prompt sans contexte spécifique.
            # prompt = f"Tu es un assistant fiscal expert. Réponds à la question suivante au mieux de tes connaissances générales: {query}" 
            # Pour l'instant, on s'en tient au prompt strict et on s'attend à ce que Mistral dise qu'il ne sait pas.
            confidence_score = 0.2

        prompt = create_prompt(query, similar_cgi_articles, similar_bofip_chunks, conversation_history)
        
        messages = [ChatMessage(role="user", content=prompt)]
        
        chat_response = client.chat(
            model="mistral-large-latest",
            messages=messages,
            temperature=0.5,
            max_tokens=1500
        )
        
        answer = chat_response.choices[0].message.content

        # Si Mistral dit qu'il ne peut pas répondre, on peut baisser la confiance.
        if "ne me permettent pas de répondre" in answer or "pas d'informations suffisantes" in answer:
            confidence_score = min(confidence_score, 0.4) # Baisser la confiance si l'IA elle-même est incertaine
        elif similar_cgi_articles or similar_bofip_chunks: # Si on a fourni du contexte et que l'IA n'a pas dit "je ne sais pas"
            confidence_score = 0.85 # Bonne confiance si contexte utilisé

        return answer, list(set(all_sources_for_api)), confidence_score
    
    except Exception as e:
        print(f"Erreur dans get_fiscal_response: {e}")
        return "Je rencontre des difficultés pour traiter votre demande. Veuillez réessayer plus tard.", [], 0.1

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
        print("Erreur : La clé API Mistral n'est pas définie (MISTRAL_API_KEY).")
        exit(1)
    if not client:
        print("Erreur : Le client Mistral n'a pas pu être initialisé. Vérifiez la clé API.")
        exit(1)
    main() 
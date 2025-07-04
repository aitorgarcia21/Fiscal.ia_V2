#!/usr/bin/env python3
"""
Système RAG (Retrieval-Augmented Generation) pour Francis Suisse
Assistant fiscal spécialisé en fiscalité suisse
"""

import os
import logging
import numpy as np
from typing import List, Dict, Any, Tuple
from pathlib import Path
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SwissRAGSystem:
    """Système RAG spécialisé pour la fiscalité suisse"""
    
    def __init__(self):
        """Initialise le système RAG suisse"""
        self.client = MistralClient(api_key=os.getenv("MISTRAL_API_KEY"))
        self.embedding_model = "mistral-embed"
        self.chat_model = "mistral-large-latest"
        
        # Cache pour les chunks et embeddings
        self.chunks_cache = {}
        self.embeddings_cache = {}
        
        # Charger la base de connaissances
        self.load_swiss_knowledge_base()
    
    def load_swiss_knowledge_base(self):
        """Charge la base de connaissances fiscale suisse"""
        try:
            chunks_dir = Path("data/swiss_chunks_text")
            embeddings_dir = Path("data/swiss_embeddings")
            
            if not chunks_dir.exists():
                logger.warning("Répertoire des chunks suisses non trouvé")
                return
            
            # Charger les chunks de texte
            chunk_files = sorted(chunks_dir.glob("swiss_chunk_*.txt"))
            for chunk_file in chunk_files:
                chunk_id = chunk_file.stem
                with open(chunk_file, 'r', encoding='utf-8') as f:
                    self.chunks_cache[chunk_id] = f.read()
            
            # Charger les embeddings
            if embeddings_dir.exists():
                embedding_files = sorted(embeddings_dir.glob("swiss_chunk_*.npy"))
                for embedding_file in embedding_files:
                    chunk_id = embedding_file.stem
                    self.embeddings_cache[chunk_id] = np.load(embedding_file)
            
            logger.info(f"Base de connaissances suisse chargée: {len(self.chunks_cache)} chunks, {len(self.embeddings_cache)} embeddings")
            
        except Exception as e:
            logger.error(f"Erreur lors du chargement de la base de connaissances: {e}")
    
    def generate_query_embedding(self, query: str) -> np.ndarray:
        """Génère l'embedding d'une requête"""
        try:
            response = self.client.embeddings(
                model=self.embedding_model,
                input=query
            )
            return np.array(response.data[0].embedding)
        except Exception as e:
            logger.error(f"Erreur lors de la génération d'embedding: {e}")
            return np.zeros(1024)  # Embedding par défaut
    
    def calculate_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calcule la similarité cosinus entre deux embeddings"""
        try:
            # Normaliser les embeddings
            norm1 = np.linalg.norm(embedding1)
            norm2 = np.linalg.norm(embedding2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            # Calculer la similarité cosinus
            similarity = np.dot(embedding1, embedding2) / (norm1 * norm2)
            return float(similarity)
            
        except Exception as e:
            logger.error(f"Erreur lors du calcul de similarité: {e}")
            return 0.0
    
    def search_relevant_chunks(self, query: str, top_k: int = 5) -> List[Tuple[str, float]]:
        """Recherche les chunks les plus pertinents pour une requête"""
        try:
            # Générer l'embedding de la requête
            query_embedding = self.generate_query_embedding(query)
            
            # Calculer les similarités avec tous les chunks
            similarities = []
            for chunk_id, chunk_embedding in self.embeddings_cache.items():
                similarity = self.calculate_similarity(query_embedding, chunk_embedding)
                similarities.append((chunk_id, similarity))
            
            # Trier par similarité décroissante
            similarities.sort(key=lambda x: x[1], reverse=True)
            
            # Retourner les top_k résultats
            return similarities[:top_k]
            
        except Exception as e:
            logger.error(f"Erreur lors de la recherche de chunks: {e}")
            return []
    
    def get_context_from_chunks(self, chunk_similarities: List[Tuple[str, float]], 
                               min_similarity: float = 0.3) -> str:
        """Récupère le contexte textuel à partir des chunks similaires"""
        context_parts = []
        
        for chunk_id, similarity in chunk_similarities:
            if similarity >= min_similarity and chunk_id in self.chunks_cache:
                chunk_text = self.chunks_cache[chunk_id]
                context_parts.append(f"[Similarité: {similarity:.3f}]\n{chunk_text}")
        
        return "\n\n---\n\n".join(context_parts)
    
    def generate_swiss_fiscal_response(self, query: str, context: str) -> str:
        """Génère une réponse fiscale suisse basée sur le contexte"""
        try:
            # Prompt spécialisé pour la fiscalité suisse
            system_prompt = """Tu es Francis, un assistant fiscal expert en fiscalité suisse. 
Tu as accès à une base de connaissances complète sur le système fiscal suisse.

INSTRUCTIONS STRICTES :
1. Réponds TOUJOURS de manière complète et détaillée
2. Cite les montants, taux et seuils EXACTS de 2025
3. Structure ta réponse avec des points numérotés
4. Inclus des calculs précis quand c'est pertinent
5. Mentionne les différences cantonales importantes
6. Propose des optimisations fiscales concrètes
7. Termine par une conclusion pratique

CARACTÉRISTIQUES DU SYSTÈME FISCAL SUISSE :
- Système fédéraliste à 3 niveaux (fédéral, cantonal, communal)
- Pilier 3A : CHF 7'056 (salarié LPP) / CHF 35'280 (indépendant) en 2025
- Différences cantonales importantes (jusqu'à 20% de charge fiscale)
- Cotisations sociales : AVS/AI (5.30%), LPP (8.25% moyen)
- Impôt à la source pour étrangers sans permis C
- Traités internationaux avec pays voisins et principaux partenaires
- Situations complexes : résidents non domiciliés, sociétés holding, frontaliers

FORMAT DE RÉPONSE :
1. Introduction claire
2. Points détaillés avec chiffres précis
3. Calculs si applicable
4. Comparaisons cantonales si pertinent
5. Optimisations fiscales concrètes
6. Conclusion pratique

NE JAMAIS TRONQUER TA RÉPONSE. Donne toujours une réponse complète.
"""

            user_prompt = f"""Question fiscale suisse: {query}

Contexte de la base de connaissances:
{context}

Réponds de manière précise et professionnelle en te basant sur ce contexte."""

            # Appel à l'API Mistral
            response = self.client.chat(
                model=self.chat_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,
                max_tokens=2000,
                top_p=0.9
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération de réponse: {e}")
            return "Désolé, je ne peux pas répondre à cette question pour le moment."
    
    def answer_swiss_fiscal_question(self, query: str, top_k: int = 5) -> Dict[str, Any]:
        """Répond à une question fiscale suisse complète"""
        try:
            # Rechercher les chunks pertinents
            chunk_similarities = self.search_relevant_chunks(query, top_k)
            
            if not chunk_similarities:
                return {
                    "answer": "Désolé, je n'ai pas trouvé d'informations pertinentes pour votre question.",
                    "sources": [],
                    "confidence": 0.0
                }
            
            # Récupérer le contexte
            context = self.get_context_from_chunks(chunk_similarities)
            
            # Générer la réponse
            answer = self.generate_swiss_fiscal_response(query, context)
            
            # Préparer les sources
            sources = []
            for chunk_id, similarity in chunk_similarities[:3]:  # Top 3 sources
                if similarity >= 0.3:
                    sources.append({
                        "chunk_id": chunk_id,
                        "similarity": similarity,
                        "preview": self.chunks_cache.get(chunk_id, "")[:200] + "..."
                    })
            
            # Calculer la confiance moyenne
            confidence = np.mean([sim for _, sim in chunk_similarities[:3]]) if chunk_similarities else 0.0
            
            return {
                "answer": answer,
                "sources": sources,
                "confidence": confidence,
                "query": query
            }
            
        except Exception as e:
            logger.error(f"Erreur lors de la réponse à la question: {e}")
            return {
                "answer": "Une erreur s'est produite lors du traitement de votre question.",
                "sources": [],
                "confidence": 0.0
            }
    
    def is_swiss_fiscal_question(self, query: str) -> bool:
        """Détermine si une question concerne la fiscalité suisse"""
        swiss_keywords = [
            'suisse', 'swiss', 'canton', 'cantonal', 'communal',
            'pilier 3a', 'lpp', 'avs', 'ai', 'afc', 'chf',
            'genève', 'zurich', 'vaud', 'valais', 'berne',
            'fédéral', 'confédération', 'impôt à la source',
            'prévoyance', 'cotisations sociales', 'frontalier',
            # Mots-clés internationaux
            'traités', 'accord fiscal', 'double imposition',
            'frontaliers', 'résident', 'non domicilié',
            'holding', 'société domiciliaire', 'imposition forfaitaire',
            'france', 'allemagne', 'italie', 'autriche', 'états-unis',
            'royaume-uni', 'fatca', 'crédit d\'impôt',
            # Situations complexes
            'optimisation', 'planification', 'succession',
            'donation', 'plus-value', 'fortune', 'patrimoine',
            'international', 'multinational', 'expatrié'
        ]
        
        query_lower = query.lower()
        return any(keyword in query_lower for keyword in swiss_keywords)
    
    def get_swiss_tax_suggestions(self, income_range: str = None) -> List[str]:
        """Retourne des suggestions d'optimisation fiscale suisse"""
        suggestions = [
            "Maximisez vos versements Pilier 3A (CHF 7'056 en 2025)",
            "Comparez les charges fiscales entre cantons avant un déménagement",
            "Optimisez le timing de vos revenus et déductions",
            "Considérez les rachats LPP pour réduire vos impôts",
            "Planifiez vos investissements immobiliers pour les déductions",
            "Étudiez les traités fiscaux internationaux pour les revenus étrangers",
            "Optimisez votre structure patrimoniale selon votre situation",
            "Considérez l'imposition forfaitaire si vous êtes éligible",
            "Planifiez vos successions et donations à l'avance",
            "Optimisez vos plus-values selon les règles cantonales"
        ]
        
        if income_range:
            if "élevé" in income_range.lower():
                suggestions.extend([
                    "Étudiez les possibilités de planification successorale",
                    "Optimisez la structure de votre patrimoine",
                    "Considérez les investissements dans l'innovation (déductions R&D)",
                    "Analysez les sociétés holding pour vos investissements",
                    "Planifiez votre départ de Suisse de manière optimale"
                ])
        
        return suggestions

# Fonction utilitaire pour tester le système
def test_swiss_rag_system():
    """Test le système RAG suisse"""
    try:
        rag = SwissRAGSystem()
        
        # Questions de test
        test_questions = [
            "Quels sont les montants maximaux du Pilier 3A en 2025?",
            "Comment fonctionnent les impôts cantonaux en Suisse?",
            "Quelles sont les différences fiscales entre Genève et Zurich?",
            "Comment optimiser ses impôts en Suisse?",
            "Qu'est-ce que l'impôt à la source?",
            "Comment fonctionnent les traités fiscaux avec la France?",
            "Quelles sont les optimisations pour les résidents non domiciliés?",
            "Comment optimiser une société holding en Suisse?"
        ]
        
        for question in test_questions:
            print(f"\n=== Question: {question} ===")
            result = rag.answer_swiss_fiscal_question(question)
            print(f"Réponse: {result['answer'][:200]}...")
            print(f"Confiance: {result['confidence']:.3f}")
            print(f"Sources: {len(result['sources'])}")
            
    except Exception as e:
        logger.error(f"Erreur lors du test: {e}")

if __name__ == "__main__":
    test_swiss_rag_system() 
"""
🔍 SYSTÈME DE RECHERCHE VECTORIELLE MULTI-PROFILS POUR FRANCIS
==============================================================

Ce module gère la recherche sémantique dans la base de connaissances multi-profils
en utilisant les embeddings Mistral pour trouver les informations les plus pertinentes
selon le profil détecté de l'utilisateur.
"""

import os
import json
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
import requests
import logging
from functools import lru_cache
import pickle
from datetime import datetime

from knowledge_base_multi_profiles import MultiProfileKnowledgeBase, KnowledgeChunk, ProfileType, RegimeFiscal, ThemeFiscal
from profile_detector import ProfileDetector, ProfileMatch

logger = logging.getLogger(__name__)

class MultiProfileSearch:
    """Système de recherche vectorielle multi-profils"""
    
    def __init__(self):
        self.knowledge_base = MultiProfileKnowledgeBase()
        self.profile_detector = ProfileDetector()
        self.mistral_api_key = os.getenv('MISTRAL_API_KEY')
        self.mistral_api_url = "https://api.mistral.ai/v1/embeddings"
        self.embeddings_cache_file = "data/multi_profile_embeddings_cache.pkl"
        
        # Charger ou générer les embeddings
        self._load_or_generate_embeddings()
    
    def search_knowledge(self, question: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Recherche contextuelle dans la base de connaissances
        
        Args:
            question: Question de l'utilisateur
            max_results: Nombre maximum de résultats
            
        Returns:
            Liste des chunks de connaissances les plus pertinents
        """
        logger.info(f"🔍 Recherche multi-profils pour : {question[:100]}...")
        
        try:
            # 1. Détecter le profil de l'utilisateur
            profile_matches = self.profile_detector.detect_profile(question)
            logger.info(f"🎯 Profils détectés : {[m.profile_type.value for m in profile_matches]}")
            
            # 2. Générer l'embedding de la question
            question_embedding = self._get_embedding(question)
            if question_embedding is None:
                logger.error("❌ Impossible de générer l'embedding de la question")
                return []
            
            # 3. Recherche vectorielle avec pondération par profil
            relevant_chunks = self._search_with_profile_weighting(
                question_embedding, 
                profile_matches, 
                max_results
            )
            
            # 4. Formater les résultats
            results = []
            for chunk, score in relevant_chunks:
                results.append({
                    "id": chunk.id,
                    "content": chunk.content,
                    "profile_type": chunk.profile_type.value,
                    "regime_fiscal": chunk.regime_fiscal.value if chunk.regime_fiscal else None,
                    "theme_fiscal": chunk.theme_fiscal.value if chunk.theme_fiscal else None,
                    "tags": chunk.tags,
                    "context": chunk.context,
                    "examples": chunk.examples,
                    "similarity_score": float(score),
                    "detected_profiles": [m.profile_type.value for m in profile_matches]
                })
            
            logger.info(f"✅ Trouvé {len(results)} résultats pertinents")
            return results
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de la recherche : {str(e)}")
            return []
    
    def _search_with_profile_weighting(
        self, 
        question_embedding: np.ndarray, 
        profile_matches: List[ProfileMatch], 
        max_results: int
    ) -> List[Tuple[KnowledgeChunk, float]]:
        """Recherche avec pondération selon les profils détectés"""
        
        chunk_scores = []
        
        for chunk in self.knowledge_base.knowledge_chunks:
            if chunk.embedding is None:
                continue
            
            # Calcul de la similarité cosinus de base
            base_similarity = self._cosine_similarity(question_embedding, chunk.embedding)
            
            # Pondération selon les profils détectés
            profile_bonus = 0.0
            
            for profile_match in profile_matches:
                # Bonus si le profil correspond exactement
                if chunk.profile_type == profile_match.profile_type:
                    profile_bonus += 0.3 * profile_match.confidence_score
                
                # Bonus si le régime fiscal correspond
                if (chunk.regime_fiscal and profile_match.regime_fiscal and 
                    chunk.regime_fiscal == profile_match.regime_fiscal):
                    profile_bonus += 0.2 * profile_match.confidence_score
                
                # Bonus si le thème fiscal correspond
                if (chunk.theme_fiscal and profile_match.theme_fiscal and 
                    chunk.theme_fiscal == profile_match.theme_fiscal):
                    profile_bonus += 0.2 * profile_match.confidence_score
            
            # Score final combiné
            final_score = base_similarity + profile_bonus
            chunk_scores.append((chunk, final_score))
        
        # Trier par score décroissant et retourner les meilleurs
        chunk_scores.sort(key=lambda x: x[1], reverse=True)
        return chunk_scores[:max_results]
    
    def _cosine_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calcule la similarité cosinus entre deux embeddings"""
        dot_product = np.dot(embedding1, embedding2)
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
    
    def _load_or_generate_embeddings(self):
        """Charge les embeddings depuis le cache ou les génère"""
        
        # Créer le dossier data s'il n'existe pas
        os.makedirs("data", exist_ok=True)
        
        if os.path.exists(self.embeddings_cache_file):
            logger.info("📂 Chargement des embeddings depuis le cache...")
            try:
                with open(self.embeddings_cache_file, 'rb') as f:
                    cached_embeddings = pickle.load(f)
                
                # Appliquer les embeddings aux chunks
                for chunk in self.knowledge_base.knowledge_chunks:
                    if chunk.id in cached_embeddings:
                        chunk.embedding = cached_embeddings[chunk.id]
                
                logger.info(f"✅ {len(cached_embeddings)} embeddings chargés depuis le cache")
                return
                
            except Exception as e:
                logger.warning(f"⚠️ Erreur lors du chargement du cache : {e}")
        
        # Générer les embeddings
        logger.info("🔄 Génération des embeddings...")
        self._generate_all_embeddings()
    
    def _generate_all_embeddings(self):
        """Génère tous les embeddings pour la base de connaissances"""
        
        if not self.mistral_api_key:
            logger.error("❌ Clé API Mistral manquante")
            return
        
        embeddings_cache = {}
        
        for i, chunk in enumerate(self.knowledge_base.knowledge_chunks):
            logger.info(f"🔄 Génération embedding {i+1}/{len(self.knowledge_base.knowledge_chunks)} - {chunk.id}")
            
            # Créer le texte à vectoriser (contenu + contexte + tags)
            text_to_embed = f"{chunk.content}\n\nContexte: {chunk.context}\n\nTags: {', '.join(chunk.tags)}"
            
            embedding = self._get_embedding(text_to_embed)
            if embedding is not None:
                chunk.embedding = embedding
                embeddings_cache[chunk.id] = embedding
            
            # Pause pour éviter les limitations de taux
            import time
            time.sleep(0.1)
        
        # Sauvegarder le cache
        try:
            with open(self.embeddings_cache_file, 'wb') as f:
                pickle.dump(embeddings_cache, f)
            logger.info(f"✅ Cache des embeddings sauvegardé ({len(embeddings_cache)} embeddings)")
        except Exception as e:
            logger.error(f"❌ Erreur lors de la sauvegarde du cache : {e}")
    
    @lru_cache(maxsize=1000)
    def _get_embedding(self, text: str) -> Optional[np.ndarray]:
        """Génère l'embedding d'un texte via l'API Mistral"""
        
        if not self.mistral_api_key:
            logger.error("❌ Clé API Mistral manquante")
            return None
        
        try:
            headers = {
                "Authorization": f"Bearer {self.mistral_api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "mistral-embed",
                "input": [text]
            }
            
            response = requests.post(
                self.mistral_api_url,
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                embedding = result["data"][0]["embedding"]
                return np.array(embedding, dtype=np.float32)
            else:
                logger.error(f"❌ Erreur API Mistral : {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Erreur lors de la génération de l'embedding : {str(e)}")
            return None
    
    def get_profile_specific_knowledge(
        self, 
        profile_type: ProfileType, 
        theme: Optional[ThemeFiscal] = None,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Récupère les connaissances spécifiques à un profil
        
        Args:
            profile_type: Type de profil fiscal
            theme: Thème fiscal optionnel pour filtrer
            max_results: Nombre maximum de résultats
            
        Returns:
            Liste des connaissances pour ce profil
        """
        
        results = []
        
        for chunk in self.knowledge_base.knowledge_chunks:
            # Filtrer par profil
            if chunk.profile_type != profile_type:
                continue
            
            # Filtrer par thème si spécifié
            if theme and chunk.theme_fiscal != theme:
                continue
            
            results.append({
                "id": chunk.id,
                "content": chunk.content,
                "profile_type": chunk.profile_type.value,
                "regime_fiscal": chunk.regime_fiscal.value if chunk.regime_fiscal else None,
                "theme_fiscal": chunk.theme_fiscal.value if chunk.theme_fiscal else None,
                "tags": chunk.tags,
                "context": chunk.context,
                "examples": chunk.examples
            })
            
            if len(results) >= max_results:
                break
        
        return results
    
    def get_optimization_suggestions(self, question: str) -> List[Dict[str, Any]]:
        """
        Suggestions d'optimisation basées sur la question
        
        Args:
            question: Question de l'utilisateur
            
        Returns:
            Liste des suggestions d'optimisation
        """
        
        # Rechercher spécifiquement les connaissances d'optimisation
        optimization_results = []
        
        # Détecter les profils
        profile_matches = self.profile_detector.detect_profile(question)
        
        for profile_match in profile_matches:
            # Chercher les optimisations pour ce profil
            profile_optimizations = self.get_profile_specific_knowledge(
                profile_match.profile_type,
                ThemeFiscal.OPTIMISATION,
                max_results=3
            )
            
            optimization_results.extend(profile_optimizations)
        
        return optimization_results

# Instance globale
multi_profile_search = MultiProfileSearch()

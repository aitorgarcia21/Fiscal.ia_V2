#!/usr/bin/env python3
"""
Script pour générer les embeddings des documents fiscaux suisses
Utilise l'API Mistral pour créer des embeddings vectoriels
"""

import os
import numpy as np
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
import logging
from typing import List
import time
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SwissEmbeddingsGenerator:
    def __init__(self):
        """Initialise le générateur d'embeddings suisses"""
        self.api_key = os.getenv('MISTRAL_API_KEY')
        if not self.api_key:
            raise ValueError("MISTRAL_API_KEY non trouvée dans les variables d'environnement")
        
        self.client = MistralClient(api_key=self.api_key)
        self.model = "mistral-embed"
        
        # Chemins des répertoires
        self.chunks_dir = "data/swiss_chunks_text"
        self.embeddings_dir = "data/swiss_embeddings"
        
        # Créer le répertoire des embeddings
        os.makedirs(self.embeddings_dir, exist_ok=True)
    
    def load_text_chunks(self) -> List[str]:
        """Charge tous les chunks de texte suisse"""
        chunks = []
        
        if not os.path.exists(self.chunks_dir):
            logger.error(f"Répertoire non trouvé: {self.chunks_dir}")
            return chunks
        
        # Lister tous les fichiers de chunks
        chunk_files = [f for f in os.listdir(self.chunks_dir) if f.startswith('swiss_chunk_') and f.endswith('.txt')]
        chunk_files.sort()
        
        for chunk_file in chunk_files:
            chunk_path = os.path.join(self.chunks_dir, chunk_file)
            
            try:
                with open(chunk_path, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    if content:
                        chunks.append(content)
            except Exception as e:
                logger.error(f"Erreur lors de la lecture de {chunk_file}: {e}")
        
        logger.info(f"Chargé {len(chunks)} chunks de texte suisse")
        return chunks
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """Génère un embedding pour un texte donné"""
        try:
            # Appel à l'API Mistral
            response = self.client.embeddings(
                model=self.model,
                input=[text]
            )
            
            # Extraire l'embedding
            embedding = response.data[0].embedding
            return np.array(embedding, dtype=np.float32)
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération d'embedding: {e}")
            raise
    
    def generate_all_embeddings(self, batch_size: int = 10, delay: float = 1.0):
        """Génère tous les embeddings pour les chunks suisses"""
        chunks = self.load_text_chunks()
        
        if not chunks:
            logger.error("Aucun chunk trouvé")
            return
        
        logger.info(f"Génération des embeddings pour {len(chunks)} chunks")
        
        for i, chunk in enumerate(chunks):
            try:
                # Nom du fichier d'embedding
                embedding_filename = f"swiss_chunk_{i:04d}.npy"
                embedding_path = os.path.join(self.embeddings_dir, embedding_filename)
                
                # Vérifier si l'embedding existe déjà
                if os.path.exists(embedding_path):
                    logger.info(f"Embedding {i+1}/{len(chunks)} existe déjà: {embedding_filename}")
                    continue
                
                # Générer l'embedding
                logger.info(f"Génération embedding {i+1}/{len(chunks)}: {embedding_filename}")
                embedding = self.generate_embedding(chunk)
                
                # Sauvegarder l'embedding
                np.save(embedding_path, embedding)
                
                # Délai pour éviter les limites de taux
                if (i + 1) % batch_size == 0:
                    logger.info(f"Pause de {delay}s après {i+1} embeddings")
                    time.sleep(delay)
                
            except Exception as e:
                logger.error(f"Erreur pour le chunk {i}: {e}")
                continue
        
        logger.info("Génération des embeddings terminée")
    
    def verify_embeddings(self):
        """Vérifie que tous les embeddings ont été générés"""
        chunks = self.load_text_chunks()
        embeddings_count = 0
        
        for i in range(len(chunks)):
            embedding_filename = f"swiss_chunk_{i:04d}.npy"
            embedding_path = os.path.join(self.embeddings_dir, embedding_filename)
            
            if os.path.exists(embedding_path):
                embeddings_count += 1
            else:
                logger.warning(f"Embedding manquant: {embedding_filename}")
        
        logger.info(f"Vérification: {embeddings_count}/{len(chunks)} embeddings générés")
        return embeddings_count == len(chunks)
    
    def test_embedding_quality(self):
        """Test la qualité des embeddings générés"""
        try:
            # Charger quelques embeddings
            test_embeddings = []
            for i in range(min(5, len(os.listdir(self.embeddings_dir)))):
                embedding_path = os.path.join(self.embeddings_dir, f"swiss_chunk_{i:04d}.npy")
                if os.path.exists(embedding_path):
                    embedding = np.load(embedding_path)
                    test_embeddings.append(embedding)
            
            if test_embeddings:
                # Vérifier les dimensions
                dimensions = [emb.shape[0] for emb in test_embeddings]
                logger.info(f"Dimensions des embeddings: {dimensions}")
                
                # Vérifier la similarité
                if len(test_embeddings) >= 2:
                    similarity = np.dot(test_embeddings[0], test_embeddings[1]) / (
                        np.linalg.norm(test_embeddings[0]) * np.linalg.norm(test_embeddings[1])
                    )
                    logger.info(f"Similarité cosinus entre les 2 premiers embeddings: {similarity:.4f}")
                
                logger.info("Test de qualité des embeddings réussi")
            else:
                logger.warning("Aucun embedding trouvé pour le test")
                
        except Exception as e:
            logger.error(f"Erreur lors du test de qualité: {e}")

def main():
    """Fonction principale"""
    try:
        # Initialiser le générateur
        generator = SwissEmbeddingsGenerator()
        
        # Générer tous les embeddings
        generator.generate_all_embeddings(batch_size=5, delay=2.0)
        
        # Vérifier les embeddings
        generator.verify_embeddings()
        
        # Tester la qualité
        generator.test_embedding_quality()
        
        logger.info("Processus terminé avec succès")
        
    except Exception as e:
        logger.error(f"Erreur dans le processus principal: {e}")
        raise

if __name__ == "__main__":
    main() 
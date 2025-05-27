import os
import json
import re
from pathlib import Path
import PyPDF2
from typing import List, Dict, Tuple

# Fichiers d'entrée/sortie
INPUT_FILE = 'CGI.pdf'
OUTPUT_DIR = Path('data/cgi_chunks')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Taille maximale des chunks en mots
MAX_WORDS_PER_CHUNK = 500

def extract_article_number(text: str) -> str:
    """Extrait le numéro d'article du texte."""
    match = re.search(r'Article (\d+[A-Za-z-]*)', text)
    return match.group(1) if match else ""

def extract_hierarchy(text: str) -> Dict[str, str]:
    """Extrait la hiérarchie (livre, titre, chapitre, section) du texte."""
    hierarchy = {
        'livre': '',
        'titre': '',
        'chapitre': '',
        'section': ''
    }
    
    # Patterns pour chaque niveau
    patterns = {
        'livre': r'LIVRE ([IVX]+)',
        'titre': r'TITRE ([IVX]+)',
        'chapitre': r'CHAPITRE ([IVX]+)',
        'section': r'Section ([IVX]+)'
    }
    
    for level, pattern in patterns.items():
        match = re.search(pattern, text)
        if match:
            hierarchy[level] = match.group(1)
    
    return hierarchy

def chunk_text(text: str, max_words: int = MAX_WORDS_PER_CHUNK) -> List[str]:
    """Découpe le texte en chunks d'environ max_words mots sans couper les phrases."""
    # Nettoyage du texte
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Découpage en phrases
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    chunks = []
    current_chunk = []
    current_word_count = 0
    
    for sentence in sentences:
        sentence_words = sentence.split()
        sentence_word_count = len(sentence_words)
        
        if current_word_count + sentence_word_count > max_words and current_chunk:
            chunks.append(' '.join(current_chunk))
            current_chunk = []
            current_word_count = 0
        
        current_chunk.append(sentence)
        current_word_count += sentence_word_count
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks

def process_pdf() -> None:
    """Traite le PDF du CGI et extrait les articles structurés."""
    with open(INPUT_FILE, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        current_article = []
        current_article_number = ""
        current_hierarchy = {
            'livre': '',
            'titre': '',
            'chapitre': '',
            'section': ''
        }
        
        for page in reader.pages:
            text = page.extract_text()
            lines = text.split('\n')
            
            for line in lines:
                # Détection d'un nouvel article
                if line.startswith('Article'):
                    # Sauvegarde de l'article précédent
                    if current_article:
                        save_article(current_article_number, current_hierarchy, current_article)
                    
                    # Initialisation du nouvel article
                    current_article_number = extract_article_number(line)
                    current_article = [line]
                    
                    # Mise à jour de la hiérarchie
                    current_hierarchy = extract_hierarchy(line)
                else:
                    # Mise à jour de la hiérarchie si nécessaire
                    new_hierarchy = extract_hierarchy(line)
                    for level in current_hierarchy:
                        if new_hierarchy[level]:
                            current_hierarchy[level] = new_hierarchy[level]
                    
                    current_article.append(line)
        
        # Sauvegarde du dernier article
        if current_article:
            save_article(current_article_number, current_hierarchy, current_article)

def save_article(article_number: str, hierarchy: Dict[str, str], content: List[str]) -> None:
    """Sauvegarde un article découpé en chunks dans un fichier JSON."""
    if not article_number:
        return
    
    # Préparation du texte complet
    full_text = ' '.join(content)
    
    # Découpage en chunks
    chunks = chunk_text(full_text)
    
    # Création de l'entrée JSON
    article_data = {
        'code': f'CGI_{article_number}',
        'article_number': article_number,
        'hierarchy': hierarchy,
        'chunks': chunks,
        'full_text': full_text
    }
    
    # Sauvegarde dans un fichier JSON
    output_file = OUTPUT_DIR / f'CGI_{article_number}.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(article_data, f, ensure_ascii=False, indent=2)
    
    print(f"Article {article_number} traité -> {len(chunks)} chunks")

if __name__ == '__main__':
    process_pdf() 
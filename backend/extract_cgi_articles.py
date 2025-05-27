import PyPDF2
import re
import json
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class ArticleSection:
    title: str
    content: str
    subsections: List['ArticleSection']
    references: List[str]

@dataclass
class Article:
    number: str
    title: str
    sections: List[ArticleSection]
    references: List[str]
    full_text: str

def extract_references(text: str) -> List[str]:
    """Extrait les références à d'autres articles du texte."""
    reference_pattern = re.compile(r'Article[s]?\s+(\d{1,4}(?:-[0-9A-Z]+)?(?:\s*(?:bis|ter|quater|quinquies|sexies|septies|octies|nonies|decies|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z))*)\b', re.IGNORECASE)
    return list(set(reference_pattern.findall(text)))

def parse_section(text: str) -> ArticleSection:
    """Parse une section d'article et ses sous-sections."""
    lines = text.split('\n')
    current_section = ArticleSection(title="", content="", subsections=[], references=[])
    current_content = []
    
    for line in lines:
        if line.strip().startswith(('I.', 'II.', 'III.', 'IV.', 'V.', 'VI.', 'VII.', 'VIII.', 'IX.', 'X.')):
            if current_content:
                current_section.content = '\n'.join(current_content)
                current_section.references = extract_references(current_section.content)
            current_section = ArticleSection(title=line.strip(), content="", subsections=[], references=[])
            current_content = []
        else:
            current_content.append(line)
    
    if current_content:
        current_section.content = '\n'.join(current_content)
        current_section.references = extract_references(current_section.content)
    
    return current_section

def extract_articles_from_pdf(pdf_path: str) -> Dict[str, Article]:
    """Extrait les articles du PDF du CGI avec leur structure hiérarchique."""
    articles = {}
    current_article = None
    current_text = []
    
    article_regex = re.compile(r'Article\s+((\d{1,4}(?:-[0-9A-Z]+)?(?:\s*(?:bis|ter|quater|quinquies|sexies|septies|octies|nonies|decies|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z))*)\b)', re.IGNORECASE)

    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        total_pages = len(reader.pages)
        print(f"Nombre total de pages dans le PDF : {total_pages}")
        
        for page_num, page in enumerate(reader.pages, 1):
            print(f"Traitement de la page {page_num}/{total_pages}")
            text = page.extract_text()
            if not text or not text.strip():
                print(f"Page {page_num} est vide")
                continue
                
            lines = text.split('\n')
            
            for line in lines:
                article_match = article_regex.match(line)
                if article_match:
                    if current_article:
                        full_text = '\n'.join(current_text).strip()
                        sections = parse_section(full_text)
                        articles[current_article] = Article(
                            number=current_article,
                            title=current_text[0] if current_text else "",
                            sections=[sections],
                            references=extract_references(full_text),
                            full_text=full_text
                        )
                        print(f"Article {current_article} extrait")
                    
                    current_article = article_match.group(1).replace('  ', ' ').strip()
                    current_text = [line]
                    print(f"Nouvel article détecté : {current_article}")
                elif current_article:
                    current_text.append(line)
    
    if current_article:
        full_text = '\n'.join(current_text).strip()
        sections = parse_section(full_text)
        articles[current_article] = Article(
            number=current_article,
            title=current_text[0] if current_text else "",
            sections=[sections],
            references=extract_references(full_text),
            full_text=full_text
        )
        print(f"Dernier article extrait : {current_article}")
    
    return articles

def save_articles_to_json(articles: Dict[str, Article], output_dir: str):
    """Sauvegarde les articles dans des fichiers JSON séparés avec leur structure."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    for article_number, article in articles.items():
        clean_number = article_number.replace(' ', '_').replace('-', '_')
        
        article_json = {
            'code': f'CGI_{clean_number}',
            'article_number': article.number,
            'title': article.title,
            'sections': [
                {
                    'title': section.title,
                    'content': section.content,
                    'references': section.references
                }
                for section in article.sections
            ],
            'references': article.references,
            'full_text': article.full_text
        }
        
        with open(output_path / f'CGI_{clean_number}.json', 'w', encoding='utf-8') as f:
            json.dump(article_json, f, ensure_ascii=False, indent=2)
        print(f"Article {article_number} sauvegardé")

def main():
    pdf_path = 'CGI.pdf'
    output_dir = 'data/cgi_chunks'
    
    print("Extraction des articles du CGI...")
    articles = extract_articles_from_pdf(pdf_path)
    
    print(f"Nombre d'articles extraits : {len(articles)}")
    
    print("Sauvegarde des articles en JSON...")
    save_articles_to_json(articles, output_dir)
    
    print("Terminé !")

if __name__ == '__main__':
    main() 
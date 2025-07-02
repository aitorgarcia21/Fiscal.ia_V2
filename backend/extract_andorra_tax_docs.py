import os
from pathlib import Path
from typing import List
import PyPDF2
import textwrap
import requests

"""
Extract Andorran fiscal laws (PDF) and split them into manageable text chunks
compatible avec la pipeline Mistral.

Étapes :
1. Placer les PDF récents (2025) dans backend/data/andorra_docs/
2. Exécuter ce script : python extract_andorra_tax_docs.py
   → Génère des fichiers texte dans backend/data/andorra_chunks_text/
     (andorra_chunk_0000.txt, etc.)
3. Lancer ensuite generate_andorra_embeddings.py pour créer les embeddings.

Les chunks sont de 1 000 caractères max, sans chevauchement pour la simplicité.
"""

PDF_DIR = Path('data/andorra_docs')
CHUNKS_DIR = Path('data/andorra_chunks_text')
CHUNK_SIZE = 1000  # caractères

PDF_SOURCES = {
    "IRPF_5_2014.pdf": "https://www.impostos.ad/sites/default/files/2024-02/Llei%205_2014_IRPF.pdf",
    "IGI_95_2010.pdf": "https://www.impostos.ad/sites/default/files/2024-02/Llei%2095_2010_IGI.pdf",
    "IS_95_2014.pdf": "https://www.impostos.ad/sites/default/files/2024-02/Llei%2095_2014_ImpostSocietats.pdf"
}


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Return full extracted text from a PDF (UTF-8)."""
    text = ""
    try:
        with pdf_path.open('rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() or ""
    except Exception as e:
        print(f"❌ Erreur extraction {pdf_path.name}: {e}")
    return text


def chunk_text(text: str, size: int = CHUNK_SIZE) -> List[str]:
    """Split text into chunks of ~size characters without breaking words."""
    # textwrap.wrap conserve les mots entiers
    return textwrap.wrap(text, width=size, break_long_words=False, break_on_hyphens=False)


def save_chunks(chunks: List[str]):
    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)
    existing = list(CHUNKS_DIR.glob('andorra_chunk_*.txt'))
    start_idx = len(existing)
    for i, chunk in enumerate(chunks, start=start_idx):
        filename = CHUNKS_DIR / f"andorra_chunk_{i:04d}.txt"
        filename.write_text(chunk, encoding='utf-8')


def download_pdfs():
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    for filename, url in PDF_SOURCES.items():
        dest = PDF_DIR / filename
        if dest.exists():
            continue
        try:
            print(f"⬇️ Téléchargement de {url} …")
            r = requests.get(url, timeout=30)
            if r.status_code == 200 and r.headers.get('content-type', '').startswith('application/pdf'):
                dest.write_bytes(r.content)
                print(f"   → Enregistré sous {dest}")
            else:
                print(f"⚠️ Échec téléchargement {url} (code {r.status_code})")
        except Exception as e:
            print(f"❌ Erreur téléchargement {url}: {e}")


def main():
    # Étape 0 : télécharger les PDF si manquants
    download_pdfs()

    if not PDF_DIR.exists() or not any(PDF_DIR.glob('*.pdf')):
        print(f"⚠️ Aucun PDF trouvé dans {PDF_DIR}. Placez-y les lois andorranes (PDF 2025) puis réexécutez.")
        return

    all_chunks: List[str] = []
    for pdf_file in PDF_DIR.glob('*.pdf'):
        print(f"📄 Extraction de {pdf_file.name}…")
        text = extract_text_from_pdf(pdf_file)
        if not text.strip():
            print(f"⚠️ Texte vide pour {pdf_file.name}, ignoré.")
            continue
        chunks = chunk_text(text)
        print(f"   → {len(chunks)} chunks créés")
        all_chunks.extend(chunks)

    save_chunks(all_chunks)
    print(f"✅ {len(all_chunks)} chunks enregistrés dans {CHUNKS_DIR}")


if __name__ == '__main__':
    main() 
import os
from pathlib import Path
from typing import List
import PyPDF2
import textwrap
import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup

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
    "IS_95_2014.pdf": "https://www.impostos.ad/sites/default/files/2024-02/Llei%2095_2014_ImpostSocietats.pdf",
    # ---- Impôts directs ----
    "Llei_5_2014_IRPF.pdf": "https://www.consellgeneral.ad/ca/arxiu/arxiu-de-lleis-i-textos-aprovats-en-legislatures-anteriors/vi-legislatura-2011-2015/copy_of_lleis-aprovades/llei-5-2014-del-24-d2019abril-de-l2019impost-sobre-la-renda-de-les-persones-fisiques/llei-5-2014.pdf",
    "Llei_94_2010_IRNR.pdf": "https://www.consellgeneral.ad/fitxers/documents/lleis-2010/llei-94-2010.pdf",
    "Llei_95_2010_IS.pdf": "https://www.consellgeneral.ad/fitxers/documents/lleis-2010/llei-95-2010.pdf",
    "Llei_11_2005_Rendements_Epargne.pdf": "https://www.consellgeneral.ad/fitxers/documents/lleis-2005/llei-11-2005.pdf",
    # ---- IGI ----
    "Llei_16_2004_Modifications_IGI.pdf": "https://www.consellgeneral.ad/fitxers/documents/lleis-2004/llei-16-2004.pdf",
    "Llei_11_2012_Text_refo_IGI.pdf": "https://www.consellgeneral.ad/ca/arxiu/arxiu-de-lleis-i-textos-aprovats-en-legislatures-anteriors/vi-legislatura-2011-2015/copy_of_lleis-aprovades/decret-legislatiu-del-23-07-2014-de-publicacio-del-text-refos-de-la-llei-11-2012-del-21-de-juny-de-l2019impost-general-indirecte/at_download/PDF",
    # ---- Bases fiscales ----
    "Llei_21_2014_Bases_Tributari.pdf": "https://www.consellgeneral.ad/fitxers/documents/lleis-2014/llei-21-2014.pdf",
    # ---- Administration fiscale ----
    "BOPA_61_2019_Codi_Administracio.pdf": "https://bopadocuments.blob.core.windows.net/bopa-documents/034048/pdf/CGL20220414_11_15_29.pdf",
    # ---- Conventions internationales ----
    "Convention_Andorre_France_2013.pdf": "https://www.impots.gouv.fr/sites/default/files/media/10_conventions/andorre/andorre_convention-avec-la-principaute-d-andorre-revenu-signee-le-2-avril-2013_fd_7522.pdf",
    "OCDE_MLI_Signatories.pdf": "https://www.oecd.org/content/dam/oecd/en/topics/policy-sub-issues/beps-mli/beps-mli-signatories-and-parties.pdf",
    # ---- Lois et décrets supplémentaires (sources BOPA / Portal Jurídic) ----
    # NB : certaines URL peuvent encore évoluer ; le script tentera de les
    #      récupérer directement et, en échec, s'appuiera sur crawl_bopa_for_pdfs.
    "Llei_21_2014_Bases_Ordenament_Tributari.pdf": "https://www.bopa.ad/bopa/03012015/Llei_21_2014.pdf",
    # Décrets d'application procédure fiscale 2015 (nº 11, 22, 150)
    "Decret_11_02_2015_Procediment_Tributari.pdf": "https://www.bopa.ad/bopa/11022015/Decret_11_2015.pdf",
    "Decret_22_04_2015_Procediment_Tributari.pdf": "https://www.bopa.ad/bopa/22042015/Decret_22_2015.pdf",
    "Decret_21_10_2015_Recobrament_Tributari.pdf": "https://www.bopa.ad/bopa/21102015/Decret_21_2015.pdf",
    # Plus-values immobilières 2017
    "Decret_6_12_2017_PlusValues_Immobilieres.pdf": "https://www.bopa.ad/bopa/06122017/Decret_PlusValues_2017.pdf",
}

BOPA_BASE = "https://www.bopa.ad"
BOPA_LEGISLACIO_URL = "https://www.bopa.ad/Legislacio"

# Étend le filtre de mots-clés pour couvrir les nouvelles références
KEYWORDS = [
    'impost', 'irpf', 'igi', 'plus', 'procediment', 'recobrament',
    'tribut', 'revisio', 'reglament', 'decret', 'valor', 'base', 'renda',
    'ordenament', 'plusvalues', 'plus-v', '2015', '2017'
]


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


def crawl_bopa_for_pdfs(max_pdfs: int = 20):
    """Parcourt la page législation et récupère les liens PDF (lois)."""
    try:
        resp = requests.get(BOPA_LEGISLACIO_URL, timeout=30)
        if resp.status_code != 200:
            print(f"⚠️ Impossible d'accéder à {BOPA_LEGISLACIO_URL} (code {resp.status_code})")
            return
        soup = BeautifulSoup(resp.text, 'html.parser')
        links = [a.get('href') for a in soup.find_all('a', href=True) if a['href'].lower().endswith('.pdf')]
        found = 0
        for href in links:
            if found >= max_pdfs:
                break
            full_url = urljoin(BOPA_BASE, href) if urlparse(href).netloc == '' else href
            filename = Path(urlparse(full_url).path).name
            if not filename:
                continue
            # Filtrer uniquement documents fiscaux (lois ou décrets)
            if not any(kw in filename.lower() for kw in KEYWORDS):
                continue
            if (PDF_DIR / filename).exists():
                continue
            try:
                print(f"⬇️ Téléchargement BOPA {full_url} …")
                r = requests.get(full_url, timeout=30, stream=True)
                if r.status_code == 200:
                    (PDF_DIR / filename).write_bytes(r.content)
                    print(f"   → {filename} sauvegardé")
                    found += 1
                else:
                    print(f"   ⚠️ code {r.status_code} pour {full_url}")
            except Exception as e:
                print(f"❌ Erreur téléchargement {full_url}: {e}")
    except Exception as e:
        print(f"❌ Erreur lors du crawl BOPA: {e}")


def main():
    # Étape 0 : télécharger les PDF si manquants (listes statiques)
    download_pdfs()
    # Étape 0 bis : crawler BOPA pour PDF supplémentaires
    crawl_bopa_for_pdfs(max_pdfs=50)

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
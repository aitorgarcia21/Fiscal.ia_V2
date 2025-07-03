import os
from pathlib import Path
from typing import List, Optional
import PyPDF2
import textwrap
import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import urllib.parse as _uparse

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

# ────────────────────────────────────────────────────────────
# Integration Scrapfly (scraping as-a-service)
# ────────────────────────────────────────────────────────────

# L'utilisateur peut fournir la clé via variable d'env SCRAPFLY_KEY ou paramètre --scrapfly-key
SCRAPFLY_KEY = os.getenv("SCRAPFLY_KEY")


def scrapfly_get(url: str, render_js: bool = False, binary: bool = False) -> Optional[bytes]:
    """Récupère *url* via Scrapfly. Retourne le *bytes* du contenu (binaire ou HTML) ou None.

    • *binary* True  → on force `format=binary` (base64) pour télécharger un PDF.
    • *render_js* True → rend la page avec un navigateur cloud.
    """
    if not SCRAPFLY_KEY:
        return None

    base = "https://api.scrapfly.io/scrape"
    params = {
        "key": SCRAPFLY_KEY,
        "url": url,
        "asp": "true",  # bypass anti-bot si nécessaire
    }
    if render_js:
        params["render_js"] = "true"
    # Pour le mode binaire, Scrapfly renvoie un payload base64 dans JSON → format=json puis décodage
    if binary:
        params["format"] = "json"

    api_url = f"{base}?" + _uparse.urlencode(params, safe="/:")

    try:
        r = requests.get(api_url, timeout=30)
        r.raise_for_status()
    except Exception as e:
        print(f"⚠️ Scrapfly request failed: {e}")
        return None

    if binary:
        try:
            payload = r.json()
            if payload["result"]["format"] != "binary":
                return None
            import base64
            return base64.b64decode(payload["result"]["content"])
        except Exception:
            return None
    else:
        # HTML/text content (result.content si success True)
        try:
            payload = r.json()
            return payload["result"]["content"].encode("utf-8")
        except Exception:
            return None


def search_pdf_duckduckgo_scrapfly(query: str, max_links: int = 10) -> List[str]:
    """Interroge DuckDuckGo via Scrapfly et renvoie max_links liens PDF.
    Avantage : permet d'obtenir des résultats même si DDG bloque l'IP locale.
    """
    if not SCRAPFLY_KEY:
        return []
    ddg_url = (
        "https://duckduckgo.com/html/?q=" + _uparse.quote_plus(query + " filetype:pdf")
    )
    html_bytes = scrapfly_get(ddg_url, render_js=False, binary=False)
    if not html_bytes:
        return []
    import re

    html = html_bytes.decode("utf-8", errors="ignore")
    pdf_links = re.findall(r"https?://[^\"']+\.pdf", html, flags=re.I)
    # Nettoyage
    seen, clean = set(), []
    for link in pdf_links:
        if link not in seen:
            seen.add(link)
            clean.append(link)
        if len(clean) >= max_links:
            break
    return clean


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


def attempt_fallback_download(url: str, dest: Path) -> bool:
    """Essaye de retrouver le PDF via diverses stratégies (Scrapfly & DuckDuckGo)."""
    # 1️⃣ Scrapfly : tentative de téléchargement direct (binaire)
    if SCRAPFLY_KEY:
        binary = scrapfly_get(url, binary=True)
        if binary:
            dest.write_bytes(binary)
            print(f"   → PDF récupéré via Scrapfly ({len(binary)} o).")
            return True

    # 2️⃣ Recherche DuckDuckGo via Scrapfly
    query = Path(url).stem.replace("_", " ")
    candidates = search_pdf_duckduckgo_scrapfly(query)
    for link in candidates:
        print(f"   → Test candidat DuckDuckGo : {link}")
        if SCRAPFLY_KEY:
            content = scrapfly_get(link, binary=True)
            if content:
                dest.write_bytes(content)
                print("      ✓ téléchargé (Scrapfly)")
                return True
        # Fallback local (sans Scrapfly)
        try:
            r = requests.get(link, timeout=15, stream=True)
            if r.status_code == 200 and r.headers.get("content-type", "").startswith("application/pdf"):
                dest.write_bytes(r.content)
                print("      ✓ téléchargé (direct)")
                return True
        except Exception:
            continue

    return False


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
                # Essayer un fallback : scruter le répertoire parent ou le site du Consell General
                print(f"⚠️ Échec téléchargement direct (code {r.status_code}). Tentative de découverte…")
                if attempt_fallback_download(url, dest):
                    print(f"   → PDF récupéré via fallback et enregistré sous {dest}")
                else:
                    print(f"❌ Impossible de récupérer {filename}")
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


def process_pdfs(target_files: List[Path]):
    """Extrait le texte et enregistre les chunks pour chaque PDF fourni."""
    all_chunks: List[str] = []
    for pdf_file in target_files:
        if not pdf_file.exists():
            print(f"⚠️ Fichier introuvable : {pdf_file}")
            continue
        print(f"📄 Extraction de {pdf_file.name}…")
        text = extract_text_from_pdf(pdf_file)
        if not text.strip():
            print(f"⚠️ Texte vide pour {pdf_file.name}, ignoré.")
            continue
        chunks = chunk_text(text)
        print(f"   → {len(chunks)} chunks créés")
        all_chunks.extend(chunks)
    if all_chunks:
        save_chunks(all_chunks)
        print(f"✅ {len(all_chunks)} chunks enregistrés dans {CHUNKS_DIR}")
    else:
        print("⚠️ Aucun chunk généré.")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Extraction PDF lois fiscales andorranes → chunks texte")
    parser.add_argument("--file", help="Nom du PDF cible déjà présent ou à télécharger")
    parser.add_argument("--url", help="URL à tenter avant fallback")
    parser.add_argument("--scrapfly-key", help="Clé API Scrapfly (sinon SCRAPFLY_KEY env)")
    parser.add_argument("--skip-crawl", action="store_true", help="Ne pas crawler le BOPA pour des PDF supplémentaires")
    args = parser.parse_args()

    global SCRAPFLY_KEY
    if args.scrapfly_key:
        SCRAPFLY_KEY = args.scrapfly_key

    PDF_DIR.mkdir(parents=True, exist_ok=True)

    if args.file:
        # Détermination du chemin complet
        pdf_path = Path(args.file)
        if not pdf_path.is_absolute():
            pdf_path = PDF_DIR / pdf_path.name

        # Télécharger depuis l'URL fournie si besoin
        if not pdf_path.exists() and args.url:
            try:
                print(f"⬇️ Téléchargement de {args.url}…")
                r = requests.get(args.url, timeout=30)
                if r.status_code == 200 and r.headers.get('content-type', '').startswith('application/pdf'):
                    pdf_path.write_bytes(r.content)
                    print(f"   → PDF enregistré sous {pdf_path}")
                else:
                    print(f"⚠️ Impossible de télécharger {args.url} (code {r.status_code})")
                    # Essayer fallback Scrapfly / DuckDuckGo
                    if attempt_fallback_download(args.url, pdf_path):
                        print(f"   → PDF récupéré via fallback et enregistré sous {pdf_path}")
            except Exception as e:
                print(f"❌ Erreur téléchargement {args.url}: {e}")

        process_pdfs([pdf_path])
    else:
        # Mode complet (tous les PDF connus + crawl)
        download_pdfs()
        if not args.skip_crawl:
            crawl_bopa_for_pdfs(max_pdfs=50)

        pdf_files = list(PDF_DIR.glob('*.pdf'))
        if not pdf_files:
            print(f"⚠️ Aucun PDF trouvé dans {PDF_DIR}. Placez-y les lois andorranes puis réexécutez.")
            return
        process_pdfs(pdf_files)

    # Étape finale : génération (ou mise à jour) des embeddings
    try:
        from backend.generate_andorra_embeddings import generate_embeddings
        generate_embeddings()
    except Exception as e:
        print(f"⚠️ Embeddings non générés automatiquement : {e}")


if __name__ == '__main__':
    main() 
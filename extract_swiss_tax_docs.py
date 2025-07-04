#!/usr/bin/env python3
"""
Extraction et découpage des documents fiscaux suisses pour Francis Suisse
Version améliorée avec guide complet
"""

import os
import re
from pathlib import Path

def clean_text(text):
    """Nettoie le texte en supprimant les caractères indésirables"""
    # Supprimer les caractères de contrôle
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    # Normaliser les espaces
    text = re.sub(r'\s+', ' ', text)
    # Supprimer les lignes vides multiples
    text = re.sub(r'\n\s*\n', '\n\n', text)
    return text.strip()

def split_into_chunks(text, max_chunk_size=8000, overlap=500):
    """Découpe le texte en chunks avec overlap"""
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + max_chunk_size
        
        # Si ce n'est pas la fin du texte, essayer de couper à un point ou saut de ligne
        if end < len(text):
            # Chercher le dernier point ou saut de ligne dans la zone de chevauchement
            search_start = max(start, end - overlap)
            last_period = text.rfind('.', search_start, end)
            last_newline = text.rfind('\n', search_start, end)
            
            # Prendre la position la plus proche de la fin
            if last_period > last_newline and last_period > search_start:
                end = last_period + 1
            elif last_newline > search_start:
                end = last_newline + 1
        
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        
        start = end - overlap
        if start >= len(text):
            break
    
    return chunks

def extract_swiss_tax_documents():
    """Extrait et découpe les documents fiscaux suisses"""
    
    # Créer les répertoires de sortie
    output_dir = Path("data/swiss_chunks_text")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Liste des documents à traiter
    documents = [
        "data/swiss_fiscal_docs/guide_fiscal_suisse.txt",
        "data/swiss_fiscal_docs/guide_fiscal_suisse_complet.txt"
    ]
    
    all_chunks = []
    
    for doc_path in documents:
        if not os.path.exists(doc_path):
            print(f"⚠️  Document non trouvé: {doc_path}")
            continue
            
        print(f"📄 Traitement de: {doc_path}")
        
        try:
            with open(doc_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Nettoyer le contenu
            content = clean_text(content)
            
            # Découper en chunks
            chunks = split_into_chunks(content)
            
            print(f"   ✅ {len(chunks)} chunks générés")
            
            # Ajouter les chunks à la liste globale
            all_chunks.extend(chunks)
            
        except Exception as e:
            print(f"   ❌ Erreur lors du traitement: {e}")
    
    # Sauvegarder tous les chunks
    print(f"\n💾 Sauvegarde de {len(all_chunks)} chunks...")
    
    for i, chunk in enumerate(all_chunks):
        chunk_filename = f"swiss_chunk_{i:04d}.txt"
        chunk_path = output_dir / chunk_filename
        
        try:
            with open(chunk_path, 'w', encoding='utf-8') as f:
                f.write(chunk)
            print(f"   ✅ {chunk_filename} sauvegardé")
        except Exception as e:
            print(f"   ❌ Erreur sauvegarde {chunk_filename}: {e}")
    
    print(f"\n🎉 Extraction terminée!")
    print(f"📊 Total: {len(all_chunks)} chunks dans {output_dir}")
    
    # Afficher un aperçu du premier chunk
    if all_chunks:
        print(f"\n📋 Aperçu du premier chunk:")
        print("-" * 50)
        print(all_chunks[0][:500] + "...")
        print("-" * 50)

if __name__ == "__main__":
    extract_swiss_tax_documents() 
#!/bin/bash

echo "🚀 Démarrage de Fiscal.ia..."

# Vérifier si les embeddings existent
if [ ! -d "data/embeddings" ] || [ -z "$(ls -A data/embeddings 2>/dev/null)" ]; then
    echo "⚠️ Embeddings CGI manquants, génération en cours..."
    python -c "
from mistral_embeddings import generate_all_embeddings
print('Génération des embeddings CGI...')
generate_all_embeddings()
print('✅ Embeddings CGI générés')
"
fi

# Vérifier si les chunks CGI existent
if [ ! -d "data/cgi_chunks" ] || [ -z "$(ls -A data/cgi_chunks 2>/dev/null)" ]; then
    echo "⚠️ Chunks CGI manquants, extraction en cours..."
    python extract_cgi_articles.py
fi

# Vérifier si les embeddings BOFiP existent
if [ ! -d "data/bofip_embeddings" ] || [ -z "$(ls -A data/bofip_embeddings 2>/dev/null)" ]; then
    echo "⚠️ Embeddings BOFiP manquants, génération en cours..."
    python generate_bofip_embeddings.py
fi

echo "✅ Vérification des données terminée"

# Démarrer l'application
exec uvicorn main:app --host 0.0.0.0 --port $PORT 
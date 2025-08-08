#!/bin/bash

echo "🚀 Démarrage de Fiscal.ia avec Ollama..."

# Installer Ollama si possible sur Railway
if command -v curl > /dev/null 2>&1; then
    echo "📦 Installation d'Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh 2>/dev/null || echo "⚠️ Ollama non installable (environnement Railway restreint)"
fi

# Démarrer Ollama si disponible
if command -v ollama > /dev/null 2>&1; then
    echo "🤖 Démarrage d'Ollama en arrière-plan..."
    ollama serve > /dev/null 2>&1 &
    OLLAMA_PID=$!
    
    # Attendre qu'Ollama soit prêt
    echo "⏳ Attente du démarrage d'Ollama..."
    sleep 10
    
    # Télécharger un modèle léger pour Railway
    echo "📥 Téléchargement du modèle Mistral 7B..."
    ollama pull mistral:7b-instruct-q4_0 2>/dev/null || echo "⚠️ Modèle non téléchargeable"
    
    export LLM_ENDPOINT="http://localhost:11434"
    echo "✅ Ollama configuré sur $LLM_ENDPOINT"
else
    echo "⚠️ Ollama non disponible - Francis Particulier utilisera le fallback regex"
fi

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
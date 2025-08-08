#!/bin/sh
# Script de démarrage pour Railway avec Ollama intégré

echo "=== Démarrage Fiscal.ia avec Ollama ==="

# Installer Ollama si nécessaire
if ! command -v ollama &> /dev/null; then
    echo "Installation d'Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
fi

# Démarrer Ollama en arrière-plan
echo "Démarrage d'Ollama..."
ollama serve &
OLLAMA_PID=$!
echo "Ollama démarré avec PID: $OLLAMA_PID"

# Attendre qu'Ollama soit prêt
echo "Attente du démarrage d'Ollama..."
attempt=0
max_attempts=30
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "✅ Ollama est prêt!"
        break
    fi
    echo "Tentative $attempt/$max_attempts..."
    sleep 2
    attempt=$((attempt + 1))
done

# Télécharger le modèle si nécessaire
echo "Vérification du modèle llama3.1..."
if ! ollama list | grep -q "llama3.1"; then
    echo "Téléchargement du modèle llama3.1 (version légère)..."
    ollama pull llama3.1:8b || ollama pull mistral:7b || echo "Utilisation du fallback"
else
    echo "✅ Modèle llama3.1 déjà présent"
fi

# Configurer l'environnement pour pointer vers Ollama local
export LLM_ENDPOINT="http://localhost:11434"
echo "✅ LLM_ENDPOINT configuré: $LLM_ENDPOINT"

# Démarrer le backend Python
echo "Démarrage du backend Python sur le port ${PORT:-8000}..."
cd /app/backend || cd backend || true

# Utiliser uvicorn pour FastAPI
exec python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1

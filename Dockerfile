# Stage 1: Frontend Build
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copier les fichiers de configuration frontend
COPY frontend/package*.json ./

# Debug: Afficher le contenu du package.json
RUN cat package.json

# Installer les dépendances frontend avec gestion des dépendances optionnelles Rollup
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false

# Installation en deux étapes pour gérer Rollup correctement
RUN npm install
RUN npm rebuild

# Copier le code source frontend
COPY frontend/ .

# Variables d'environnement pour le build Vite
ARG VITE_SUPABASE_URL=https://lqxfjjtjxktjgpekugtf.supabase.co
ARG VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTgyMDMsImV4cCI6MjA2MzM3NDIwM30.-E66kbBxRAVcJcPdhhUJWq5BZB-2GRpiBEaGtiWLVrA

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Debug: Vérifier la structure du projet
RUN echo "=== Structure du projet ==="
RUN ls -la
RUN echo "=== Contenu du dossier src ==="
RUN ls -la src/
RUN echo "=== Contenu du dossier public ==="
RUN ls -la public/
RUN echo "=== Variables d'environnement Vite ==="
RUN echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL"
RUN echo "VITE_SUPABASE_ANON_KEY défini: $(test -n "$VITE_SUPABASE_ANON_KEY" && echo "OUI" || echo "NON")"

# Build l'application frontend
ENV NODE_ENV=production
RUN npm run build

# Debug: Vérifier le contenu du dossier dist
RUN echo "=== Contenu du dossier dist ==="
RUN ls -la dist/
RUN echo "=== Contenu du dossier dist/assets ==="
RUN ls -la dist/assets/
RUN echo "=== Contenu de /app/frontend/dist/index.html ==="
RUN cat /app/frontend/dist/index.html
RUN echo "=== Vérification des assets ==="
RUN find dist -type f -name "*.js" -o -name "*.css" -o -name "*.svg" | sort

# Stage 2: Production
FROM python:3.11-slim

WORKDIR /app

# Installer nginx et curl
RUN apt-get update && \
    apt-get install -y nginx curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Nettoyer le dossier /var/www/html
RUN rm -rf /var/www/html/*

# Copier le frontend buildé
COPY --from=frontend-builder /app/frontend/dist /var/www/html

# Debug: Vérifier le contenu après copie
RUN echo "=== Contenu de /var/www/html ==="
RUN ls -la /var/www/html/
RUN echo "=== Contenu de /var/www/html/assets ==="
RUN ls -la /var/www/html/assets/
RUN echo "=== Vérification des assets après copie ==="
RUN find /var/www/html -type f -name "*.js" -o -name "*.css" -o -name "*.svg" | sort

# Copier les fichiers backend
COPY backend/ ./backend

# Installer les dépendances Python
ENV PIP_NO_CACHE_DIR=1
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copier le script de démarrage
COPY start.sh .
COPY debug-start.sh .
RUN chmod +x start.sh
RUN chmod +x debug-start.sh

# Supprimer les fichiers .pyc potentiels pour forcer la réimportation
RUN find . -type d -name "__pycache__" -exec rm -r {} +
RUN find . -type f -name "*.pyc" -delete

# --- Début des commandes de débogage ---
RUN echo "=== Contenu de /app/backend/ pour débogage ==="
RUN ls -la /app/backend/
RUN echo "=== Tentative d'affichage de mistral_embeddings.py pour débogage ==="
RUN cat /app/backend/mistral_embeddings.py || echo "Impossible d'afficher mistral_embeddings.py"
RUN echo "=== Tentative d'importation directe pour débogage ==="
RUN python -c "from backend.mistral_embeddings import search_similar_bofip_chunks; print('Importation directe de search_similar_bofip_chunks réussie')" || echo "Importation directe échouée"
RUN python -c "import sys; print(sys.path)" # Afficher PYTHONPATH
# --- Fin des commandes de débogage ---

# Variables d'environnement pour Railway
ENV PORT=8080
ENV PYTHONPATH=/app/backend

# Exposer le port pour Railway
EXPOSE 8080

# Démarrer les services avec debug temporaire
CMD ["./debug-start.sh"] 
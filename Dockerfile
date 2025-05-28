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

# Debug: Vérifier la structure du projet
RUN ls -la
RUN ls -la src/

# Build l'application frontend
ENV NODE_ENV=production
RUN npm run build

# Debug: Vérifier le contenu du dossier dist
RUN echo "=== Contenu du dossier dist ==="
RUN ls -la dist/
RUN echo "=== Contenu du dossier dist/assets ==="
RUN ls -la dist/assets/
RUN echo "=== Contenu de index.html ==="
RUN cat dist/index.html

# Stage 2: Production
FROM python:3.11-slim

WORKDIR /app

# Installer nginx et curl
RUN apt-get update && \
    apt-get install -y nginx curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copier le frontend buildé
COPY --from=frontend-builder /app/frontend/dist /var/www/html

# Debug: Vérifier le contenu après copie
RUN echo "=== Contenu de /var/www/html ==="
RUN ls -la /var/www/html/
RUN echo "=== Contenu de /var/www/html/assets ==="
RUN ls -la /var/www/html/assets/

# Copier les fichiers backend
COPY backend/ ./backend

# Installer les dépendances Python
ENV PIP_NO_CACHE_DIR=1
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copier le script de démarrage
COPY start.sh .
RUN chmod +x start.sh

# Variables d'environnement pour Railway
ENV PORT=8080
ENV PYTHONPATH=/app/backend

# Exposer le port pour Railway
EXPOSE 8080

# Démarrer les services
CMD ["./start.sh"] 
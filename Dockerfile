# Stage 1: Frontend Build
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copier les fichiers de configuration frontend
COPY frontend/package*.json ./

# Installer les dépendances frontend (toutes nécessaires pour le build)
ENV NODE_OPTIONS="--max-old-space-size=384"
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false
RUN npm install --no-optional

# Copier le code source frontend
COPY frontend/ .

# Build l'application frontend
ENV NODE_ENV=production
RUN npm run build

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
ENV PORT=3000
ENV PYTHONPATH=/app/backend

# Exposer le port pour Railway
EXPOSE 3000

# Démarrer les services
CMD ["./start.sh"] 
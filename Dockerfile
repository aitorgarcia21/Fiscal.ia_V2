# Stage 1: Frontend Build
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copier les fichiers de configuration frontend
COPY frontend/package*.json ./

# Installer les dépendances frontend avec une limite de mémoire plus basse
ENV NODE_OPTIONS=--max-old-space-size=512
RUN npm install --legacy-peer-deps

# Copier le code source frontend
COPY frontend/ .

# Build l'application frontend avec une limite de mémoire plus basse
RUN npm run build

# Stage 2: Backend Build
FROM python:3.11-slim AS backend-builder

WORKDIR /app/backend

# Copier les fichiers de configuration backend
COPY backend/requirements.txt .

# Installer les dépendances système nécessaires à psycopg2-binary
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Installer les dépendances backend avec une limite de mémoire
ENV PIP_NO_CACHE_DIR=1
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source backend
COPY backend/ .

# Stage 3: Production
FROM python:3.11-slim

WORKDIR /app

# Installer nginx et les outils nécessaires avec nettoyage
RUN apt-get update && \
    apt-get install -y --no-install-recommends nginx curl && \
    rm -rf /var/lib/apt/lists/*

# Copier le frontend buildé
COPY --from=frontend-builder /app/frontend/dist /var/www/html

# Copier le backend et ses dépendances
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin
COPY --from=backend-builder /app/backend ./backend

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copier le script de démarrage
COPY start.sh .
RUN chmod +x start.sh

# Exposer le port
EXPOSE $PORT

# Démarrer les services
CMD ["./start.sh"] 
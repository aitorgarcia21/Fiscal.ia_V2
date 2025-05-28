# Stage 1: Frontend Build
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copier les fichiers de configuration frontend
COPY frontend/package*.json ./

# Installer les dépendances frontend
RUN npm install --legacy-peer-deps

# Copier le code source frontend
COPY frontend/ .

# Build l'application frontend
RUN npm run build

# Stage 2: Backend Build
FROM python:3.11-slim AS backend-builder

WORKDIR /app/backend

# Copier les fichiers de configuration backend
COPY backend/requirements.txt .

# Installer les dépendances backend
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source backend
COPY backend/ .

# Stage 3: Production
FROM python:3.11-slim

WORKDIR /app

# Installer serve pour le frontend
RUN npm install -g serve

# Copier le frontend buildé
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copier le backend
COPY --from=backend-builder /app/backend ./backend

# Copier le script de démarrage
COPY start.sh .
RUN chmod +x start.sh

# Exposer les ports
EXPOSE $PORT

# Démarrer les deux services
CMD ["./start.sh"] 
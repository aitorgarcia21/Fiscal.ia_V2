FROM node:20-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY frontend/package*.json ./

# Installer les dépendances
RUN npm ci --only=production --legacy-peer-deps

# Copier le code source
COPY frontend/ .

# Build l'application pour la production
RUN npm run build

# Stage de production
FROM node:20-alpine AS runner

WORKDIR /app

# Installer serve globalement
RUN npm install -g serve

# Copier les fichiers buildés
COPY --from=builder /app/dist ./dist

# Exposer le port (Railway utilise la variable PORT)
EXPOSE $PORT

# Démarrer l'application avec le bon port
CMD serve -s dist -l ${PORT:-3000} 
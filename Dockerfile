FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app/frontend

# Copier les fichiers de configuration
COPY frontend/package*.json ./

# Installer les dépendances avec legacy-peer-deps
RUN npm install --legacy-peer-deps

# Copier le reste des fichiers du frontend
COPY frontend/ .

# Vérifier que les fichiers sont bien copiés
RUN ls -la src/

# Build l'application
RUN npm run build

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"] 
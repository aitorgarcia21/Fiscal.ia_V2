FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de configuration
COPY frontend/package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers
COPY frontend/ .

# Build l'application
RUN npm run build

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"] 
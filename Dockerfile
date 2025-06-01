# Stage 1: Frontend Build
FROM node:20-alpine AS frontend-builder

# CACHE BUSTER FINAL - BUILD DU 01/06/2025 16:00 UTC
RUN echo "FINAL_BUILD_01062025_1600" > /tmp/final_cache_bust.txt

WORKDIR /app/frontend
COPY frontend/package*.json ./
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false
RUN npm install && npm rebuild
COPY frontend/ .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_TRUELAYER_CLIENT_ID
ARG VITE_TRUELAYER_ENV
ARG VITE_API_BASE_URL
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV VITE_TRUELAYER_CLIENT_ID=${VITE_TRUELAYER_CLIENT_ID}
ENV VITE_TRUELAYER_ENV=${VITE_TRUELAYER_ENV}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && \
    apt-get install -y nginx curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY --from=frontend-builder /app/frontend/dist /var/www/html
COPY backend/ ./backend

ENV PIP_NO_CACHE_DIR=1
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh .
RUN chmod +x start.sh

# Nettoyage final __pycache__ pour la prod
RUN find . -type d -name "__pycache__" -exec rm -r {} +
RUN find . -type f -name "*.pyc" -delete

ENV PORT=8080
# Assurez-vous que PYTHONPATH est correct pour les imports `backend.`
ENV PYTHONPATH=/app

EXPOSE $PORT
CMD ["./start.sh"] 
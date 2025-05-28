#!/bin/bash

# Fonction pour gérer l'arrêt propre
cleanup() {
    echo "Arrêt des services..."
    kill $BACKEND_PID 2>/dev/null
    nginx -s quit 2>/dev/null
    exit 0
}

# Configurer le gestionnaire de signal
trap cleanup SIGTERM SIGINT

# Configurer le port pour Railway
export PORT=${PORT:-3000}

echo "=== Configuration ==="
echo "PORT: $PORT"
echo "PYTHONPATH: $PYTHONPATH"

# Aller dans le répertoire de l'application
cd /app

# Vérifier que les fichiers existent
if [ ! -f "backend/main.py" ]; then
    echo "Erreur: backend/main.py non trouvé"
    exit 1
fi

if [ ! -d "/var/www/html" ]; then
    echo "Erreur: /var/www/html non trouvé"
    exit 1
fi

# Vérifier que le frontend est bien copié
echo "=== Vérification du frontend ==="
ls -la /var/www/html/
if [ ! -f "/var/www/html/index.html" ]; then
    echo "Erreur: index.html non trouvé dans /var/www/html"
    exit 1
fi

# Démarrer le backend en arrière-plan
echo "=== Démarrage du backend sur le port 8000 (localhost uniquement) ==="
cd backend

# Ajouter le répertoire backend au PYTHONPATH
export PYTHONPATH="/app/backend:$PYTHONPATH"

# IMPORTANT: Démarrer uvicorn sur 127.0.0.1 UNIQUEMENT pour éviter l'exposition directe par Railway
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --log-level info &
BACKEND_PID=$!

# Attendre que le backend soit prêt
echo "Attente du démarrage du backend..."
sleep 10

# Vérifier que le processus backend est toujours en cours
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Erreur: Le processus backend s'est arrêté"
    exit 1
fi

# Vérifier que le backend répond
echo "Vérification de la santé du backend..."
for i in {1..30}; do
    if curl -f http://127.0.0.1:8000/health > /dev/null 2>&1; then
        echo "Backend démarré avec succès"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Erreur: Le backend ne répond pas après 30 tentatives"
        exit 1
    fi
    echo "Tentative $i/30..."
    sleep 2
done

# Configurer nginx
echo "=== Configuration de Nginx ==="
cd /app

# Remplacer le port dans la configuration nginx
sed -i "s/listen 3000;/listen $PORT;/g" /etc/nginx/nginx.conf

# Vérifier la configuration nginx
nginx -t
if [ $? -ne 0 ]; then
    echo "Erreur: Configuration nginx invalide"
    exit 1
fi

# Démarrer nginx au premier plan sur toutes les interfaces
echo "=== Démarrage de nginx sur le port $PORT (toutes interfaces) ==="
nginx -g 'daemon off;' &
NGINX_PID=$!

# Attendre un peu pour que nginx démarre
sleep 5

# Vérifier que nginx fonctionne
if ! kill -0 $NGINX_PID 2>/dev/null; then
    echo "Erreur: Nginx ne s'est pas démarré correctement"
    exit 1
fi

echo "=== Services démarrés avec succès ==="
echo "✅ Backend: http://127.0.0.1:8000 (localhost uniquement)"
echo "✅ Frontend + API: http://0.0.0.0:$PORT (exposé publiquement)"
echo "✅ API accessible sur: /api/"

# Attendre l'arrêt
wait 
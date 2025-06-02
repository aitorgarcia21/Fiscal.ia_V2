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
export PORT=${PORT:-8080}

echo "=== Configuration ==="
echo "PORT: $PORT"

# Mettre à jour la configuration nginx avec le bon port
sed -i "s/listen 8080;/listen $PORT;/g" /etc/nginx/nginx.conf

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

# Supprimer le fichier nginx par défaut qui pourrait interférer
if [ -f "/var/www/html/index.nginx-debian.html" ]; then
    echo "Suppression du fichier nginx par défaut..."
    rm -f /var/www/html/index.nginx-debian.html
fi

if [ ! -f "/var/www/html/index.html" ]; then
    echo "Erreur: index.html non trouvé dans /var/www/html"
    exit 1
fi

# Ajouter le répertoire backend au PYTHONPATH
export PYTHONPATH=$PYTHONPATH:/app/backend

# Démarrer le backend en arrière-plan
echo "=== Démarrage du backend ==="
cd backend
# Utiliser plusieurs workers et augmenter le timeout
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --log-level info --workers 2 --timeout-keep-alive 300 &
BACKEND_PID=$!

# Attendre que le backend soit prêt
echo "Attente du démarrage du backend..."
sleep 10

# Vérifier que le backend répond
echo "Vérification de la santé du backend..."
for i in {1..10}; do
    if curl -f http://127.0.0.1:8000/health > /dev/null 2>&1; then
        echo "Backend démarré avec succès"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "Erreur: Le backend ne répond pas"
        exit 1
    fi
    echo "Tentative $i/10..."
    sleep 2
done

# Configurer nginx
echo "=== Configuration de Nginx ==="
cd /app

# Vérifier la configuration nginx
nginx -t
if [ $? -ne 0 ]; then
    echo "Erreur: Configuration nginx invalide"
    exit 1
fi

# Démarrer nginx
echo "=== Démarrage de nginx sur le port $PORT ==="
nginx -g 'daemon off;' &
NGINX_PID=$!

sleep 3

echo "=== Services démarrés ==="
echo "✅ Backend: http://127.0.0.1:8000"
echo "✅ Frontend: http://0.0.0.0:$PORT"

# Attendre l'arrêt
wait 
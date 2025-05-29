#!/bin/bash

echo "=== DEBUG RAILWAY STARTUP ==="
echo "Date: $(date)"
echo "PWD: $(pwd)"
echo "User: $(whoami)"

echo -e "\n=== VARIABLES D'ENVIRONNEMENT ==="
echo "PORT: $PORT"
echo "MISTRAL_API_KEY: ${MISTRAL_API_KEY:+[SET]} ${MISTRAL_API_KEY:+${MISTRAL_API_KEY:0:10}...}"
echo "VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
echo "VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:+[SET]} ${VITE_SUPABASE_ANON_KEY:+${VITE_SUPABASE_ANON_KEY:0:10}...}"

echo -e "\n=== STRUCTURE DES FICHIERS ==="
echo "Contenu racine:"
ls -la
echo -e "\nContenu /var/www/html:"
ls -la /var/www/html/ || echo "Dossier /var/www/html non trouvé"
echo -e "\nContenu backend:"
ls -la backend/

echo -e "\n=== TEST PYTHON ==="
python --version
python -c "import sys; print('Python path:', sys.path)"

echo -e "\n=== TEST IMPORT BACKEND ==="
cd backend
python -c "
try:
    from assistant_fiscal import get_fiscal_response
    print('✅ Import assistant_fiscal OK')
except Exception as e:
    print(f'❌ Erreur import assistant_fiscal: {e}')

try:
    from main import app
    print('✅ Import main.py OK')
except Exception as e:
    print(f'❌ Erreur import main.py: {e}')
"

echo -e "\n=== DEMARRAGE BACKEND ==="
exec python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} --log-level debug 
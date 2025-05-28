#!/bin/bash

# Démarrer le backend en arrière-plan
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 &

# Démarrer le frontend
cd ../frontend && serve -s dist -l ${PORT:-3000} 
import sys, pathlib, os

# Ajoute le répertoire racine du projet au PYTHONPATH pour les imports des tests
project_root = pathlib.Path(__file__).resolve().parents[1]
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root)) 
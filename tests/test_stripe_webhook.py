import sys
import pathlib
project_root = pathlib.Path(__file__).resolve().parents[1]
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

import json
from fastapi.testclient import TestClient

# Importer après patch pour éviter l'initialisation Supabase
import importlib
import types

# Créer un faux module Supabase minimaliste pour éviter les appels réseau
mock_supabase = types.SimpleNamespace()
mock_supabase.auth = types.SimpleNamespace(admin=types.SimpleNamespace(invite_user_by_email=lambda *args, **kwargs: None))
mock_supabase.table = lambda *args, **kwargs: types.SimpleNamespace(upsert=lambda *a, **k: types.SimpleNamespace(execute=lambda: None))

# Charger le module dependencies et le patcher
import sys
dependencies_mod = importlib.import_module('backend.dependencies')
dependencies_mod.supabase = mock_supabase

# Ensuite seulement on importe main pour créer l'app
backend_main = importlib.import_module('backend.main')
# S'assure que le champ global est bien le mock
backend_main.supabase = mock_supabase  # Par sécurité

client = TestClient(backend_main.app)

def test_stripe_checkout_completed_invites_user():
    payload = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "payment_status": "paid",
                "customer_email": "client_test@example.com",
                "subscription": "sub_12345",
                "metadata": {"price_id": "price_abc"}
            }
        }
    }
    response = client.post("/api/webhooks/stripe", json=payload)
    assert response.status_code == 200
    assert response.json() == {"received": True} 
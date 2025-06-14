import json
import uuid
from pathlib import Path
from typing import Dict, List
from .supabase_client import get_supabase

DATA_PATH = Path(__file__).parent / "data" / "clients.json"
DATA_PATH.parent.mkdir(exist_ok=True, parents=True)

# Utilisation de Supabase si les variables d'environnement sont présentes.
_USE_SUPABASE = False
try:
    _supabase = get_supabase()
    _USE_SUPABASE = True
except Exception:
    _USE_SUPABASE = False  # fallback JSON

TABLE = "clients"

if _USE_SUPABASE:

    def create_client(profile: Dict) -> str:
        from uuid import uuid4
        cid = str(uuid4())
        profile["id"] = cid
        _supabase.table(TABLE).insert(profile).execute()
        return cid

    def get_client(client_id: str) -> Dict | None:
        res = _supabase.table(TABLE).select("*").eq("id", client_id).execute()
        return res.data[0] if res.data else None

    def update_client(client_id: str, updates: Dict) -> bool:
        res = _supabase.table(TABLE).update(updates).eq("id", client_id).execute()
        return bool(res.data)

    def list_clients() -> List[Dict]:
        res = _supabase.table(TABLE).select("*").execute()
        return res.data or []

else:
    # fallback JSON (ancien comportement)
    def _load() -> Dict[str, Dict]:
        if DATA_PATH.exists():
            with DATA_PATH.open("r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def _save(clients: Dict[str, Dict]):
        with DATA_PATH.open("w", encoding="utf-8") as f:
            json.dump(clients, f, ensure_ascii=False, indent=2)

    def create_client(profile: Dict) -> str:
        clients = _load()
        client_id = str(uuid.uuid4())
        profile["id"] = client_id
        clients[client_id] = profile
        _save(clients)
        return client_id

    def get_client(client_id: str) -> Dict | None:
        return _load().get(client_id)

    def update_client(client_id: str, updates: Dict) -> bool:
        clients = _load()
        if client_id not in clients:
            return False
        clients[client_id].update(updates)
        _save(clients)
        return True

    def list_clients() -> List[Dict]:
        return list(_load().values()) 
import os
from supabase import create_client, Client
from functools import lru_cache


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        raise RuntimeError("Variables d'environnement SUPABASE_URL et SUPABASE_SERVICE_KEY manquantes")
    return create_client(url, key) 
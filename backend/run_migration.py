import os
from supabase import create_client, Client
import time

# Configuration Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Les variables d'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies")

# Initialisation du client Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def run_migration():
    try:
        # Lire le fichier de migration
        with open('migrations/add_new_profile_fields.sql', 'r') as file:
            migration_sql = file.read()

        # Exécuter la migration
        print("Début de la migration...")
        result = supabase.rpc('exec_sql', {'sql': migration_sql}).execute()
        
        print("Migration terminée avec succès!")
        return True
    except Exception as e:
        print(f"Erreur lors de la migration: {e}")
        return False

if __name__ == "__main__":
    run_migration() 
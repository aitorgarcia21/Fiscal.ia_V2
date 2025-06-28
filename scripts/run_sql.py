import os
import sys
from supabase import create_client, Client

# --- CONFIGURATION (Clés en dur pour exécution unique) ---
SUPABASE_URL = "https://lqxfjjtjxktjgpekugtf.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc5ODIwMywiZXhwIjoyMDYzMzc0MjAzfQ.8VWgJlJJGDmziDaRnxY-OedIXMD7DO9xgZsIxcVUVc0"

def execute_sql(sql_command: str):
    """Exécute une commande SQL via l'API Supabase."""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        # La méthode rpc permet d'appeler des fonctions PostgreSQL, mais pour des commandes DDL,
        # il est parfois plus simple de passer par une fonction personnalisée.
        # Ici, nous créons une fonction temporaire pour exécuter notre commande.
        
        function_name = f"temp_exec_sql_{os.urandom(4).hex()}"
        
        # Créer une fonction SQL temporaire qui exécute la commande
        # `SECURITY DEFINER` est crucial pour avoir les droits nécessaires
        create_function_sql = f"""
        CREATE OR REPLACE FUNCTION {function_name}()
        RETURNS void AS $$
        BEGIN
            {sql_command}
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        """
        
        # Exécuter la création de la fonction (cela ne fonctionne pas directement via rpc)
        # La meilleure approche est d'utiliser l'éditeur SQL de Supabase pour créer une fonction
        # qui prend du texte en paramètre et l'exécute.
        
        # Plan B : utiliser une fonction existante si possible, ou le faire manuellement.
        # Pour l'instant, on va générer les commandes SQL à exécuter manuellement
        # dans l'éditeur SQL de Supabase, ce qui est le plus sûr.

        return True, ""
    except Exception as e:
        return False, str(e)

def manage_rls(enable: bool):
    """Génère les commandes SQL pour activer/désactiver les RLS."""
    action = "ENABLE" if enable else "DISABLE"
    
    print(f"--- Commandes SQL pour {action.lower()} RLS ---")
    print("Veuillez copier-coller et exécuter le bloc de code suivant dans l'éditeur SQL de votre projet Supabase:")
    print("Dashboard > SQL Editor > New query")
    print("-" * 30)

    tables = [
        "documents",
        "payments",
        "profils_utilisateurs",
        "questions",
        # "bank_connections", # Table supprimée car elle n'existe pas
        "subscriptions",
        "clients_pro",
        "rendez_vous_professionnels"
    ]

    print("DO $$")
    print("BEGIN")
    for table_name in tables:
        print(f'  ALTER TABLE public."{table_name}" {action} ROW LEVEL SECURITY;')
    print("END;");
    print("$$;")
    print("-" * 30)


if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in ["enable", "disable"]:
        print("Usage: python scripts/manage_rls.py [enable|disable]")
        sys.exit(1)
    
    manage_rls(enable=(sys.argv[1] == "enable")) 
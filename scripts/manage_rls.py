import os
import sys
import psycopg2
from dotenv import load_dotenv

# --- CONFIGURATION (Clé en dur pour exécution unique) ---
DATABASE_URL = "postgresql://postgres.lqxfjjtjxktjgpekugtf:21AiPa01....@aws-0-eu-west-3.pooler.supabase.com:6543/postgres"

def get_db_connection():
    """Établit la connexion à la base de données PostgreSQL."""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except psycopg2.OperationalError as e:
        print(f"Erreur de connexion à la base de données : {e}", file=sys.stderr)
        sys.exit(1)

def manage_rls(enable: bool):
    """Active ou désactive les politiques RLS sur toutes les tables du schéma public."""
    action = "ENABLE" if enable else "DISABLE"
    action_text = "Activation" if enable else "Désactivation"
    
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Lister toutes les tables du schéma public
        cur.execute("""
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public';
        """)
        tables = cur.fetchall()

        if not tables:
            print("Aucune table trouvée dans le schéma public.")
            return

        print(f"--- {action_text} des RLS pour toutes les tables du schéma 'public' ---")

        for table in tables:
            table_name = table[0]
            try:
                # Construire la commande SQL pour éviter l'injection
                # On utilise des placeholders pour les valeurs, mais pas pour les identifiants de table
                # Il faut donc s'assurer que table_name est safe (ce qui est le cas ici, venant de pg_tables)
                sql_command = f'ALTER TABLE public."{table_name}" {action} ROW LEVEL SECURITY;'
                cur.execute(sql_command)
                print(f"  - RLS {action_text.lower().replace('ion', 'ées')} sur la table : {table_name}")
            except Exception as e:
                print(f"  - Erreur sur la table {table_name}: {e}")
        
        conn.commit()
        print(f"\nOpération terminée. Les RLS ont été {action_text.lower().replace('ion', 'ées')}.")

    except Exception as e:
        print(f"Une erreur générale est survenue : {e}", file=sys.stderr)
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in ["enable", "disable"]:
        print("Usage: python scripts/manage_rls.py [enable|disable]")
        sys.exit(1)
    
    confirm = input(f"Êtes-vous sûr de vouloir {sys.argv[1].upper()} les RLS pour TOUTES les tables ? (oui/non): ")
    if confirm.lower().strip() == 'oui':
        manage_rls(enable=(sys.argv[1] == "enable"))
    else:
        print("Opération annulée.") 
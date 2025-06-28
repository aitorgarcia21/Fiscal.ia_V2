import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Charger les variables d'environnement depuis le fichier .env à la racine
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(project_root, '.env')
if not os.path.exists(dotenv_path):
    print("Erreur : Fichier .env non trouvé à la racine du projet.")
    sys.exit(1)
load_dotenv(dotenv_path=dotenv_path)

# --- CONFIGURATION ---
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
# IMPORTANT : Pour créer un utilisateur, il faut la clé de service (droits admin)
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Erreur : VITE_SUPABASE_URL et SUPABASE_SERVICE_KEY doivent être définis dans votre fichier .env.")
    sys.exit(1)

# --- INFORMATIONS UTILISATEUR ---
USER_EMAIL = "bz@break-expertise.com"
USER_PASSWORD = "Password_BZ_2024!#"
USER_FULL_NAME = "BZ Break Expertise"
USER_ACCOUNT_TYPE = "particulier" # ou "professionnel"

def create_user():
    """Crée un utilisateur dans Supabase Auth et son profil associé."""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("Connexion à Supabase... OK")

        # 1. Créer l'utilisateur dans Supabase Auth
        print(f"Création de l'utilisateur '{USER_EMAIL}'...")
        auth_response = supabase.auth.admin.create_user({
            "email": USER_EMAIL,
            "password": USER_PASSWORD,
            "email_confirm": True, # Marquer l'email comme déjà confirmé
            "user_metadata": {"full_name": USER_FULL_NAME}
        })
        
        user = auth_response.user
        if not user:
            print(f"Erreur lors de la création de l'utilisateur : {auth_response}")
            # Vérifier si l'utilisateur existe déjà
            try:
                existing_user = supabase.auth.admin.get_user_by_email(USER_EMAIL).user
                if existing_user:
                    print(f"L'utilisateur avec l'email '{USER_EMAIL}' existe déjà. ID: {existing_user.id}")
                    user = existing_user
                else:
                    sys.exit(1)
            except Exception:
                print("Impossible de récupérer l'utilisateur existant.")
                sys.exit(1)

        print(f"Utilisateur créé/trouvé dans Auth. ID: {user.id}")

        # 2. Créer ou mettre à jour le profil dans la table 'profils_utilisateurs'
        print("Création/Mise à jour du profil utilisateur...")
        profile_data = {
            "user_id": user.id,
            "email": USER_EMAIL,
            "full_name": USER_FULL_NAME,
            "taper": USER_ACCOUNT_TYPE
        }
        
        profile_response = supabase.table("profils_utilisateurs").upsert(profile_data).execute()
        
        if profile_response.data:
            print("Profil utilisateur créé/mis à jour avec succès.")
            print("\n--- Résumé ---")
            print(f"Email: {USER_EMAIL}")
            print(f"Mot de passe: {USER_PASSWORD}")
            print(f"Rôle: {USER_ACCOUNT_TYPE}")
            print("L'utilisateur peut maintenant se connecter.")
        else:
            print(f"Erreur lors de la création du profil : {profile_response.error}")

    except Exception as e:
        print(f"Une erreur inattendue est survenue : {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_user() 
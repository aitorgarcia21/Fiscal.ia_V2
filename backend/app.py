from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
import json
import os
import sqlite3
import sys
from pathlib import Path
from mistral_embeddings import search_similar_articles, get_embedding
import requests
import pytesseract
from PIL import Image
import io
from supabase import create_client, Client
import datetime
import PyPDF2
import tempfile
import re
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import hashlib
from dotenv import load_dotenv
import stripe
from fastapi import APIRouter
from fastapi.responses import JSONResponse

# Ajout du chemin du dossier backend
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

app = FastAPI()

# Configuration du port
import uvicorn
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8082)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3003", "http://127.0.0.1:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration Mistral
MISTRAL_API_KEY = os.environ.get("MISTRAL_API_KEY")
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {MISTRAL_API_KEY}",
    "Content-Type": "application/json"
}

# Initialize Supabase client
# Utilisez les variables d'environnement pour les clés sensibles
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Les variables d'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Configuration de Tesseract
pytesseract.pytesseract.tesseract_cmd = r'/usr/local/bin/tesseract'  # Ajustez selon votre installation

# Configuration TrueLayer
TRUELAYER_CLIENT_ID = os.environ.get("TRUELAYER_CLIENT_ID")
TRUELAYER_CLIENT_SECRET = os.environ.get("TRUELAYER_CLIENT_SECRET")
TRUELAYER_REDIRECT_URI = os.environ.get("TRUELAYER_REDIRECT_URI")

if not all([TRUELAYER_CLIENT_ID, TRUELAYER_CLIENT_SECRET, TRUELAYER_REDIRECT_URI]):
    raise ValueError("Les variables d'environnement TrueLayer doivent être définies")

def get_user_profile(user_id: str) -> Dict[str, Any] | None:
    """Récupère le profil utilisateur depuis Supabase."""
    try:
        response = supabase.from_('profils_utilisateurs').select('*').eq('user_id', user_id).single().execute()
        return response.data
    except Exception as e:
        print(f"Erreur lors de la récupération du profil utilisateur {user_id}: {e}")
        return None

def update_user_profile(user_id: str, profile_data: Dict[str, Any]) -> bool:
    """Met à jour le profil utilisateur dans Supabase."""
    try:
        # Enlève les champs gérés automatiquement par la DB ou non modifiables ici
        data_to_update = {k: v for k, v in profile_data.items() if k not in ['identifiant', 'user_id', 'created_at']}
        # S'assurer que interaction_history est traité comme jsonb
        if 'interaction_history' in data_to_update and isinstance(data_to_update['interaction_history'], list):
             data_to_update['interaction_history'] = json.dumps(data_to_update['interaction_history'])

        # Ajouter le timestamp de mise à jour
        data_to_update['updated_at'] = datetime.datetime.now(datetime.timezone.utc).isoformat()

        response = supabase.from_('profils_utilisateurs').update(data_to_update).eq('user_id', user_id).execute()
        response.raise_for_status()
        print(f"Profil utilisateur {user_id} mis à jour avec succès.")
        return True
    except Exception as e:
        print(f"Erreur lors de la mise à jour du profil utilisateur {user_id}: {e}")
        return False

def extract_insights_from_response(question: str, response_text: str) -> List[Dict[str, Any]]:
    """Analyse la réponse pour extraire des insights sur le profil fiscal.
    Ceci est une implémentation simple. Une version plus sophistiquée utiliserait un modèle NLP.
    """
    insights = []
    # Exemple très basique: chercher des mots clés liés aux revenus, situation, etc.
    # Une implémentation réelle nécessiterait une analyse sémantique plus poussée.
    if "revenu" in response_text.lower() or "salaire" in response_text.lower():
        insights.append({"type": "revenus", "value": "mentionné dans conversation", "confidence": 0.5})
    if "mariage" in response_text.lower() or "pacs" in response_text.lower() or "célibataire" in response_text.lower():
         insights.append({"type": "situation", "value": "mentionné dans conversation", "confidence": 0.5})
    # Ajoutez d'autres logiques d'extraction d'insights ici
    return insights

def ask_mistral_with_context(question: str, context: str) -> str:
    prompt = f"""
Tu es Francis, un assistant fiscaliste pédagogue et sympathique. Tu dois aider l'utilisateur à comprendre sa situation fiscale de manière simple et accessible.

Contexte du CGI :
{context}

Question de l'utilisateur :
{question}

Instructions pour ta réponse :
1. Adapte ton style de réponse au contexte :
   - Si c'est une salutation, réponds brièvement et amicalement
   - Si c'est une question simple, réponds de manière concise
   - Si c'est une question complexe, prends le temps d'expliquer en détail
   - Si c'est une question technique, utilise les articles du CGI de manière naturelle

2. Sois toujours :
   - Naturel dans ton langage
   - Pédagogue dans tes explications
   - Rassurant dans ton ton
   - Concret dans tes exemples

3. Évite :
   - Le jargon fiscal complexe
   - Les réponses trop longues si la question est simple
   - Les réponses trop courtes si la question est complexe
   - De poser des questions à l'utilisateur

Réponse :
"""
    try:
        response = requests.post(
            MISTRAL_API_URL,
            headers=headers,
            json={
                "model": "mistral-large-latest",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 400
            }
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        raise Exception(f"Erreur lors de l'appel à Mistral : {str(e)}")

class ChatRequest(BaseModel):
    question: str
    profile: Dict[str, Any]
    chatMode: str = 'libre'

def is_user_active(user_id: str) -> bool:
    profile = get_user_profile(user_id)
    return profile and profile.get('is_active', False)

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    question = data.get("question")
    profile_data = data.get("profile", {})
    chat_mode = data.get("chatMode", "libre")
    user_id = data.get("userId")

    if not question or not user_id:
        return {"response": "Veuillez fournir une question et un identifiant utilisateur."}

    # Vérification de l'activation du compte
    if not is_user_active(user_id):
        return {"response": "Votre compte n'est pas encore activé. Merci de finaliser votre paiement pour accéder à l'application.", "insights": []}

    # 1. Charger le profil utilisateur complet depuis Supabase
    full_profile = get_user_profile(user_id)

    # Si le profil n'existe pas, créer un profil de base
    if not full_profile:
        print(f"Profil non trouvé pour l'utilisateur {user_id}. Création d'un profil de base.")
        base_profile = {
            "user_id": user_id,
            "situation": profile_data.get("situation", ''),
            "revenus": profile_data.get("revenus", ''),
            "patrimoine": profile_data.get("patrimoine", ''),
            "objectifs": profile_data.get("objectifs", ''),
            "tolerance_risque": profile_data.get("toleranceRisque", ''),
            "horizon_investissement": profile_data.get("horizonInvestissement", ''),
            "nombre_enfants": profile_data.get("nombreEnfants", 0),
            "type_revenus": profile_data.get("typeRevenus", ''),
            "autres_revenus": profile_data.get("autresRevenus", ''),
            "interaction_history": [],
            "last_interaction": None,
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        # Tentez d'insérer le profil de base
        try:
            # L'insertion devrait aussi renvoyer le profil complet avec l'id généré
            insert_response = supabase.from_('profils_utilisateurs').insert([base_profile]).execute()
            # Supabase client execute() returns a Response object, data is in response.data
            if insert_response.data:
                 full_profile = insert_response.data[0] # Récupérer le profil inséré avec les champs par défaut (id, timestamps)
                 print(f"Profil de base créé pour l'utilisateur {user_id}.")
            else:
                 raise Exception("Aucune donnée renvoyée après l'insertion du profil.")

        except Exception as e:
             print(f"Erreur lors de la création du profil de base pour {user_id}: {e}")
             # Si la création échoue (par exemple, si un profil a été créé entre-temps), tentez de le récupérer à nouveau
             full_profile = get_user_profile(user_id)
             if not full_profile:
                  return {"response": "Erreur critique: Impossible de charger ou créer le profil utilisateur.", "insights": []}

    # 2. Préparer le contexte pour Francis en utilisant le profil complet
    # C'est ici que vous intégrerez les données du profil dans le prompt de Francis
    profile_context = f"\n\nInformations de profil utilisateur: " \
                      f"Situation familiale: {full_profile.get('situation', 'non spécifié')}, " \
                      f"Nombre d'enfants: {full_profile.get('nombre_enfants', 'non spécifié')}, " \
                      f"Revenus annuels: {full_profile.get('revenus', 'non spécifié')}, " \
                      f"Type de revenus: {full_profile.get('type_revenus', 'non spécifié')}, " \
                      f"Autres revenus: {full_profile.get('autres_revenus', 'non spécifié')}, " \
                      f"Patrimoine: {full_profile.get('patrimoine', 'non spécifié')}, " \
                      f"Objectifs: {full_profile.get('objectifs', 'non spécifié')}, " \
                      f"Tolérance risque: {full_profile.get('tolerance_risque', 'non spécifié')}, " \
                      f"Horizon investissement: {full_profile.get('horizon_investissement', 'non spécifié')}."

    # Ajouter l'historique de conversation récent au contexte (optionnel, peut consommer beaucoup de tokens)
    # recent_history = "\n\nHistorique récent:\n" + "\n".join([f"Q: {h['question']}\nA: {h['response']}" for h in full_profile.get('interaction_history', [])])
    # context_for_francis = profile_context + recent_history
    context_for_francis = profile_context

    # Récupérer les articles pertinents basés sur la question et le contexte du profil
    # Assurez-vous que search_similar_articles peut utiliser le contexte si nécessaire
    relevant_articles = search_similar_articles(question + context_for_francis) # Exemple: Utiliser question + contexte
    # Formater les articles pour les passer à ask_mistral_with_context
    formatted_articles = "\n".join([f"Article: {a['content']}" for a in relevant_articles]) # Adaptez selon la structure de vos résultats

    # 3. Obtenir la réponse de Francis en utilisant le contexte et les articles
    response_text = ask_mistral_with_context(question, formatted_articles)

    # 4. Extraire les insights de la réponse de Francis
    insights = extract_insights_from_response(question, response_text)

    # 5. Mettre à jour le profil utilisateur avec les insights et l'historique
    # Cloner le profil complet pour éviter de modifier l'objet directement si non nécessaire
    updated_profile_data = full_profile.copy()

    # Appliquer les insights au profil (logique simple: remplacer si confidence est élevée)
    for insight in insights:
        # TODO: Implémenter une logique de fusion plus intelligente si confidence est basse
        if insight['confidence'] > 0.8: # Utiliser le même seuil que dans le frontend
             # Assurez-vous que le type correspond à une colonne dans la table profils_utilisateurs
            if insight['type'] in updated_profile_data:
                 updated_profile_data[insight['type']] = insight['value']
            else:
                 print(f"Avertissement: Type d'insight inconnu: {insight['type']}")

    # Ajouter l'interaction actuelle à l'historique
    current_interaction = {
        "question": question,
        "response": response_text,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(), # Utiliser le timestamp actuel pour l'interaction
        "insights": insights # Stocker les insights extraits pour référence
    }
    # Assurez-vous que interaction_history est une liste avant d'ajouter
    if not isinstance(updated_profile_data.get('interaction_history'), list):
         updated_profile_data['interaction_history'] = []

    updated_profile_data['interaction_history'].append(current_interaction)
    # Limiter la taille de l'historique pour éviter une trop grande taille de JSON
    updated_profile_data['interaction_history'] = updated_profile_data['interaction_history'][-50:] # Garder les 50 dernières

    # Mettre à jour last_interaction timestamp
    updated_profile_data['last_interaction'] = datetime.datetime.now(datetime.timezone.utc).isoformat() # Utiliser le timestamp actuel

    # Sauvegarder le profil mis à jour dans Supabase
    # Passer full_profile pour l'update afin d'avoir bien l'identifiant de la ligne si nécessaire
    update_user_profile(user_id, updated_profile_data)

    return {"response": response_text, "insights": insights} # Optionnel: renvoyer les insights au frontend

@app.post("/upload-tax-form")
async def upload_tax_form(request: Request):
    # Logique pour gérer le téléchargement de fichier, l'OCR, et potentiellement mettre à jour le profil
    pass # À implémenter plus tard

@app.post("/upload-tax-form/") # Nouveau endpoint pour l'OCR
async def upload_tax_form(file: UploadFile = File(...)):
    try:
        # Lire le contenu du fichier
        contents = await file.read()
        
        # Ouvrir l'image avec Pillow
        # Note: Cela fonctionne directement pour les images (JPG, PNG, etc.).
        # Pour les PDFs, une bibliothèque supplémentaire (comme pdf2image) serait nécessaire
        # pour convertir chaque page en image avant de faire l'OCR.
        image = Image.open(io.BytesIO(contents))
        
        # Exécuter l'OCR sur l'image
        # Vous pourriez avoir besoin d'installer Tesseract OCR sur votre système
        # et éventuellement spécifier le chemin si ce n'est pas dans le PATH.
        # Exemple: pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        text = pytesseract.image_to_string(image, lang='fra') # Utilisez 'fra' pour le français
        
        # Ici, vous traiteriez le texte OCR pour extraire les informations clés
        # Pour l'instant, on renvoie juste le texte brut
        extracted_data = {
            "filename": file.filename,
            "ocr_text": text
            # Plus tard: ajoutez des champs spécifiques (revenus, déductions, etc.)
        }
        
        return {"status": "success", "data": extracted_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement OCR: {str(e)}")

def extract_text_from_pdf(pdf_file: bytes) -> str:
    """Extrait le texte d'un fichier PDF."""
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf:
        temp_pdf.write(pdf_file)
        temp_pdf_path = temp_pdf.name

    try:
        text = ""
        with open(temp_pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    finally:
        os.unlink(temp_pdf_path)

def extract_text_from_image(image_file: bytes) -> str:
    """Extrait le texte d'une image."""
    image = Image.open(io.BytesIO(image_file))
    return pytesseract.image_to_string(image, lang='fra')

def extract_fiscal_info(text: str) -> Dict[str, Any]:
    """Extrait les informations fiscales pertinentes du texte, en excluant les données personnelles sensibles."""
    info = {}
    
    # Revenu fiscal de référence (anonymisé)
    revenus = re.search(r'Revenu fiscal de référence\s*:?\s*(\d[\d\s]*,\d{2})', text)
    if revenus:
        montant = float(revenus.group(1).replace(' ', '').replace(',', '.'))
        # Catégoriser le revenu dans une tranche
        if montant < 15000:
            info['tranche_revenu'] = 'moins de 15 000€'
        elif montant < 30000:
            info['tranche_revenu'] = '15 000€ - 30 000€'
        elif montant < 50000:
            info['tranche_revenu'] = '30 000€ - 50 000€'
        elif montant < 100000:
            info['tranche_revenu'] = '50 000€ - 100 000€'
        else:
            info['tranche_revenu'] = 'plus de 100 000€'
    
    # Situation familiale (anonymisée)
    situation = re.search(r'Situation de famille\s*:?\s*([^\n]+)', text)
    if situation:
        situation_text = situation.group(1).strip().lower()
        if 'célibataire' in situation_text:
            info['situation_familiale'] = 'célibataire'
        elif 'marié' in situation_text or 'pacs' in situation_text:
            info['situation_familiale'] = 'en couple'
        elif 'divorcé' in situation_text:
            info['situation_familiale'] = 'divorcé'
        elif 'veuf' in situation_text:
            info['situation_familiale'] = 'veuf'
    
    # Nombre de parts (anonymisé)
    parts = re.search(r'Nombre de parts\s*:?\s*(\d+[.,]?\d*)', text)
    if parts:
        nb_parts = float(parts.group(1).replace(',', '.'))
        if nb_parts <= 1:
            info['categorie_parts'] = '1 part'
        elif nb_parts <= 2:
            info['categorie_parts'] = '2 parts'
        elif nb_parts <= 3:
            info['categorie_parts'] = '3 parts'
        else:
            info['categorie_parts'] = 'plus de 3 parts'
    
    # Types de revenus (anonymisés)
    categories = {
        'Traitements et salaires': 'revenus_salaires',
        'Revenus des valeurs mobilières': 'revenus_mobiliers',
        'Revenus fonciers': 'revenus_fonciers',
        'Bénéfices industriels et commerciaux': 'benefices_bic',
        'Bénéfices non commerciaux': 'benefices_bnc'
    }
    
    for cat, key in categories.items():
        montant = re.search(f'{cat}\\s*:?\\s*(\\d[\\d\\s]*,\\d{{2}})', text)
        if montant:
            montant_value = float(montant.group(1).replace(' ', '').replace(',', '.'))
            # Catégoriser le montant
            if montant_value > 0:
                if montant_value < 10000:
                    info[key] = 'moins de 10 000€'
                elif montant_value < 50000:
                    info[key] = '10 000€ - 50 000€'
                elif montant_value < 100000:
                    info[key] = '50 000€ - 100 000€'
                else:
                    info[key] = 'plus de 100 000€'
    
    # Zone fiscale (anonymisée)
    zone = re.search(r'Zone fiscale\s*:?\s*([^\n]+)', text)
    if zone:
        zone_text = zone.group(1).strip().lower()
        if 'zone 1' in zone_text:
            info['zone_fiscale'] = 'zone 1'
        elif 'zone 2' in zone_text:
            info['zone_fiscale'] = 'zone 2'
        elif 'zone 3' in zone_text:
            info['zone_fiscale'] = 'zone 3'
    
    # Déductions et réductions (anonymisées)
    deductions = {
        'Dons aux associations': 'dons',
        'Investissements locatifs': 'investissements_locatifs',
        'Épargne retraite': 'epargne_retraite',
        'Services à la personne': 'services_personne'
    }
    
    for cat, key in deductions.items():
        montant = re.search(f'{cat}\\s*:?\\s*(\\d[\\d\\s]*,\\d{{2}})', text)
        if montant:
            montant_value = float(montant.group(1).replace(' ', '').replace(',', '.'))
            if montant_value > 0:
                info[key] = True
    
    return info

# Configuration du chiffrement
def generate_key(user_id: str) -> bytes:
    """Génère une clé de chiffrement unique pour l'utilisateur."""
    salt = b'fiscal_ia_salt'  # À stocker de manière sécurisée en production
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(user_id.encode()))
    return key

def encrypt_data(data: bytes, user_id: str) -> bytes:
    """Chiffre les données avec la clé de l'utilisateur."""
    key = generate_key(user_id)
    f = Fernet(key)
    return f.encrypt(data)

def decrypt_data(encrypted_data: bytes, user_id: str) -> bytes:
    """Déchiffre les données avec la clé de l'utilisateur."""
    key = generate_key(user_id)
    f = Fernet(key)
    return f.decrypt(encrypted_data)

def store_document(file_content: bytes, file_name: str, user_id: str, fiscal_info: Dict[str, Any]) -> Dict[str, Any]:
    """Stocke le document de manière sécurisée dans Supabase."""
    try:
        # Chiffrer le contenu du fichier
        encrypted_content = encrypt_data(file_content, user_id)
        
        # Générer un hash unique pour le fichier
        file_hash = hashlib.sha256(file_content).hexdigest()
        
        # Préparer les métadonnées (sans données personnelles)
        metadata = {
            "user_id": user_id,
            "file_name": "document_fiscal",  # Nom générique
            "file_hash": file_hash,
            "file_size": len(file_content),
            "content_type": "application/encrypted",
            "fiscal_info": fiscal_info,  # Contient uniquement les informations anonymisées
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "retention_period": "5 years",
            "encryption_version": "1.0"
        }
        
        # Stocker le fichier chiffré dans Supabase Storage
        storage_path = f"documents/{user_id}/{file_hash}"
        supabase.storage.from_('documents').upload(
            storage_path,
            encrypted_content,
            {"content-type": "application/encrypted"}
        )
        
        # Stocker les métadonnées dans la table documents
        response = supabase.from_('documents').insert([metadata]).execute()
        
        return {
            "status": "success",
            "document_id": response.data[0]['id'],
            "file_hash": file_hash
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du stockage du document: {str(e)}")

@app.post("/process-document")
async def process_document(file: UploadFile = File(...), user_id: str = None):
    """Traite un document fiscal et extrait les informations pertinentes."""
    if not user_id:
        raise HTTPException(status_code=400, detail="ID utilisateur requis")
        
    try:
        # Lire le contenu du fichier
        content = await file.read()
        
        # Déterminer le type de fichier et extraire le texte
        if file.content_type == 'application/pdf':
            text = extract_text_from_pdf(content)
        elif file.content_type in ['image/jpeg', 'image/png']:
            text = extract_text_from_image(content)
        else:
            raise HTTPException(status_code=400, detail="Format de fichier non supporté")
        
        # Extraire les informations fiscales
        fiscal_info = extract_fiscal_info(text)
        
        if not fiscal_info:
            raise HTTPException(status_code=422, detail="Aucune information fiscale trouvée dans le document")
        
        # Stocker le document de manière sécurisée
        storage_result = store_document(content, file.filename, user_id, fiscal_info)
        
        # Mettre à jour le profil utilisateur avec les nouvelles informations
        profile_update = {
            "numero_fiscal": fiscal_info.get('numero_fiscal'),
            "revenu_fiscal": fiscal_info.get('revenu_fiscal'),
            "impot_revenu": fiscal_info.get('impot_revenu'),
            "situation_familiale": fiscal_info.get('situation_familiale'),
            "nombre_parts": fiscal_info.get('nombre_parts'),
            "adresse": fiscal_info.get('adresse'),
            "revenus_salaires": fiscal_info.get('revenus_salaires'),
            "revenus_mobiliers": fiscal_info.get('revenus_mobiliers'),
            "revenus_fonciers": fiscal_info.get('revenus_fonciers'),
            "benefices_bic": fiscal_info.get('benefices_bic'),
            "benefices_bnc": fiscal_info.get('benefices_bnc'),
            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        
        update_user_profile(user_id, profile_update)
        
        return {
            "fiscal_info": fiscal_info,
            "storage": storage_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{user_id}")
async def get_user_documents(user_id: str):
    """Récupère la liste des documents de l'utilisateur."""
    try:
        response = supabase.from_('documents').select('*').eq('user_id', user_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{user_id}/{document_id}")
async def get_document(user_id: str, document_id: str):
    """Récupère un document spécifique."""
    try:
        # Récupérer les métadonnées du document
        metadata = supabase.from_('documents').select('*').eq('id', document_id).eq('user_id', user_id).single().execute()
        
        if not metadata.data:
            raise HTTPException(status_code=404, detail="Document non trouvé")
            
        # Récupérer le fichier chiffré
        storage_path = f"documents/{user_id}/{metadata.data['file_hash']}"
        encrypted_content = supabase.storage.from_('documents').download(storage_path)
        
        # Déchiffrer le contenu
        decrypted_content = decrypt_data(encrypted_content, user_id)
        
        return {
            "metadata": metadata.data,
            "content": base64.b64encode(decrypted_content).decode()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{user_id}/{document_id}")
async def delete_document(user_id: str, document_id: str):
    """Supprime un document de manière sécurisée."""
    try:
        # Récupérer les métadonnées du document
        metadata = supabase.from_('documents').select('*').eq('id', document_id).eq('user_id', user_id).single().execute()
        
        if not metadata.data:
            raise HTTPException(status_code=404, detail="Document non trouvé")
            
        # Supprimer le fichier du stockage
        storage_path = f"documents/{user_id}/{metadata.data['file_hash']}"
        supabase.storage.from_('documents').remove([storage_path])
        
        # Supprimer les métadonnées
        supabase.from_('documents').delete().eq('id', document_id).execute()
        
        return {"status": "success", "message": "Document supprimé avec succès"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/init-truelayer")
async def init_truelayer(request: Request):
    """Initialise la connexion TrueLayer et retourne les informations nécessaires pour le widget."""
    try:
        return {
            "clientId": TRUELAYER_CLIENT_ID,
            "redirectUri": TRUELAYER_REDIRECT_URI
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def analyze_bank_data(transactions: Dict[str, Any]) -> Dict[str, Any]:
    """Analyse les données bancaires pour extraire des insights fiscaux."""
    analysis = {
        "revenus": {
            "total": 0,
            "par_categorie": {},
            "revenus_imposables": 0,
            "revenus_non_imposables": 0
        },
        "depenses": {
            "total": 0,
            "par_categorie": {},
            "depenses_deductibles": 0,
            "depenses_non_deductibles": 0
        },
        "categories_fiscales": {
            "revenus_activite": 0,
            "revenus_mobiliers": 0,
            "revenus_fonciers": 0,
            "depenses_professionnelles": 0,
            "depenses_immobilieres": 0,
            "depenses_familiales": 0
        },
        "tendances": {
            "evolution_revenus": [],
            "evolution_depenses": [],
            "taux_epargne": 0
        }
    }
    
    # Catégories de transactions pour l'analyse fiscale
    categories = {
        "revenus_activite": ["SALAIRE", "HONORAIRES", "FACTURE", "REMUNERATION"],
        "revenus_mobiliers": ["DIVIDENDE", "INTERET", "PLACEMENT"],
        "revenus_fonciers": ["LOYER", "BAIL"],
        "depenses_professionnelles": ["MATERIEL", "FORMATION", "TRANSPORT", "TELEPHONE"],
        "depenses_immobilieres": ["CREDIT", "TAXE", "ASSURANCE"],
        "depenses_familiales": ["ALIMENTATION", "SANTE", "EDUCATION"]
    }
    
    # Analyse des transactions
    for account_transactions in transactions.values():
        for transaction in account_transactions["results"]:
            amount = float(transaction["amount"])
            description = transaction.get("description", "").upper()
            
            # Catégorisation des transactions
            if amount > 0:  # Revenus
                analysis["revenus"]["total"] += amount
                # Catégorisation des revenus
                for cat, keywords in categories.items():
                    if any(keyword in description for keyword in keywords):
                        analysis["categories_fiscales"][cat] += amount
                        analysis["revenus"]["par_categorie"][cat] = analysis["revenus"]["par_categorie"].get(cat, 0) + amount
                        break
            else:  # Dépenses
                analysis["depenses"]["total"] += abs(amount)
                # Catégorisation des dépenses
                for cat, keywords in categories.items():
                    if any(keyword in description for keyword in keywords):
                        analysis["categories_fiscales"][cat] += abs(amount)
                        analysis["depenses"]["par_categorie"][cat] = analysis["depenses"]["par_categorie"].get(cat, 0) + abs(amount)
                        break
    
    # Calcul du taux d'épargne
    if analysis["revenus"]["total"] > 0:
        analysis["tendances"]["taux_epargne"] = (
            (analysis["revenus"]["total"] - analysis["depenses"]["total"]) 
            / analysis["revenus"]["total"] * 100
        )
    
    # Ajout de recommandations fiscales
    analysis["recommandations"] = []
    
    # Recommandations basées sur les revenus
    if analysis["categories_fiscales"]["revenus_activite"] > 0:
        analysis["recommandations"].append({
            "type": "optimisation",
            "message": "Envisagez d'ouvrir un PER pour réduire votre impôt sur le revenu",
            "impact": "Réduction possible de l'impôt sur le revenu"
        })
    
    # Recommandations basées sur les dépenses
    if analysis["categories_fiscales"]["depenses_professionnelles"] > 0:
        analysis["recommandations"].append({
            "type": "deduction",
            "message": "Pensez à déclarer vos frais professionnels pour réduire votre impôt",
            "impact": "Déduction possible des frais professionnels"
        })
    
    return analysis

@app.get("/bank-data")
async def get_bank_data(request: Request):
    """Récupère et analyse les données bancaires via l'API TrueLayer."""
    try:
        # Récupérer le token d'accès depuis les headers
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Token d'accès manquant")
        
        access_token = auth_header.split(" ")[1]
        
        # Appeler l'API TrueLayer pour obtenir les données
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        }
        
        # Récupérer les comptes
        accounts_response = requests.get(
            "https://api.truelayer.com/data/v1/accounts",
            headers=headers
        )
        accounts_response.raise_for_status()
        accounts = accounts_response.json()
        
        # Récupérer les soldes
        balances = {}
        for account in accounts["results"]:
            balance_response = requests.get(
                f"https://api.truelayer.com/data/v1/accounts/{account['account_id']}/balance",
                headers=headers
            )
            balance_response.raise_for_status()
            balances[account["account_id"]] = balance_response.json()
        
        # Récupérer les transactions récentes
        transactions = {}
        for account in accounts["results"]:
            transactions_response = requests.get(
                f"https://api.truelayer.com/data/v1/accounts/{account['account_id']}/transactions",
                headers=headers
            )
            transactions_response.raise_for_status()
            transactions[account["account_id"]] = transactions_response.json()
        
        # Analyser les données
        analysis = analyze_bank_data(transactions)
        
        return {
            "totalBalance": sum(float(b["results"][0]["current"]) for b in balances.values()),
            "accounts": accounts["results"],
            "analysis": analysis
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'appel à TrueLayer: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

router = APIRouter()

@router.post("/api/create-checkout-session")
async def create_checkout_session(request: Request):
    data = await request.json()
    price_id = data.get('priceId')
    success_url = data.get('successUrl')
    cancel_url = data.get('cancelUrl')
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
        )
        return JSONResponse({'url': session.url})
    except Exception as e:
        return JSONResponse({'error': str(e)}, status_code=400)

@router.post("/api/create-portal-session")
async def create_portal_session(request: Request):
    data = await request.json()
    return_url = data.get('returnUrl')
    # À remplacer par la logique pour récupérer le customer_id Stripe de l'utilisateur connecté
    customer_id = "cus_xxx"  # À personnaliser
    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )
        return JSONResponse({'url': session.url})
    except Exception as e:
        return JSONResponse({'error': str(e)}, status_code=400)

app.include_router(router) 
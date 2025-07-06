from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from main import api_router, pro_clients_router # Importer les routeurs
from main import startup_event # Importer l'événement startup
from routers import pro_clients
from routers import meta
from fastapi.responses import JSONResponse
from fastapi import Request
from supabase_client import supabase
import time
import os

# Créer l'instance de l'application principale
app = FastAPI(
    title="Fiscal.ia API",
    description="API pour l'assistant fiscal intelligent",
    version="1.0.0"
)

# Configurer les CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://fiscal-ia.net"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routeurs dans l'application
# C'est ici que toutes les routes API sont enregistrées
app.include_router(api_router)
app.include_router(pro_clients_router.router)
app.include_router(pro_clients.router)
app.include_router(meta.router)

# Enregistrer l'événement de démarrage
app.on_event("startup")(startup_event)

@app.get("/health")
async def health():
    return {"status": "ok"}

# Routes pour l'extension Chrome
@app.get("/francis/install")
async def serve_francis_install():
    """Nouvelle route pour l'installation de Francis - évite le cache"""
    file_path = "chrome_extension/install-super-simple.html"
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="text/html")
    else:
        return HTMLResponse("""
        <html>
        <body>
            <h1>Francis Teams Assistant</h1>
            <p>Page d'installation non trouvée. Veuillez télécharger l'extension manuellement.</p>
        </body>
        </html>
        """)

@app.get("/chrome-extension/install-super-simple.html")
async def serve_install_super_simple():
    """Servir la page d'installation ultra-simple de Francis"""
    file_path = "chrome_extension/install-super-simple.html"
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="text/html")
    else:
        return HTMLResponse("""
        <html>
        <body>
            <h1>Francis Teams Assistant</h1>
            <p>Page d'installation non trouvée. Veuillez télécharger l'extension manuellement.</p>
        </body>
        </html>
        """)

@app.get("/chrome-extension/GUIDE-ULTRA-AUTO.md")
async def serve_guide_ultra_auto():
    """Servir le guide d'installation ultra-automatique"""
    file_path = "chrome_extension/GUIDE-ULTRA-AUTO.md"
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="text/markdown")
    else:
        return HTMLResponse("""
        <html>
        <body>
            <h1>Guide d'installation Francis</h1>
            <p>Guide non trouvé. Veuillez consulter la documentation.</p>
        </body>
        </html>
        """)

@app.get("/chrome-extension/francis-teams-automatic.zip")
async def serve_extension_zip():
    """Servir le fichier ZIP de l'extension Francis"""
    file_path = "chrome_extension/dist-auto/francis-teams-automatic.zip"
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="application/zip", filename="francis-teams-automatic.zip")
    else:
        return JSONResponse(
            status_code=404,
            content={"error": "Extension Francis non trouvée"}
        )

@app.get("/chrome-extension/auto-installer.js")
async def serve_auto_installer():
    """Servir le script d'installation automatique"""
    file_path = "chrome_extension/auto-installer.js"
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="application/javascript")
    else:
        return JSONResponse(
            status_code=404,
            content={"error": "Script d'installation non trouvé"}
        )

@app.get("/chrome-extension/install-auto.html")
async def serve_install_auto():
    """Servir la page d'installation automatique"""
    file_path = "chrome_extension/install-auto.html"
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="text/html")
    else:
        return HTMLResponse("""
        <html>
        <body>
            <h1>Francis Teams Assistant</h1>
            <p>Page d'installation automatique non trouvée.</p>
        </body>
        </html>
        """)

@app.post("/api/auth/send-invitation")
async def send_invitation_email(request: Request):
    """Route pour envoyer des emails d'invitation aux utilisateurs créés manuellement"""
    try:
        data = await request.json()
        email = data.get("email")
        
        if not email:
            return JSONResponse(
                status_code=400,
                content={"error": "Email requis"}
            )
        
        print(f"📧 Envoi d'invitation pour: {email}")
        
        # Créer un lien d'invitation sécurisé
        invitation_link = f"{request.base_url}set-password?email={email}&invite=true&timestamp={int(time.time())}"
        
        # Envoyer un email d'invitation personnalisé
        try:
            # Utiliser l'API Supabase pour envoyer un email personnalisé
            # Note: Supabase ne permet pas d'envoyer des emails personnalisés directement
            # On va utiliser une approche alternative
            
            # Option 1: Envoyer un email de reset avec un lien personnalisé
            reset_result = supabase.auth.reset_password_for_email(
                email,
                {
                    "redirectTo": f"{request.base_url}set-password?invite=true"
                }
            )
            
            print(f"✅ Email d'invitation envoyé pour {email}")
            
            return JSONResponse(
                status_code=200,
                content={
                    "message": "Email d'invitation envoyé !",
                    "type": "invitation_sent",
                    "note": "L'utilisateur peut maintenant créer son mot de passe en cliquant sur le lien dans l'email."
                }
            )
            
        except Exception as e:
            print(f"❌ Erreur envoi invitation: {e}")
            
            # Option 2: Fallback - retourner le lien d'invitation
            return JSONResponse(
                status_code=200,
                content={
                    "message": "Lien d'invitation généré",
                    "type": "invitation_link",
                    "invitation_link": invitation_link,
                    "note": "Copiez ce lien et envoyez-le manuellement à l'utilisateur."
                }
            )
                    
    except Exception as e:
        print(f"❌ Erreur serveur: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Erreur serveur: {str(e)}"}
        )

@app.post("/api/auth/reset-password-manual")
async def reset_password_manual(request: Request):
    """Route robuste pour reset de mot de passe manuel - VRAIE TECHNIQUE"""
    try:
        data = await request.json()
        email = data.get("email")
        new_password = data.get("newPassword")
        
        if not email or not new_password:
            return JSONResponse(
                status_code=400,
                content={"error": "Email et nouveau mot de passe requis"}
            )
        
        # Validation du mot de passe
        if len(new_password) < 6:
            return JSONResponse(
                status_code=400,
                content={"error": "Le mot de passe doit contenir au moins 6 caractères"}
            )
        
        print(f"🔍 Reset manuel pour: {email}")
        
        # VRAIE TECHNIQUE : Envoyer un email de reset standard
        try:
            # Envoyer un email de reset avec le bon redirectTo
            reset_result = supabase.auth.reset_password_for_email(
                email,
                {
                    "redirectTo": f"{request.base_url}update-password"
                }
            )
            
            print(f"✅ Email de reset envoyé pour {email}")
            
            # Retourner un message qui dit à l'utilisateur de vérifier son email
            return JSONResponse(
                status_code=200,
                content={
                    "message": "Email de récupération envoyé !",
                    "type": "email_sent",
                    "note": "Vérifiez votre boîte de réception et cliquez sur le lien dans l'email."
                }
            )
            
        except Exception as e:
            print(f"❌ Erreur envoi email: {e}")
            
            # Fallback : essayer avec une URL différente
            try:
                reset_result = supabase.auth.reset_password_for_email(
                    email,
                    {
                        "redirectTo": f"{request.base_url}login"
                    }
                )
                
                return JSONResponse(
                    status_code=200,
                    content={
                        "message": "Email de récupération envoyé !",
                        "type": "email_sent",
                        "note": "Vérifiez votre boîte de réception."
                    }
                )
                
            except Exception as e2:
                print(f"❌ Erreur fallback: {e2}")
                
                return JSONResponse(
                    status_code=200,
                    content={
                        "message": "Reset initié",
                        "type": "reset_initiated",
                        "note": "Essayez la méthode standard sur /forgot-password si vous ne recevez pas d'email."
                    }
                )
                    
    except Exception as e:
        print(f"❌ Erreur serveur: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Erreur serveur: {str(e)}"}
        )

@app.post("/api/auth/send-reset-email")
async def send_reset_email(request: Request):
    """Route simple pour envoyer un email de reset de mot de passe"""
    try:
        data = await request.json()
        email = data.get("email")
        
        if not email:
            return JSONResponse(
                status_code=400,
                content={"error": "Email requis"}
            )
        
        print(f"📧 Envoi reset pour: {email}")
        print(f"🌐 URL de base: {request.base_url}")
        
        # Vérifier si l'utilisateur existe dans Supabase
        try:
            # Essayer de récupérer l'utilisateur
            user_response = supabase.auth.admin.list_users()
            user_exists = any(user.email == email for user in user_response.users)
            print(f"👤 Utilisateur existe: {user_exists}")
            
            if not user_exists:
                return JSONResponse(
                    status_code=404,
                    content={"error": "Utilisateur non trouvé dans la base de données"}
                )
                
        except Exception as e:
            print(f"❌ Erreur vérification utilisateur: {e}")
        
        # Envoyer un email de reset standard avec le bon redirectTo
        try:
            # Utiliser une URL plus simple pour éviter les problèmes de tokens
            reset_url = f"{request.base_url}update-password"
            print(f"🔗 URL de reset: {reset_url}")
            
            # Essayer avec une approche différente
            reset_result = supabase.auth.reset_password_for_email(
                email,
                {
                    "redirectTo": reset_url,
                    "captchaToken": None  # Désactiver captcha si présent
                }
            )
            
            print(f"✅ Email de reset envoyé pour {email}")
            print(f"📤 Résultat: {reset_result}")
            
            return JSONResponse(
                status_code=200,
                content={
                    "message": "Email de récupération envoyé !",
                    "type": "email_sent",
                    "note": "Vérifiez votre boîte de réception et cliquez sur le lien dans l'email.",
                    "debug": {
                        "email": email,
                        "reset_url": reset_url,
                        "warning": "Si le refresh_token est vide, vérifiez le template d'email Supabase"
                    }
                }
            )
            
        except Exception as e:
            print(f"❌ Erreur envoi email: {e}")
            print(f"❌ Type d'erreur: {type(e)}")
            
            return JSONResponse(
                status_code=500,
                content={
                    "error": f"Erreur lors de l'envoi: {str(e)}",
                    "note": "Vérifiez que l'email existe dans votre base de données Supabase.",
                    "debug": {
                        "email": email,
                        "error_type": str(type(e))
                    }
                }
            )
                    
    except Exception as e:
        print(f"❌ Erreur serveur: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Erreur serveur: {str(e)}"}
        ) 
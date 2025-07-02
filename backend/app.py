from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .main import api_router, pro_clients_router # Importer les routeurs
from .main import startup_event # Importer l'événement startup
from backend.routers import pro_clients
from backend.routers import meta

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
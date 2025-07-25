from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
import os
import zipfile
import io
from pathlib import Path

router = APIRouter()

@router.get("/francis-desktop-macos")
async def download_francis_desktop_macos():
    """
    Téléchargement direct de Francis Desktop pour macOS
    Génère le zip à la volée pour éviter de stocker le gros fichier
    """
    try:
        # Chemin vers Francis.app (si disponible localement)
        francis_app_path = Path("../desktop-app/dist/mac/Francis.app")
        
        if not francis_app_path.exists():
            # Si pas disponible localement, redirection vers GitHub Release
            raise HTTPException(
                status_code=404, 
                detail="Francis Desktop not available for direct download. Please visit GitHub Releases."
            )
        
        # Créer un zip en mémoire
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Ajouter Francis.app au zip
            for root, dirs, files in os.walk(francis_app_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    arc_name = os.path.relpath(file_path, francis_app_path.parent)
                    zip_file.write(file_path, arc_name)
        
        zip_buffer.seek(0)
        
        # Retourner le zip en streaming
        return StreamingResponse(
            io.BytesIO(zip_buffer.read()),
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=Francis-Desktop-macOS.zip"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download error: {str(e)}")

@router.get("/francis-desktop-windows")
async def download_francis_desktop_windows():
    """
    Téléchargement Francis Desktop pour Windows (à venir)
    """
    raise HTTPException(
        status_code=404, 
        detail="Francis Desktop for Windows coming soon!"
    )

@router.get("/francis-desktop-linux")
async def download_francis_desktop_linux():
    """
    Téléchargement Francis Desktop pour Linux (à venir)
    """
    raise HTTPException(
        status_code=404, 
        detail="Francis Desktop for Linux coming soon!"
    )

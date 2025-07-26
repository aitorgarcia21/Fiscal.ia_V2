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
    Utilise le zip pré-créé pour garantir la compatibilité
    """
    try:
        # Utiliser le ZIP qui fonctionne de façon fiable
        zip_path = Path("/Users/aitorgarcia/Fiscal.ia_V2/desktop-app/dist/mac/Francis-Desktop-macOS.zip")
        
        if not zip_path.exists():
            # Créer le ZIP s'il n'existe pas
            francis_app_path = Path("/Users/aitorgarcia/Fiscal.ia_V2/desktop-app/dist/mac/Francis.app")
            
            if not francis_app_path.exists():
                raise HTTPException(
                    status_code=404, 
                    detail="Francis Desktop not available. Please contact support."
                )
            
            # Créer le ZIP avec compression standard
            import subprocess
            result = subprocess.run([
                "zip", "-r", 
                str(zip_path),
                "Francis.app"
            ], cwd=francis_app_path.parent, capture_output=True)
            
            if result.returncode != 0:
                raise HTTPException(status_code=500, detail="Failed to create ZIP file")
        
        # Vérifier la taille du fichier ZIP
        file_size = zip_path.stat().st_size
        
        # Retourner le fichier ZIP avec les bons headers
        return FileResponse(
            path=str(zip_path),
            media_type="application/zip",
            filename="Francis-Desktop-macOS.zip",
            headers={
                "Content-Length": str(file_size),
                "Accept-Ranges": "bytes",
                "Cache-Control": "no-cache",
                "Content-Disposition": "attachment; filename=Francis-Desktop-macOS.zip"
            }
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

@router.get("/francis-chrome-extension")
async def download_francis_chrome_extension():
    """
    Téléchargement de l'extension Chrome Francis
    """
    try:
        # Chemin vers l'extension Chrome
        extension_path = Path("/Users/aitorgarcia/Fiscal.ia_V2/backend/public/downloads/francis-chrome-extension-v1.1.0.zip")
        
        if not extension_path.exists():
            raise HTTPException(
                status_code=404, 
                detail="Francis Chrome Extension not available. Please contact support."
            )
        
        # Vérifier la taille du fichier
        file_size = extension_path.stat().st_size
        
        # Retourner le fichier ZIP de l'extension
        return FileResponse(
            path=str(extension_path),
            media_type="application/zip",
            filename="francis-chrome-extension-v1.1.0.zip",
            headers={
                "Content-Length": str(file_size),
                "Accept-Ranges": "bytes",
                "Cache-Control": "no-cache",
                "Content-Disposition": "attachment; filename=francis-chrome-extension-v1.1.0.zip"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download error: {str(e)}")

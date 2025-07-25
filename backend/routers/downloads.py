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
        # Utiliser le DMG qui s'ouvre automatiquement avec l'interface de glisser-déposer
        dmg_path = Path("/Users/aitorgarcia/Fiscal.ia_V2/desktop-app/dist/mac/Francis-Desktop-macOS.dmg")
        
        if not dmg_path.exists():
            # Créer le DMG s'il n'existe pas
            francis_app_path = Path("/Users/aitorgarcia/Fiscal.ia_V2/desktop-app/dist/mac/Francis.app")
            
            if not francis_app_path.exists():
                raise HTTPException(
                    status_code=404, 
                    detail="Francis Desktop not available. Please contact support."
                )
            
            # Créer le DMG avec l'interface de glisser-déposer
            import subprocess
            result = subprocess.run([
                "hdiutil", "create", 
                "-volname", "Francis Desktop",
                "-srcfolder", str(francis_app_path),
                "-ov", "-format", "UDZO",
                str(dmg_path)
            ], cwd=francis_app_path.parent, capture_output=True)
            
            if result.returncode != 0:
                raise HTTPException(status_code=500, detail="Failed to create DMG file")
        
        # Vérifier la taille du fichier DMG
        file_size = dmg_path.stat().st_size
        
        # Retourner le fichier DMG avec les bons headers pour éviter la corruption
        return FileResponse(
            path=str(dmg_path),
            media_type="application/x-apple-diskimage",
            filename="Francis-Desktop-macOS.dmg",
            headers={
                "Content-Length": str(file_size),
                "Accept-Ranges": "bytes",
                "Cache-Control": "no-cache",
                "Content-Disposition": "attachment; filename=Francis-Desktop-macOS.dmg"
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

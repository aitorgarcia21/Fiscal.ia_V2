#!/usr/bin/env python3
"""
Francis Auto-Installer - Installation automatique sans mode développeur
Solution révolutionnaire pour installer Francis sur Chrome/Brave sans intervention manuelle
"""

import os
import sys
import json
import shutil
import platform
import subprocess
import tempfile
import zipfile
from pathlib import Path

class FrancisAutoInstaller:
    def __init__(self):
        self.system = platform.system()
        self.extension_id = "francis-agent-fiscal"  # ID unique Francis
        self.version = "1.0.0"
        
    def get_chrome_paths(self):
        """Retourne les chemins Chrome selon l'OS"""
        if self.system == "Windows":
            return {
                "chrome": [
                    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
                ],
                "brave": [
                    r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe",
                    r"C:\Program Files (x86)\BraveSoftware\Brave-Browser\Application\brave.exe"
                ],
                "extensions": r"C:\Program Files\Google\Chrome\Application\Extensions",
                "policies": r"C:\Program Files\Google\Chrome\Application\policies"
            }
        elif self.system == "Darwin":  # macOS
            return {
                "chrome": ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"],
                "brave": ["/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"],
                "extensions": "/Applications/Google Chrome.app/Contents/Extensions",
                "policies": "/Applications/Google Chrome.app/Contents/policies"
            }
        else:  # Linux
            return {
                "chrome": ["/usr/bin/google-chrome", "/opt/google/chrome/chrome"],
                "brave": ["/usr/bin/brave-browser", "/opt/brave.com/brave/brave"],
                "extensions": "/opt/google/chrome/extensions",
                "policies": "/etc/opt/chrome/policies"
            }

    def create_extension_policy(self):
        """Crée la politique Chrome pour forcer l'installation"""
        policy = {
            "ExtensionInstallForcelist": [
                f"{self.extension_id};https://fiscal-ia-v2-production.up.railway.app/francis-extension.crx"
            ],
            "ExtensionSettings": {
                self.extension_id: {
                    "installation_mode": "force_installed",
                    "update_url": "https://fiscal-ia-v2-production.up.railway.app/updates.xml"
                }
            }
        }
        return policy

    def install_via_registry_windows(self):
        """Installation via registre Windows (méthode enterprise)"""
        try:
            import winreg
            
            # Clé principale Chrome Enterprise
            key_path = r"SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist"
            
            # Créer la clé si elle n'existe pas
            try:
                key = winreg.CreateKey(winreg.HKEY_LOCAL_MACHINE, key_path)
                winreg.SetValueEx(key, "1", 0, winreg.REG_SZ, 
                                f"{self.extension_id};https://fiscal-ia-v2-production.up.railway.app/francis-extension.crx")
                winreg.CloseKey(key)
                print("✅ Politique Chrome Enterprise installée !")
                return True
            except Exception as e:
                print(f"❌ Erreur registre: {e}")
                return False
                
        except ImportError:
            print("❌ Module winreg non disponible")
            return False

    def install_via_chrome_directory(self):
        """Installation directe dans le dossier Chrome"""
        paths = self.get_chrome_paths()
        
        # Créer le dossier d'extension
        extension_dir = os.path.join(paths["extensions"], self.extension_id, self.version)
        
        try:
            os.makedirs(extension_dir, exist_ok=True)
            
            # Copier tous les fichiers de l'extension
            source_dir = os.path.dirname(os.path.abspath(__file__))
            extension_files = ["manifest.json", "background.js", "content.js", "popup.html", "popup.js", "styles.css"]
            
            for file in extension_files:
                src = os.path.join(source_dir, file)
                dst = os.path.join(extension_dir, file)
                if os.path.exists(src):
                    shutil.copy2(src, dst)
                    
            # Copier le dossier icons
            icons_src = os.path.join(source_dir, "icons")
            icons_dst = os.path.join(extension_dir, "icons")
            if os.path.exists(icons_src):
                shutil.copytree(icons_src, icons_dst, dirs_exist_ok=True)
                
            print(f"✅ Extension copiée dans: {extension_dir}")
            return True
            
        except Exception as e:
            print(f"❌ Erreur copie: {e}")
            return False

    def create_crx_package(self):
        """Crée un package CRX pour installation automatique"""
        try:
            # Créer un fichier ZIP temporaire
            temp_dir = tempfile.mkdtemp()
            zip_path = os.path.join(temp_dir, "francis.zip")
            
            source_dir = os.path.dirname(os.path.abspath(__file__))
            
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                # Ajouter tous les fichiers de l'extension
                files_to_add = [
                    "manifest.json", "background.js", "content.js", 
                    "popup.html", "popup.js", "styles.css"
                ]
                
                for file in files_to_add:
                    file_path = os.path.join(source_dir, file)
                    if os.path.exists(file_path):
                        zipf.write(file_path, file)
                
                # Ajouter les icônes
                icons_dir = os.path.join(source_dir, "icons")
                if os.path.exists(icons_dir):
                    for root, dirs, files in os.walk(icons_dir):
                        for file in files:
                            file_path = os.path.join(root, file)
                            arc_path = os.path.relpath(file_path, source_dir)
                            zipf.write(file_path, arc_path)
            
            # Renommer en .crx
            crx_path = os.path.join(source_dir, "francis-extension.crx")
            shutil.move(zip_path, crx_path)
            
            print(f"✅ Package CRX créé: {crx_path}")
            return crx_path
            
        except Exception as e:
            print(f"❌ Erreur création CRX: {e}")
            return None

    def launch_chrome_with_extension(self):
        """Lance Chrome avec l'extension forcée"""
        paths = self.get_chrome_paths()
        
        for chrome_path in paths["chrome"]:
            if os.path.exists(chrome_path):
                try:
                    cmd = [
                        chrome_path,
                        f"--load-extension={os.path.dirname(os.path.abspath(__file__))}",
                        "--disable-extensions-except=" + os.path.dirname(os.path.abspath(__file__)),
                        "--no-first-run",
                        "--no-default-browser-check"
                    ]
                    
                    subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    print("✅ Chrome lancé avec Francis !")
                    return True
                    
                except Exception as e:
                    print(f"❌ Erreur lancement Chrome: {e}")
                    continue
        
        return False

    def install(self):
        """Installation automatique complète de Francis"""
        print("🚀 FRANCIS AUTO-INSTALLER - Installation automatique")
        print("=" * 60)
        
        success = False
        
        # Méthode 1: Registry Windows (plus propre)
        if self.system == "Windows":
            print("🔧 Tentative installation via Politique Enterprise...")
            if self.install_via_registry_windows():
                success = True
        
        # Méthode 2: Installation directe
        if not success:
            print("🔧 Tentative installation directe...")
            if self.install_via_chrome_directory():
                success = True
        
        # Méthode 3: Lancement Chrome avec extension
        if not success:
            print("🔧 Lancement Chrome avec extension...")
            if self.launch_chrome_with_extension():
                success = True
        
        # Créer le package CRX pour future distribution
        print("📦 Création du package CRX...")
        self.create_crx_package()
        
        if success:
            print("\n🎉 FRANCIS INSTALLÉ AVEC SUCCÈS !")
            print("Francis est maintenant actif sur tous vos sites web !")
            print("Redémarrez Chrome pour finaliser l'installation.")
        else:
            print("\n❌ Échec de l'installation automatique")
            print("Veuillez contacter le support Francis.")
        
        return success

def main():
    """Point d'entrée principal"""
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        print("Francis Auto-Installer")
        print("Usage: python francis_auto_installer.py")
        print("Installe automatiquement Francis sans mode développeur")
        return
    
    installer = FrancisAutoInstaller()
    installer.install()

if __name__ == "__main__":
    main()

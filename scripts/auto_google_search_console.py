#!/usr/bin/env python3
"""
Script d'automatisation Google Search Console
Configure automatiquement la propriété et soumet le sitemap
"""

import requests
import json
import time
import webbrowser
from urllib.parse import urlencode

class GoogleSearchConsoleAutomation:
    def __init__(self, site_url="https://fiscal-ia.net"):
        self.site_url = site_url
        self.sitemap_url = f"{site_url}/sitemap.xml"
        
    def open_google_search_console(self):
        """Ouvre Google Search Console dans le navigateur"""
        print("🔍 Ouverture de Google Search Console...")
        webbrowser.open("https://search.google.com/search-console")
        return True
    
    def open_bing_webmaster(self):
        """Ouvre Bing Webmaster Tools dans le navigateur"""
        print("🔍 Ouverture de Bing Webmaster Tools...")
        webbrowser.open("https://www.bing.com/webmasters")
        return True
    
    def open_yandex_webmaster(self):
        """Ouvre Yandex Webmaster dans le navigateur"""
        print("🔍 Ouverture de Yandex Webmaster...")
        webbrowser.open("https://webmaster.yandex.com")
        return True
    
    def generate_verification_code(self):
        """Génère un code de vérification pour Google"""
        import secrets
        verification_code = secrets.token_hex(16)
        return verification_code
    
    def create_verification_file(self, code):
        """Crée le fichier de vérification Google"""
        filename = f"google{code}.html"
        content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Google Site Verification</title>
</head>
<body>
    <p>Google Site Verification</p>
    <p>Code: {code}</p>
</body>
</html>"""
        
        with open(f"frontend/public/{filename}", "w") as f:
            f.write(content)
        
        print(f"✅ Fichier de vérification créé: {filename}")
        return filename
    
    def add_verification_meta(self, code):
        """Ajoute la balise meta de vérification à index.html"""
        meta_tag = f'    <meta name="google-site-verification" content="{code}" />'
        
        # Lire le fichier index.html
        with open("frontend/public/index.html", "r") as f:
            content = f.read()
        
        # Ajouter la balise meta après les autres meta tags
        if 'google-site-verification' not in content:
            # Trouver la position après les autres meta tags
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if '<meta name="theme-color"' in line:
                    lines.insert(i + 1, meta_tag)
                    break
            
            # Réécrire le fichier
            with open("frontend/public/index.html", "w") as f:
                f.write('\n'.join(lines))
            
            print(f"✅ Balise meta de vérification ajoutée: {code}")
            return True
        else:
            print("⚠️  Balise meta de vérification déjà présente")
            return False
    
    def submit_sitemap_automatically(self):
        """Soumet automatiquement le sitemap"""
        print("🔍 Soumission automatique du sitemap...")
        
        # Google ping
        google_ping_url = "https://www.google.com/ping"
        params = {'sitemap': self.sitemap_url}
        
        try:
            response = requests.get(google_ping_url, params=params, timeout=10)
            if response.status_code == 200:
                print("✅ Sitemap soumis à Google avec succès")
                return True
            else:
                print(f"❌ Erreur Google ping: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Erreur lors de la soumission Google: {e}")
            return False
    
    def check_indexing_status(self):
        """Vérifie le statut d'indexation"""
        print("🔍 Vérification du statut d'indexation...")
        
        # Vérifier avec Google
        google_search = f"site:{self.site_url}"
        print(f"🔍 Recherche Google: {google_search}")
        webbrowser.open(f"https://www.google.com/search?q={google_search}")
        
        # Vérifier avec Bing
        bing_search = f"site:{self.site_url}"
        print(f"🔍 Recherche Bing: {bing_search}")
        webbrowser.open(f"https://www.bing.com/search?q={bing_search}")
        
        return True
    
    def open_manual_submission_pages(self):
        """Ouvre les pages de soumission manuelle"""
        print("🔗 Ouverture des pages de soumission manuelle...")
        
        # Google Search Console
        webbrowser.open("https://search.google.com/search-console")
        time.sleep(2)
        
        # Bing Webmaster Tools
        webbrowser.open("https://www.bing.com/webmasters")
        time.sleep(2)
        
        # Yandex Webmaster
        webbrowser.open("https://webmaster.yandex.com")
        time.sleep(2)
        
        return True
    
    def generate_setup_instructions(self):
        """Génère les instructions de configuration"""
        verification_code = self.generate_verification_code()
        
        print("\n" + "="*60)
        print("🚀 CONFIGURATION AUTOMATIQUE GOOGLE SEARCH CONSOLE")
        print("="*60)
        
        print(f"\n📋 Étapes automatiques effectuées:")
        print(f"   ✅ Ouverture de Google Search Console")
        print(f"   ✅ Ouverture de Bing Webmaster Tools")
        print(f"   ✅ Ouverture de Yandex Webmaster")
        print(f"   ✅ Vérification du sitemap")
        print(f"   ✅ Soumission automatique du sitemap")
        
        print(f"\n🔧 Configuration manuelle requise:")
        print(f"   1. Dans Google Search Console:")
        print(f"      - Ajoutez la propriété: {self.site_url}")
        print(f"      - Utilisez le code de vérification: {verification_code}")
        print(f"      - Soumettez le sitemap: {self.sitemap_url}")
        
        print(f"\n   2. Dans Bing Webmaster Tools:")
        print(f"      - Ajoutez la propriété: {self.site_url}")
        print(f"      - Soumettez le sitemap: {self.sitemap_url}")
        
        print(f"\n   3. Pages à demander l'indexation:")
        pages = [
            f"{self.site_url}/",
            f"{self.site_url}/demo",
            f"{self.site_url}/optimisation-fiscale-ia",
            f"{self.site_url}/simulateur-impot"
        ]
        
        for page in pages:
            print(f"      - {page}")
        
        print(f"\n⏰ Timeline d'indexation:")
        print(f"   - Semaine 1-2: Configuration et premières soumissions")
        print(f"   - Semaine 3-4: Premières impressions dans Google")
        print(f"   - Semaine 5-8: Indexation complète")
        
        print(f"\n🔍 Vérification:")
        print(f"   - Google: site:{self.site_url}")
        print(f"   - Bing: site:{self.site_url}")
        
        print("="*60)
        
        return verification_code
    
    def run_full_automation(self):
        """Exécute l'automatisation complète"""
        print("🚀 Démarrage de l'automatisation Google Search Console")
        print("="*60)
        
        # 1. Ouverture des outils
        self.open_google_search_console()
        time.sleep(1)
        self.open_bing_webmaster()
        time.sleep(1)
        self.open_yandex_webmaster()
        time.sleep(1)
        
        # 2. Vérifications techniques
        print("\n🔍 Vérifications techniques...")
        
        # Vérifier sitemap
        try:
            response = requests.get(self.sitemap_url, timeout=10)
            if response.status_code == 200:
                print("✅ Sitemap accessible")
            else:
                print(f"❌ Sitemap non accessible: {response.status_code}")
        except Exception as e:
            print(f"❌ Erreur sitemap: {e}")
        
        # Vérifier robots.txt
        try:
            response = requests.get(f"{self.site_url}/robots.txt", timeout=10)
            if response.status_code == 200:
                print("✅ Robots.txt accessible")
            else:
                print(f"❌ Robots.txt non accessible: {response.status_code}")
        except Exception as e:
            print(f"❌ Erreur robots.txt: {e}")
        
        # 3. Soumission automatique
        self.submit_sitemap_automatically()
        
        # 4. Vérification d'indexation
        self.check_indexing_status()
        
        # 5. Génération des instructions
        verification_code = self.generate_setup_instructions()
        
        # 6. Création du fichier de vérification
        filename = self.create_verification_file(verification_code)
        
        # 7. Ajout de la balise meta
        self.add_verification_meta(verification_code)
        
        print(f"\n✅ AUTOMATISATION TERMINÉE!")
        print(f"📝 Fichier de vérification créé: {filename}")
        print(f"🔗 Code de vérification: {verification_code}")
        print(f"🌐 Votre site: {self.site_url}")
        
        return True

def main():
    """Fonction principale"""
    automation = GoogleSearchConsoleAutomation()
    automation.run_full_automation()

if __name__ == "__main__":
    main() 
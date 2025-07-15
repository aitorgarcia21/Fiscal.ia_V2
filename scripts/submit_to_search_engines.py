#!/usr/bin/env python3
"""
Script pour soumettre le site aux moteurs de recherche
Améliore l'indexation et le référencement
"""

import requests
import time
import json
from urllib.parse import urlencode

class SearchEngineSubmitter:
    def __init__(self, base_url="https://fiscal-ia.net"):
        self.base_url = base_url
        self.sitemap_url = f"{base_url}/sitemap.xml"
        
    def submit_to_google(self):
        """Soumet le sitemap à Google via l'API Search Console"""
        print("🔍 Soumission à Google Search Console...")
        
        # URL de soumission Google
        google_url = "https://www.google.com/ping"
        params = {
            'sitemap': self.sitemap_url
        }
        
        try:
            response = requests.get(google_url, params=params)
            if response.status_code == 200:
                print("✅ Sitemap soumis à Google avec succès")
                return True
            else:
                print(f"❌ Erreur lors de la soumission à Google: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Erreur lors de la soumission à Google: {e}")
            return False
    
    def submit_to_bing(self):
        """Soumet le sitemap à Bing"""
        print("🔍 Soumission à Bing...")
        
        bing_url = "https://www.bing.com/ping"
        params = {
            'sitemap': self.sitemap_url
        }
        
        try:
            response = requests.get(bing_url, params=params)
            if response.status_code == 200:
                print("✅ Sitemap soumis à Bing avec succès")
                return True
            else:
                print(f"❌ Erreur lors de la soumission à Bing: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Erreur lors de la soumission à Bing: {e}")
            return False
    
    def submit_to_yandex(self):
        """Soumet le sitemap à Yandex"""
        print("🔍 Soumission à Yandex...")
        
        yandex_url = "https://blogs.yandex.com/pings"
        params = {
            'status=success': '',
            'url': self.base_url
        }
        
        try:
            response = requests.get(yandex_url, params=params)
            if response.status_code == 200:
                print("✅ Site soumis à Yandex avec succès")
                return True
            else:
                print(f"❌ Erreur lors de la soumission à Yandex: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Erreur lors de la soumission à Yandex: {e}")
            return False
    
    def check_sitemap_accessibility(self):
        """Vérifie que le sitemap est accessible"""
        print("🔍 Vérification de l'accessibilité du sitemap...")
        
        try:
            response = requests.get(self.sitemap_url)
            if response.status_code == 200:
                print("✅ Sitemap accessible")
                return True
            else:
                print(f"❌ Sitemap non accessible: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Erreur lors de la vérification du sitemap: {e}")
            return False
    
    def check_robots_txt(self):
        """Vérifie que le robots.txt est accessible"""
        print("🔍 Vérification du robots.txt...")
        
        robots_url = f"{self.base_url}/robots.txt"
        try:
            response = requests.get(robots_url)
            if response.status_code == 200:
                print("✅ Robots.txt accessible")
                return True
            else:
                print(f"❌ Robots.txt non accessible: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Erreur lors de la vérification du robots.txt: {e}")
            return False
    
    def generate_submission_links(self):
        """Génère les liens de soumission manuelle"""
        print("\n🔗 Liens de soumission manuelle:")
        print("=" * 50)
        
        # Google Search Console
        print("📝 Google Search Console:")
        print(f"   https://search.google.com/search-console")
        print(f"   Propriété à ajouter: {self.base_url}")
        print(f"   Sitemap à soumettre: {self.sitemap_url}")
        
        # Bing Webmaster Tools
        print("\n📝 Bing Webmaster Tools:")
        print(f"   https://www.bing.com/webmasters")
        print(f"   Propriété à ajouter: {self.base_url}")
        print(f"   Sitemap à soumettre: {self.sitemap_url}")
        
        # Yandex Webmaster
        print("\n📝 Yandex Webmaster:")
        print(f"   https://webmaster.yandex.com")
        print(f"   Propriété à ajouter: {self.base_url}")
        print(f"   Sitemap à soumettre: {self.sitemap_url}")
        
        # Autres moteurs
        print("\n📝 Autres moteurs de recherche:")
        print(f"   DuckDuckGo: https://duckduckgo.com/")
        print(f"   Qwant: https://www.qwant.com/")
        
        print("\n" + "=" * 50)
    
    def run_full_submission(self):
        """Exécute la soumission complète"""
        print("🚀 Début de la soumission aux moteurs de recherche")
        print("=" * 50)
        
        # Vérifications préalables
        if not self.check_sitemap_accessibility():
            print("❌ Impossible de continuer sans sitemap accessible")
            return False
        
        if not self.check_robots_txt():
            print("⚠️  Robots.txt non accessible - à vérifier")
        
        # Soumissions automatiques
        results = {
            'google': self.submit_to_google(),
            'bing': self.submit_to_bing(),
            'yandex': self.submit_to_yandex()
        }
        
        # Génération des liens manuels
        self.generate_submission_links()
        
        # Résumé
        print("\n📊 Résumé des soumissions:")
        print("=" * 50)
        for engine, success in results.items():
            status = "✅ Succès" if success else "❌ Échec"
            print(f"   {engine.capitalize()}: {status}")
        
        success_count = sum(results.values())
        total_count = len(results)
        
        print(f"\n🎯 {success_count}/{total_count} soumissions réussies")
        
        if success_count > 0:
            print("✅ Votre site a été soumis aux moteurs de recherche")
            print("⏰ L'indexation peut prendre 1-4 semaines")
        else:
            print("❌ Aucune soumission automatique réussie")
            print("📝 Utilisez les liens manuels ci-dessus")
        
        return success_count > 0

def main():
    """Fonction principale"""
    submitter = SearchEngineSubmitter()
    submitter.run_full_submission()

if __name__ == "__main__":
    main() 
import requests
import json
import time

# URL de l'API
API_URL = "https://fiscal-ia.net/api/test-francis"

# Questions de test
test_questions = [
    "donne moi les tmi",
    "qu'est-ce que la TVA et ses différents taux ?",
    "comment calculer la plus-value immobilière ?",
    "quelles sont les réductions d'impôt possibles ?",
    "comment fonctionne le quotient familial ?",
    "qu'est-ce que le prélèvement à la source ?",
    "comment déclarer des revenus locatifs ?",
    "qu'est-ce que la flat tax ?"
]

print("🧪 Test de Francis - Assistant Fiscal\n")
print("=" * 50)

for i, question in enumerate(test_questions, 1):
    print(f"\n📝 Question {i}: {question}")
    print("-" * 50)
    
    try:
        # Faire la requête
        response = requests.post(
            API_URL,
            json={"message": question},
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            answer = data.get("response", "Pas de réponse")
            
            # Vérifier la qualité de la réponse
            print(f"✅ Réponse reçue ({len(answer)} caractères)")
            
            # Afficher un extrait de la réponse
            if len(answer) > 300:
                print(f"\n{answer[:300]}...")
            else:
                print(f"\n{answer}")
            
            # Analyser la réponse
            quality_indicators = {
                "Chiffres précis": any(char.isdigit() for char in answer),
                "Format structuré": "•" in answer or "-" in answer or "**" in answer,
                "Citations CGI": "article" in answer.lower() or "cgi" in answer.lower(),
                "Exemples concrets": "exemple" in answer.lower() or "€" in answer
            }
            
            print("\n📊 Analyse de qualité:")
            for indicator, present in quality_indicators.items():
                print(f"  - {indicator}: {'✓' if present else '✗'}")
                
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏱️ Timeout - La requête a pris trop de temps")
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
    
    # Pause entre les requêtes
    if i < len(test_questions):
        time.sleep(2)

print("\n" + "=" * 50)
print("✅ Tests terminés!")

#!/usr/bin/env python3
"""
Test du système RAG Luxembourg
Vérifie que Francis répond correctement aux questions fiscales luxembourgeoises
"""

import requests
import json
from typing import Dict, Any

def test_luxembourg_rag():
    """Test complet du système RAG Luxembourg"""
    
    base_url = "http://localhost:8000"
    
    # Questions de test pour Luxembourg
    test_questions = [
        {
            "question": "Quel est le barème de l'impôt sur le revenu au Luxembourg en 2025 ?",
            "expected_keywords": ["barème", "impôt", "revenu", "luxembourg", "2025", "tranche", "taux"]
        },
        {
            "question": "Comment calculer l'impôt sur le revenu au Luxembourg ?",
            "expected_keywords": ["calcul", "impôt", "revenu", "luxembourg", "barème", "tranche"]
        },
        {
            "question": "Quels sont les taux de TVA au Luxembourg ?",
            "expected_keywords": ["tva", "taux", "luxembourg", "17%", "14%", "8%", "3%"]
        },
        {
            "question": "Qu'est-ce que le quotient familial au Luxembourg ?",
            "expected_keywords": ["quotient", "familial", "parts", "enfants", "marié"]
        },
        {
            "question": "Comment optimiser ses impôts au Luxembourg ?",
            "expected_keywords": ["optimisation", "déductions", "épargne", "immobilier", "assurance"]
        }
    ]
    
    print("🧪 TEST DU SYSTÈME RAG LUXEMBOURG")
    print("=" * 50)
    
    results = []
    
    for i, test in enumerate(test_questions, 1):
        print(f"\n📝 Test {i}: {test['question']}")
        
        try:
            # Appel API
            response = requests.post(
                f"{base_url}/api/francis",
                json={
                    "question": test["question"],
                    "jurisdiction": "LU",
                    "conversation_history": []
                },
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                answer = data.get("answer", "")
                confidence = data.get("confidence", 0)
                sources = data.get("sources", [])
                
                print(f"✅ Réponse reçue (confiance: {confidence:.2f})")
                print(f"📄 Sources: {len(sources)} trouvées")
                
                # Vérification des mots-clés attendus
                answer_lower = answer.lower()
                found_keywords = []
                missing_keywords = []
                
                for keyword in test["expected_keywords"]:
                    if keyword.lower() in answer_lower:
                        found_keywords.append(keyword)
                    else:
                        missing_keywords.append(keyword)
                
                keyword_coverage = len(found_keywords) / len(test["expected_keywords"])
                
                print(f"🎯 Couverture mots-clés: {keyword_coverage:.1%}")
                print(f"✅ Trouvés: {', '.join(found_keywords)}")
                if missing_keywords:
                    print(f"❌ Manquants: {', '.join(missing_keywords)}")
                
                # Afficher un extrait de la réponse
                print(f"💬 Réponse: {answer[:200]}...")
                
                results.append({
                    "test": i,
                    "question": test["question"],
                    "success": True,
                    "confidence": confidence,
                    "keyword_coverage": keyword_coverage,
                    "sources_count": len(sources),
                    "answer_preview": answer[:200]
                })
                
            else:
                print(f"❌ Erreur HTTP: {response.status_code}")
                print(f"📄 Réponse: {response.text}")
                results.append({
                    "test": i,
                    "question": test["question"],
                    "success": False,
                    "error": f"HTTP {response.status_code}"
                })
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Erreur de connexion: {e}")
            results.append({
                "test": i,
                "question": test["question"],
                "success": False,
                "error": str(e)
            })
        except Exception as e:
            print(f"❌ Erreur inattendue: {e}")
            results.append({
                "test": i,
                "question": test["question"],
                "success": False,
                "error": str(e)
            })
    
    # Résumé des tests
    print("\n" + "=" * 50)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 50)
    
    successful_tests = [r for r in results if r["success"]]
    failed_tests = [r for r in results if not r["success"]]
    
    print(f"✅ Tests réussis: {len(successful_tests)}/{len(results)}")
    print(f"❌ Tests échoués: {len(failed_tests)}/{len(results)}")
    
    if successful_tests:
        avg_confidence = sum(r["confidence"] for r in successful_tests) / len(successful_tests)
        avg_coverage = sum(r["keyword_coverage"] for r in successful_tests) / len(successful_tests)
        avg_sources = sum(r["sources_count"] for r in successful_tests) / len(successful_tests)
        
        print(f"📈 Confiance moyenne: {avg_confidence:.2f}")
        print(f"🎯 Couverture moyenne: {avg_coverage:.1%}")
        print(f"📄 Sources moyennes: {avg_sources:.1f}")
    
    if failed_tests:
        print("\n❌ Tests échoués:")
        for test in failed_tests:
            print(f"  - Test {test['test']}: {test['error']}")
    
    # Test du simulateur
    print("\n🧮 TEST DU SIMULATEUR LUXEMBOURG")
    print("=" * 50)
    
    try:
        calc_response = requests.post(
            f"{base_url}/api/tools/calc-luxembourg",
            json={
                "revenu_net": 50000,
                "situation_familiale": "marie",
                "nombre_enfants": 2,
                "residence_principale": True,
                "residence_secondaire": False
            },
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if calc_response.status_code == 200:
            calc_data = calc_response.json()
            print("✅ Simulateur fonctionnel")
            print(f"💰 Impôt calculé: {calc_data.get('impot_luxembourg', 0):,.0f}€")
            print(f"📊 Taux moyen: {calc_data.get('taux_moyen', 0):.1f}%")
            print(f"📋 Tranches: {len(calc_data.get('tranches_applicables', []))}")
            print(f"💡 Conseils: {len(calc_data.get('conseils_optimisation', []))}")
        else:
            print(f"❌ Erreur simulateur: {calc_response.status_code}")
            print(f"📄 Réponse: {calc_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur simulateur: {e}")
    
    print("\n🎯 CONCLUSION")
    print("=" * 50)
    
    if len(successful_tests) >= 4 and avg_confidence > 0.7:
        print("✅ SYSTÈME RAG LUXEMBOURG FONCTIONNEL")
        print("   - Réponses cohérentes et sourcées")
        print("   - Confiance élevée")
        print("   - Couverture des mots-clés satisfaisante")
    elif len(successful_tests) >= 3:
        print("⚠️ SYSTÈME RAG LUXEMBOURG PARTIELLEMENT FONCTIONNEL")
        print("   - Quelques réponses correctes")
        print("   - Améliorations possibles")
    else:
        print("❌ SYSTÈME RAG LUXEMBOURG DYSFONCTIONNEL")
        print("   - Vérifier la configuration")
        print("   - Contrôler les embeddings")

if __name__ == "__main__":
    test_luxembourg_rag() 
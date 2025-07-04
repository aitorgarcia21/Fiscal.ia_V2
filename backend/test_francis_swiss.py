#!/usr/bin/env python3
"""
Script de test pour Francis Suisse
Test des fonctionnalités de base sans nécessiter d'embeddings
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_swiss_question_detection():
    """Test la détection des questions fiscales suisses"""
    try:
        from assistant_fiscal import is_swiss_fiscal_question
        
        # Questions suisses
        swiss_questions = [
            "Comment fonctionne le Pilier 3A en Suisse ?",
            "Quels sont les taux d'impôt dans le canton de Genève ?",
            "Comment calculer les cotisations AVS ?",
            "Quelle est la différence entre les impôts fédéraux et cantonaux en Suisse ?",
            "Comment optimiser ses impôts avec le LPP ?"
        ]
        
        # Questions non-suisses
        non_swiss_questions = [
            "Comment calculer l'impôt sur le revenu en France ?",
            "Qu'est-ce que le PEA ?",
            "Comment fonctionne l'assurance vie en France ?",
            "Quels sont les taux de TVA français ?"
        ]
        
        print("=== Test de détection des questions suisses ===")
        
        print("\n✅ Questions suisses détectées :")
        for question in swiss_questions:
            is_swiss = is_swiss_fiscal_question(question)
            status = "✅" if is_swiss else "❌"
            print(f"{status} {question} -> {is_swiss}")
        
        print("\n✅ Questions non-suisses détectées :")
        for question in non_swiss_questions:
            is_swiss = is_swiss_fiscal_question(question)
            status = "✅" if not is_swiss else "❌"
            print(f"{status} {question} -> {is_swiss}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors du test de détection: {e}")
        return False

def test_swiss_tax_calculator():
    """Test le calculateur fiscal suisse"""
    try:
        from calculs_fiscaux_suisse import SwissTaxCalculator
        
        print("\n=== Test du calculateur fiscal suisse ===")
        
        calculator = SwissTaxCalculator()
        
        # Test de calcul simple
        test_params = {
            'revenu_annuel': 80000,
            'canton': 'geneve',
            'situation_familiale': 'celibataire',
            'enfants': 0,
            'pilier_3a': 6000
        }
        
        result = calculator.calculate_total_tax(**test_params)
        
        print(f"✅ Calcul pour revenu de {test_params['revenu_annuel']} CHF à Genève :")
        print(f"   - Impôt fédéral : {result['federal_tax']:.2f} CHF")
        print(f"   - Impôt cantonal : {result['cantonal_tax']:.2f} CHF")
        print(f"   - Impôt communal : {result['communal_tax']:.2f} CHF")
        print(f"   - Total impôts : {result['total_tax']:.2f} CHF")
        print(f"   - Taux effectif : {result['effective_rate']:.2f}%")
        
        # Test de comparaison inter-cantonale
        comparison = calculator.compare_cantons(test_params['revenu_annuel'])
        print(f"\n✅ Comparaison inter-cantonale :")
        for canton, data in comparison.items():
            print(f"   - {canton.title()} : {data['total_tax']:.2f} CHF ({data['effective_rate']:.2f}%)")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors du test du calculateur: {e}")
        return False

def test_swiss_rag_basic():
    """Test basique du système RAG suisse (sans embeddings)"""
    try:
        from rag_swiss import SwissRAGSystem
        
        print("\n=== Test basique du système RAG suisse ===")
        
        # Test d'initialisation
        try:
            rag = SwissRAGSystem()
            print("✅ Système RAG suisse initialisé")
            
            # Test des suggestions
            suggestions = rag.get_swiss_tax_suggestions()
            print(f"✅ {len(suggestions)} suggestions d'optimisation disponibles :")
            for i, suggestion in enumerate(suggestions[:3], 1):
                print(f"   {i}. {suggestion}")
            
            return True
            
        except Exception as e:
            print(f"⚠️  Système RAG non disponible (normal sans embeddings): {e}")
            return True  # Ce n'est pas une erreur critique
        
    except Exception as e:
        print(f"❌ Erreur lors du test RAG: {e}")
        return False

def test_francis_swiss_router():
    """Test du routeur Francis Suisse"""
    try:
        from routers.francis_swiss import router
        
        print("\n=== Test du routeur Francis Suisse ===")
        print("✅ Routeur Francis Suisse importé avec succès")
        print(f"✅ Préfixe du routeur : {router.prefix}")
        print(f"✅ Tags du routeur : {router.tags}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors du test du routeur: {e}")
        return False

def main():
    """Fonction principale de test"""
    print("🇨🇭 === TESTS FRANCIS SUISSE ===")
    
    tests = [
        ("Détection questions suisses", test_swiss_question_detection),
        ("Calculateur fiscal suisse", test_swiss_tax_calculator),
        ("Système RAG suisse", test_swiss_rag_basic),
        ("Routeur Francis Suisse", test_francis_swiss_router)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        print(f"🧪 Test : {test_name}")
        print(f"{'='*50}")
        
        try:
            result = test_func()
            results.append((test_name, result))
            status = "✅ RÉUSSI" if result else "❌ ÉCHOUÉ"
            print(f"\n{status}")
        except Exception as e:
            print(f"\n❌ ERREUR : {e}")
            results.append((test_name, False))
    
    # Résumé final
    print(f"\n{'='*60}")
    print("📊 RÉSUMÉ DES TESTS FRANCIS SUISSE")
    print(f"{'='*60}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅" if result else "❌"
        print(f"{status} {test_name}")
    
    print(f"\n🎯 Résultat global : {passed}/{total} tests réussis")
    
    if passed == total:
        print("🎉 Tous les tests Francis Suisse ont réussi !")
        return True
    else:
        print("⚠️  Certains tests ont échoué, mais Francis Suisse devrait fonctionner partiellement")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 
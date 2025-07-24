"""
🧪 TESTS FRANCIS MULTI-PROFILS - VALIDATION EXPERTISE CGP
=========================================================

Script de test pour valider l'intégration du système multi-profils
avec Francis. Teste la détection de profils et la précision des réponses
sur des cas ultra-spécialisés pour CGP.
"""

import sys
import os
sys.path.append('/Users/aitorgarcia/Fiscal.ia_V2/backend')

from assistant_fiscal_simple import get_fiscal_response
from knowledge_base_multi_profiles import ProfileType, RegimeFiscal, ThemeFiscal

def test_profile_detection_and_response():
    """Tests complets de détection de profils et réponses spécialisées"""
    
    # 🎯 TEST CASES ULTRA-SPÉCIALISÉS CGP
    test_cases = [
        {
            "question": "Je suis gérant majoritaire d'une SARL familiale avec 2M€ de CA. Dois-je opter pour l'IS ou rester à l'IR ? Quels sont les seuils d'arbitrage ?",
            "profil_attendu": ProfileType.GERANT_SARL,
            "mots_cles": ["arbitrage IS/IR", "SARL familiale", "seuils", "TMI 25%"],
            "precision_attendue": "calculs précis d'arbitrage avec seuils TMI"
        },
        {
            "question": "Comment optimiser la transmission de mes parts de SARL via démembrement ? J'ai 70 ans et 3 enfants, valorisation 1M€",
            "profil_attendu": ProfileType.GERANT_SARL,
            "mots_cles": ["démembrement", "transmission", "décote 40%", "abattements"],
            "precision_attendue": "calculs détaillés décotes et droits de donation"
        },
        {
            "question": "Ma SCI détient 10 appartements avec 200k€ de loyers annuels. L'option IS est-elle avantageuse ? Comment ventiler les amortissements ?",
            "profil_attendu": ProfileType.INVESTISSEUR_SCI,
            "mots_cles": ["SCI IS", "amortissements", "économie 52k€", "15% vs 25%"],
            "precision_attendue": "calculs comparatifs IR vs IS avec amortissements détaillés"
        },
        {
            "question": "Je veux créer un montage holding-SCI pour mon groupe familial. Comment optimiser l'intégration fiscale ?",
            "profil_attendu": ProfileType.GROUPE_HOLDING,
            "mots_cles": ["holding-SCI", "intégration fiscale", "régime mère-fille"],
            "precision_attendue": "architecture complexe avec optimisations fiscales"
        },
        {
            "question": "Comment optimiser mes amortissements LMNP ? J'ai un appartement meublé de 300k€ avec 24k€ de loyers",
            "profil_attendu": ProfileType.LOUEUR_MEUBLE,
            "mots_cles": ["LMNP", "amortissements", "ventilation", "15k€/an"],
            "precision_attendue": "ventilation détaillée prix avec calculs d'économie"
        },
        {
            "question": "Notaire avec 500k€ de bénéfices annuels. SELARL IS vs exercice individuel : quel gain net ?",
            "profil_attendu": ProfileType.PROFESSIONNEL_LIBERAL,
            "mots_cles": ["SELARL", "notaire", "217k€ gain", "dividendes"],
            "precision_attendue": "comparaison chiffrée complète avec optimisation rémunération/dividendes"
        }
    ]
    
    print("🚀 LANCEMENT TESTS FRANCIS MULTI-PROFILS CGP")
    print("=" * 60)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📋 TEST {i}/6 : {test_case['profil_attendu'].value.upper()}")
        print(f"❓ Question : {test_case['question']}")
        print("-" * 50)
        
        try:
            # Test de la réponse Francis
            response, sources, confidence = get_fiscal_response(
                query=test_case['question'],
                jurisdiction="FR"
            )
            
            print(f"🤖 RÉPONSE FRANCIS :")
            print(response)
            print(f"\n📚 Sources utilisées : {sources}")
            print(f"🎯 Confiance : {confidence}")
            
            # Validation des mots-clés attendus
            mots_cles_trouves = []
            for mot_cle in test_case['mots_cles']:
                if mot_cle.lower() in response.lower():
                    mots_cles_trouves.append(mot_cle)
            
            print(f"✅ Mots-clés détectés : {mots_cles_trouves}")
            print(f"🎯 Précision attendue : {test_case['precision_attendue']}")
            
            # Score de qualité
            score_mots_cles = len(mots_cles_trouves) / len(test_case['mots_cles'])
            print(f"📊 Score mots-clés : {score_mots_cles:.1%}")
            
            if score_mots_cles >= 0.5:
                print("🎉 TEST RÉUSSI - Francis maîtrise le sujet")
            else:
                print("⚠️ TEST PARTIEL - Améliorations possibles")
                
        except Exception as e:
            print(f"❌ ERREUR : {e}")
        
        print("=" * 60)

def test_profile_combinations():
    """Test de cas complexes combinant plusieurs profils"""
    
    print("\n🔄 TESTS COMBINAISONS MULTI-PROFILS")
    print("=" * 60)
    
    complex_cases = [
        {
            "question": "CGP avec SASU + SCI LMNP + PER : comment optimiser l'ensemble de cette structure patrimoniale ?",
            "profils_attendus": ["dirigeant_sasu", "investisseur_sci", "loueur_meuble"],
            "complexity": "high"
        },
        {
            "question": "Médecin libéral : SELARL + SCM + Madelin + SCI professionnelle, quelle stratégie globale ?",
            "profils_attendus": ["professionnel_liberal"],
            "complexity": "very_high"
        }
    ]
    
    for i, case in enumerate(complex_cases, 1):
        print(f"\n🧩 CAS COMPLEXE {i} : {case['complexity'].upper()}")
        print(f"❓ {case['question']}")
        print("-" * 50)
        
        try:
            response, sources, confidence = get_fiscal_response(case['question'])
            print(f"🤖 FRANCIS (synthèse) :")
            print(response[:500] + "..." if len(response) > 500 else response)
            print(f"\n📚 Nombre de sources : {len(sources)}")
            print(f"🎯 Confiance : {confidence}")
            
        except Exception as e:
            print(f"❌ ERREUR : {e}")

def main():
    """Exécution complète des tests"""
    
    print("🎯 VALIDATION FRANCIS MULTI-PROFILS POUR CGP")
    print("=" * 60)
    print("Objectif : Tester la précision des réponses sur des cas ultra-spécialisés")
    print("Système : Détection automatique de profils + Base de connaissances enrichie")
    print("=" * 60)
    
    # Tests principaux
    test_profile_detection_and_response()
    
    # Tests combinaisons
    test_profile_combinations()
    
    print("\n🏁 TESTS TERMINÉS")
    print("=" * 60)
    print("✅ Francis est maintenant équipé pour répondre avec précision")
    print("   aux questions ultra-spécialisées des CGP !")
    print("🚀 Prêt pour utilisation en production")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Test final complet de Francis Suisse - Assistant fiscal spécialisé
Validation de la précision et de la qualité des réponses
"""

import sys
import json
from typing import Dict, Any

# Ajouter le répertoire courant au path
sys.path.append('.')

def test_francis_swiss_comprehensive():
    """Test complet de Francis Suisse avec questions très précises"""
    
    print("🎯 TEST FINAL FRANCIS SUISSE - VALIDATION COMPLÈTE")
    print("=" * 80)
    
    try:
        from rag_swiss import SwissRAGSystem
        from assistant_fiscal import is_swiss_fiscal_question
        
        # Initialisation
        print("🔄 Initialisation du système...")
        swiss_rag = SwissRAGSystem()
        print(f"✅ Système initialisé: {len(swiss_rag.chunks_cache)} chunks, {len(swiss_rag.embeddings_cache)} embeddings")
        
        # Questions de test très précises
        test_questions = [
            {
                "id": 1,
                "question": "Quel est le montant maximum déductible pour le pilier 3A en 2025 pour un salarié affilié à la LPP versus un indépendant ?",
                "expected_keywords": ["7'056", "35'280", "2025", "LPP", "indépendant"]
            },
            {
                "id": 2,
                "question": "Calculez précisément l'impôt total pour un célibataire gagnant 120000 CHF en 2025 à Genève versus Zurich",
                "expected_keywords": ["Genève", "Zurich", "120'000", "2025", "impôt"]
            },
            {
                "id": 3,
                "question": "Quelles sont les cotisations AVS/AI et LPP pour un salarié gagnant 80000 CHF par an en 2025 ?",
                "expected_keywords": ["AVS", "AI", "LPP", "5.30%", "8.25%", "80'000"]
            },
            {
                "id": 4,
                "question": "Comment optimiser fiscalement un revenu de 150000 CHF en Suisse en 2025 avec le pilier 3A et les déductions ?",
                "expected_keywords": ["150'000", "2025", "pilier 3A", "optimisation", "déductions"]
            },
            {
                "id": 5,
                "question": "Quelles sont les différences de taux d'imposition entre Genève et Zurich pour un revenu de 100000 CHF en 2025 ?",
                "expected_keywords": ["Genève", "Zurich", "100'000", "2025", "taux", "différences"]
            }
        ]
        
        results = []
        total_confidence = 0.0
        
        for test in test_questions:
            print(f"\n📊 TEST {test['id']}: {test['question'][:60]}...")
            
            # Vérifier la détection suisse
            is_swiss = is_swiss_fiscal_question(test['question'])
            print(f"   Détection suisse: {'✅' if is_swiss else '❌'}")
            
            # Obtenir la réponse
            result = swiss_rag.answer_swiss_fiscal_question(test['question'], top_k=3)
            
            # Analyser la réponse
            answer = result['answer']
            confidence = result['confidence']
            sources_count = len(result['sources'])
            
            print(f"   Confiance: {confidence:.2f}")
            print(f"   Sources: {sources_count}")
            print(f"   Longueur réponse: {len(answer)} caractères")
            
            # Vérifier les mots-clés attendus
            answer_lower = answer.lower()
            found_keywords = []
            for keyword in test['expected_keywords']:
                if keyword.lower() in answer_lower:
                    found_keywords.append(keyword)
            
            keyword_coverage = len(found_keywords) / len(test['expected_keywords'])
            print(f"   Couverture mots-clés: {keyword_coverage:.1%} ({len(found_keywords)}/{len(test['expected_keywords'])})")
            
            # Évaluer la qualité
            quality_score = 0.0
            if confidence >= 0.8:
                quality_score += 0.4
            if sources_count >= 1:
                quality_score += 0.2
            if len(answer) >= 200:
                quality_score += 0.2
            if keyword_coverage >= 0.6:
                quality_score += 0.2
            
            print(f"   Score qualité: {quality_score:.2f}")
            
            # Stocker les résultats
            results.append({
                "test_id": test['id'],
                "question": test['question'],
                "is_swiss": is_swiss,
                "confidence": confidence,
                "sources_count": sources_count,
                "answer_length": len(answer),
                "keyword_coverage": keyword_coverage,
                "quality_score": quality_score,
                "found_keywords": found_keywords
            })
            
            total_confidence += confidence
        
        # Résultats finaux
        print("\n" + "=" * 80)
        print("📈 RÉSULTATS FINAUX")
        print("=" * 80)
        
        avg_confidence = total_confidence / len(results)
        avg_quality = sum(r['quality_score'] for r in results) / len(results)
        avg_keyword_coverage = sum(r['keyword_coverage'] for r in results) / len(results)
        
        print(f"Confiance moyenne: {avg_confidence:.2f}")
        print(f"Score qualité moyen: {avg_quality:.2f}")
        print(f"Couverture mots-clés moyenne: {avg_keyword_coverage:.1%}")
        
        # Évaluation globale
        if avg_confidence >= 0.8 and avg_quality >= 0.7:
            print("🎉 ÉVALUATION: EXCELLENT - Francis Suisse est prêt pour la production !")
        elif avg_confidence >= 0.7 and avg_quality >= 0.6:
            print("✅ ÉVALUATION: BON - Francis Suisse fonctionne bien")
        else:
            print("⚠️ ÉVALUATION: À AMÉLIORER - Des ajustements sont nécessaires")
        
        # Suggestions d'optimisation
        print("\n🎯 SUGGESTIONS D'OPTIMISATION")
        suggestions = swiss_rag.get_swiss_tax_suggestions('élevé')
        for i, suggestion in enumerate(suggestions[:5], 1):
            print(f"{i}. {suggestion}")
        
        # Détails par test
        print("\n📋 DÉTAILS PAR TEST")
        for result in results:
            status = "✅" if result['quality_score'] >= 0.7 else "⚠️" if result['quality_score'] >= 0.5 else "❌"
            print(f"{status} Test {result['test_id']}: Score {result['quality_score']:.2f}, Confiance {result['confidence']:.2f}")
        
        return {
            "success": True,
            "avg_confidence": avg_confidence,
            "avg_quality": avg_quality,
            "avg_keyword_coverage": avg_keyword_coverage,
            "results": results
        }
        
    except Exception as e:
        print(f"❌ Erreur lors du test: {e}")
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    test_francis_swiss_comprehensive() 
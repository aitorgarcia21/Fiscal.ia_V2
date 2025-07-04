#!/usr/bin/env python3
"""
Test final ultra-complet de Francis Suisse - Assistant fiscal ultra-pointu
Validation de la précision sur tous les aspects : traités internationaux, situations complexes, optimisations avancées
"""

import sys
import json
from typing import Dict, Any

# Ajouter le répertoire courant au path
sys.path.append('.')

def test_francis_swiss_ultra_comprehensive():
    """Test ultra-complet de Francis Suisse avec questions ultra-pointues"""
    
    print("🎯 TEST FINAL ULTRA-COMPLET FRANCIS SUISSE")
    print("=" * 80)
    
    try:
        from rag_swiss import SwissRAGSystem
        from assistant_fiscal import is_swiss_fiscal_question
        
        # Initialisation
        print("🔄 Initialisation du système ultra-pointu...")
        swiss_rag = SwissRAGSystem()
        print(f"✅ Système initialisé: {len(swiss_rag.chunks_cache)} chunks, {len(swiss_rag.embeddings_cache)} embeddings")
        
        # Questions de test ultra-pointues
        test_questions = [
            {
                "id": 1,
                "category": "TRAITÉS INTERNATIONAUX",
                "question": "Comment fonctionne l'accord fiscal franco-suisse pour un frontalier travaillant à Genève et résidant en France ?",
                "expected_keywords": ["accord fiscal", "franco-suisse", "frontalier", "Genève", "France", "double imposition"]
            },
            {
                "id": 2,
                "category": "RÉSIDENTS NON DOMICILIÉS",
                "question": "Quelles sont les conditions et avantages de l'imposition forfaitaire pour un étranger fortuné en Suisse en 2025 ?",
                "expected_keywords": ["imposition forfaitaire", "étranger", "fortuné", "2025", "dépenses", "400'000"]
            },
            {
                "id": 3,
                "category": "SOCIÉTÉS HOLDING",
                "question": "Comment optimiser fiscalement une société holding en Suisse avec des participations dans l'UE ?",
                "expected_keywords": ["société holding", "participations", "UE", "taux réduit", "1%", "optimisation"]
            },
            {
                "id": 4,
                "category": "OPTIMISATION INTERNATIONALE",
                "question": "Quelles sont les meilleures stratégies d'optimisation fiscale pour un couple multinational gagnant 300000 CHF avec des revenus en France et en Suisse ?",
                "expected_keywords": ["couple multinational", "300'000", "France", "Suisse", "stratégies", "optimisation"]
            },
            {
                "id": 5,
                "category": "PILIER 3A AVANCÉ",
                "question": "Quel est le montant maximum déductible pour le pilier 3A en 2025 pour un salarié affilié à la LPP versus un indépendant ?",
                "expected_keywords": ["pilier 3A", "7'056", "35'280", "2025", "LPP", "indépendant"]
            },
            {
                "id": 6,
                "category": "COMPARAISONS CANTONALES",
                "question": "Calculez précisément l'impôt total pour un célibataire gagnant 120000 CHF en 2025 à Genève versus Zurich",
                "expected_keywords": ["120'000", "2025", "Genève", "Zurich", "impôt", "calcul"]
            },
            {
                "id": 7,
                "category": "COTISATIONS SOCIALES",
                "question": "Quelles sont les cotisations AVS/AI et LPP pour un salarié gagnant 80000 CHF par an en 2025 ?",
                "expected_keywords": ["AVS", "AI", "LPP", "5.30%", "8.25%", "80'000", "2025"]
            },
            {
                "id": 8,
                "category": "SITUATIONS COMPLEXES",
                "question": "Comment optimiser une succession en Suisse pour un couple avec enfants et un patrimoine de 2 millions CHF ?",
                "expected_keywords": ["succession", "patrimoine", "2 millions", "optimisation", "enfants"]
            }
        ]
        
        results = []
        total_confidence = 0.0
        
        for test in test_questions:
            print(f"\n📊 TEST {test['id']}: {test['category']}")
            print(f"Q: {test['question'][:80]}...")
            
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
            if len(answer) >= 300:
                quality_score += 0.2
            if keyword_coverage >= 0.6:
                quality_score += 0.2
            
            print(f"   Score qualité: {quality_score:.2f}")
            
            # Stocker les résultats
            results.append({
                "test_id": test['id'],
                "category": test['category'],
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
        print("📈 RÉSULTATS FINAUX ULTRA-COMPLETS")
        print("=" * 80)
        
        avg_confidence = total_confidence / len(results)
        avg_quality = sum(r['quality_score'] for r in results) / len(results)
        avg_keyword_coverage = sum(r['keyword_coverage'] for r in results) / len(results)
        
        print(f"Confiance moyenne: {avg_confidence:.2f}")
        print(f"Score qualité moyen: {avg_quality:.2f}")
        print(f"Couverture mots-clés moyenne: {avg_keyword_coverage:.1%}")
        
        # Évaluation globale
        if avg_confidence >= 0.85 and avg_quality >= 0.8:
            print("🎉 ÉVALUATION: EXCELLENT - Francis Suisse est ULTRA-POINTU !")
        elif avg_confidence >= 0.8 and avg_quality >= 0.7:
            print("✅ ÉVALUATION: TRÈS BON - Francis Suisse est très performant")
        else:
            print("⚠️ ÉVALUATION: À AMÉLIORER - Des ajustements sont nécessaires")
        
        # Suggestions d'optimisation avancées
        print("\n🎯 SUGGESTIONS D'OPTIMISATION ULTRA-AVANCÉES")
        suggestions = swiss_rag.get_swiss_tax_suggestions('élevé')
        for i, suggestion in enumerate(suggestions[:10], 1):
            print(f"{i}. {suggestion}")
        
        # Détails par catégorie
        print("\n📋 DÉTAILS PAR CATÉGORIE")
        categories = {}
        for result in results:
            cat = result['category']
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(result)
        
        for category, cat_results in categories.items():
            cat_avg_quality = sum(r['quality_score'] for r in cat_results) / len(cat_results)
            cat_avg_confidence = sum(r['confidence'] for r in cat_results) / len(cat_results)
            status = "✅" if cat_avg_quality >= 0.8 else "⚠️" if cat_avg_quality >= 0.6 else "❌"
            print(f"{status} {category}: Score {cat_avg_quality:.2f}, Confiance {cat_avg_confidence:.2f}")
        
        # Détails par test
        print("\n📋 DÉTAILS PAR TEST")
        for result in results:
            status = "✅" if result['quality_score'] >= 0.8 else "⚠️" if result['quality_score'] >= 0.6 else "❌"
            print(f"{status} Test {result['test_id']} ({result['category']}): Score {result['quality_score']:.2f}, Confiance {result['confidence']:.2f}")
        
        return {
            "success": True,
            "avg_confidence": avg_confidence,
            "avg_quality": avg_quality,
            "avg_keyword_coverage": avg_keyword_coverage,
            "results": results,
            "categories": categories
        }
        
    except Exception as e:
        print(f"❌ Erreur lors du test: {e}")
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    test_francis_swiss_ultra_comprehensive() 
"""
🎯 DÉTECTEUR DE PROFILS FISCAUX POUR FRANCIS
============================================

Ce module analyse les questions des utilisateurs pour détecter automatiquement
leur profil fiscal et orienter Francis vers les bonnes connaissances.
"""

import re
import os
import json
import requests
from typing import Dict, List, Optional, Tuple
from enum import Enum
from dataclasses import dataclass
from knowledge_base_multi_profiles import ProfileType, RegimeFiscal, ThemeFiscal
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ProfileMatch:
    """Résultat de détection de profil"""
    profile_type: ProfileType
    regime_fiscal: Optional[RegimeFiscal]
    theme_fiscal: Optional[ThemeFiscal]
    confidence_score: float
    detected_keywords: List[str]
    semantic_indicators: List[str]  # Nouveaux indicateurs sémantiques
    context_score: float  # Score contextuel
    reasoning: str  # Explication du choix

class ProfileDetector:
    """Détecteur de profils fiscaux basé sur l'analyse textuelle"""
    
    def __init__(self):
        self.profile_patterns = self._build_profile_patterns()
        self.regime_patterns = self._build_regime_patterns()
        self.theme_patterns = self._build_theme_patterns()
        
        # Nouveaux systèmes sémantiques
        self.context_patterns = self._build_context_patterns()
        self.semantic_indicators = self._build_semantic_indicators()
        self.business_size_indicators = self._build_business_size_indicators()
        self.intent_patterns = self._build_intent_patterns()
    
    def detect_profile(self, question: str) -> List[ProfileMatch]:
        """
        Détecte les profils fiscaux potentiels avec analyse sémantique avancée
        
        Args:
            question: Question de l'utilisateur
            
        Returns:
            Liste des profils détectés avec scores de confiance et raisonnement
        """
        question_lower = question.lower()
        matches = []
        
        logger.info(f"🎯 Analyse sémantique de la question: {question[:100]}...")
        
        # Analyser chaque type de profil avec intelligence sémantique
        for profile_type, patterns in self.profile_patterns.items():
            # Score basique (mots-clés)
            basic_score, keywords = self._calculate_profile_score(question_lower, patterns)
            
            # Score contextuel avancé
            context_score, semantic_indicators = self._calculate_semantic_score(question_lower, profile_type)
            
            # Score de taille d'entreprise
            size_score = self._calculate_business_size_score(question_lower, profile_type)
            
            # Score d'intention métier
            intent_score, intent_reasoning = self._calculate_intent_score(question_lower, profile_type)
            
            # Score de confiance composite
            confidence_score = self._compute_composite_confidence(
                basic_score, context_score, size_score, intent_score
            )
            
            # Seuil de confiance adaptatif
            threshold = self._get_adaptive_threshold(profile_type)
            
            if confidence_score > threshold:
                # Détecter le régime fiscal associé
                regime = self._detect_regime(question_lower, profile_type)
                # Détecter le thème fiscal
                theme = self._detect_theme(question_lower)
                
                # Générer le raisonnement
                reasoning = self._generate_reasoning(
                    profile_type, basic_score, context_score, 
                    size_score, intent_score, keywords, semantic_indicators
                )
                
                matches.append(ProfileMatch(
                    profile_type=profile_type,
                    regime_fiscal=regime,
                    theme_fiscal=theme,
                    confidence_score=confidence_score,
                    detected_keywords=keywords,
                    semantic_indicators=semantic_indicators,
                    context_score=context_score,
                    reasoning=reasoning
                ))
                
                logger.info(f"✅ Profil détecté: {profile_type.value} (confiance: {confidence_score:.2f})")
        
        # Trier par score de confiance décroissant
        matches.sort(key=lambda x: x.confidence_score, reverse=True)
        
        # Log du résultat final
        if matches:
            logger.info(f"🎯 Meilleur match: {matches[0].profile_type.value} ({matches[0].confidence_score:.2f})")
        else:
            logger.info("⚠️ Aucun profil détecté avec suffisamment de confiance")
        
        return matches
    
    def _build_profile_patterns(self) -> Dict[ProfileType, Dict[str, List[str]]]:
        """Construit les patterns de détection pour chaque profil"""
        return {
            ProfileType.ENTREPRENEUR_INDIVIDUEL: {
                "primary": [
                    "entrepreneur individuel", "ei", "auto entrepreneur", "auto-entrepreneur",
                    "micro entreprise", "micro-entreprise", "travailleur indépendant"
                ],
                "secondary": [
                    "urssaf", "rsi", "charges sociales", "cotisations", "bic", "bnc"
                ],
                "context": [
                    "créer entreprise", "statut juridique", "régime fiscal"
                ]
            },
            
            ProfileType.DIRIGEANT_SASU: {
                "primary": [
                    "sasu", "président sasu", "dirigeant sasu", "société par actions simplifiée"
                ],
                "secondary": [
                    "dividendes", "rémunération dirigeant", "is", "impôt société",
                    "assimilé salarié", "cotisations sociales dirigeant"
                ],
                "context": [
                    "optimisation rémunération", "arbitrage salaire dividendes"
                ]
            },
            
            ProfileType.GERANT_SARL: {
                "primary": [
                    "sarl", "gérant sarl", "gérant majoritaire", "gérant minoritaire",
                    "société à responsabilité limitée"
                ],
                "secondary": [
                    "tns", "travailleur non salarié", "parts sociales",
                    "gérant égalitaire", "rémunération gérant"
                ],
                "context": [
                    "statut gérant", "cotisations tns", "régime social"
                ]
            },
            
            ProfileType.INVESTISSEUR_SCI: {
                "primary": [
                    "sci", "société civile immobilière", "investissement immobilier"
                ],
                "secondary": [
                    "revenus fonciers", "location", "parts sci", "plus values immobilières",
                    "ir sci", "is sci", "amortissement immobilier"
                ],
                "context": [
                    "déficit foncier", "choix fiscal sci", "transmission patrimoine"
                ]
            },
            
            ProfileType.GROUPE_HOLDING: {
                "primary": [
                    "holding", "société mère", "filiale", "groupe société"
                ],
                "secondary": [
                    "intégration fiscale", "consolidation", "régime mère fille",
                    "dividendes filiale", "plus values cession"
                ],
                "context": [
                    "optimisation groupe", "restructuration", "transmission entreprise"
                ]
            },
            
            ProfileType.LOUEUR_MEUBLE: {
                "primary": [
                    "lmnp", "lmp", "location meublée", "loueur meublé",
                    "meublé professionnel", "meublé non professionnel"
                ],
                "secondary": [
                    "amortissement mobilier", "régime réel", "déficit lmnp",
                    "seuils lmp", "airbnb", "location courte durée"
                ],
                "context": [
                    "investissement locatif", "optimisation meublé", "fiscalité location"
                ]
            },
            
            ProfileType.PROFESSIONNEL_LIBERAL: {
                "primary": [
                    "profession libérale", "libéral", "médecin", "avocat", "architecte",
                    "consultant", "conseil", "expert comptable", "notaire"
                ],
                "secondary": [
                    "bnc", "bénéfices non commerciaux", "honoraires",
                    "charges professionnelles", "formation continue"
                ],
                "context": [
                    "déduction charges", "régime déclaratif", "cotisations ordinales"
                ]
            },
            
            ProfileType.COMMERCANT: {
                "primary": [
                    "commerçant", "commerce", "magasin", "boutique", "vente"
                ],
                "secondary": [
                    "stocks", "marchandises", "tva", "régime réel", "bic"
                ],
                "context": [
                    "gestion stocks", "franchise tva", "comptabilité commerce"
                ]
            },
            
            ProfileType.ARTISAN: {
                "primary": [
                    "artisan", "artisanat", "métier manuel", "chambre métiers"
                ],
                "secondary": [
                    "qualification artisanale", "bic artisan", "charges matières"
                ],
                "context": [
                    "statut artisan", "régime fiscal artisan"
                ]
            }
        }
    
    def _build_regime_patterns(self) -> Dict[RegimeFiscal, List[str]]:
        """Patterns pour détecter les régimes fiscaux"""
        return {
            RegimeFiscal.MICRO_BIC: [
                "micro bic", "micro-bic", "régime micro", "auto entrepreneur",
                "seuils micro", "abattement forfaitaire"
            ],
            RegimeFiscal.MICRO_BNC: [
                "micro bnc", "micro-bnc", "régime micro bnc", "abattement 34"
            ],
            RegimeFiscal.REEL_SIMPLIFIE: [
                "réel simplifié", "reel simplifie", "régime réel", "charges réelles"
            ],
            RegimeFiscal.REEL_NORMAL: [
                "réel normal", "reel normal", "comptabilité complète"
            ],
            RegimeFiscal.IMPOT_SOCIETES: [
                "is", "impôt société", "impot societe", "taux is", "15% 25%"
            ],
            RegimeFiscal.IMPOT_REVENU: [
                "ir", "impôt revenu", "impot revenu", "barème progressif", "tmi"
            ],
            RegimeFiscal.LMNP: [
                "lmnp", "loueur meublé non professionnel", "seuils lmnp"
            ],
            RegimeFiscal.LMP: [
                "lmp", "loueur meublé professionnel", "condition lmp"
            ]
        }
    
    def _build_theme_patterns(self) -> Dict[ThemeFiscal, List[str]]:
        """Patterns pour détecter les thèmes fiscaux"""
        return {
            ThemeFiscal.TVA: [
                "tva", "taxe valeur ajoutée", "franchise tva", "récupération tva",
                "déclaration ca3", "régime tva"
            ],
            ThemeFiscal.URSSAF: [
                "urssaf", "cotisations sociales", "charges sociales", "rsi",
                "tns", "assimilé salarié"
            ],
            ThemeFiscal.DIVIDENDES: [
                "dividendes", "distribution", "pfu", "flat tax", "abattement 40%"
            ],
            ThemeFiscal.AMORTISSEMENTS: [
                "amortissement", "amortir", "dépréciation", "immobilisation"
            ],
            ThemeFiscal.PER: [
                "per", "plan épargne retraite", "déduction retraite", "madelin"
            ],
            ThemeFiscal.PEA: [
                "pea", "plan épargne actions", "plus values", "exonération"
            ],
            ThemeFiscal.OPTIMISATION: [
                "optimisation", "optimiser", "réduire impôts", "économie fiscale",
                "conseil fiscal", "stratégie fiscale"
            ],
            ThemeFiscal.INTEGRATION_FISCALE: [
                "intégration fiscale", "groupe fiscal", "consolidation"
            ],
            ThemeFiscal.PLUS_VALUES: [
                "plus values", "plus-values", "cession", "vente"
            ],
            ThemeFiscal.DEFISCALISATION: [
                "défiscalisation", "défiscaliser", "réduction impôt",
                "pinel", "malraux", "girardin"
            ]
        }
    
    def _calculate_profile_score(self, question: str, patterns: Dict[str, List[str]]) -> Tuple[float, List[str]]:
        """Calcule le score de correspondance pour un profil"""
        score = 0.0
        detected_keywords = []
        
        # Mots-clés primaires (poids fort)
        for keyword in patterns.get("primary", []):
            if keyword in question:
                score += 1.0
                detected_keywords.append(keyword)
        
        # Mots-clés secondaires (poids moyen)
        for keyword in patterns.get("secondary", []):
            if keyword in question:
                score += 0.6
                detected_keywords.append(keyword)
        
        # Mots-clés contextuels (poids faible)
        for keyword in patterns.get("context", []):
            if keyword in question:
                score += 0.3
                detected_keywords.append(keyword)
        
        # Normaliser le score (0-1)
        max_possible_score = len(patterns.get("primary", [])) * 1.0 + \
                           len(patterns.get("secondary", [])) * 0.6 + \
                           len(patterns.get("context", [])) * 0.3
        
        if max_possible_score > 0:
            score = min(score / max_possible_score, 1.0)
        
        return score, detected_keywords
    
    def _detect_regime(self, question: str, profile_type: ProfileType) -> Optional[RegimeFiscal]:
        """Détecte le régime fiscal le plus probable"""
        best_regime = None
        best_score = 0
        
        for regime, keywords in self.regime_patterns.items():
            score = sum(1 for keyword in keywords if keyword in question)
            if score > best_score:
                best_score = score
                best_regime = regime
        
        return best_regime
    
    def _detect_theme(self, question: str) -> Optional[ThemeFiscal]:
        """Détecte le thème fiscal principal"""
        best_theme = None
        best_score = 0
        
        for theme, keywords in self.theme_patterns.items():
            score = sum(1 for keyword in keywords if keyword in question)
            if score > best_score:
                best_score = score
                best_theme = theme
        
        return best_theme

    def _calculate_semantic_score(self, question: str, profile_type: ProfileType) -> Tuple[float, List[str]]:
        """Calcul du score sémantique basé sur le contexte métier"""
        semantic_indicators = []
        score = 0.0
        
        # Analyse contextuelle selon le profil
        context_patterns = self.context_patterns.get(profile_type, {})
        
        for context_type, indicators in context_patterns.items():
            for indicator in indicators:
                if indicator in question:
                    score += self._get_context_weight(context_type)
                    semantic_indicators.append(f"{context_type}:{indicator}")
        
        # Analyse sémantique avancée
        semantic_patterns = self.semantic_indicators.get(profile_type, [])
        for pattern in semantic_patterns:
            if pattern["pattern"] in question:
                score += pattern["weight"]
                semantic_indicators.append(pattern["indicator"])
        
        return min(score, 1.0), semantic_indicators
    
    def _calculate_business_size_score(self, question: str, profile_type: ProfileType) -> float:
        """Score basé sur les indicateurs de taille d'entreprise"""
        size_indicators = self.business_size_indicators.get(profile_type, {})
        score = 0.0
        
        for size_category, patterns in size_indicators.items():
            for pattern in patterns:
                if pattern in question:
                    score += self._get_size_weight(size_category, profile_type)
        
        return min(score, 1.0)
    
    def _calculate_intent_score(self, question: str, profile_type: ProfileType) -> Tuple[float, str]:
        """Score basé sur l'intention détectée dans la question"""
        intent_patterns = self.intent_patterns.get(profile_type, {})
        best_score = 0.0
        best_intent = "unknown"
        
        for intent_type, patterns in intent_patterns.items():
            intent_score = 0.0
            for pattern in patterns:
                if pattern in question:
                    intent_score += 0.3
            
            if intent_score > best_score:
                best_score = intent_score
                best_intent = intent_type
        
        return min(best_score, 1.0), best_intent
    
    def _compute_composite_confidence(self, basic_score: float, context_score: float, 
                                    size_score: float, intent_score: float) -> float:
        """Calcul du score de confiance composite"""
        # Pondération adaptative
        weights = {
            'basic': 0.4,      # Mots-clés de base
            'context': 0.3,    # Contexte sémantique  
            'size': 0.2,       # Taille entreprise
            'intent': 0.1      # Intention utilisateur
        }
        
        composite_score = (
            basic_score * weights['basic'] +
            context_score * weights['context'] +
            size_score * weights['size'] +
            intent_score * weights['intent']
        )
        
        return min(composite_score, 1.0)
    
    def _get_adaptive_threshold(self, profile_type: ProfileType) -> float:
        """Seuil de confiance adaptatif selon le profil"""
        # Seuils adaptés à la complexité du profil
        thresholds = {
            ProfileType.GROUPE_HOLDING: 0.25,          # Profil complexe, seuil bas
            ProfileType.INVESTISSEUR_SCI: 0.25,
            ProfileType.DIRIGEANT_SASU: 0.3,
            ProfileType.GERANT_SARL: 0.3,
            ProfileType.PROFESSIONNEL_LIBERAL: 0.35,
            ProfileType.ENTREPRENEUR_INDIVIDUEL: 0.4,   # Profil simple, seuil plus élevé
            ProfileType.COMMERCANT: 0.4,
            ProfileType.ARTISAN: 0.4,
            ProfileType.LOUEUR_MEUBLE: 0.35
        }
        
        return thresholds.get(profile_type, 0.3)
    
    def _generate_reasoning(self, profile_type: ProfileType, basic_score: float, 
                          context_score: float, size_score: float, intent_score: float,
                          keywords: List[str], semantic_indicators: List[str]) -> str:
        """Génère une explication du choix de profil"""
        reasoning_parts = []
        
        if basic_score > 0.5:
            reasoning_parts.append(f"Mots-clés directs détectés: {', '.join(keywords[:3])}")
        
        if context_score > 0.3:
            reasoning_parts.append(f"Contexte métier cohérent: {', '.join(semantic_indicators[:2])}")
        
        if size_score > 0.2:
            reasoning_parts.append("Indicateurs de taille d'entreprise correspondants")
        
        if intent_score > 0.2:
            reasoning_parts.append("Intention utilisateur alignée avec le profil")
        
        composite_confidence = self._compute_composite_confidence(basic_score, context_score, size_score, intent_score)
        
        if composite_confidence > 0.7:
            confidence_level = "très élevée"
        elif composite_confidence > 0.5:
            confidence_level = "élevée"
        elif composite_confidence > 0.3:
            confidence_level = "modérée"
        else:
            confidence_level = "faible"
        
        reasoning = f"Profil {profile_type.value} détecté avec confiance {confidence_level} ({composite_confidence:.2f}). "
        
        if reasoning_parts:
            reasoning += "Raisons: " + "; ".join(reasoning_parts) + "."
        
        return reasoning
    
    def _get_context_weight(self, context_type: str) -> float:
        """Poids des différents types de contexte"""
        weights = {
            'business_context': 0.4,
            'regulatory_context': 0.3,
            'financial_context': 0.2,
            'operational_context': 0.1
        }
        return weights.get(context_type, 0.1)
    
    def _get_size_weight(self, size_category: str, profile_type: ProfileType) -> float:
        """Poids selon la taille d'entreprise et le profil"""
        base_weights = {
            'micro': 0.1,
            'small': 0.2, 
            'medium': 0.3,
            'large': 0.4
        }
        
        # Ajustement selon le profil
        if profile_type in [ProfileType.GROUPE_HOLDING, ProfileType.INVESTISSEUR_SCI]:
            # Ces profils sont plutôt orientés "grandes structures"
            return base_weights.get(size_category, 0.1) * 1.5
        elif profile_type in [ProfileType.ENTREPRENEUR_INDIVIDUEL, ProfileType.ARTISAN]:
            # Ces profils sont plutôt "petites structures"
            return base_weights.get(size_category, 0.1) * 0.7
        
        return base_weights.get(size_category, 0.1)
    
    def _build_context_patterns(self) -> Dict[ProfileType, Dict[str, List[str]]]:
        """Patterns contextuels avancés pour chaque profil"""
        return {
            ProfileType.GROUPE_HOLDING: {
                'business_context': [
                    'filiales', 'participations', 'consolidation', 'groupe',
                    'intégration fiscale', 'mère-fille', 'dividendes remontés'
                ],
                'regulatory_context': [
                    'régime mère-fille', 'beps', 'prix de transfert',
                    'substance économique', 'anti-évasion'
                ],
                'financial_context': [
                    'effet de levier', 'financement acquisition',
                    'optimisation fiscale', 'cash pooling'
                ]
            },
            
            ProfileType.INVESTISSEUR_SCI: {
                'business_context': [
                    'immobilier locatif', 'patrimoine immobilier', 'revenus fonciers',
                    'plus-values immobilières', 'démembrement', 'transmission'
                ],
                'regulatory_context': [
                    'ifi', 'impôt fortune immobilière', 'abattement durée détention',
                    'régime réel', 'micro-foncier'
                ],
                'operational_context': [
                    'gestion locative', 'travaux déductibles', 'amortissements',
                    'charges déductibles', 'déficit foncier'
                ]
            },
            
            ProfileType.DIRIGEANT_SASU: {
                'business_context': [
                    'rémunération dirigeant', 'arbitrage salaire dividendes',
                    'assimilé salarié', 'président sasu', 'optimisation rémunération'
                ],
                'regulatory_context': [
                    'charges sociales dirigeant', 'pfu', 'flat tax',
                    'cotisations sociales', 'urssaf'
                ],
                'financial_context': [
                    'distribution dividendes', 'réserves', 'report à nouveau',
                    'compte courant associé'
                ]
            }
        }
    
    def _build_semantic_indicators(self) -> Dict[ProfileType, List[Dict[str, any]]]:
        """Indicateurs sémantiques avec poids"""
        return {
            ProfileType.PROFESSIONNEL_LIBERAL: [
                {"pattern": "honoraires", "weight": 0.4, "indicator": "revenus_professionnels"},
                {"pattern": "bnc", "weight": 0.5, "indicator": "regime_fiscal"},
                {"pattern": "urssaf", "weight": 0.3, "indicator": "charges_sociales"},
                {"pattern": "déclaration 2035", "weight": 0.6, "indicator": "régime_déclaratif"},
                {"pattern": "charges déductibles", "weight": 0.3, "indicator": "optimisation"},
                {"pattern": "provisions", "weight": 0.4, "indicator": "gestion_avancée"}
            ],
            
            ProfileType.COMMERCANT: [
                {"pattern": "stock", "weight": 0.4, "indicator": "activité_commerciale"},
                {"pattern": "marge commerciale", "weight": 0.5, "indicator": "métrique_business"},
                {"pattern": "tva collectée", "weight": 0.3, "indicator": "gestion_tva"},
                {"pattern": "franchise tva", "weight": 0.4, "indicator": "régime_tva"},
                {"pattern": "clientèle b2b", "weight": 0.3, "indicator": "segment_client"},
                {"pattern": "point de vente", "weight": 0.3, "indicator": "distribution"}
            ]
        }
    
    def _build_business_size_indicators(self) -> Dict[ProfileType, Dict[str, List[str]]]:
        """Indicateurs de taille d'entreprise par profil"""
        return {
            ProfileType.GROUPE_HOLDING: {
                'large': ['consolidation', 'filiales multiples', 'international', 'cotation'],
                'medium': ['plusieurs participations', 'groupe régional', 'expansion'],
                'small': ['holding familiale', 'quelques participations']
            },
            
            ProfileType.ENTREPRENEUR_INDIVIDUEL: {
                'micro': ['micro-entreprise', 'auto-entrepreneur', 'freelance'],
                'small': ['artisan', 'commerce local', 'indépendant'],
                'medium': ['entreprise individuelle', 'équipe', 'développement']
            }
        }
    
    def _build_intent_patterns(self) -> Dict[ProfileType, Dict[str, List[str]]]:
        """Patterns d'intention utilisateur"""
        return {
            ProfileType.DIRIGEANT_SASU: {
                'optimization': ['optimiser', 'réduire charges', 'économiser'],
                'structuring': ['créer sasu', 'passer en société', 'structure'],
                'compliance': ['obligations', 'déclarations', 'conformité'],
                'planning': ['stratégie', 'projection', 'anticipation']
            },
            
            ProfileType.INVESTISSEUR_SCI: {
                'acquisition': ['acheter', 'acquérir', 'investir'],
                'optimization': ['défiscaliser', 'optimiser', 'réduire ifi'],
                'transmission': ['transmettre', 'succession', 'donation']
            }
        }

# Instance globale
profile_detector = ProfileDetector()

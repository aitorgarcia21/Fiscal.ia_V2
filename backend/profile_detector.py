"""
🎯 DÉTECTEUR DE PROFILS FISCAUX POUR FRANCIS
============================================

Ce module analyse les questions des utilisateurs pour détecter automatiquement
leur profil fiscal et orienter Francis vers les bonnes connaissances.
"""

import re
from typing import Dict, List, Optional, Tuple
from enum import Enum
from dataclasses import dataclass
from knowledge_base_multi_profiles import ProfileType, RegimeFiscal, ThemeFiscal

@dataclass
class ProfileMatch:
    """Résultat de détection de profil"""
    profile_type: ProfileType
    regime_fiscal: Optional[RegimeFiscal]
    theme_fiscal: Optional[ThemeFiscal]
    confidence_score: float
    detected_keywords: List[str]

class ProfileDetector:
    """Détecteur de profils fiscaux basé sur l'analyse textuelle"""
    
    def __init__(self):
        self.profile_patterns = self._build_profile_patterns()
        self.regime_patterns = self._build_regime_patterns()
        self.theme_patterns = self._build_theme_patterns()
    
    def detect_profile(self, question: str) -> List[ProfileMatch]:
        """
        Détecte les profils fiscaux potentiels dans une question
        
        Args:
            question: Question de l'utilisateur
            
        Returns:
            Liste des profils détectés avec scores de confiance
        """
        question_lower = question.lower()
        matches = []
        
        # Analyser chaque type de profil
        for profile_type, patterns in self.profile_patterns.items():
            score, keywords = self._calculate_profile_score(question_lower, patterns)
            if score > 0.3:  # Seuil de confiance minimum
                # Détecter le régime fiscal associé
                regime = self._detect_regime(question_lower, profile_type)
                # Détecter le thème fiscal
                theme = self._detect_theme(question_lower)
                
                matches.append(ProfileMatch(
                    profile_type=profile_type,
                    regime_fiscal=regime,
                    theme_fiscal=theme,
                    confidence_score=score,
                    detected_keywords=keywords
                ))
        
        # Trier par score de confiance décroissant
        matches.sort(key=lambda x: x.confidence_score, reverse=True)
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

# Instance globale
profile_detector = ProfileDetector()

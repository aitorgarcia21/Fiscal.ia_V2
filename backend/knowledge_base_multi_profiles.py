"""
📚 BASE DE CONNAISSANCES MULTI-PROFILS VECTORISÉE POUR FRANCIS
================================================================

Ce module contient une base de connaissances complète structurée par profils
et cas d'usage pour permettre à Francis de répondre avec précision selon
le contexte détecté dans les questions des utilisateurs.

Catégories couvertes :
- Régimes fiscaux : Micro, réel, IS, IR, LMNP, LMP
- Statuts juridiques : EI, SASU, SARL, SCI, Holding
- Thèmes clés : TVA, URSSAF, dividendes, amortissements, PER, impôt société
- Cas concrets : Exemples CGP, simulateurs, montages légaux
- Optimisations : PEA, PER, intégration fiscale, sociétés civiles, etc.
"""

import os
import json
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import requests
from functools import lru_cache
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProfileType(Enum):
    """Types de profils fiscaux"""
    ENTREPRENEUR_INDIVIDUEL = "entrepreneur_individuel"
    DIRIGEANT_SASU = "dirigeant_sasu"
    GERANT_SARL = "gerant_sarl"
    INVESTISSEUR_SCI = "investisseur_sci"
    GROUPE_HOLDING = "groupe_holding"
    LOUEUR_MEUBLE = "loueur_meuble"
    PROFESSIONNEL_LIBERAL = "professionnel_liberal"
    COMMERCANT = "commercant"
    ARTISAN = "artisan"

class RegimeFiscal(Enum):
    """Régimes fiscaux disponibles"""
    MICRO_BIC = "micro_bic"
    MICRO_BNC = "micro_bnc"
    REEL_SIMPLIFIE = "reel_simplifie"
    REEL_NORMAL = "reel_normal"
    IMPOT_SOCIETES = "impot_societes"
    IMPOT_REVENU = "impot_revenu"
    LMNP = "lmnp"
    LMP = "lmp"

class ThemeFiscal(Enum):
    """Thèmes fiscaux principaux"""
    TVA = "tva"
    URSSAF = "urssaf"
    DIVIDENDES = "dividendes"
    AMORTISSEMENTS = "amortissements"
    PER = "per"
    PEA = "pea"
    OPTIMISATION = "optimisation"
    INTEGRATION_FISCALE = "integration_fiscale"
    PLUS_VALUES = "plus_values"
    DEFISCALISATION = "defiscalisation"
    DEFICITS = "deficits"
    TRANSMISSION = "transmission"

@dataclass
class KnowledgeChunk:
    """Chunk de connaissance vectorisé"""
    id: str
    content: str
    profile_type: ProfileType
    regime_fiscal: RegimeFiscal
    theme_fiscal: ThemeFiscal
    tags: List[str]
    context: str
    examples: List[str]
    embedding: Optional[np.ndarray] = None
    similarity_score: float = 0.0

class MultiProfileKnowledgeBase:
    """Base de connaissances multi-profils vectorisée"""
    
    def __init__(self):
        self.knowledge_chunks: List[KnowledgeChunk] = []
        self.embeddings_cache = {}
        self.mistral_api_key = os.getenv('MISTRAL_API_KEY')
        self.mistral_api_url = "https://api.mistral.ai/v1/embeddings"
        
        # Initialiser avec la base de connaissances
        self._load_knowledge_base()
    
    def _load_knowledge_base(self):
        """Charge la base de connaissances complète"""
        logger.info("🔄 Chargement de la base de connaissances multi-profils...")
        
        # Charger toutes les catégories
        self._load_entrepreneur_individuel_knowledge()
        self._load_dirigeant_sasu_knowledge()
        self._load_gerant_sarl_knowledge()
        self._load_investisseur_sci_knowledge()
        self._load_groupe_holding_knowledge()
        self._load_loueur_meuble_knowledge()
        self._load_professionnel_liberal_knowledge()
        self._load_commercant_artisan_knowledge()
        self._load_optimisations_transversales()
        
        logger.info(f"✅ Base de connaissances chargée : {len(self.knowledge_chunks)} chunks")
    
    def _load_entrepreneur_individuel_knowledge(self):
        """Connaissances spécifiques aux entrepreneurs individuels"""
        
        chunks = [
            KnowledgeChunk(
                id="ei_micro_bic_001",
                content="""
                **RÉGIME MICRO-BIC POUR ENTREPRENEURS INDIVIDUELS**
                
                Le régime micro-BIC s'applique aux entrepreneurs individuels dont le CA annuel ne dépasse pas :
                - 188 700 € pour les activités de vente de marchandises
                - 77 700 € pour les activités de prestations de services
                
                **Avantages :**
                - Simplicité administrative : pas de comptabilité complexe
                - Abattement forfaitaire : 71% pour vente, 50% pour services
                - Pas de TVA si sous les seuils
                - Déclaration simplifiée sur 2042-C-PRO
                
                **Inconvénients :**
                - Pas de déduction des charges réelles
                - Cotisations sociales sur le CA total
                - Limitation du CA
                
                **Calcul de l'impôt :**
                Base imposable = CA - Abattement forfaitaire
                Cette base s'ajoute aux autres revenus pour le calcul de l'IR
                """,
                profile_type=ProfileType.ENTREPRENEUR_INDIVIDUEL,
                regime_fiscal=RegimeFiscal.MICRO_BIC,
                theme_fiscal=ThemeFiscal.OPTIMISATION,
                tags=["micro-bic", "entrepreneur individuel", "seuils", "abattement"],
                context="Entrepreneur individuel envisageant le régime micro-BIC",
                examples=[
                    "Consultant IT avec CA 45 000€ : base imposable = 45 000 - 50% = 22 500€",
                    "E-commerce avec CA 120 000€ : base imposable = 120 000 - 71% = 34 800€"
                ]
            )
        ]
        
        self.knowledge_chunks.extend(chunks)
    
    def _load_dirigeant_sasu_knowledge(self):
        """Connaissances SASU"""
        chunks = [
            KnowledgeChunk(
                id="sasu_optimisation_001",
                content="""
                **OPTIMISATION FISCALE DIRIGEANT SASU**
                
                La SASU offre une grande flexibilité d'optimisation entre IS, IR et rémunération/dividendes.
                
                **Stratégie rémunération vs dividendes :**
                
                **RÉMUNÉRATION :**
                - Déductible de l'IS (taux 15% jusqu'à 42 500€, puis 25%)
                - Cotisations sociales : ~82% du net (dirigeant assimilé salarié)
                - Ouvre droits : chômage, retraite, formation
                
                **DIVIDENDES :**
                - Soumis au PFU 30% ou option barème progressif IR
                - Pas de cotisations sociales
                - Abattement 40% si option barème IR
                
                **Optimisation recommandée :**
                1. Rémunération minimale pour valider 4 trimestres retraite (~6 400€/an)
                2. Complément en dividendes selon tranche marginale
                3. Si TMI ≤ 11% : privilégier dividendes avec abattement 40%
                4. Si TMI ≥ 30% : PFU plus avantageux
                """,
                profile_type=ProfileType.DIRIGEANT_SASU,
                regime_fiscal=RegimeFiscal.IMPOT_SOCIETES,
                theme_fiscal=ThemeFiscal.DIVIDENDES,
                tags=["SASU", "dividendes", "rémunération", "optimisation"],
                context="Dirigeant SASU optimisant sa rémunération",
                examples=[
                    "CA 100k€, bénéfice 60k€ : 6,4k€ salaire + 45k€ dividendes optimisés"
                ]
            )
        ]
        self.knowledge_chunks.extend(chunks)
    
    def _load_gerant_sarl_knowledge(self):
        """Connaissances SARL ultra-spécialisées pour CGP"""
        
        chunks = [
            KnowledgeChunk(
                id="sarl_is_ir_arbitrage_001",
                content="""**ARBITRAGE IS/IR EN SARL - STRATÉGIE AVANCÉE CGP**
                
                **Contexte :** SARL familiale, associés personnes physiques, CA > 10M€
                
                **OPTION IS (défaut si CA > 10M€) :**
                - Taux : 15% jusqu'à 42 500€ puis 25% (voire 28% si >250M€)
                - Gérant majoritaire : TNS (cotisations ~45%)
                - Distributions soumises PFU 30% ou barème IR
                - Possibilité report déficitaire illimité
                
                **OPTION IR (sous conditions) :**
                - Transparence fiscale : bénéfices imposés directement
                - Gérant majoritaire : BIC si commercial, BNC si libéral
                - Avantage si TMI associés < 25%
                - Déficits imputables sur revenus globaux
                
                **STRATÉGIE D'OPTIMISATION :**
                1. **Année de création** : IR pour imputer déficits
                2. **Développement** : basculer IS quand bénéfices > seuils
                3. **Transmission** : IS pour valorisation at stock-options
                4. **Holding** : IS obligatoire pour régime mère-fille
                
                **Calcul d'arbitrage type :**
                - Bénéfice 100k€, TMI associé 30%
                - IR : 30k€ d'économie vs IS+dividendes (15% + 30% = 42%)
                - Seuil de bascule : TMI > 25% → privilégier IS
                """,
                profile_type=ProfileType.GERANT_SARL,
                regime_fiscal=RegimeFiscal.IMPOT_SOCIETES,
                theme_fiscal=ThemeFiscal.OPTIMISATION,
                tags=["SARL", "IS", "IR", "arbitrage", "optimisation"],
                context="Gérant SARL optimisant régime fiscal",
                examples=[
                    "SARL familiale 2M€ CA : Option IR en création puis IS après 3 ans",
                    "SARL holding : IS obligatoire mais optimisation via intégration fiscale"
                ]
            ),
            
            KnowledgeChunk(
                id="sarl_demembrement_001",
                content="""**DÉMEMBREMENT DE PARTS SOCIALES SARL**
                
                **Technique avancée :** Séparation usufruit/nue-propriété pour optimisation transmission
                
                **MÉCANISME :**
                - Usufruit conservé par cédant (droits aux bénéfices)
                - Nue-propriété transmise avec décote (barème fiscal 60% à 70 ans)
                - Réunion automatique au décès de l'usufruitier
                
                **AVANTAGES FISCAUX :**
                1. **Donation** : décote nue-propriété = abattement majoré
                2. **ISF/IFI** : seule nue-propriété taxable chez donataire
                3. **Revenus** : conservés par usufruitier (pas d'impact cash-flow)
                4. **Succession** : transmission sans taxation si > 15 ans
                
                **VALORISATION ET DÉCOTES :**
                - Décote usufruit : barème fiscal (ex: 40% à 70 ans)
                - Décote nue-propriété : 100% - décote usufruit
                - Abattements donation : 100k€ par enfant tous les 15 ans
                - Décote supplémentaire pour pacte Dutreil : 75%
                
                **CAS PRATIQUE :**
                Parts SARL valorisées 1M€, dirigeant 70 ans :
                - Nue-propriété = 600k€ (décote 40%)
                - Don 3 enfants = 200k€ chacun
                - Après abattements : 100k€ taxables par enfant
                - Droits : ~20k€ par enfant vs 200k€ en pleine propriété
                """,
                profile_type=ProfileType.GERANT_SARL,
                regime_fiscal=RegimeFiscal.IMPOT_REVENU,
                theme_fiscal=ThemeFiscal.OPTIMISATION,
                tags=["démembrement", "transmission", "SARL", "donation"],
                context="Transmission SARL via démembrement",
                examples=[
                    "SARL 1M€ : démembrement → économie 150k€ droits succession",
                    "Combiné avec pacte Dutreil : décote totale 85%"
                ]
            )
        ]
        
        self.knowledge_chunks.extend(chunks)
    
    def _load_investisseur_sci_knowledge(self):
        """Connaissances SCI ultra-spécialisées pour CGP"""
        
        chunks = [
            KnowledgeChunk(
                id="sci_is_optimisation_001",
                content="""**SCI À L'IS - STRATÉGIE PATRIMONIALE AVANCÉE**
                
                **Contexte :** SCI détenant immobilier de rapport, associés TMI élevée
                
                **MÉCANISME SCI IS :**
                - Option irrévocable 5 ans, renouvelable
                - Taux IS : 15% jusqu'à 42 500€ puis 25%
                - Amortissements déductibles (2,5%/an sur 40 ans)
                - Provisions pour gros travaux déductibles
                - Reports déficitaires illimités
                
                **AVANTAGES VS SCI IR :**
                1. **Fiscalité réduite** : 25% vs TMI 45%
                2. **Amortissements** : réduction base imposable
                3. **Provisions** : lissage des charges exceptionnelles
                4. **Cash-flow** : optimisation via reports de distribution
                
                **STRATÉGIE DISTRIBUTION :**
                - Dividendes : PFU 30% ou barème IR avec abattement 40%
                - Compte courant associé : prêt 0% (attention réglementation)
                - Remboursement apports : exonéré si > 5 ans
                
                **CAS D'USAGE TYPE :**
                SCI 10 appartements, loyers 200k€/an :
                - IR : 200k€ × 45% TMI = 90k€ impôt
                - IS : (200k€ - 50k€ amortissements) × 25% = 37,5k€
                - **Économie annuelle : 52,5k€**
                
                **POINTS DE VIGILANCE :**
                - Plus-values soumises IS lors cession
                - Démembrement plus complexe
                - Exit difficile (attente 5 ans minimum)
                """,
                profile_type=ProfileType.INVESTISSEUR_SCI,
                regime_fiscal=RegimeFiscal.IMPOT_SOCIETES,
                theme_fiscal=ThemeFiscal.OPTIMISATION,
                tags=["SCI", "IS", "amortissements", "immobilier"],
                context="SCI patrimoniale avec option IS",
                examples=[
                    "SCI 10 appts, 200k€ loyers : économie 52k€/an avec IS",
                    "SCI familiale : IS + démembrement parts pour transmission"
                ]
            ),
            
            KnowledgeChunk(
                id="sci_demembrement_avance_001",
                content="""**DÉMEMBREMENT COMPLEXE EN SCI - MONTAGE CGP**
                
                **Stratégie :** Démembrement croisé usufruits temporaires
                
                **MÉCANISME AVANCÉ :**
                1. **Création SCI familiale** avec répartition asymétrique
                2. **Démembrement par générations** :
                   - Parents : usufruit temporaire (15-20 ans)
                   - Enfants : nue-propriété immédiate
                   - Petits-enfants : nue-propriété différée
                
                **OPTIMISATIONS FISCALES :**
                - **Valorisation décotée** : usufruit temporaire vs viager
                - **Saut de génération** : économie droits mutation
                - **Réversion programmée** : optimisation âges
                
                **CALCULS DE DÉCOTES :**
                Usufruit temporaire 15 ans, usufruitier 60 ans :
                - Décote supplémentaire : ~20% vs usufruit viager
                - Combinaison avec Dutreil : décotes cumulées 80%
                - Abattements générationnels optimisés
                
                **VARIANTES SOPHISTIQUÉES :**
                1. **Trust à la française** : SCI + assurance-vie
                2. **Démembrement croisé** : usufruits réciproques
                3. **Clause d'agrément** : contrôle succession
                4. **Substitution fidéicommissaire** : transmission 2 générations
                
                **CAS PRATIQUE COMPLEXE :**
                Patrimoine 5M€, 3 générations :
                - SCI avec parts à droits préférentiels
                - Usufruit temporaire parents (20 ans)
                - Nue-propriété enfants (50%) + petits-enfants (50%)
                - Décote globale : 75% + abattements
                - **Droits théoriques 2M€ → réels 200k€**
                """,
                profile_type=ProfileType.INVESTISSEUR_SCI,
                regime_fiscal=RegimeFiscal.IMPOT_REVENU,
                theme_fiscal=ThemeFiscal.OPTIMISATION,
                tags=["démembrement", "SCI", "transmission", "génération"],
                context="Montage complexe SCI multi-générationnel",
                examples=[
                    "Patrimoine 5M€ : démembrement → économie 1,8M€ droits",
                    "SCI + usufruit temporaire : saut générationnel optimisé"
                ]
            ),
            
            KnowledgeChunk(
                id="sci_holding_montage_001",
                content="""**MONTAGE SCI-HOLDING - ARCHITECTURE PATRIMONIALE**
                
                **Structure :** Holding → SCI → Immobilier d'entreprise
                
                **MÉCANISME :**
                1. **Holding familiale** détient parts SCI
                2. **SCI** détient bureaux/entrepôts loués aux sociétés
                3. **Sociétés opérationnelles** locataires
                
                **AVANTAGES FISCAUX :**
                - **Régime mère-fille** : dividendes SCI → Holding exonérés 95%
                - **Intégration fiscale** : compensation résultats
                - **Amortissements déductibles** en SCI IS
                - **Prix de transfert** : loyers déductibles sociétés
                
                **OPTIMISATION TRANSMISSION :**
                - **Pacte Dutreil holding** : 75% décote
                - **Démembrement parts holding** : décotes cumulées
                - **Management package** : actions gratuites dirigeants
                
                **GESTION DES FLUX :**
                - Loyers SCI → dividendes Holding (quasi-exonérés)
                - Holding redistributes selon besoins familiaux
                - Optimisation TMI via étalement distributions
                
                **VARIANTE SOPHISTIQUÉE :**
                Structure à 3 niveaux :
                - **Holding Patri** (parents) : contrôle
                - **Holding Invest** (enfants) : développement
                - **SCI spécialisées** : par type d'actifs
                
                **CAS PRATIQUE :**
                Groupe familial 20M€ CA :
                - Holding détient 15 SCI (50M€ immobilier)
                - Loyers 3M€/an → dividendes quasi-exonérés
                - Économie IS : 750k€/an vs imposition directe
                - Transmission optimisée : 80% décote globale
                """,
                profile_type=ProfileType.GROUPE_HOLDING,
                regime_fiscal=RegimeFiscal.IMPOT_SOCIETES,
                theme_fiscal=ThemeFiscal.INTEGRATION_FISCALE,
                tags=["holding", "SCI", "intégration", "patrimoine"],
                context="Architecture holding-SCI complexe",
                examples=[
                    "Groupe 50M€ immo : structure holding-SCI, économie 750k€/an",
                    "Transmission famille : 80% décote via montage intégré"
                ]
            )
        ]
        
        self.knowledge_chunks.extend(chunks)
    
    def _load_groupe_holding_knowledge(self):
        """Connaissances Holdings ultra-sophistiquées pour CGP"""
        
        chunks = [
            KnowledgeChunk(
                id="holding_integration_fiscale_001",
                content="""**INTÉGRATION FISCALE GROUPE - STRATÉGIE AVANCÉE**
                
                **Contexte :** Holding + filiales opérationnelles, optimisation fiscale groupe
                
                **CONDITIONS D'INTÉGRATION :**
                - Détention ≥ 95% capital/droits vote filiales
                - Option quinquennale renouvelable
                - Société mère française soumise IS taux normal
                - Filiales françaises IS (sauf banques/assurance)
                
                **MÉCANISME TECHNIQUE :**
                1. **Compensation déficits-bénèfices** intra-groupe
                2. **Neutralisation plus/moins-values** internes
                3. **Report déficitaire** illimité tête de groupe
                4. **Régime mère-fille** automatic intra-groupe
                
                **OPTIMISATIONS FISCALES :**
                - **Répartition charges** : management fees déductibles
                - **Prix de transfert** : refacturation services centralisés
                - **Timing plus-values** : étalement via holding
                - **Cash pooling** : centralisation trésorerie
                
                **STRATÉGIES DE SORTIE :**
                1. **Cession d'activité** : plus-value holding vs filiale
                2. **Démembrement pré-cession** : optimisation taxation
                3. **OBO/MBO** : rachat par management via holding
                4. **Introduction** : holding coté, filiales opérationnelles
                
                **CAS PRATIQUE COMPLEXE :**
                Groupe 5 filiales, bénéfices hétérogènes :
                - Filiale A : +2M€ bénéfice (secteur porteur)
                - Filiale B : -800k€ déficit (restructuration)
                - Filiale C : +500k€ (stabilisée)
                - Filiale D : -300k€ (start-up)
                - Filiale E : +1,2M€ (maturité)
                
                **Sans intégration :** IS = (2M + 0,5M + 1,2M) × 25% = 925k€
                **Avec intégration :** IS = (2,6M - 1,1M) × 25% = 375k€
                **Économie annuelle : 550k€**
                """,
                profile_type=ProfileType.GROUPE_HOLDING,
                regime_fiscal=RegimeFiscal.IMPOT_SOCIETES,
                theme_fiscal=ThemeFiscal.INTEGRATION_FISCALE,
                tags=["intégration", "holding", "déficits", "groupe"],
                context="Groupe multi-filiales avec intégration fiscale",
                examples=[
                    "Groupe 5 filiales : économie 550k€/an via intégration",
                    "Holding + 15 filiales : compensation systématique déficits"
                ]
            ),
            
            KnowledgeChunk(
                id="holding_lbo_transmission_001",
                content="""**HOLDING DE REPRISE LBO - TRANSMISSION FAMILIALE**
                
                **Montage :** Acquisition entreprise via holding + endettement optimisé
                
                **STRUCTURE LBO FAMILIAL :**
                1. **Holding patrimoniale** (famille) : 51% capital
                2. **Holding managériale** (dirigeants) : 20% capital  
                3. **Dette senior** : 60% prix acquisition
                4. **Dette mezzanine** : 20% prix acquisition
                5. **Fonds propres** : 20% prix acquisition
                
                **OPTIMISATIONS FISCALES :**
                - **Intérêts d'emprunt** déductibles IS holding
                - **Dividendes remontés** : régime mère-fille 95% exonérés
                - **Effet de levier** fiscal via endettement
                - **Plus-value de cession** : abattement holding si >2 ans
                
                **MÉCANISME DE REMBOURSEMENT :**
                - **Années 1-3** : remboursement dette via dividendes
                - **Année 4-7** : optimisation fiscale groupe
                - **Sortie** : cession optimisée avec plus-values
                
                **STRATÉGIE TRANSMISSION :**
                1. **Pacte Dutreil** sur holding : 75% décote
                2. **Management package** : actions gratuites/préférentielles
                3. **Démembrement progressif** : usufruit/nue-propriété
                4. **Buy-back** : rachat parts minoritaires
                
                **CAS PRATIQUE :**
                Acquisition entreprise 10M€ :
                - Dette : 7M€ (remboursée en 5 ans)
                - Fonds propres famille : 2M€
                - Fonds propres management : 1M€
                - Dividendes annuels cible : 1,8M€
                - Économie IS via intérêts : 400k€/an
                - Plus-value exit (×3) : 30M€ holding
                - Transmission optimisée : 75% décote Dutreil
                
                **VARIANTES SOPHISTIQUÉES :**
                - **LBO secondaire** : refinancement via nouvelle holding
                - **Spin-off** : séparation activités via holdings dédiées
                - **Build-up** : acquisitions complémentaires intégrées
                """,
                profile_type=ProfileType.GROUPE_HOLDING,
                regime_fiscal=RegimeFiscal.IMPOT_SOCIETES,
                theme_fiscal=ThemeFiscal.OPTIMISATION,
                tags=["LBO", "transmission", "endettement", "Dutreil"],
                context="LBO familial avec optimisation transmission",
                examples=[
                    "LBO 10M€ : économie 400k€/an IS + transmission Dutreil 75%",
                    "Build-up holding : 5 acquisitions intégrées fiscalement"
                ]
            ),
            
            KnowledgeChunk(
                id="holding_internationale_001",
                content="""**HOLDING INTERNATIONALE - OPTIMISATION MULTICOUNTRY**
                
                **Architecture :** Holding française + filiales internationales
                
                **RÉGIMES FISCAUX PRIVILÉGIÉS :**
                1. **Régime mère-fille international** : exonération 95%
                2. **Crédit d'impôt étranger** : imputation retenues
                3. **Conventions fiscales** : taux réduits retenues
                4. **Exit tax différée** : transfert siège social
                
                **OPTIMISATIONS PAR JURIDICTION :**
                
                **LUXEMBOURG :**
                - Holding company : 0,5% minimum tax
                - Régime participation : exonération totale
                - SOPARFI : structure optimale UE
                
                **PAYS-BAS :**
                - CV-BV structure : transparence fiscale
                - Ruling fiscal : sécurisation 5 ans
                - Réseau conventionnel optimal
                
                **IRLANDE :**
                - Taux IS : 12,5% activités commerciales
                - IP Box : 6,25% revenus propriété intellectuelle
                - R&D crédits : 25% dépenses
                
                **STRATÉGIES DE RAPATRIEMENT :**
                1. **Dividendes étalés** : optimisation retenues
                2. **Prêts intra-groupe** : alternative dividendes
                3. **Royalties/management fees** : déduction locale
                4. **Plus-values de cession** : localisation optimale
                
                **COMPLIANCE & REPORTING :**
                - **CbCR** : Country-by-Country Reporting
                - **DAC6** : déclaration montages transfrontaliers
                - **Substance économique** : justification implantations
                - **BEPS** : conformité actions anti-évasion
                
                **CAS PRATIQUE COMPLEXE :**
                Groupe français, filiales 8 pays :
                - **Holding France** : coordination et contrôle
                - **Sub-holding Luxembourg** : détention UE
                - **Operating cos** : UK, Allemagne, Italie, Espagne
                - **IP Holding Irlande** : centralisation brevets
                - **Trading Singapore** : activités Asie
                
                **Flux optimisés :**
                - Royalties IP → Irlande (6,25% vs 25% France)
                - Dividendes → Luxembourg → France (exonérés)
                - Management fees → déduction pays à fort IS
                - **Économie annuelle : 2,5M€ sur 15M€ bénéfices**
                """,
                profile_type=ProfileType.GROUPE_HOLDING,
                regime_fiscal=RegimeFiscal.IMPOT_SOCIETES,
                theme_fiscal=ThemeFiscal.OPTIMISATION,
                tags=["international", "holding", "conventions", "Luxembourg"],
                context="Groupe international avec holding d'optimisation",
                examples=[
                    "Groupe 8 pays : structure LUX, économie 2,5M€/an",
                    "IP Holding Irlande : royalties 6,25% vs 25% France"
                ]
            )
        ]
        
        self.knowledge_chunks.extend(chunks)
    
    def _load_loueur_meuble_knowledge(self):
        """Connaissances LMNP/LMP ultra-spécialisées pour CGP"""
        
        chunks = [
            KnowledgeChunk(
                id="lmnp_amortissement_optimise_001",
                content="""**LMNP - OPTIMISATION AMORTISSEMENTS AVANCÉE**
                
                **Stratégie :** Maximisation déductions via ventilation optimisée
                
                **VENTILATION PRIX D'ACQUISITION :**
                - **Terrain** : non amortissable (généralement 15-20%)
                - **Gros œuvre** : 40 ans (2,5%/an)
                - **Équipements** : 10-15 ans (6,67% à 10%/an)
                - **Mobilier/électroménager** : 5-10 ans (10% à 20%/an)
                - **Aménagements** : durée usage (variable)
                
                **TECHNIQUES D'OPTIMISATION :**
                1. **Achat séparé** immeuble + mobilier : maximise part amortissable
                2. **Renouvellement mobilier** : déduction intégrale année N
                3. **Travaux vs amortissements** : arbitrage fiscal optimal
                4. **Provisionning** : gros travaux prévisionnels
                
                **CAS PRATIQUE OPTIMISÉ :**
                Appartement meublé 300k€ :
                - Terrain : 45k€ (15%) - non amortissable
                - Bâti : 180k€ (60%) - 40 ans = 4,5k€/an
                - Équipements : 45k€ (15%) - 10 ans = 4,5k€/an
                - Mobilier : 30k€ (10%) - 5 ans = 6k€/an
                - **Total amortissements : 15k€/an**
                
                **IMPACT FISCAL :**
                Loyers 24k€/an, charges 4k€ :
                - Résultat brut : 20k€
                - Amortissements : -15k€
                - **Résultat fiscal : 5k€** (au lieu de 20k€)
                - Économie IR (TMI 30%) : 4,5k€/an
                
                **STRATÉGIES AVANCÉES :**
                - **Réinvestissement bénéfices** : acquisition nouveaux biens
                - **SCI LMNP** : mutualisation amortissements
                - **Déficalisation complémentaire** : Pinel, Denormandie
                - **Plus-value exit** : abattement durée détention
                """,
                profile_type=ProfileType.LOUEUR_MEUBLE,
                regime_fiscal=RegimeFiscal.LMNP,
                theme_fiscal=ThemeFiscal.AMORTISSEMENTS,
                tags=["LMNP", "amortissements", "ventilation", "mobilier"],
                context="Loueur meublé optimisant amortissements",
                examples=[
                    "Appt 300k€ : amortissements 15k€/an, économie IR 4,5k€",
                    "SCI LMNP 5 appts : mutualisation optimisée amortissements"
                ]
            ),
            
            KnowledgeChunk(
                id="lmp_professionnel_optimisation_001",
                content="""**LMP PROFESSIONNEL - STRATÉGIE FISCALE AVANCÉE**
                
                **Conditions LMP :** 23k€/an revenus + > 50% revenus globaux
                
                **AVANTAGES FISCAUX MAJEURS :**
                1. **Déficits imputables** revenus globaux (vs report LMNP)
                2. **Plus-values professionnelles** : abattements durée
                3. **Exonération plus-values** si < 90k€ (vs 250k€ LMNP)
                4. **Cotisations sociales** : assujettissement possible
                
                **OPTIMISATION SEUILS :**
                **Stratégie revenus** :
                - **Réduction autres revenus** : PER, défiscalisation
                - **Augmentation LMP** : investissements supplémentaires
                - **Timing cessions** : optimisation seuil 50%
                
                **MONTAGE SCI LMP :**
                1. **SCI familiale** option LMP
                2. **Gérance rémunérée** : qualification professionnelle
                3. **Prestations élargies** : ménage, linge, petit-déjeuner
                4. **Amortissements majorés** : équipements professionnels
                
                **CAS PRATIQUE COMPLEXE :**
                Couple, autres revenus 40k€ :
                - **LMP nécessaire** : > 40k€ (seuil 50%)
                - **Stratégie** : 8 appartements meublés
                - **Revenus LMP** : 48k€ (60% total)
                - **Déficits années 1-3** : -60k€ (amortissements)
                - **Imputation** : économie IR 18k€/an (TMI 30%)
                
                **PLUS-VALUES DE CESSION :**
                - **Abattement durée** : 10%/an après 5 ans
                - **Exonération totale** : si ventes < 90k€/an
                - **Strategie cessions étalées** : rester sous seuil
                - **Réinvestissement** : report plus-values (art. 238 quindecies)
                
                **VARIANTES SOPHISTIQUÉES :**
                - **Résidence services** : LMP + prestations para-hôtelières
                - **Airbnb professionnel** : LMP courte durée
                - **Colocation haut de gamme** : prestations premium
                - **Apart-hôtels** : délégation gestion professionnelle
                """,
                profile_type=ProfileType.LOUEUR_MEUBLE,
                regime_fiscal=RegimeFiscal.LMP,
                theme_fiscal=ThemeFiscal.DEFICITS,
                tags=["LMP", "professionnel", "déficits", "plus-values"],
                context="Loueur meublé professionnel optimisant déficits",
                examples=[
                    "Couple : LMP 48k€, imputation déficits 60k€, économie 18k€",
                    "Cessions étalées : exonération sous seuil 90k€/an"
                ]
            ),
            
            KnowledgeChunk(
                id="meuble_courte_duree_001",
                content="""**MEUBLÉ COURTE DURÉE - STRATÉGIE AIRBNB OPTIMISÉE**
                
                **Réglementation :** Locations < 90 jours, résidence principale
                
                **OPTIMISATION FISCALE :**
                
                **RÉGIME MICRO-BIC :**
                - Abattement : 50% (vs 30% location classique)
                - Seuil : 72 600€ CA (vs 23 000€ BIC classique)
                - **Avantage** : simplicité, exonération CFE
                
                **RÉGIME RÉEL :**
                - **Charges déductibles** : 100% frais réels
                - **Amortissements** : mobilier/équipements spécifiques
                - **Frais de gestion** : plateformes, ménage, linge
                - **Quote-part charges** : copropriété, assurance
                
                **SEUIL D'ARBITRAGE :**
                - **Micro avantageux** si marge < 50%
                - **Réel avantageux** si charges > 50% CA
                - **Simulation** : impératif avant choix
                
                **CAS PRATIQUE PARISIEN :**
                2P 70m², 150€/nuit, 200 nuits/an :
                - **CA** : 30k€/an
                - **Charges** : 18k€ (copro, ménage, plateformes, usure)
                
                **Micro-BIC :** (30k - 15k abattement) × TMI 30% = 4,5k€
                **Réel :** (30k - 18k) × 30% = 3,6k€
                **Économie réel : 900€/an**
                
                **STRATÉGIES D'OPTIMISATION :**
                1. **Diversification biens** : répartition risques réglementaires
                2. **Société dédiée** : SAS/SARL si multi-biens
                3. **Prestations connexes** : petit-déjeuner, navette
                4. **Investissement équipements** : high-tech déductible
                
                **COMPLIANCE RÉGLEMENTAIRE :**
                - **Déclaration mairie** : numéro enregistrement
                - **Taxe de séjour** : collecte reversée
                - **Assurance spécifique** : responsabilité locative
                - **Respect quotas** : 120 jours max certaines villes
                
                **VARIANTE PROFESSIONNELLE :**
                Si > seuils LMP (23k€ + 50% revenus) :
                - **Déficits imputables** : optimisation fiscale majorée
                - **Cotisations sociales** : arbitrage statut
                - **Plus-values pro** : abattements avantageux
                - **Investissements** : amortissements accélérés
                """,
                profile_type=ProfileType.LOUEUR_MEUBLE,
                regime_fiscal=RegimeFiscal.MICRO_BIC,
                theme_fiscal=ThemeFiscal.OPTIMISATION,
                tags=["Airbnb", "courte durée", "micro-BIC", "réel"],
                context="Location meublée courte durée type Airbnb",
                examples=[
                    "Airbnb Paris 30k€ CA : réel vs micro, économie 900€/an",
                    "Multi-biens : société dédiée + statut LMP si seuils"
                ]
            )
        ]
        
        self.knowledge_chunks.extend(chunks)
    
    def _load_professionnel_liberal_knowledge(self):
        """Connaissances professionnels libéraux BNC ultra-spécialisées pour CGP"""
        
        chunks = [
            KnowledgeChunk(
                id="bnc_societe_exercice_liberal_001",
                content="""**SEL - SOCIÉTÉ D'EXERCICE LIBÉRAL OPTIMISATION**
                
                **Contexte :** Professional libéraux en société, optimisation fiscale/sociale
                
                **FORMES JURIDIQUES DISPONIBLES :**
                - **SELARL** : SARL + règles profession (majoritaire)
                - **SELAS** : SAS + règles profession (souplesse)
                - **SELAFA** : SA + règles profession (rare)
                - **SELCA** : SCA + règles profession (très rare)
                
                **AVANTAGES FISCAUX SEL :**
                1. **Option IS** : bénéfices société 25% vs TMI 45%
                2. **Rémunération déductible** : optimisation charges
                3. **Dividendes** : PFU 30% ou barème avec abattement
                4. **Plus-values** : régime favorable cession parts
                
                **OPTIMISATION RÉMUNÉRATION/DIVIDENDES :**
                
                **Pour dirigeant SELARL majoritaire (TNS) :**
                - Cotisations sociales : ~45% rémunération
                - Pas de cotisations sur dividendes
                - **Stratégie** : rémunération minimale + dividendes
                
                **Pour dirigeant SELAS (assimilé salarié) :**
                - Cotisations sociales : ~82% du net
                - Mais : chômage, retraite complémentaire
                - **Arbitrage** selon profil risque/protection
                
                **CAS PRATIQUE NOTAIRE :**
                Office 500k€ bénéfice annuel :
                
                **En individuel BNC :**
                - IR : 500k€ × 45% = 225k€
                - Cotisations : 500k€ × 45% = 225k€
                - **Net : 50k€**
                
                **En SELARL IS :**
                - IS : 500k€ × 25% = 125k€
                - Remu 100k€ : cotisations 45k€ + IR 30k€
                - Dividendes 275k€ : PFU 82,5k€
                - **Net : 267,5k€ (+217k€ vs individuel)**
                
                **POINTS DE VIGILANCE :**
                - **Règles déontologiques** profession
                - **Détention parts** : restrictions profession
                - **Responsabilité** : personnelle actes professionnels
                - **Cessibilité** : agrément ordre professionnel
                """,
                profile_type=ProfileType.PROFESSIONNEL_LIBERAL,
                regime_fiscal=RegimeFiscal.IMPOT_SOCIETES,
                theme_fiscal=ThemeFiscal.OPTIMISATION,
                tags=["SEL", "SELARL", "SELAS", "libéraux"],
                context="Professionnel libéral en société d'exercice",
                examples=[
                    "Notaire 500k€ : SELARL vs individuel, gain 217k€ net",
                    "Avocat : SELAS pour souplesse + protection sociale"
                ]
            ),
            
            KnowledgeChunk(
                id="bnc_madelin_optimisation_001",
                content="""**MADELIN + COMPLÉMENTAIRES - OPTIMISATION TNS**
                
                **Contexte :** TNS libéraux, optimisation retraite/prévoyance
                
                **PLAFONDS MADELIN 2024 :**
                - **Retraite** : 10% BNC (mini 4 399€, maxi 83 088€)
                - **Prévoyance** : 7% BNC (maxi 3 707€)
                - **Mutuelle** : intégralité cotisations
                - **Perte d'emploi** : 1,875% BNC (maxi 2 654€)
                
                **STRATÉGIES D'OPTIMISATION :**
                
                **1. LISSAGE FISCAL :**
                - **Années hauts revenus** : maximiser Madelin
                - **Années basses** : versements minimum
                - **Flexibilité** : adaptation selon TMI
                
                **2. ARBITRAGE MADELIN/PER :**
                - **Madelin** : plafonds supérieurs si BNC élevés
                - **PER** : plafonds identiques mais portabilité
                - **Combiné** : optimisation selon situations
                
                **3. OPTIMISATION SORTIE :**
                - **Rente viagere** : fiscalité réduite âge
                - **Capital** : 60% imposable (vs 100% Madelin)
                - **Stratégie** : arbitrage selon patrimoine
                
                **CAS PRATIQUE CHIRURGIEN :**
                BNC 300k€/an, TMI 45% :
                
                **Cotisations optimisées :**
                - Madelin retraite : 30k€ (10% BNC)
                - Madelin prévoyance : 21k€ (7% BNC)
                - Mutuelle : 3k€
                - **Total déductible : 54k€**
                
                **Économie fiscale :**
                - IR : 54k€ × 45% = 24,3k€
                - Cotisations sociales : 54k€ × 45% = 24,3k€
                - **Économie totale : 48,6k€/an**
                
                **VARIANTES SOPHISTIQUÉES :**
                - **Surcomplémentaire** : au-delà plafonds Madelin
                - **Assurance-vie** : complément patrimoine
                - **PERP/PER** : diversification supports
                - **SCI** : immobilier professionnel déductible
                
                **GESTION DE FIN DE CARRIÈRE :**
                - **Cessation progressive** : étalement revenus
                - **Cession cabinet** : plus-values optimisées
                - **Retraite progressive** : cumul emploi-retraite
                - **Transmission** : valorisation goodwill
                """,
                profile_type=ProfileType.PROFESSIONNEL_LIBERAL,
                regime_fiscal=RegimeFiscal.MICRO_BNC,
                theme_fiscal=ThemeFiscal.PER,
                tags=["Madelin", "TNS", "retraite", "prévoyance"],
                context="TNS libéral optimisant Madelin et complémentaires",
                examples=[
                    "Chirurgien 300k€ : Madelin 54k€, économie 48,6k€/an",
                    "Avocat : combiné Madelin + PER selon variabilité revenus"
                ]
            ),
            
            KnowledgeChunk(
                id="bnc_scm_optimisation_001",
                content="""**SCM - SOCIÉTÉ CIVILE DE MOYENS OPTIMISATION**
                
                **Contexte :** Professionnels libéraux mutualisant moyens d'exercice
                
                **PRINCIPE SCM :**
                - **Objet** : mise en commun moyens matériels/humains
                - **Interdiction** : exercice profession (seuls les associés)
                - **Transparence** : répartition charges au prorata
                - **Fiscalité** : pas d'impôt SCM, déduction chez associés
                
                **AVANTAGES FISCAUX :**
                1. **Mutualisation charges** : economies d'échelle
                2. **Déductibilité** : 100% charges professionnelles
                3. **Amortissements** : matériels mutualisés
                4. **TVA** : récupération sur investissements
                
                **OPTIMISATIONS SOPHISTIQUÉES :**
                
                **1. SCM IMMOBILIÈRE :**
                - **Détention locaux** : SCM propriétaire
                - **Loyers internes** : déductibles associés
                - **Amortissements** : locaux professionnels
                - **Plus-values** : répartition entre associés
                
                **2. SCM + SCI MIXTE :**
                - **SCI** : détention murs
                - **SCM** : locataire + sous-location associés
                - **Optimisation** : répartition loyers/amortissements
                
                **3. SCM DE GESTION :**
                - **Personnel commun** : secrétaires, comptable
                - **Services mutualisés** : informatique, marketing
                - **Équipements** : matériels coûteux partagés
                
                **CAS PRATIQUE CABINET MÉDICAL :**
                5 médecins, locaux 2M€, équipements 500k€ :
                
                **Sans SCM (individuel) :**
                - Location : 20k€/an/médecin = 100k€ total
                - Matériels : achat individuel = sur-coûts
                - Charges : duplication services = inefficience
                
                **Avec SCM :**
                - Acquisition locaux : SCM propriétaire
                - Amortissements : 50k€/an déductibles
                - Équipements : mutualisation = 30% économie
                - Charges : optimisation = 25% économie
                - **Économie globale : 40k€/an par médecin**
                
                **VARIANTES AVANCÉES :**
                - **SCM multi-sites** : plusieurs cabinets
                - **SCM + SEL** : exercice en société
                - **SCM + holding** : structure patrimoniale
                - **SCM internationale** : exercise transfrontalier
                
                **POINTS DE VIGILANCE :**
                - **Règles déontologiques** : respect indépendance
                - **Répartition charges** : clés objectives
                - **Responsabilité** : solidarité associés
                - **Exit** : valorisation parts difficile
                """,
                profile_type=ProfileType.PROFESSIONNEL_LIBERAL,
                regime_fiscal=RegimeFiscal.IMPOT_REVENU,
                theme_fiscal=ThemeFiscal.OPTIMISATION,
                tags=["SCM", "mutualisation", "libéraux", "charges"],
                context="Professionnels libéraux en SCM pour mutualisation",
                examples=[
                    "Cabinet 5 médecins : SCM, économie 40k€/an par praticien",
                    "SCM + SCI : optimisation détention locaux professionnels"
                ]
            )
        ]
        
        self.knowledge_chunks.extend(chunks)
    
    def _load_commercant_artisan_knowledge(self):
        """Connaissances Commerçants/Artisans ultra-spécialisées pour CGP"""
        
        chunks = [
            KnowledgeChunk(
                id="artisan_micro_reel_transition_001",
                content="""
                **TRANSITION MICRO-BIC → RÉEL SIMPLIFIÉ POUR ARTISANS**
                
                **SEUILS DE BASCULE 2024 :**
                - **Micro-BIC** : CA < 188 700€ (vente) / 77 700€ (services)
                - **Réel obligatoire** : dépassement seuils 2 années consécutives
                - **Option réel** : possible même sous seuils (intérêt fiscal)
                
                **ANALYSE COÛT/BÉNÉFICE TRANSITION :**
                
                **EXEMPLE ARTISAN ÉLECTRICIEN (CA 85k€) :**
                
                **En Micro-BIC :**
                - Abattement forfaitaire : 71% → CA imposable : 24 650€
                - Charges réelles non déductibles : 45k€ (matériaux, véhicule, outils)
                - **IR sur 24 650€ (TMI 30%) = 7 395€**
                
                **En Réel Simplifié :**
                - CA : 85 000€
                - Charges déductibles : 45 000€
                - Bénéfice imposable : 40 000€
                - **IR sur 40 000€ (TMI 30%) = 12 000€**
                - **MAIS** : récupération TVA + amortissements
                
                **OPTIMISATION RÉEL :**
                - **Amortissements véhicule** : 8k€/an → économie 2 400€
                - **TVA récupérée** : 9k€ (20% sur 45k€ charges)
                - **Charges déductibles supplémentaires** : formation, expertises, etc.
                - **Économie nette : 15 000€/an**
                
                **STRATÉGIES AVANCÉES :**
                1. **Timing optimal** : option réel avant gros investissements
                2. **Régularisation TVA** : étalement sur 5 ans si défavorable
                3. **Provision congés payés** : lissage charges sociales
                4. **SCI pour locaux** : optimisation patrimoniale
                
                **CAS PRATIQUE - ARTISAN BOULANGER :**
                CA 120k€, investissement fournil 80k€ :
                - **Micro** : abattement 71% → 34 800€ imposable
                - **Réel** : amortissement fournil 8k€/an + récup TVA 16k€
                - **Gain transition : 25k€ première année**
                """,
                profile_type=ProfileType.ARTISAN,
                regime_fiscal=RegimeFiscal.REEL_SIMPLIFIE,
                theme_fiscal=ThemeFiscal.OPTIMISATION,
                tags=["micro-BIC", "réel", "transition", "artisan", "seuils"],
                context="Optimisation fiscale transition micro vers réel pour artisans",
                examples=[
                    "Électricien 85k€ : passage réel → économie 15k€/an",
                    "Boulanger 120k€ + investissement 80k€ → gain 25k€ première année"
                ]
            ),
            
            KnowledgeChunk(
                id="commercant_sarl_ou_sasu_001",
                content="""
                **COMMERÇANT : SARL vs SASU - ARBITRAGE AVANCÉ**
                
                **CRITÈRES DE CHOIX POUR COMMERÇANTS :**
                
                **1. PROTECTION SOCIALE :**
                - **SARL (gérant majoritaire)** : TNS → RSI → charges 45% CA
                - **SASU (président)** : Assimilé salarié → charges 75% rémunération
                - **Impact** : SASU = meilleure protection, coût plus élevé
                
                **2. FLEXIBILITÉ DIVIDENDES :**
                - **SARL** : distribution obligatoire égalitaire entre associés
                - **SASU** : dividendes flexibles selon nombre d'actions
                
                **3. CESSION FACILITÉ :**
                - **SARL** : agrément associés requis
                - **SASU** : cession libre (sauf clauses statutaires)
                
                **CAS PRATIQUE - COMMERCE ALIMENTAIRE (CA 200k€) :**
                
                **OPTION SARL :**
                - Bénéfice après IS (25%) : 150k€
                - Rémunération gérant : 50k€
                - Charges sociales TNS : 22 500€ (45%)
                - Dividendes : 100k€ → Prélèvements sociaux 17,2% = 17 200€
                - **Coût social total : 39 700€**
                
                **OPTION SASU :**
                - Rémunération président : 50k€
                - Charges sociales : 37 500€ (75%)
                - Dividendes : 100k€ → PFU 30% = 30 000€
                - **Coût social + fiscal total : 67 500€**
                
                **ARBITRAGE :**
                - **SARL** : économie 27 800€/an mais protection moindre
                - **SASU** : coût élevé mais retraite + chômage + maladie optimaux
                
                **STRATÉGIE HYBRIDE - SARL + CONTRAT MADELIN :**
                - SARL classique + complémentaire Madelin
                - Coût Madelin : 8k€/an déductible
                - **Coût total : 47 700€ vs 67 500€ SASU**
                - **Économie : 19 800€/an avec protection équivalente**
                
                **RECOMMANDATION CGP :**
                - **CA < 150k€** : EI ou SARL + Madelin
                - **CA 150-300k€** : SARL optimisée
                - **CA > 300k€** : SASU (avantages > surcoûts)
                - **Projet cession** : SASU obligatoire
                """,
                profile_type=ProfileType.COMMERCANT,
                regime_fiscal=RegimeFiscal.IMPOT_SOCIETES,
                theme_fiscal=ThemeFiscal.OPTIMISATION,
                tags=["SARL", "SASU", "arbitrage", "commerce", "protection sociale"],
                context="Choix structure juridique optimale pour commerçants",
                examples=[
                    "Commerce 200k€ CA : SARL économie 27k€/an vs SASU",
                    "SARL + Madelin = protection SASU - 19k€/an"
                ]
            ),
            
            KnowledgeChunk(
                id="franchise_tva_commercant_001",
                content="""
                **FRANCHISE TVA COMMERÇANT - OPTIMISATION AVANCÉE**
                
                **SEUILS FRANCHISE TVA 2024 :**
                - **Ventes** : 91 900€ (dépassement → TVA obligatoire)
                - **Services** : 36 800€
                - **Mixte** : calcul prorata
                
                **STRATÉGIES DE MAINTIEN SOUS SEUILS :**
                
                **1. ÉCHELONNEMENT CA :**
                - Report facturation décembre → janvier N+1
                - Lissage CA sur 2 exercices
                - **Gain** : maintien franchise 1 an supplémentaire
                
                **2. CRÉATION SCI POUR LOCAUX :**
                - Local commercial → SCI dédiée
                - Loyer SCI → réduction CA société
                - **Double avantage** : franchise maintenue + optimisation IS
                
                **3. EXTERNALISATION SERVICES :**
                - Comptabilité, nettoyage → sous-traitance
                - CA facturation → CA prestation
                - Optimisation classification activités
                
                **CAS PRATIQUE - COMMERCE TEXTILE :**
                CA prévu : 95k€ (dépassement 3,1k€)
                
                **Solution 1 - Report facturation :**
                - Report 5k€ factures décembre → janvier
                - CA N : 90k€ (sous seuil)
                - **Économie TVA** : maintien franchise
                
                **Solution 2 - SCI locaux :**
                - Local 2k€/mois → SCI
                - CA commerce : 95k€ - 24k€ = 71k€
                - **Double bénéfice** : franchise + déduction IS loyers
                
                **ANALYSE COÛT/BÉNÉFICE ASSUJETTISSEMENT :**
                Pour CA 100k€ marge 40% :
                
                **En franchise :**
                - Prix TTC = prix HT
                - Compétitivité maintenue
                - **Pas de récupération TVA achats**
                
                **Assujetti TVA :**
                - TVA collectée : 20k€
                - TVA déductible : 12k€ (60k€ achats)
                - **TVA nette à payer : 8k€**
                - **MAIS** : avantage compétitif B2B
                
                **RECOMMANDATION :**
                - **Clientèle B2C** : maintenir franchise maximum
                - **Clientèle B2B** : option TVA souvent bénéfique
                - **Investissements prévus** : opter TVA avant achat
                """,
                profile_type=ProfileType.COMMERCANT,
                regime_fiscal=RegimeFiscal.REEL_SIMPLIFIE,
                theme_fiscal=ThemeFiscal.TVA,
                tags=["franchise TVA", "seuils", "optimisation", "B2B", "B2C"],
                context="Stratégies optimisation franchise TVA commerçants",
                examples=[
                    "Commerce 95k€ : SCI locaux → maintien franchise",
                    "Textile B2B : option TVA bénéfique malgré coût 8k€"
                ]
            )
        ]
        
        self.knowledge_chunks.extend(chunks)
    
    def _load_optimisations_transversales(self):
        """Optimisations transversales"""
        chunks = [
            KnowledgeChunk(
                id="per_optimisation_001",
                content="""
                **PLAN D'ÉPARGNE RETRAITE (PER) - OPTIMISATION**
                
                **Plafonds de déduction 2024 :**
                - 10% des revenus professionnels (mini 4 399€, maxi 35 194€)
                - Majorations possibles selon situations
                
                **Stratégies d'optimisation :**
                1. **Lissage fiscal** : versements en années à forte imposition
                2. **Sortie en rente** : fiscalité réduite à la retraite
                3. **Sortie en capital** : 60% imposable, 40% exonéré
                4. **Déblocage anticipé** : achat résidence principale, surendettement
                
                **Cas d'usage par profil :**
                - **TNS** : déduction + cotisations Madelin
                - **Dirigeant salarié** : optimisation tranche marginale
                - **Investisseur** : réduction IR + constitution capital retraite
                """,
                profile_type=ProfileType.ENTREPRENEUR_INDIVIDUEL,
                regime_fiscal=RegimeFiscal.IMPOT_REVENU,
                theme_fiscal=ThemeFiscal.PER,
                tags=["PER", "retraite", "déduction", "optimisation"],
                context="Optimisation PER selon profil fiscal",
                examples=[
                    "TNS 50k€ revenus : déduction PER 5k€ → économie IR 1,5k€ si TMI 30%"
                ]
            ),
            
            KnowledgeChunk(
                id="multi_structure_holding_sci_001",
                content="""
                **MONTAGE MULTI-STRUCTURES : HOLDING + SCI + SASU OPÉRATIONNELLE**
                
                **ARCHITECTURE OPTIMISÉE POUR ENTREPRENEURS PATRIMONIAUX :**
                
                **NIVEAU 1 - HOLDING PATRIMONIALE (IS) :**
                - Détention participations + immobilier de rapport
                - Régime mère-fille : dividendes 95% exonérés
                - IS réduit : 15% (jusqu'à 42 500€ bénéfices)
                
                **NIVEAU 2 - SCI FAMILIALE (IR) :**
                - Immobilier professionnel + personnel
                - Optimisation démembrement : usufruit/nue-propriété
                - Transmission facilitée enfants
                
                **NIVEAU 3 - SASU OPÉRATIONNELLE (IS) :**
                - Activité principale
                - Dirigeant assimilé salarié
                - Optimisation arbitrage salaire/dividendes
                
                **CAS PRATIQUE - CONSULTANT IT :**
                Revenus 300k€/an, patrimoine immobilier 2M€
                
                **AVANT (EI + patrimoine personnel) :**
                - IR consultation : 300k€ × 45% = 135k€
                - IFI patrimoine : 2M€ × 1% = 20k€
                - **Fiscalité totale : 155k€/an**
                
                **APRÈS (montage multi-structures) :**
                
                1. **SASU consultation** :
                   - Salaire dirigeant : 80k€ (optimal charges sociales)
                   - Dividendes SASU → Holding : 220k€ (exonérés 95%)
                   - IS SASU : 220k€ × 25% = 55k€
                
                2. **Holding patrimoniale** :
                   - Revenus locatifs SCI : 100k€
                   - Dividendes SASU : 220k€ (209k€ nets)
                   - IS Holding : 15% sur 42,5k€ + 25% sur 266,5k€ = 73k€
                
                3. **SCI familiale** :
                   - Loyers holding : déductibles IR
                   - Démembrement : réduction IFI 20-30%
                   - IFI optimisé : 14k€ (au lieu de 20k€)
                
                **FISCALITÉ OPTIMISÉE TOTALE :**
                - IS SASU : 55k€
                - IS Holding : 73k€
                - IR salaire dirigeant : 15k€
                - IFI optimisé : 14k€
                - **Total : 157k€ vs 155k€**
                
                **MAIS AVANTAGES QUALITATIFS :**
                - **Protection sociale optimale** (dirigeant assimilé salarié)
                - **Transmission facilitée** (SCI + holding)
                - **Flexibilité patrimoniale** (réinvestissement via holding)
                - **Optimisation future** (intégration fiscale, cession...)
                
                **STRATÉGIES AVANCÉES :**
                1. **Intégration fiscale** : Holding + filiales
                2. **LBO familial** : acquisition via holding avec effet de levier
                3. **Internationalisation** : holdings européennes (Luxembourg, Pays-Bas)
                4. **Démembrement évolutif** : usufruit temporaire
                
                **COÛTS DE MISE EN ŒUVRE :**
                - Création structures : 5k€
                - Gestion annuelle : 8k€
                - Expertise fiscale : 15k€
                - **Coût total : 28k€/an**
                - **ROI** : avantages > coûts dès 500k€ revenus annuels
                """,
                profile_type=ProfileType.GROUPE_HOLDING,
                regime_fiscal=RegimeFiscal.IMPOT_SOCIETES,
                theme_fiscal=ThemeFiscal.OPTIMISATION,
                tags=["holding", "SCI", "SASU", "multi-structures", "patrimoine"],
                context="Montages multi-structures pour entrepreneurs patrimoniaux",
                examples=[
                    "Consultant 300k€ : montage holding+SCI+SASU = protection + transmission",
                    "ROI montage : bénéfique dès 500k€ revenus annuels"
                ]
            ),
            
            KnowledgeChunk(
                id="succession_anticipee_001",
                content="""
                **TRANSMISSION D'ENTREPRISE - STRATÉGIES FISCALES AVANCÉES**
                
                **OUTILS DE TRANSMISSION OPTIMISÉE :**
                
                **1. DÉMEMBREMENT DE PROPRIÉTÉ :**
                - **Usufruit** : revenus + contrôle (dirigeant âgé)
                - **Nue-propriété** : transmission enfants avec décote
                - **Décote fiscale** : 30-60% selon âge usufruitier
                
                **2. PACTE DUTREIL :**
                - **Exonération** : 75% droits succession/donation
                - **Conditions** : conservation 6 ans + engagement collectif
                - **Cumul possible** : avec autres réductions
                
                **3. HOLDING DE REPRISE :**
                - **Leverage effect** : acquisition avec dette
                - **Optimisation fiscale** : intérêts déductibles
                - **Management package** : association équipe dirigeante
                
                **CAS PRATIQUE - PME FAMILIALE :**
                Entreprise valorisée 5M€, dirigeant 65 ans, 2 enfants
                
                **STRATÉGIE CLASSIQUE (cession directe) :**
                - Plus-value : 5M€ - 500k€ (prix acquisition) = 4,5M€
                - IR plus-values : 4,5M€ × 30% = 1,35M€
                - **Net vendeur : 3,65M€**
                
                **STRATÉGIE OPTIMISÉE (démembrement Dutreil) :**
                
                **Phase 1 - Démembrement (dirigeant 65 ans) :**
                - Décote viager 65 ans : 40%
                - Valeur nue-propriété : 5M€ × 60% = 3M€
                - Donation nue-propriété enfants : 3M€
                
                **Phase 2 - Application Dutreil :**
                - Exonération 75% : 3M€ × 75% = 2,25M€ exonéré
                - Base taxable : 750k€
                - Droits donation (après abattements) : 200k€
                
                **Phase 3 - Usufruit dirigeant :**
                - Dirigeant conserve revenus + contrôle
                - Extinction usufruit au décès (sans taxation)
                - **Transmission totale pour 200k€ droits**
                
                **ÉCONOMIE FISCALE :**
                - Cession classique : 1,35M€ impôts
                - Transmission Dutreil : 200k€ droits
                - **Économie : 1,15M€**
                
                **STRATÉGIE HOLDING LBO FAMILIAL :**
                
                Pour entreprise 10M€ :
                
                **Structure :**
                - Holding familiale : acquisition 80% dette + 20% fonds propres
                - Management : 10-20% participation
                - Remboursement dette : dividendes entreprise
                
                **Avantages :**
                - **Effet de levier** : acquisition avec faible apport
                - **Optimisation fiscale** : intérêts déductibles IS
                - **Motivation management** : participation au capital
                - **Transmission progressive** : cession parts holding
                
                **TIMING OPTIMAL :**
                - **Anticipation** : démembrement dès 60 ans
                - **Valorisation** : avant forte croissance
                - **Pacte Dutreil** : signature 2 ans avant transmission
                - **Holding** : constitution progressive sur 5-10 ans
                
                **PIÈGES À ÉVITER :**
                - **Abus de droit** : montages trop artificiels
                - **Respect engagements** : Dutreil sur 6 ans minimum
                - **Liquidités** : prévoir paiement droits
                - **Management** : anticipation départ dirigeant
                """,
                profile_type=ProfileType.GERANT_SARL,
                regime_fiscal=RegimeFiscal.IMPOT_SOCIETES,
                theme_fiscal=ThemeFiscal.TRANSMISSION,
                tags=["succession", "transmission", "Dutreil", "démembrement", "holding"],
                context="Stratégies fiscales optimisées transmission entreprise",
                examples=[
                    "PME 5M€ : démembrement + Dutreil = économie 1,15M€ vs cession",
                    "LBO familial 10M€ : effet levier + optimisation IS"
                ]
            ),
            
            KnowledgeChunk(
                id="international_optimization_001",
                content="""
                **OPTIMISATION FISCALE INTERNATIONALE - STRUCTURES EUROPÉENNES**
                
                **CONTEXTE RÉGLEMENTAIRE POST-BEPS :**
                - **Substance économique** : exigence réelle activité
                - **Prix de transfert** : documentation obligatoire
                - **Anti-BEPS** : limitation optimisations artificielles
                
                **HOLDING LUXEMBOURGEOISE - CAS D'USAGE :**
                
                **Structure recommandée :**
                - **Holding Luxembourg** : détention participations
                - **Filiales EU** : activités opérationnelles
                - **Substance réelle** : bureau + salariés Luxembourg
                
                **Avantages fiscaux :**
                - **Participation exemption** : dividendes/plus-values exonérés
                - **Réseau de conventions** : limitation retenues à la source
                - **IP Box** : régime propriété intellectuelle 5,76%
                - **Liquidation** : plus-values exonérées sous conditions
                
                **CAS PRATIQUE - GROUPE TECH :**
                CA consolidé 50M€, marges 20%, expansion internationale
                
                **Avant (structure française) :**
                - IS France : 10M€ × 25% = 2,5M€
                - Retenues à la source : 500k€ (dividendes filiales)
                - **Fiscalité totale : 3M€**
                
                **Après (holding luxembourgeoise) :**
                - Holding Luxembourg : exonération dividendes filiales
                - IP Box Luxembourg : revenus IP à 5,76%
                - Réduction retenues : conventions luxembourgeoises
                - **Fiscalité optimisée : 1,8M€**
                - **Économie : 1,2M€/an**
                
                **STRUCTURE PAYS-BAS (INNOVATION) :**
                
                **Innovation Box :**
                - Revenus R&D : 9% IS (vs 25,8% standard)
                - **Conditions** : développement interne + substance
                - **Optimisation** : 16,8 points réduction IS
                
                **CAS FINTECH :**
                Revenus logiciels 20M€, développement Paris
                
                **Structure optimisée :**
                - **Holding Pays-Bas** : détention IP
                - **Filiale France** : développement + substance
                - **Redevances** : France → Pays-Bas (prix de marché)
                - **Innovation Box** : 9% sur revenus IP aux Pays-Bas
                
                **CONFORMITÉ BEPS :**
                1. **Substance économique** :
                   - Bureau + équipe dédiée (2-3 personnes minimum)
                   - Décisions stratégiques prises localement
                   - Activité réelle (pas boîte aux lettres)
                
                2. **Prix de transfert** :
                   - Documentation complète
                   - Benchmarking indépendants
                   - Accords préalables (APA) recommandés
                
                3. **Reporting** :
                   - Country-by-Country reporting
                   - Déclaration structures offshore
                   - Conformité FATCA/CRS
                
                **COÛTS VS BÉNÉFICES :**
                - **Setup** : 50k€ (structure + conseil)
                - **Running costs** : 80k€/an (substance + compliance)
                - **Seuil rentabilité** : 500k€ économie fiscale/an
                - **ROI** : bénéfique dès 2-3M€ bénéfices récurrents
                
                **RISQUES ET MITIGATION :**
                - **Contrôle fiscal** : documentation irréprochable
                - **Changements législatifs** : veille réglementaire
                - **Réputation** : transparence communication
                - **Exit strategy** : plans rapatriement si nécessaire
                """,
                profile_type=ProfileType.GROUPE_HOLDING,
                regime_fiscal=RegimeFiscal.IMPOT_SOCIETES,
                theme_fiscal=ThemeFiscal.OPTIMISATION,
                tags=["international", "Luxembourg", "Pays-Bas", "BEPS", "holding"],
                context="Optimisations fiscales internationales conformes post-BEPS",
                examples=[
                    "Groupe tech 50M€ : holding Luxembourg = économie 1,2M€/an",
                    "Fintech : Innovation Box Pays-Bas = IS 9% sur revenus IP"
                ]
            )
        ]
        self.knowledge_chunks.extend(chunks)

# Instance globale
multi_profile_kb = MultiProfileKnowledgeBase()

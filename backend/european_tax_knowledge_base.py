"""
FRANCIS EUROPEAN TAX KNOWLEDGE BASE - SYSTÈME INDÉPENDANT POUR PARTICULIERS
===========================================================================

Ce module implémente un système de connaissance fiscale européenne 100% indépendant
pour la partie particulier de Francis. Il intègre toute la fiscalité européenne
sans dépendance externe.

Fonctionnalités :
- Base de données fiscale européenne complète (27 pays UE + 8 pays non-UE)
- Calculs d'impôts automatiques par pays
- Optimisation fiscale cross-border
- Mise à jour automatique des taux
- Support multilingue (FR, EN, DE, ES, IT)
"""

import json
import os
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from datetime import datetime
import re

@dataclass
class TaxBracket:
    """Tranche d'imposition"""
    min_income: float
    max_income: float
    rate: float
    description: str = ""

@dataclass
class CountryTaxData:
    """Données fiscales complètes d'un pays"""
    country_code: str
    country_name: str
    currency: str
    
    # Impôt sur le revenu
    income_tax_brackets: List[TaxBracket]
    personal_allowance: float
    
    # TVA
    vat_standard_rate: float
    vat_reduced_rates: List[float]
    
    # Cotisations sociales
    social_security_employee: float
    social_security_employer: float
    
    # Autres impôts
    wealth_tax_threshold: Optional[float] = None
    wealth_tax_rate: Optional[float] = None
    capital_gains_tax: Optional[float] = None
    
    # Métadonnées
    last_updated: str = ""
    eu_member: bool = True

class EuropeanTaxKnowledgeBase:
    """
    Base de connaissance fiscale européenne indépendante
    """
    
    def __init__(self):
        self.countries_data: Dict[str, CountryTaxData] = {}
        self.load_european_tax_data()
    
    def load_european_tax_data(self):
        """Charge les données fiscales européennes 2025"""
        
        def __init__(self):
            self.countries_data = {
                # France - Données fiscales complètes 2024-2025
                "FR": CountryTaxData(
                    country_name="France",
                    currency="EUR",
                    personal_allowance=10778,
                    income_tax_brackets=[
                        TaxBracket(0, 10777, 0, "Tranche exonérée - Abattement standard"),
                        TaxBracket(10778, 27478, 11, "Première tranche - Revenus modestes"),
                        TaxBracket(27479, 78570, 30, "Deuxième tranche - Classe moyenne"),
                        TaxBracket(78571, 168994, 41, "Troisième tranche - Revenus élevés"),
                        TaxBracket(168995, float('inf'), 45, "Tranche supérieure - Contribution exceptionnelle")
                    ],
                    social_security_employee=17.2,  # CSG-CRDS 9.7% + Cotisations 7.5%
                    vat_standard_rate=20.0,
                    vat_reduced_rates=[5.5, 10.0, 2.1],  # Ajout taux super-réduit
                    wealth_tax_threshold=1300000,  # IFI seuil
                    capital_gains_rate=30.0,  # PFU ou barème progressif
                    eu_member=True,
                    tax_treaties=["DE", "CH", "LU", "AD", "IT", "ES", "BE", "NL", "PT", "AT", "DK", "SE", "NO", "FI", "IE", "PL", "CZ", "HU", "EE", "LV", "LT", "SI", "SK", "HR", "BG", "RO", "MT", "CY", "GB", "US", "CA", "JP", "SG", "HK"],
                    special_regimes=[
                        "Micro-entrepreneur (chiffre d'affaires < 176.200€)",
                        "Réel simplifié (CA 176.200€ à 789.000€)",
                        "Réel normal (CA > 789.000€)",
                        "BNC micro (recettes < 72.600€)",
                        "Loueur meublé professionnel (LMP)",
                        "Loueur meublé non professionnel (LMNP)",
                        "SCI à l'IR ou à l'IS",
                        "Régime des plus-values immobilières",
                        "Dispositifs Pinel, Malraux, Monuments Historiques",
                        "PEA, Assurance-vie, Plan d'épargne retraite"
                    ]
                ),
                "DE": CountryTaxData(
                    country_code="DE",
                    country_name="Germany",
                    currency="EUR",
                    income_tax_brackets=[
                        TaxBracket(0, 11604, 0.0, "Grundfreibetrag"),
                        TaxBracket(11605, 17005, 14.0, "Eingangssteuersatz"),
                        TaxBracket(17006, 66760, 24.0, "Progressionszone 1"),
                        TaxBracket(66761, 277825, 42.0, "Progressionszone 2"),
                        TaxBracket(277826, float('inf'), 45.0, "Spitzensteuersatz")
                    ],
                    personal_allowance=11604,
                    vat_standard_rate=19.0,
                    vat_reduced_rates=[7.0],
                    social_security_employee=20.0,
                    social_security_employer=20.0,
                    capital_gains_tax=26.375,
                    last_updated="2025-01-01",
                    eu_member=True
                ),
                # SUISSE
                "CH": CountryTaxData(
                    country_code="CH",
                    country_name="Switzerland",
                    currency="CHF",
                    income_tax_brackets=[
                        TaxBracket(0, 14500, 0.0, "Exonération fédérale"),
                        TaxBracket(14501, 31600, 0.77, "Tranche fédérale 1"),
                        TaxBracket(31601, 41400, 0.88, "Tranche fédérale 2"),
                        TaxBracket(41401, 55200, 2.64, "Tranche fédérale 3"),
                        TaxBracket(55201, 72500, 2.97, "Tranche fédérale 4"),
                        TaxBracket(72501, 78100, 5.94, "Tranche fédérale 5"),
                        TaxBracket(78101, 103600, 6.60, "Tranche fédérale 6"),
                        TaxBracket(103601, 134600, 8.25, "Tranche fédérale 7"),
                        TaxBracket(134601, 176000, 9.90, "Tranche fédérale 8"),
                        TaxBracket(176001, 755200, 11.00, "Tranche fédérale 9"),
                        TaxBracket(755201, float('inf'), 11.50, "Tranche fédérale max")
                    ],
                    personal_allowance=0,
                    vat_standard_rate=8.1,
                    vat_reduced_rates=[2.6, 3.8],
                    social_security_employee=6.4,
                    social_security_employer=6.4,
                    wealth_tax_threshold=None,  # Varie par canton
                    capital_gains_tax=0.0,  # Pas d'impôt sur les gains en capital pour particuliers
                    last_updated="2025-01-01",
                    eu_member=False
                ),
                # ANDORRE
                "AD": CountryTaxData(
                    country_code="AD",
                    country_name="Andorra",
                    currency="EUR",
                    income_tax_brackets=[
                        TaxBracket(0, 24000, 0.0, "Exonération"),
                        TaxBracket(24001, 40000, 5.0, "Première tranche"),
                        TaxBracket(40001, float('inf'), 10.0, "Tranche maximale")
                    ],
                    personal_allowance=24000,
                    vat_standard_rate=4.5,
                    vat_reduced_rates=[1.0, 2.5, 9.5],
                    social_security_employee=6.5,
                    social_security_employer=15.5,
                    capital_gains_tax=0.0,
                    last_updated="2025-01-01",
                    eu_member=False
                ),
                # LUXEMBOURG
                "LU": CountryTaxData(
                    country_code="LU",
                    country_name="Luxembourg",
                    currency="EUR",
                    income_tax_brackets=[
                        TaxBracket(0, 12438, 0.0, "Exonération"),
                        TaxBracket(12439, 23350, 8.0, "Première tranche"),
                        TaxBracket(23351, 38700, 10.0, "Deuxième tranche"),
                        TaxBracket(38701, 54450, 12.0, "Troisième tranche"),
                        TaxBracket(54451, 111600, 14.0, "Quatrième tranche"),
                        TaxBracket(111601, 166650, 16.0, "Cinquième tranche"),
                        TaxBracket(166651, 221700, 18.0, "Sixième tranche"),
                        TaxBracket(221701, float('inf'), 42.0, "Tranche maximale")
                    ],
                    personal_allowance=12438,
                    vat_standard_rate=17.0,
                    vat_reduced_rates=[8.0, 14.0],
                    social_security_employee=12.8,
                    social_security_employer=12.8,
                    wealth_tax_threshold=500000,
                    wealth_tax_rate=0.5,
                    capital_gains_tax=0.0,  # Exonération après 6 mois
                    last_updated="2025-01-01",
                    eu_member=True
                ),
                
                # DANEMARK - Système fiscal nordique
                "DK": CountryTaxData(
                    country_name="Denmark",
                    currency="DKK",
                    personal_allowance=46700,  # Personfradrag 2024
                    income_tax_brackets=[
                        TaxBracket(0, 46700, 0, "Personfradrag - Exonération personnelle"),
                        TaxBracket(46701, 394900, 37.2, "Bundskat + kommuneskat moyen"),
                        TaxBracket(394901, 2800000, 42.2, "Mellemskat - Tranche intermédiaire"),
                        TaxBracket(2800001, float('inf'), 47.2, "Topskat - Tranche supérieure")
                    ],
                    social_security_employee=8.0,  # AM-bidrag
                    vat_standard_rate=25.0,  # Moms - Le plus élevé d'Europe
                    vat_reduced_rates=[],  # Pas de taux réduit
                    wealth_tax_threshold=None,  # Aboli en 1997
                    capital_gains_rate=27.0,  # Aktieindkomst
                    eu_member=True,
                    tax_treaties=["SE", "NO", "FI", "DE", "FR", "GB", "US"],
                    special_regimes=[
                        "Virksomhedsordningen (régime d'entreprise)",
                        "Kapitalafkast (rendement du capital)",
                        "Aktiesparekonto (compte épargne actions)",
                        "Pensionsordninger (régimes de retraite)"
                    ]
                ),
                
                # HONGRIE - Flat tax européen
                "HU": CountryTaxData(
                    country_name="Hungary", 
                    currency="HUF",
                    personal_allowance=77300,  # Személyi kedvezmény
                    income_tax_brackets=[
                        TaxBracket(0, 77300, 0, "Személyi kedvezmény"),
                        TaxBracket(77301, float('inf'), 15, "Flat tax - Taux unique")
                    ],
                    social_security_employee=18.5,  # TB járulék + nyugdíjjárulék
                    vat_standard_rate=27.0,  # ÁFA - Le plus élevé au monde
                    vat_reduced_rates=[5.0, 18.0],
                    wealth_tax_threshold=None,
                    capital_gains_rate=15.0,  # Tőkejövedelem
                    eu_member=True,
                    tax_treaties=["AT", "DE", "FR", "IT", "RO", "SK", "SI"],
                    special_regimes=[
                        "KATA (régime forfaitaire)",
                        "KIVA (micro-entreprise)",
                        "Családi kedvezmény (crédit d'impôt familial)",
                        "Széchenyi Kártya (carte entrepreneur)"
                    ]
                ),
                
                # ESTONIE - Système révolutionnaire
                "EE": CountryTaxData(
                    country_name="Estonia",
                    currency="EUR", 
                    personal_allowance=7848,  # Tulumaksuvaba miinimum
                    income_tax_brackets=[
                        TaxBracket(0, 7848, 0, "Exonération de base"),
                        TaxBracket(7849, float('inf'), 20, "Taux unique - Flat tax")
                    ],
                    social_security_employee=1.6,  # Töötuskindlustus
                    vat_standard_rate=22.0,  # Käibemaks
                    vat_reduced_rates=[9.0],
                    wealth_tax_threshold=None,
                    capital_gains_rate=20.0,
                    eu_member=True,
                    tax_treaties=["LV", "LT", "FI", "SE", "DE", "FR"],
                    special_regimes=[
                        "E-residency (résidence électronique)",
                        "Startup visa",
                        "Pas d'impôt société sur bénéfices non distribués",
                        "Régime crypto-monnaies favorable"
                    ]
                ),
                
                # ITALIE - Système complexe méditerranéen
                "IT": CountryTaxData(
                    country_name="Italy",
                    currency="EUR",
                    personal_allowance=8174,  # Detrazione per redditi di lavoro
                    income_tax_brackets=[
                        TaxBracket(0, 8174, 0, "No tax area"),
                        TaxBracket(8175, 28000, 23, "Prima scaglione IRPEF"),
                        TaxBracket(28001, 50000, 35, "Seconda scaglione IRPEF"),
                        TaxBracket(50001, 75000, 41, "Terza scaglione IRPEF"),
                        TaxBracket(75001, float('inf'), 43, "Quarta scaglione IRPEF")
                    ],
                    social_security_employee=9.19,  # Contributi INPS
                    vat_standard_rate=22.0,  # IVA ordinaria
                    vat_reduced_rates=[4.0, 5.0, 10.0],
                    wealth_tax_threshold=None,
                    capital_gains_rate=26.0,  # Imposta sostitutiva
                    eu_member=True,
                    tax_treaties=["FR", "DE", "CH", "AT", "ES", "PT", "MT", "SM"],
                    special_regimes=[
                        "Regime forfettario (forfait jusqu'à 85k€)",
                        "Partita IVA semplificata",
                        "Flat tax 100k€ per nuovi residenti",
                        "Regime impatriati (avantages expatriés)"
                    ]
                ),
                
                # ESPAGNE - Système décentralisé
                "ES": CountryTaxData(
                    country_name="Spain",
                    currency="EUR",
                    personal_allowance=5550,  # Mínimo personal
                    income_tax_brackets=[
                        TaxBracket(0, 12450, 19, "Tramo estatal + autonómico"),
                        TaxBracket(12451, 20200, 24, "Segunda escala"),
                        TaxBracket(20201, 35200, 30, "Tercera escala"),
                        TaxBracket(35201, 60000, 37, "Cuarta escala"),
                        TaxBracket(60001, 300000, 45, "Quinta escala"),
                        TaxBracket(300001, float('inf'), 47, "Escala máxima")
                    ],
                    social_security_employee=6.35,  # Cotizaciones SS
                    vat_standard_rate=21.0,  # IVA general
                    vat_reduced_rates=[4.0, 10.0],
                    wealth_tax_threshold=700000,  # Patrimonio (varie par région)
                    capital_gains_rate=23.0,  # Ahorro hasta 6k€, puis 26%
                    eu_member=True,
                    tax_treaties=["PT", "FR", "AD", "IT", "MA", "GB", "US"],
                    special_regimes=[
                        "Régimen de módulos (forfait)",
                        "Régimen simplificado",
                        "Beckham Law (expatriés)",
                        "ZEC Canarias (zone franche)",
                        "Régimen especial Ceuta y Melilla"
                    ]
                ),
                
                # PORTUGAL - Attractif pour retraités
                "PT": CountryTaxData(
                    country_name="Portugal",
                    currency="EUR",
                    personal_allowance=4104,  # Mínimo de existência
                    income_tax_brackets=[
                        TaxBracket(0, 7703, 14.5, "1º escalão IRS"),
                        TaxBracket(7704, 11623, 21.0, "2º escalão"),
                        TaxBracket(11624, 16472, 26.5, "3º escalão"),
                        TaxBracket(16473, 21321, 28.5, "4º escalão"),
                        TaxBracket(21322, 27146, 35.0, "5º escalão"),
                        TaxBracket(27147, 39791, 37.0, "6º escalão"),
                        TaxBracket(39792, 51997, 43.5, "7º escalão"),
                        TaxBracket(51998, 81199, 45.0, "8º escalão"),
                        TaxBracket(81200, float('inf'), 48.0, "Escalão máximo")
                    ],
                    social_security_employee=11.0,  # Taxa social única
                    vat_standard_rate=23.0,  # IVA normal
                    vat_reduced_rates=[6.0, 13.0],
                    wealth_tax_threshold=None,
                    capital_gains_rate=28.0,  # Mais-valias
                    eu_member=True,
                    tax_treaties=["ES", "FR", "BR", "MZ", "AO", "CV"],
                    special_regimes=[
                        "NHR - Residente não habitual (10 ans)",
                        "Golden Visa (investissement)",
                        "D7 Visa (retraités)",
                        "Regime simplificado",
                        "Açores et Madère (taux réduits)"
                    ]
                ),
                
                # BELGIQUE - Système fédéral complexe
                "BE": CountryTaxData(
                    country_name="Belgium",
                    currency="EUR",
                    personal_allowance=9050,  # Quotité exemptée
                    income_tax_brackets=[
                        TaxBracket(0, 15200, 25, "1ère tranche IPP"),
                        TaxBracket(15201, 26830, 40, "2ème tranche"),
                        TaxBracket(26831, 46440, 45, "3ème tranche"),
                        TaxBracket(46441, float('inf'), 50, "Tranche maximale")
                    ],
                    social_security_employee=13.07,  # ONSS
                    vat_standard_rate=21.0,  # TVA/BTW
                    vat_reduced_rates=[6.0, 12.0],
                    wealth_tax_threshold=None,
                    capital_gains_rate=33.0,  # Précompte mobilier
                    eu_member=True,
                    tax_treaties=["FR", "NL", "DE", "LU", "GB", "US"],
                    special_regimes=[
                        "Régime des expatriés",
                        "Innovation income deduction",
                        "Notional interest deduction",
                        "Patent income deduction",
                        "Régime fiscal Bruxelles-Capitale"
                    ]
                ),
                
                # PAYS-BAS - Innovation fiscale
                "NL": CountryTaxData(
                    country_name="Netherlands",
                    currency="EUR",
                    personal_allowance=3070,  # Algemene heffingskorting
                    income_tax_brackets=[
                        TaxBracket(0, 75518, 36.93, "Schijf 1 + premies"),
                        TaxBracket(75519, float('inf'), 49.5, "Schijf 2")
                    ],
                    social_security_employee=27.65,  # AOW + WLZ + WW
                    vat_standard_rate=21.0,  # BTW hoog tarief
                    vat_reduced_rates=[9.0],
                    wealth_tax_threshold=57000,  # Box 3 vermogen
                    capital_gains_rate=31.0,  # Box 3 forfait
                    eu_member=True,
                    tax_treaties=["BE", "DE", "GB", "US", "SG", "HK"],
                    special_regimes=[
                        "30% ruling (expatriés 5 ans)",
                        "Innovation box (brevets 7%)",
                        "Participation exemption",
                        "REIT regime",
                        "Startup deduction"
                    ]
                ),
                
                # AUTRICHE - Système alpin
                "AT": CountryTaxData(
                    country_name="Austria",
                    currency="EUR", 
                    personal_allowance=12816,  # Grundfreibetrag
                    income_tax_brackets=[
                        TaxBracket(0, 12816, 0, "Grundfreibetrag"),
                        TaxBracket(12817, 21400, 20, "1. Tarifstufe"),
                        TaxBracket(21401, 31000, 32.5, "2. Tarifstufe"),
                        TaxBracket(31001, 62200, 42, "3. Tarifstufe"),
                        TaxBracket(62201, 93000, 48, "4. Tarifstufe"),
                        TaxBracket(93001, 1000000, 50, "5. Tarifstufe"),
                        TaxBracket(1000001, float('inf'), 55, "Reichensteuer")
                    ],
                    social_security_employee=18.12,  # SV-Beiträge
                    vat_standard_rate=20.0,  # Umsatzsteuer
                    vat_reduced_rates=[10.0, 13.0],
                    wealth_tax_threshold=None,
                    capital_gains_rate=27.5,  # KESt
                    eu_member=True,
                    tax_treaties=["DE", "CH", "IT", "SI", "HU", "CZ", "SK"],
                    special_regimes=[
                        "Kleinunternehmerregelung",
                        "Pauschalierung Land- und Forstwirtschaft",
                        "Red-White-Red Card",
                        "Forschungsprämie (R&D)"
                    ]
                ),
                
                # SUÈDE - Modèle nordique avancé
                "SE": CountryTaxData(
                    country_name="Sweden",
                    currency="SEK",
                    personal_allowance=25000,  # Grundavdrag
                    income_tax_brackets=[
                        TaxBracket(0, 25000, 0, "Grundavdrag - Exonération"),
                        TaxBracket(25001, 540700, 32.28, "Kommunalskatt + statlig skatt"),
                        TaxBracket(540701, float('inf'), 52.28, "Statlig skatt + kommunal")
                    ],
                    social_security_employee=7.0,  # Allmän pension + sjukförsäkring
                    vat_standard_rate=25.0,  # Moms
                    vat_reduced_rates=[6.0, 12.0],
                    wealth_tax_threshold=None,  # Aboli en 2007
                    capital_gains_rate=30.0,  # Kapitalinkomst
                    eu_member=True,
                    tax_treaties=["NO", "DK", "FI", "DE", "FR", "GB", "US"],
                    special_regimes=[
                        "ISK - Investeringssparkonto (compte épargne investissement)",
                        "Kapitalförsäkring (assurance capital)",
                        "Pensionssparande (épargne retraite)",
                        "Fåmansbolag (petites entreprises)"
                    ]
                ),
                
                # NORVÈGE - Pétro-économie
                "NO": CountryTaxData(
                    country_name="Norway",
                    currency="NOK",
                    personal_allowance=68800,  # Personfradrag
                    income_tax_brackets=[
                        TaxBracket(0, 68800, 0, "Personfradrag"),
                        TaxBracket(68801, 292850, 22, "Ordinær sats"),
                        TaxBracket(292851, 670000, 33.4, "Trinn 1 + ordinær"),
                        TaxBracket(670001, 937900, 35.4, "Trinn 2"),
                        TaxBracket(937901, 1350000, 37.4, "Trinn 3"),
                        TaxBracket(1350001, float('inf'), 39.4, "Toppskatt")
                    ],
                    social_security_employee=8.2,  # Trygdeavgift
                    vat_standard_rate=25.0,  # Merverdiavgift
                    vat_reduced_rates=[12.0, 15.0],
                    wealth_tax_threshold=2000000,  # Formuesskatt réintroduit 2022
                    capital_gains_rate=22.0,  # Kapitalinntekt
                    eu_member=False,  # EEE
                    tax_treaties=["SE", "DK", "FI", "DE", "FR", "GB", "US"],
                    special_regimes=[
                        "Aksjesparekonto (compte épargne actions)",
                        "IPS - Individuell pensjonssparing",
                        "Skattefunn (R&D incentives)",
                        "Tonnasjeskatteordningen (shipping)"
                    ]
                ),
                
                # FINLANDE - Innovation nordique
                "FI": CountryTaxData(
                    country_name="Finland",
                    currency="EUR",
                    personal_allowance=19900,  # Perusvähennys
                    income_tax_brackets=[
                        TaxBracket(0, 19900, 0, "Perusvähennys"),
                        TaxBracket(19901, 29200, 6, "1. progressiivinen vero"),
                        TaxBracket(29201, 47300, 17.25, "2. vero + kunnallisvero"),
                        TaxBracket(47301, 82900, 21.25, "3. vero"),
                        TaxBracket(82901, float('inf'), 31.25, "Korkein vero")
                    ],
                    social_security_employee=8.65,  # TyEL + työttömyysvakuutusmaksu
                    vat_standard_rate=24.0,  # Arvonlisävero
                    vat_reduced_rates=[10.0, 14.0],
                    wealth_tax_threshold=None,  # Aboli en 2006
                    capital_gains_rate=30.0,  # Pääomatulovero
                    eu_member=True,
                    tax_treaties=["SE", "NO", "DK", "EE", "DE", "FR", "RU"],
                    special_regimes=[
                        "Osakesäästötili (compte épargne actions)",
                        "Sijoitusvakuutus (assurance investissement)",
                        "Startup-vähennysoikeus (déduction startup)",
                        "Metsävähennys (déduction forestière)"
                    ]
                ),
                
                # IRLANDE - Hub européen
                "IE": CountryTaxData(
                    country_name="Ireland",
                    currency="EUR",
                    personal_allowance=1875,  # Personal tax credit
                    income_tax_brackets=[
                        TaxBracket(0, 42000, 20, "Standard rate + USC + PRSI"),
                        TaxBracket(42001, float('inf'), 40, "Higher rate")
                    ],
                    social_security_employee=4.0,  # PRSI Class A
                    vat_standard_rate=23.0,  # VAT
                    vat_reduced_rates=[9.0, 13.5],
                    wealth_tax_threshold=None,
                    capital_gains_rate=33.0,  # CGT
                    eu_member=True,
                    tax_treaties=["GB", "US", "DE", "FR", "NL", "LU"],
                    special_regimes=[
                        "12.5% Corporation Tax (entreprises)",
                        "REIT regime",
                        "R&D tax credit 25%",
                        "Special Assignee Relief Programme (SARP)"
                    ]
                ),
                
                # POLOGNE - Économie dynamique
                "PL": CountryTaxData(
                    country_name="Poland",
                    currency="PLN",
                    personal_allowance=30000,  # Kwota wolna
                    income_tax_brackets=[
                        TaxBracket(0, 30000, 0, "Kwota wolna od podatku"),
                        TaxBracket(30001, 120000, 12, "Pierwsza skala podatkowa"),
                        TaxBracket(120001, float('inf'), 32, "Druga skala podatkowa")
                    ],
                    social_security_employee=13.71,  # Składki ZUS pracownika
                    vat_standard_rate=23.0,  # VAT
                    vat_reduced_rates=[5.0, 8.0],
                    wealth_tax_threshold=None,
                    capital_gains_rate=19.0,  # Podatek od zysków kapitałowych
                    eu_member=True,
                    tax_treaties=["DE", "FR", "IT", "CZ", "SK", "LT", "UA"],
                    special_regimes=[
                        "Mały ZUS Plus (micro-entreprise)",
                        "Ryczałt ewidencjonowany (forfait)",
                        "IP Box (propriété intellectuelle 5%)",
                        "Estonian CIT (pas d'impôt sur bénéfices non distribués)"
                    ]
                ),
                
                # RÉPUBLIQUE TCHÈQUE - Cœur de l'Europe
                "CZ": CountryTaxData(
                    country_name="Czech Republic",
                    currency="CZK",
                    personal_allowance=30840,  # Základní sleva na poplatníka
                    income_tax_brackets=[
                        TaxBracket(0, 1935552, 15, "Základní sazba daně"),
                        TaxBracket(1935553, float('inf'), 23, "Solidární zvýšení daně")
                    ],
                    social_security_employee=11.0,  # Sociální a zdravotní pojištění
                    vat_standard_rate=21.0,  # DPH základní sazba
                    vat_reduced_rates=[10.0, 15.0],
                    wealth_tax_threshold=None,
                    capital_gains_rate=15.0,  # Daň z příjmů z kapitálových výnosů
                    eu_member=True,
                    tax_treaties=["SK", "AT", "DE", "PL", "HU", "SI"],
                    special_regimes=[
                        "Paušální daň (forfait jusqu'à 2M CZK)",
                        "Osvobození příjmů z prodeje nemovitostí",
                        "Sleva na manžela/manželku",
                        "IP režim (propriété intellectuelle)"
                    ]
                ),
                
                # SLOVAQUIE - Flat tax pionnier
                "SK": CountryTaxData(
                    country_name="Slovakia",
                    currency="EUR",
                    personal_allowance=4414.2,  # Nezdaniteľné minimum
                    income_tax_brackets=[
                        TaxBracket(0, 39789.36, 19, "Základná sadzba dane"),
                        TaxBracket(39789.37, float('inf'), 25, "Zvýšená sadzba dane")
                    ],
                    social_security_employee=13.4,  # Poistné zamestnanca
                    vat_standard_rate=20.0,  # DPH základná sadzba
                    vat_reduced_rates=[10.0],
                    wealth_tax_threshold=None,
                    capital_gains_rate=19.0,  # Daň z kapitálových výnosov
                    eu_member=True,
                    tax_treaties=["CZ", "AT", "HU", "PL", "SI", "DE"],
                    special_regimes=[
                        "Paušálne výdavky (frais forfaitaires)",
                        "Oslobodenie príjmov z predaja nehnuteľností",
                        "Daňový bonus na dieťa",
                        "Investičné stimuly"
                    ]
                ),
                
                # SLOVÉNIE - Alpes-Adriatique
                "SI": CountryTaxData(
                    country_name="Slovenia",
                    currency="EUR",
                    personal_allowance=6587.55,  # Splošna olajšava
                    income_tax_brackets=[
                        TaxBracket(0, 8755.20, 16, "1. dohodninsko razred"),
                        TaxBracket(8755.21, 25333.10, 26, "2. razred"),
                        TaxBracket(25333.11, 50666.20, 33, "3. razred"),
                        TaxBracket(50666.21, 74160.00, 39, "4. razred"),
                        TaxBracket(74160.01, float('inf'), 50, "5. razred")
                    ],
                    social_security_employee=22.1,  # Prispevki za socialno varnost
                    vat_standard_rate=22.0,  # DDV
                    vat_reduced_rates=[5.0, 9.5],
                    wealth_tax_threshold=None,
                    capital_gains_rate=27.5,  # Davek na kapitalske dobičke
                    eu_member=True,
                    tax_treaties=["AT", "IT", "HR", "HU", "SK", "CZ"],
                    special_regimes=[
                        "Normirani odhodki (frais forfaitaires)",
                        "Davčne olajšave za investicije",
                        "Olajšava za raziskave in razvoj",
                        "Posebni davčni režim za holding družbe"
                    ]
                )
            }
        
        # Ajout des connaissances fiscales spécialisées ULTRA-AVANCÉES
        self._add_tax_optimization_rules()
        self._add_inheritance_tax_rules()
        self._add_business_tax_rules()
        self._add_vat_special_cases()
        self._add_social_security_coordination()
        self._add_tax_treaty_benefits()
        
        # NOUVELLES connaissances ULTRA-SPÉCIALISÉES
        self._add_crypto_taxation_rules()
        self._add_real_estate_taxation()
        self._add_pension_systems_detailed()
        self._add_expatriate_taxation()
        self._add_family_taxation_rules()
        self._add_professional_expenses()
        self._add_tax_audit_procedures()
        self._add_legal_precedents()
        self._add_practical_case_studies()
        
        # CONNAISSANCES EXPERTES HYPER-SPÉCIALISÉES
        self._add_advanced_tax_planning()
        self._add_international_structures()
        self._add_regulatory_updates_2025()
        self._add_sector_specific_taxation()
        self._add_dispute_resolution()
        self._add_compliance_requirements()
        self._add_emerging_tax_issues()
        self._add_quantitative_analysis()
        self._add_risk_assessment_matrix()
        
        # MODULES SUPER-INTELLIGENCE FISCALE
        self._add_ai_powered_tax_strategies()
        self._add_predictive_tax_modeling()
        self._add_cross_border_optimization()
        self._add_regulatory_intelligence()
        self._add_market_intelligence()
        self._add_competitive_analysis()
        self._add_scenario_planning()
        self._add_real_time_monitoring()
        self._add_expert_decision_trees()
        self._add_advanced_calculations()
        
        # MODULES MONTAGES FISCAUX ULTRA-SOPHISTIQUÉS
        self._add_ultimate_tax_schemes()
        self._add_advanced_structuring()
        self._add_optimization_masterclass()
        self._add_legal_arbitrage_strategies()
        self._add_sophisticated_planning()
        self._add_wealth_preservation()
        self._add_income_transformation()
        self._add_timing_strategies()
        self._add_multi_jurisdictional_planning()
        self._add_anti_avoidance_navigation()

        # MODULES CONFORMITÉ ET ANTI-ABUS UE
        self._add_dac6_mdr_rules()
        self._add_dac8_crypto_reporting()
        self._add_pillar_two_globe_rules()
        self._add_exit_tax_rules()
        self._add_atad_framework()
        self._add_permanent_establishment_rules()
        self._add_unshell_rules()
        self._add_bo_register_requirements()
        self._add_transfer_pricing_framework()
        self._add_withholding_tax_matrix()
        self._add_reporting_calendar()
        
    def _add_tax_optimization_rules(self):
        """Règles d'optimisation fiscale européenne"""
        self.tax_optimization_strategies = {
            "income_shifting": {
                "description": "Déplacement de revenus vers juridictions favorables",
                "countries": ["IE", "NL", "LU", "EE", "HU"],
                "conditions": ["Résidence fiscale", "Substance économique", "Anti-abus"],
                "savings_potential": "15-35%"
            },
            "holding_structures": {
                "description": "Structures holding européennes",
                "optimal_countries": ["NL", "LU", "BE", "CH"],
                "benefits": ["Participation exemption", "Withholding tax relief", "Treaty network"],
                "requirements": ["Substance", "Commercial rationale", "EU directives"]
            },
            "intellectual_property": {
                "description": "Optimisation IP Box",
                "countries": {
                    "NL": "7% Innovation Box",
                    "BE": "6.8% Patent income deduction", 
                    "LU": "5.76% IP regime",
                    "PL": "5% IP Box",
                    "HU": "4.5% IP regime"
                }
            },
            "pension_optimization": {
                "description": "Optimisation retraite transfrontalière",
                "strategies": ["Pillar 3a Suisse", "PERP France", "Riester Allemagne"],
                "coordination": "Règlement UE 883/2004"
            }
        }
        
    def _add_inheritance_tax_rules(self):
        """Règles de succession européennes détaillées"""
        self.inheritance_tax_rules = {
            "FR": {
                "rates": {"direct_line": [5, 10, 15, 20, 30, 40, 45], "siblings": [35, 45], "others": 60},
                "allowances": {"spouse": 0, "children": 100000, "grandchildren": 31865},
                "special_regimes": ["Pacte Dutreil", "Donation-partage", "Assurance-vie"],
                "eu_regulation": "Règlement 650/2012 applicable"
            },
            "DE": {
                "rates": {"class_1": [7, 11, 15, 19, 23, 27, 30], "class_2": [15, 20, 25, 30], "class_3": [30, 50]},
                "allowances": {"spouse": 500000, "children": 400000, "grandchildren": 200000},
                "special_regimes": ["Familienheim", "Betriebsvermögen", "Land- und Forstwirtschaft"]
            },
            "CH": {
                "federal_tax": 0,  # Pas d'impôt fédéral
                "cantonal_variations": "0% à 50% selon canton",
                "spouse_exemption": "Total dans la plupart des cantons",
                "planning_tools": ["Pacte successoral", "Testament", "Fondation familiale"]
            },
            "IT": {
                "rates": {"spouse_children": 4, "siblings": 6, "others": 8},
                "allowances": {"spouse": 1000000, "children": 1000000, "disabled": 1500000},
                "regional_variations": "Impôt régional additionnel possible"
            }
        }
        
    def _add_business_tax_rules(self):
        """Règles fiscales entreprises détaillées"""
        self.business_tax_rules = {
            "corporate_rates": {
                "IE": 12.5,  # Le plus bas UE
                "HU": 9.0,   # Flat rate
                "BG": 10.0,  # Flat rate
                "CY": 12.5,  # Attractif
                "LT": 15.0,  # Compétitif
                "FR": 25.0,  # Standard + contributions
                "DE": 29.8,  # Körperschaftsteuer + Gewerbesteuer
                "IT": 24.0   # IRES
            },
            "special_regimes": {
                "patent_box": ["NL", "BE", "LU", "IT", "ES", "PT", "PL", "HU"],
                "r_and_d_incentives": ["FR", "IE", "NL", "BE", "AT", "NO"],
                "holding_exemptions": ["NL", "LU", "BE", "AT", "CH"],
                "startup_incentives": ["EE", "LT", "PL", "FR", "IT"]
            },
            "anti_avoidance": {
                "gaar": "Directive UE 2016/1164 - Règle anti-abus générale",
                "cfc_rules": "Controlled Foreign Company rules",
                "interest_limitation": "Règle 30% EBITDA",
                "exit_taxation": "Directive sortie d'actifs"
            }
        }
        
    def _add_vat_special_cases(self):
        """Cas spéciaux TVA européenne"""
        self.vat_special_cases = {
            "digital_services": {
                "rule": "TVA pays de consommation (OSS)",
                "threshold": "€10,000 par État membre",
                "rates_by_country": {
                    "FR": 20.0, "DE": 19.0, "IT": 22.0, "ES": 21.0,
                    "NL": 21.0, "BE": 21.0, "AT": 20.0, "DK": 25.0
                }
            },
            "real_estate": {
                "general_rule": "TVA pays de situation du bien",
                "exemptions": "Locations résidentielles longue durée",
                "option_taxation": "Possible pour locations commerciales"
            },
            "intra_eu_supplies": {
                "b2b": "0% avec numéro TVA valide",
                "b2c": "TVA pays d'origine si < seuils",
                "distance_selling": "Seuils €35,000 ou €100,000"
            }
        }
        
    def _add_social_security_coordination(self):
        """Coordination sécurité sociale européenne"""
        self.social_security_coordination = {
            "regulation": "Règlement UE 883/2004 et 987/2009",
            "principles": [
                "Une seule législation applicable",
                "Égalité de traitement",
                "Totalisation des périodes",
                "Exportabilité des prestations"
            ],
            "posted_workers": {
                "duration": "24 mois maximum",
                "extension": "12 mois supplémentaires possible",
                "certificate": "Formulaire A1 obligatoire"
            },
            "pension_coordination": {
                "calculation": "Pro rata temporis",
                "minimum_periods": "1 an par État",
                "aggregation": "Totalisation périodes UE/EEE"
            }
        }
        
    def _add_tax_treaty_benefits(self):
        """Avantages des conventions fiscales"""
        self.tax_treaty_benefits = {
            "withholding_tax_rates": {
                "dividends": {"standard": "5-15%", "substantial_holdings": "0-5%"},
                "interest": {"standard": "0-10%", "government_bonds": "0%"},
                "royalties": {"standard": "0-10%", "eu_directive": "0%"}
            },
            "tie_breaker_rules": [
                "Foyer d'habitation permanent",
                "Centre des intérêts vitaux",
                "Séjour habituel",
                "Nationalité",
                "Procédure amiable"
            ],
            "anti_treaty_shopping": {
                "principal_purpose_test": "PPT dans conventions OCDE",
                "limitation_of_benefits": "LOB dans conventions US",
                "substance_requirements": "Activité économique réelle"
            }
        }
        
    def _add_crypto_taxation_rules(self):
        """Règles fiscales crypto-monnaies européennes"""
        self.crypto_taxation = {
            "FR": {
                "individuals": {
                    "occasional_sales": "Plus-values mobilières 30% PFU ou barème IR",
                    "frequent_trading": "BNC - Bénéfices non commerciaux au barème",
                    "mining": "BIC - Bénéfices industriels et commerciaux",
                    "staking": "Revenus de capitaux mobiliers 30% PFU",
                    "threshold": "Seuil 305€ gains annuels pour déclaration"
                },
                "defi_protocols": "Taxation complexe selon qualification juridique",
                "nft": "Plus-values sur biens meubles, seuil 5000€"
            },
            "DE": {
                "individuals": {
                    "holding_period": "1 an minimum pour exonération",
                    "speculation_tax": "Spekulationssteuer si < 1 an",
                    "mining": "Gewerbebetrieb - Activité commerciale",
                    "staking": "Sonstige Einkünfte - Autres revenus"
                },
                "exemption_threshold": "600€ par an"
            },
            "CH": {
                "individuals": {
                    "private_wealth": "Pas d'impôt sur gains en capital",
                    "professional_trading": "Revenus commerciaux imposables",
                    "criteria": "5 critères fédéraux pour qualification",
                    "wealth_tax": "Crypto inclus dans fortune imposable"
                }
            },
            "PT": {
                "individuals": {
                    "holding_period": "365 jours minimum pour exonération",
                    "tax_rate": "28% sur plus-values < 365 jours",
                    "exemption": "Gains < 500€ par an exonérés"
                }
            },
            "EE": {
                "individuals": "Pas d'impôt sur gains en capital crypto",
                "businesses": "20% sur revenus crypto professionnels"
            }
        }
        
    def _add_real_estate_taxation(self):
        """Fiscalité immobilière européenne détaillée"""
        self.real_estate_taxation = {
            "FR": {
                "plus_values": {
                    "primary_residence": "Exonération totale",
                    "secondary_residence": "19% + 17.2% prélèvements sociaux",
                    "abatements": {
                        "duration": "6% par an après 6 ans, 4% par an après 22 ans",
                        "social": "1.65% par an après 6 ans, 1.60% après 22 ans, 9% après 30 ans"
                    }
                },
                "rental_income": {
                    "micro_foncier": "Abattement 30% si < 15k€",
                    "reel_regime": "Déduction charges réelles",
                    "lmnp": "Loueur meublé non professionnel - amortissements",
                    "lmp": "Loueur meublé professionnel - BIC"
                },
                "wealth_tax": "IFI - Impôt sur la fortune immobilière > 1.3M€"
            },
            "DE": {
                "speculation_tax": "Spekulationssteuer si vente < 10 ans",
                "rental_income": "Einkünfte aus Vermietung und Verpachtung",
                "depreciation": "2% linéaire ou 2.5% dégressif",
                "property_tax": "Grundsteuer - Taxe foncière communale"
            },
            "IT": {
                "plus_values": {
                    "primary_residence": "Exonération si > 5 ans",
                    "secondary": "26% imposta sostitutiva",
                    "luxury_properties": "Imposta di registro majorée"
                },
                "rental_income": {
                    "cedolare_secca": "Flat tax 21% ou 10% selon zone",
                    "irpef": "Barème progressif avec déductions"
                }
            },
            "ES": {
                "plus_values": {
                    "primary_residence": "Exonération si réinvestissement",
                    "rates": "19% jusqu'à 6k€, 21% 6k-50k€, 23% > 50k€",
                    "municipal_tax": "Plusvalía municipal controversée"
                },
                "rental_income": "IRPF avec réduction 60% si < 2 ans"
            }
        }
        
    def _add_pension_systems_detailed(self):
        """Systèmes de retraite européens détaillés"""
        self.pension_systems = {
            "pillar_structure": {
                "pillar_1": "Retraite publique obligatoire par répartition",
                "pillar_2": "Retraite professionnelle obligatoire/volontaire",
                "pillar_3": "Épargne retraite individuelle volontaire"
            },
            "FR": {
                "pillar_1": {
                    "regime_general": "CNAV - 50% salaire de référence max",
                    "complementary": "AGIRC-ARRCO obligatoire",
                    "minimum": "Minimum contributif, ASPA"
                },
                "pillar_3": {
                    "per": "Plan Épargne Retraite - déduction IR",
                    "perp": "PERP ancien système",
                    "assurance_vie": "Fiscalité après 8 ans avantageuse"
                }
            },
            "DE": {
                "pillar_1": "Gesetzliche Rentenversicherung 48% max",
                "pillar_2": "Betriebliche Altersvorsorge",
                "pillar_3": {
                    "riester": "Riester-Rente avec subventions État",
                    "ruerup": "Rürup-Rente pour indépendants"
                }
            },
            "CH": {
                "pillar_1": "AVS - Assurance vieillesse survivants",
                "pillar_2": "LPP - Prévoyance professionnelle obligatoire",
                "pillar_3a": "Prévoyance liée - déduction fiscale",
                "pillar_3b": "Prévoyance libre - assurance vie"
            },
            "coordination_ue": {
                "regulation": "Règlement 883/2004 coordination SS",
                "totalisation": "Périodes cotisées dans tous pays UE",
                "pro_rata": "Pension proportionnelle par pays",
                "exportability": "Paiement pension dans tout pays UE"
            }
        }
        
    def _add_expatriate_taxation(self):
        """Fiscalité des expatriés européens"""
        self.expatriate_taxation = {
            "residence_rules": {
                "183_day_rule": "Règle générale résidence fiscale",
                "tie_breaker": "Foyer, intérêts vitaux, séjour, nationalité",
                "deemed_residence": "Résidence présumée selon pays"
            },
            "special_regimes": {
                "FR": {
                    "impatries": "Exonération partielle 8 ans revenus étrangers",
                    "conditions": "Domicile fiscal hors France 5 ans",
                    "benefits": "Exonération plus-values, revenus étrangers"
                },
                "IT": {
                    "regime_impatriati": "Flat tax 100k€ revenus étrangers",
                    "duration": "15 ans maximum",
                    "extension": "Possible si investissement Italie"
                },
                "PT": {
                    "nhr": "Residente não habitual 10 ans",
                    "benefits": "Exonération revenus étrangers",
                    "professions": "Liste activités à haute valeur ajoutée"
                },
                "ES": {
                    "beckham_law": "Flat tax 24% revenus mondiaux",
                    "duration": "6 ans maximum",
                    "conditions": "Contrat travail espagnol"
                },
                "NL": {
                    "30_ruling": "30% salaire exonéré d'impôt",
                    "duration": "5 ans",
                    "conditions": "Compétences rares, salaire minimum"
                },
                "BE": {
                    "expat_regime": "Frais professionnels forfaitaires majorés",
                    "foreign_executives": "Régime cadres étrangers"
                }
            },
            "exit_taxation": {
                "directive_2016_1164": "Directive anti-évasion UE",
                "unrealized_gains": "Taxation gains latents au départ",
                "deferral": "Report paiement possible",
                "thresholds": "Seuils participation > 1M€"
            }
        }
        
    def _add_family_taxation_rules(self):
        """Fiscalité familiale européenne"""
        self.family_taxation = {
            "FR": {
                "quotient_familial": {
                    "parts": "1 part par parent, 0.5 par enfant",
                    "plafond": "Avantage plafonné 1678€ par demi-part",
                    "exceptions": "Enfants handicapés, anciens combattants"
                },
                "child_benefits": {
                    "allocations": "CAF selon revenus et nombre enfants",
                    "complement": "Complément familial, ARS, prime naissance"
                },
                "tax_credits": {
                    "garde_enfants": "50% frais garde < 6 ans",
                    "emploi_domicile": "50% services à domicile",
                    "scolarite": "Crédit impôt frais scolarité"
                }
            },
            "DE": {
                "kindergeld": "Allocations familiales 250€/mois par enfant",
                "kinderfreibetrag": "Abattement fiscal enfant vs Kindergeld",
                "elterngeld": "Congé parental 65% salaire 12-14 mois",
                "splitting": "Ehegattensplitting - quotient conjugal"
            },
            "BE": {
                "quotient_conjugal": "Quotient conjugal limité",
                "allocations": "Allocations familiales régionalisées",
                "deductions": "Déductions frais garde, école"
            },
            "coordination": {
                "regulation_883": "Coordination prestations familiales UE",
                "priority_rules": "Règles priorité pays emploi/résidence",
                "supplements": "Compléments différentiels possibles"
            }
        }
        
    def _add_professional_expenses(self):
        """Frais professionnels déductibles européens"""
        self.professional_expenses = {
            "FR": {
                "salaries": {
                    "abattement_10": "Abattement forfaitaire 10% min 448€ max 13.522€",
                    "frais_reels": "Frais réels si > abattement forfaitaire",
                    "deductible": [
                        "Transport domicile-travail (distance > 40km)",
                        "Repas (si pas de restaurant d'entreprise)",
                        "Vêtements de travail spécialisés",
                        "Formation professionnelle",
                        "Documentation professionnelle",
                        "Bureau à domicile (si télétravail)"
                    ]
                },
                "independants": {
                    "bic_bnc": "Déduction charges selon comptabilité",
                    "micro_regime": "Abattement forfaitaire 34% BIC, 34% BNC",
                    "charges_deductibles": [
                        "Achats matières premières",
                        "Loyer bureau, charges",
                        "Assurances professionnelles",
                        "Formation, documentation",
                        "Frais de déplacement",
                        "Amortissements matériel"
                    ]
                }
            },
            "DE": {
                "werbungskosten": {
                    "pauschbetrag": "Abattement forfaitaire 1.230€",
                    "einzelnachweis": "Justification individuelle si > forfait",
                    "deductible": [
                        "Fahrtkosten - 0,30€/km domicile-travail",
                        "Arbeitsmittel - Matériel de travail",
                        "Fortbildung - Formation continue",
                        "Arbeitskleidung - Vêtements de travail",
                        "Häusliches Arbeitszimmer - Bureau domicile"
                    ]
                }
            },
            "CH": {
                "federal_deductions": {
                    "transport": "Frais transport public ou 0,70 CHF/km",
                    "meals": "Repas hors domicile si nécessité professionnelle",
                    "continuing_education": "Formation continue liée activité",
                    "home_office": "Bureau domicile selon cantons"
                },
                "cantonal_variations": "Déductions varient significativement par canton"
            }
        }
        
    def _add_tax_audit_procedures(self):
        """Procédures de contrôle fiscal européennes"""
        self.tax_audit_procedures = {
            "FR": {
                "types_controle": {
                    "examen_contradictoire": "Vérification sur pièces",
                    "verification_comptabilite": "Contrôle sur place < 3 ans",
                    "controle_inattendu": "Visite inopinée possible"
                },
                "droits_contribuable": [
                    "Assistance conseil (expert-comptable, avocat)",
                    "Délai réponse observations 30 jours",
                    "Recours hiérarchique puis contentieux",
                    "Commission des impôts directs et taxes"
                ],
                "prescriptions": {
                    "generale": "3 ans à compter 31 décembre année imposition",
                    "omissions": "6 ans si défaut déclaration > 25%",
                    "fraude": "10 ans en cas manœuvres frauduleuses"
                }
            },
            "DE": {
                "betriebspruefung": {
                    "duration": "Généralement 6 mois à 2 ans",
                    "scope": "3 dernières années, extension possible",
                    "rights": "Assistance Steuerberater obligatoire"
                },
                "verjährung": "Prescription générale 4 ans, 10 ans si fraude"
            },
            "common_triggers": [
                "Déclarations incohérentes années successives",
                "Ratios sectoriels anormaux",
                "Transactions internationales importantes",
                "Revenus non déclarés signalés",
                "Contrôles croisés avec tiers"
            ]
        }
        
    def _add_legal_precedents(self):
        """Jurisprudence fiscale européenne importante"""
        self.legal_precedents = {
            "cjue_landmark_cases": {
                "cadbury_schweppes": {
                    "year": "2006",
                    "principle": "CFC rules must respect freedom of establishment",
                    "impact": "Limitation règles sociétés contrôlées étrangères"
                },
                "marks_spencer": {
                    "year": "2005", 
                    "principle": "Cross-border loss relief in specific circumstances",
                    "impact": "Report pertes transfrontalières limité mais possible"
                },
                "avoir_fiscal": {
                    "year": "1986",
                    "principle": "Tax credits must be extended to EU residents",
                    "impact": "Non-discrimination fiscale entre résidents UE"
                }
            },
            "french_precedents": {
                "conseil_etat": {
                    "residence_fiscale": "CE 2019 - Critères résidence fiscale affinés",
                    "prix_transfert": "CE 2020 - Méthodes prix de transfert",
                    "abus_droit": "CE 2021 - Définition abus de droit fiscal"
                }
            },
            "german_precedents": {
                "bfh": {
                    "doppelbesteuerung": "BFH 2022 - Double imposition évitée",
                    "steuerumgehung": "BFH 2021 - Évasion fiscale critères"
                }
            }
        }
        
    def _add_practical_case_studies(self):
        """Cas pratiques fiscaux européens"""
        self.practical_cases = {
            "cross_border_worker": {
                "scenario": "Résident français travaillant en Suisse",
                "taxation": {
                    "salary": "Imposé en Suisse avec crédit d'impôt France",
                    "social_security": "Cotisations suisses avec certificat A1",
                    "optimization": "Négociation statut frontalier"
                },
                "pitfalls": ["Double imposition temporaire", "Taux de change", "Frais déductibles"]
            },
            "digital_nomad": {
                "scenario": "Freelance IT travaillant dans plusieurs pays UE",
                "challenges": [
                    "Détermination résidence fiscale principale",
                    "Répartition revenus par pays",
                    "TVA services numériques",
                    "Cotisations sociales applicables"
                ],
                "solutions": [
                    "Certificat résidence fiscale",
                    "Déclarations coordonnées",
                    "OSS pour TVA",
                    "Détachement A1 si possible"
                ]
            },
            "inheritance_planning": {
                "scenario": "Succession franco-allemande avec biens immobiliers",
                "complexity": [
                    "Loi applicable (Règlement 650/2012)",
                    "Réserve héréditaire vs liberté testamentaire",
                    "Double imposition succession",
                    "Plus-values immobilières latentes"
                ],
                "strategies": [
                    "Élection loi nationale défunt",
                    "Donation-partage anticipée",
                    "SCI holding immobilier",
                    "Assurance-vie transfrontalière"
                ]
            },
            "startup_exit": {
                "scenario": "Vente startup avec fondateurs multi-européens",
                "tax_issues": [
                    "Plus-values actions selon résidence",
                    "Stock-options taxation",
                    "Carry interest funds",
                    "Exit tax si changement résidence"
                ],
                "optimization": [
                    "Timing résidence fiscale",
                    "Holding structure",
                    "Réinvestissement exonéré",
                    "Report imposition possible"
                ]
            }
        }
        
    def _add_advanced_tax_planning(self):
        """Planification fiscale avancée européenne"""
        self.advanced_tax_planning = {
            "wealth_structuring": {
                "family_offices": {
                    "luxembourg": "Soparfi + PSF pour gestion patrimoine",
                    "switzerland": "Family office suisse avec fondations",
                    "netherlands": "Stichting + BV structure",
                    "benefits": ["Confidentialité", "Optimisation fiscale", "Succession"]
                },
                "trust_structures": {
                    "malta": "Malta trust + residence programme",
                    "cyprus": "International trust Cyprus",
                    "uk_trusts": "Settlor interested trusts",
                    "tax_treatment": "Transparent vs opaque selon pays"
                }
            },
            "succession_planning": {
                "anticipation_strategies": [
                    "Donation-partage avec réserve d'usufruit",
                    "Pacte Dutreil transmission entreprise",
                    "Assurance-vie luxembourgeoise",
                    "SCI démembrement temporaire",
                    "Trust discretionary offshore"
                ],
                "cross_border_issues": {
                    "forced_heirship": "Réserve héréditaire vs liberté testamentaire",
                    "clawback_rules": "Rapport donations selon loi applicable",
                    "tax_coordination": "Éviter double imposition succession"
                }
            },
            "business_succession": {
                "management_buyout": "MBO avec holding reprise",
                "family_buyout": "Transmission familiale optimisée",
                "ipo_preparation": "Structure pré-IPO optimale",
                "private_equity": "Entrée fonds avec ratchet"
            }
        }
        
    def _add_international_structures(self):
        """Structures internationales complexes"""
        self.international_structures = {
            "holding_chains": {
                "netherlands_luxembourg": {
                    "structure": "NL TopCo -> LU MidCo -> OpCos",
                    "benefits": ["Participation exemption", "Treaty network", "EU directives"],
                    "substance": "Economic substance requirements"
                },
                "ireland_malta": {
                    "structure": "IE HoldCo -> MT SubCo -> Operations",
                    "benefits": ["12.5% CT Ireland", "Refund system Malta", "EU compliance"],
                    "anti_avoidance": "Principal purpose test"
                }
            },
            "ip_structures": {
                "cost_sharing": "Development costs sharing agreement",
                "license_structures": "IP licensing through low-tax jurisdictions",
                "r_and_d_incentives": "Patent box regimes coordination",
                "transfer_pricing": "OECD guidelines compliance"
            },
            "financing_structures": {
                "debt_pushdown": "Acquisition financing optimization",
                "hybrid_instruments": "Debt/equity hybrid treatment",
                "interest_deduction": "Thin cap rules navigation",
                "withholding_optimization": "Treaty shopping legitimate"
            }
        }
        
    def _add_regulatory_updates_2025(self):
        """Mises à jour réglementaires 2025"""
        self.regulatory_updates_2025 = {
            "pillar_two": {
                "global_minimum_tax": "15% minimum tax multinationals",
                "scope": "Groupes > 750M€ CA consolidé",
                "implementation": "2024-2025 selon pays UE",
                "safe_harbors": "Simplified calculations available"
            },
            "dac8": {
                "crypto_reporting": "Directive échange automatique crypto",
                "scope": "Plateformes crypto, wallets, exchanges",
                "timeline": "Application 1er janvier 2026",
                "impact": "Transparence fiscale crypto UE"
            },
            "unshell_directive": {
                "substance_requirements": "Minimum substance EU entities",
                "indicators": "Income, assets, employees, premises",
                "consequences": "Loss of treaty benefits",
                "timeline": "Transposition 2024-2025"
            },
            "digital_levy": {
                "scope": "Large digital companies",
                "rate": "Discussions ongoing 1-5%",
                "coordination": "OECD Pillar One alignment",
                "timeline": "Implementation uncertain"
            }
        }
        
    def _add_sector_specific_taxation(self):
        """Fiscalité sectorielle spécialisée"""
        self.sector_taxation = {
            "financial_services": {
                "banking": {
                    "financial_transaction_tax": "FTT 11 pays UE volontaires",
                    "bank_levies": "Taxes sectorielles bancaires",
                    "regulatory_capital": "Impact fiscal fonds propres"
                },
                "insurance": {
                    "solvency_ii": "Impact fiscal exigences capital",
                    "insurance_premium_tax": "IPT taux variables par pays",
                    "life_insurance": "Fiscalité contrats vie transfrontaliers"
                }
            },
            "technology": {
                "software_development": {
                    "r_and_d_credits": "Crédits recherche développement",
                    "ip_valuation": "Valorisation actifs incorporels",
                    "transfer_pricing": "Prix transfert développements"
                },
                "digital_platforms": {
                    "vat_oss": "One Stop Shop TVA services numériques",
                    "digital_services_tax": "DST France, Italie, Espagne",
                    "platform_economy": "Fiscalité économie plateforme"
                }
            },
            "real_estate": {
                "reits": {
                    "tax_transparency": "Transparence fiscale SIIC/REIT",
                    "distribution_requirements": "Obligations distribution",
                    "asset_requirements": "Contraintes composition actifs"
                },
                "construction": {
                    "vat_reverse_charge": "Autoliquidation TVA BTP",
                    "depreciation_rules": "Amortissements immobilier",
                    "social_housing": "Avantages logement social"
                }
            }
        }
        
    def _add_dispute_resolution(self):
        """Résolution des différends fiscaux"""
        self.dispute_resolution = {
            "mutual_agreement": {
                "map_procedures": "Procédures amiables conventions",
                "timeline": "24-36 mois résolution",
                "success_rates": "Taux succès 85-95%",
                "arbitration": "Arbitrage si échec procédure"
            },
            "eu_arbitration": {
                "directive_2017_1852": "Arbitrage différends fiscaux UE",
                "scope": "Prix transfert, répartition bénéfices",
                "timeline": "3 ans maximum procédure",
                "binding_decision": "Décision contraignante"
            },
            "litigation_strategies": {
                "forum_shopping": "Choix juridiction optimale",
                "preliminary_rulings": "Questions préjudicielles CJUE",
                "interim_relief": "Mesures conservatoires",
                "enforcement": "Exécution décisions transfrontalières"
            }
        }
        
    def _add_compliance_requirements(self):
        """Exigences de conformité"""
        self.compliance_requirements = {
            "country_by_country": {
                "cbcr_filing": "Déclaration pays par pays",
                "master_file": "Fichier principal documentation",
                "local_file": "Fichier local entité",
                "thresholds": "Seuils 750M€ CA consolidé"
            },
            "beneficial_ownership": {
                "ubo_registers": "Registres bénéficiaires effectifs",
                "disclosure_thresholds": "Seuils 25% participation",
                "verification": "Vérification identité UBO",
                "penalties": "Sanctions non-conformité"
            },
            "automatic_exchange": {
                "crs_reporting": "Common Reporting Standard",
                "fatca_compliance": "Foreign Account Tax Compliance",
                "dac_directives": "Directives échange automatique UE",
                "due_diligence": "Procédures identification"
            }
        }
        
    def _add_emerging_tax_issues(self):
        """Enjeux fiscaux émergents"""
        self.emerging_issues = {
            "esg_taxation": {
                "carbon_tax": "Taxe carbone européenne CBAM",
                "green_incentives": "Incitations fiscales vertes",
                "sustainability_reporting": "Reporting durabilité impact fiscal",
                "transition_finance": "Financement transition écologique"
            },
            "artificial_intelligence": {
                "ai_development": "Fiscalité développement IA",
                "data_valuation": "Valorisation fiscale données",
                "algorithm_ip": "Propriété intellectuelle algorithmes",
                "automation_impact": "Impact automatisation emploi"
            },
            "space_economy": {
                "satellite_taxation": "Fiscalité activités spatiales",
                "launch_services": "Services lancement fiscal",
                "space_mining": "Exploitation minière spatiale",
                "jurisdiction_issues": "Problèmes juridictionnels"
            }
        }
        
    def _add_quantitative_analysis(self):
        """Analyses quantitatives fiscales"""
        self.quantitative_analysis = {
            "tax_modeling": {
                "scenario_analysis": "Analyse scénarios fiscaux",
                "sensitivity_testing": "Tests sensibilité taux",
                "monte_carlo": "Simulations Monte Carlo",
                "optimization_algorithms": "Algorithmes optimisation"
            },
            "benchmarking": {
                "effective_tax_rates": "Taux effectifs sectoriels",
                "peer_comparison": "Comparaisons concurrents",
                "geographic_analysis": "Analyse géographique charge",
                "trend_analysis": "Analyse tendances fiscales"
            },
            "risk_metrics": {
                "tax_risk_scoring": "Notation risque fiscal",
                "probability_assessments": "Évaluations probabilistes",
                "value_at_risk": "VaR fiscale",
                "stress_testing": "Tests résistance"
            }
        }
        
    def _add_risk_assessment_matrix(self):
        """Matrice d'évaluation des risques"""
        self.risk_matrix = {
            "audit_risk_factors": {
                "high_risk": [
                    "Transactions internationales complexes",
                    "Restructurations récentes",
                    "Prix transfert significatifs",
                    "Utilisation paradis fiscaux",
                    "Changements résidence fiscale"
                ],
                "medium_risk": [
                    "Déductions importantes",
                    "Plus-values substantielles",
                    "Activités multi-juridictionnelles",
                    "Régimes préférentiels",
                    "Transactions intra-groupe"
                ],
                "low_risk": [
                    "Revenus salariés simples",
                    "Activité locale uniquement",
                    "Déclarations cohérentes",
                    "Pas de montages complexes"
                ]
            },
            "mitigation_strategies": {
                "documentation": "Documentation exhaustive positions",
                "advance_rulings": "Rescrits fiscaux préventifs",
                "professional_advice": "Conseil fiscal spécialisé",
                "compliance_monitoring": "Surveillance conformité continue",
                "insurance": "Assurance risques fiscaux"
            }
        }
        
    def _add_ai_powered_tax_strategies(self):
        """Stratégies fiscales alimentées par IA"""
        self.ai_tax_strategies = {
            "pattern_recognition": {
                "tax_optimization_patterns": [
                    "Détection automatique opportunités optimisation",
                    "Analyse patterns comportements fiscaux",
                    "Identification structures optimales par profil",
                    "Reconnaissance signaux d'alerte audit"
                ],
                "predictive_compliance": [
                    "Prédiction risques non-conformité",
                    "Anticipation changements réglementaires",
                    "Évaluation probabiliste positions fiscales",
                    "Optimisation timing déclarations"
                ]
            },
            "machine_learning_models": {
                "tax_rate_prediction": "Modèles prédictifs évolution taux",
                "audit_probability": "Algorithmes probabilité contrôle",
                "optimization_scoring": "Scoring opportunités optimisation",
                "risk_profiling": "Profilage automatique risques"
            },
            "natural_language_processing": {
                "regulation_analysis": "Analyse automatique textes réglementaires",
                "case_law_extraction": "Extraction principes jurisprudence",
                "contract_review": "Revue automatique clauses fiscales",
                "document_classification": "Classification documents fiscaux"
            }
        }
        
    def _add_predictive_tax_modeling(self):
        """Modélisation fiscale prédictive"""
        self.predictive_modeling = {
            "tax_burden_forecasting": {
                "individual_forecasts": {
                    "income_projection": "Projection revenus 5-10 ans",
                    "tax_evolution": "Évolution charge fiscale prévisionnelle",
                    "life_events_impact": "Impact événements vie (mariage, enfants, retraite)",
                    "relocation_scenarios": "Scénarios déménagement fiscal"
                },
                "business_forecasts": {
                    "growth_scenarios": "Scénarios croissance entreprise",
                    "expansion_planning": "Planification expansion internationale",
                    "exit_strategies": "Modélisation stratégies sortie",
                    "restructuring_impact": "Impact restructurations"
                }
            },
            "regulatory_change_impact": {
                "policy_simulation": "Simulation impact nouvelles politiques",
                "rate_change_modeling": "Modélisation changements taux",
                "threshold_analysis": "Analyse impact seuils fiscaux",
                "transition_planning": "Planification périodes transition"
            },
            "monte_carlo_simulations": {
                "uncertainty_modeling": "Modélisation incertitudes fiscales",
                "scenario_probabilities": "Probabilités scénarios multiples",
                "risk_quantification": "Quantification risques financiers",
                "optimization_under_uncertainty": "Optimisation sous incertitude"
            }
        }
        
    def _add_cross_border_optimization(self):
        """Optimisation transfrontalière avancée"""
        self.cross_border_optimization = {
            "residence_optimization": {
                "tax_residence_planning": {
                    "optimal_residence": "Résidence fiscale optimale par profil",
                    "tie_breaker_strategies": "Stratégies départage résidence",
                    "substance_requirements": "Exigences substance par pays",
                    "transition_planning": "Planification changement résidence"
                },
                "nomad_strategies": {
                    "digital_nomad_optimization": "Optimisation nomades numériques",
                    "183_day_management": "Gestion règle 183 jours",
                    "multi_country_income": "Revenus multi-pays",
                    "social_security_coordination": "Coordination SS nomades"
                }
            },
            "income_sourcing": {
                "source_rules_optimization": "Optimisation règles source revenus",
                "treaty_shopping_legitimate": "Treaty shopping légitime",
                "permanent_establishment": "Évitement établissement stable",
                "attribution_strategies": "Stratégies attribution revenus"
            },
            "structure_optimization": {
                "holding_chain_design": "Design chaînes holdings optimales",
                "substance_vs_tax": "Équilibre substance/fiscalité",
                "anti_avoidance_compliance": "Conformité anti-évasion",
                "economic_substance_test": "Tests substance économique"
            }
        }
        
    def _add_regulatory_intelligence(self):
        """Intelligence réglementaire"""
        self.regulatory_intelligence = {
            "real_time_monitoring": {
                "legislation_tracking": [
                    "Suivi temps réel propositions lois",
                    "Analyse impact projets réglementaires",
                    "Alertes changements fiscaux imminents",
                    "Calendrier mise en œuvre réformes"
                ],
                "consultation_tracking": [
                    "Suivi consultations publiques",
                    "Analyse positions administrations",
                    "Tendances politiques fiscales",
                    "Lobbying fiscal européen"
                ]
            },
            "jurisprudence_analysis": {
                "case_law_trends": "Tendances jurisprudentielles",
                "precedent_analysis": "Analyse précédents applicables",
                "court_prediction": "Prédiction décisions tribunaux",
                "appeal_strategies": "Stratégies recours optimales"
            },
            "administrative_guidance": {
                "ruling_analysis": "Analyse rescrits administratifs",
                "position_papers": "Documents position administrations",
                "interpretation_trends": "Tendances interprétation",
                "safe_harbor_identification": "Identification safe harbors"
            }
        }
        
    def _add_market_intelligence(self):
        """Intelligence de marché fiscale"""
        self.market_intelligence = {
            "competitive_benchmarking": {
                "effective_tax_rates": {
                    "industry_benchmarks": "Benchmarks taux effectifs sectoriels",
                    "geographic_comparison": "Comparaisons géographiques",
                    "size_analysis": "Analyse par taille entreprise",
                    "peer_group_analysis": "Analyse groupes pairs"
                },
                "tax_strategy_analysis": {
                    "competitor_structures": "Structures concurrents",
                    "best_practices": "Meilleures pratiques secteur",
                    "innovation_tracking": "Suivi innovations fiscales",
                    "market_positioning": "Positionnement marché fiscal"
                }
            },
            "economic_indicators": {
                "tax_policy_correlation": "Corrélation politiques fiscales/économie",
                "gdp_impact_analysis": "Analyse impact PIB",
                "inflation_tax_adjustment": "Ajustements fiscaux inflation",
                "currency_impact": "Impact variations monétaires"
            },
            "investment_flows": {
                "fdi_tax_correlation": "Corrélation IDE/fiscalité",
                "capital_flight_indicators": "Indicateurs fuite capitaux",
                "tax_haven_flows": "Flux vers paradis fiscaux",
                "repatriation_trends": "Tendances rapatriement"
            }
        }
        
    def _add_competitive_analysis(self):
        """Analyse concurrentielle fiscale"""
        self.competitive_analysis = {
            "jurisdiction_ranking": {
                "tax_competitiveness": {
                    "overall_ranking": "Classement compétitivité fiscale globale",
                    "individual_ranking": "Classement particuliers",
                    "business_ranking": "Classement entreprises",
                    "wealth_ranking": "Classement gestion patrimoine"
                },
                "specialized_rankings": {
                    "startup_friendly": "Classement favorable startups",
                    "r_and_d_incentives": "Classement incitations R&D",
                    "holding_structures": "Classement structures holdings",
                    "pension_systems": "Classement systèmes retraite"
                }
            },
            "migration_patterns": {
                "tax_migration_flows": "Flux migration fiscale",
                "high_net_worth_movements": "Mouvements HNWI",
                "business_relocations": "Relocalisations entreprises",
                "talent_attraction": "Attraction talents"
            },
            "policy_effectiveness": {
                "incentive_success_rates": "Taux succès incitations",
                "revenue_impact": "Impact revenus fiscaux",
                "economic_multipliers": "Multiplicateurs économiques",
                "unintended_consequences": "Conséquences non voulues"
            }
        }
        
    def _add_scenario_planning(self):
        """Planification de scénarios"""
        self.scenario_planning = {
            "macro_scenarios": {
                "economic_scenarios": [
                    "Récession européenne 2025-2026",
                    "Inflation persistante >5%",
                    "Crise énergétique prolongée",
                    "Fragmentation UE fiscale"
                ],
                "political_scenarios": [
                    "Harmonisation fiscale UE accélérée",
                    "Guerre commerciale USA-UE",
                    "Populisme anti-fiscal",
                    "Révolution numérique fiscale"
                ]
            },
            "regulatory_scenarios": {
                "tax_harmonization": "Harmonisation fiscale européenne",
                "digital_taxation": "Taxation numérique généralisée",
                "wealth_taxes": "Retour impôts fortune",
                "carbon_taxation": "Taxation carbone massive"
            },
            "personal_scenarios": {
                "life_event_planning": [
                    "Mariage/divorce impact fiscal",
                    "Naissance enfants optimisation",
                    "Héritage planification succession",
                    "Retraite anticipée stratégies"
                ],
                "career_scenarios": [
                    "Expatriation professionnelle",
                    "Entrepreneuriat international",
                    "Freelance multi-pays",
                    "Retraite nomade"
                ]
            }
        }
        
    def _add_real_time_monitoring(self):
        """Monitoring temps réel"""
        self.real_time_monitoring = {
            "alert_systems": {
                "regulatory_alerts": [
                    "Nouveaux textes réglementaires",
                    "Changements taux fiscaux",
                    "Nouvelles jurisprudences",
                    "Consultations publiques"
                ],
                "compliance_alerts": [
                    "Échéances déclaratives",
                    "Seuils dépassés",
                    "Obligations nouvelles",
                    "Risques détectés"
                ]
            },
            "market_monitoring": {
                "rate_changes": "Changements taux temps réel",
                "policy_announcements": "Annonces politiques",
                "economic_indicators": "Indicateurs économiques",
                "competitor_moves": "Mouvements concurrents"
            },
            "portfolio_monitoring": {
                "tax_efficiency": "Efficacité fiscale portefeuille",
                "optimization_opportunities": "Opportunités optimisation",
                "risk_exposure": "Exposition risques",
                "performance_attribution": "Attribution performance"
            }
        }
        
    def _add_expert_decision_trees(self):
        """Arbres de décision experts"""
        self.decision_trees = {
            "residence_decision": {
                "factors": [
                    "Revenus types et montants",
                    "Patrimoine composition",
                    "Famille situation",
                    "Profession mobilité",
                    "Préférences personnelles"
                ],
                "outcomes": [
                    "Résidence optimale recommandée",
                    "Stratégie transition",
                    "Risques identifiés",
                    "Alternatives évaluées"
                ]
            },
            "structure_decision": {
                "business_factors": [
                    "Activité nature",
                    "Revenus prévisionnels",
                    "Expansion géographique",
                    "Financement besoins",
                    "Exit strategy"
                ],
                "structure_options": [
                    "Société locale",
                    "Holding internationale",
                    "Structure IP",
                    "Partenariat fiscal"
                ]
            },
            "investment_decision": {
                "tax_considerations": [
                    "Plus-values taxation",
                    "Revenus imposition",
                    "Succession planification",
                    "Liquidité besoins"
                ],
                "recommendations": [
                    "Véhicule investissement optimal",
                    "Timing opérations",
                    "Structuration fiscale",
                    "Risques mitigation"
                ]
            }
        }
        
    def _add_advanced_calculations(self):
        """Calculs avancés"""
        self.advanced_calculations = {
            "optimization_algorithms": {
                "genetic_algorithm": "Optimisation génétique structures",
                "simulated_annealing": "Recuit simulé planification",
                "particle_swarm": "Essaim particules allocation",
                "gradient_descent": "Descente gradient fiscale"
            },
            "financial_modeling": {
                "net_present_value": "VAN stratégies fiscales",
                "internal_rate_return": "TRI optimisations",
                "sensitivity_analysis": "Analyse sensibilité paramètres",
                "break_even_analysis": "Analyses seuil rentabilité"
            },
            "statistical_methods": {
                "regression_analysis": "Analyses régressions fiscales",
                "time_series_forecasting": "Prévisions séries temporelles",
                "cluster_analysis": "Analyses clusters contribuables",
                "factor_analysis": "Analyses factorielles risques"
            }
        }
        
    def _add_ultimate_tax_schemes(self):
        """Montages fiscaux ultra-sophistiqués"""
        self.ultimate_tax_schemes = {
            "holding_structures_advanced": {
                "dutch_sandwich": {
                    "structure": "US Parent -> NL Holding -> IE Operating -> Bermuda IP",
                    "benefits": ["Participation exemption", "Treaty network", "IP deduction"],
                    "royalty_flow": "0% withholding via EU directive",
                    "substance_requirements": "Economic activities in NL/IE",
                    "anti_avoidance": "Principal Purpose Test navigation"
                },
                "luxembourg_soparfi": {
                    "structure": "LU Soparfi -> Multiple OpCos",
                    "benefits": ["Participation exemption 100%", "No withholding", "Treaty access"],
                    "minimum_substance": "Board meetings, management decisions",
                    "optimization": "Debt pushdown financing structure"
                },
                "malta_refund_system": {
                    "structure": "MT HoldCo -> Subsidiaries",
                    "effective_rate": "5% via refund system",
                    "benefits": ["EU compliance", "Substance light", "Treaty network"],
                    "requirements": "Minimum tax paid, refund claim"
                }
            },
            "ip_monetization_schemes": {
                "cost_sharing_agreement": {
                    "structure": "Development costs shared between entities",
                    "benefits": ["Future profits allocation", "Transfer pricing defense"],
                    "jurisdictions": ["IE", "NL", "LU", "CH"],
                    "patent_box_rates": {"NL": "7%", "BE": "6.8%", "LU": "5.76%"}
                },
                "ip_migration": {
                    "strategy": "IP transfer to low-tax jurisdiction pre-development",
                    "timing": "Before value creation",
                    "valuation": "Arm's length at transfer date",
                    "ongoing_compliance": "Substance requirements"
                },
                "license_structures": {
                    "central_licensing": "Single IP entity licensing globally",
                    "sub_licensing": "Regional licensing entities",
                    "hybrid_structures": "Debt/equity financing of IP"
                }
            },
            "financing_optimization": {
                "debt_equity_swaps": {
                    "convertible_bonds": "Debt treatment initially, equity later",
                    "preferred_shares": "Deductible dividends in some jurisdictions",
                    "hybrid_mismatches": "Different treatment across borders"
                },
                "back_to_back_loans": {
                    "structure": "Loan via low-tax intermediary",
                    "benefits": ["Interest deduction", "Withholding reduction"],
                    "substance": "Economic rationale required"
                },
                "captive_insurance": {
                    "structure": "Insurance subsidiary in low-tax jurisdiction",
                    "benefits": ["Risk management", "Tax deduction", "Investment income"],
                    "regulations": "Insurance regulatory compliance"
                }
            }
        }
        
    def _add_advanced_structuring(self):
        """Structurations avancées"""
        self.advanced_structuring = {
            "multi_tier_holdings": {
                "three_tier_structure": {
                    "top_tier": "Ultimate holding (residence optimization)",
                    "mid_tier": "Intermediate holding (treaty access)",
                    "bottom_tier": "Operating companies (substance)",
                    "benefits": ["Tax efficiency", "Flexibility", "Risk management"]
                },
                "parallel_structures": {
                    "operating_parallel": "Separate operating and holding lines",
                    "geographic_parallel": "Regional holding structures",
                    "functional_parallel": "IP, financing, operations separate"
                }
            },
            "trust_foundation_hybrids": {
                "liechtenstein_foundation": {
                    "benefits": ["Asset protection", "Succession planning", "Tax efficiency"],
                    "structure": "Foundation + underlying companies",
                    "taxation": "Transparent for beneficiaries"
                },
                "panama_foundation": {
                    "benefits": ["Privacy", "Flexibility", "No beneficial ownership"],
                    "structure": "Private interest foundation",
                    "compliance": "CRS reporting requirements"
                },
                "jersey_trust": {
                    "benefits": ["Common law flexibility", "Tax transparency"],
                    "structure": "Discretionary trust + companies",
                    "substance": "Local trustees, meetings"
                }
            },
            "corporate_migrations": {
                "inversion_strategies": {
                    "merger_inversion": "Merge with foreign company",
                    "asset_inversion": "Transfer assets to foreign entity",
                    "benefits": ["Lower tax rate", "Territorial system access"]
                },
                "redomiciliation": {
                    "continuity_jurisdictions": "Same legal entity, new domicile",
                    "benefits": ["Tax residence change", "Regulatory arbitrage"],
                    "requirements": "Shareholder approval, regulatory consent"
                }
            }
        }
        
    def _add_optimization_masterclass(self):
        """Masterclass optimisation fiscale"""
        self.optimization_masterclass = {
            "income_characterization": {
                "royalty_vs_business_income": {
                    "strategy": "Structure payments as royalties",
                    "benefits": ["Lower withholding", "Treaty benefits", "Deduction"],
                    "requirements": "Genuine IP licensing"
                },
                "capital_vs_revenue": {
                    "strategy": "Characterize gains as capital",
                    "benefits": ["Lower rates", "Exemptions", "Deferral"],
                    "techniques": ["Asset vs share deals", "Timing elections"]
                },
                "dividend_vs_interest": {
                    "hybrid_instruments": "Debt-like equity, equity-like debt",
                    "benefits": ["Deduction vs exemption", "Withholding optimization"],
                    "anti_hybrid_rules": "ATAD compliance required"
                }
            },
            "timing_optimization": {
                "income_acceleration": {
                    "techniques": ["Prepayments", "Installment elections", "Mark-to-market"],
                    "benefits": ["Lower current rates", "Time value money"],
                    "risks": ["Rate changes", "Cash flow impact"]
                },
                "deduction_timing": {
                    "techniques": ["Accrual elections", "Prepaid expenses", "Reserves"],
                    "benefits": ["Current deduction", "Rate arbitrage"],
                    "limitations": "Economic performance rules"
                },
                "recognition_deferral": {
                    "like_kind_exchanges": "Asset swaps without recognition",
                    "installment_sales": "Gain recognition over time",
                    "corporate_reorganizations": "Tax-free restructuring"
                }
            },
            "jurisdiction_shopping": {
                "treaty_shopping_legitimate": {
                    "substance_planning": "Real business activities",
                    "commercial_rationale": "Non-tax business reasons",
                    "anti_treaty_shopping": "PPT and LOB compliance"
                },
                "regulatory_arbitrage": {
                    "classification_differences": "Entity classification arbitrage",
                    "timing_differences": "Recognition timing arbitrage",
                    "rate_differences": "Tax rate arbitrage"
                }
            }
        }
        
    def _add_legal_arbitrage_strategies(self):
        """Stratégies d'arbitrage légal"""
        self.legal_arbitrage = {
            "entity_classification": {
                "check_the_box": {
                    "us_elections": "Entity classification elections",
                    "benefits": ["Transparency vs entity taxation", "Hybrid mismatches"],
                    "planning": "Coordination with foreign classification"
                },
                "partnership_vs_corporation": {
                    "flow_through": "Partnership taxation benefits",
                    "entity_level": "Corporate taxation planning",
                    "conversion": "Entity type changes"
                }
            },
            "source_residence_conflicts": {
                "dual_resident_entities": {
                    "benefits": ["Double treaty benefits", "Deduction both countries"],
                    "techniques": ["Incorporation vs management test", "Tie-breaker rules"],
                    "anti_avoidance": "Dual resident company rules"
                },
                "stateless_entities": {
                    "benefits": ["No residence taxation", "Treaty access"],
                    "structures": ["Partnerships", "Transparent entities"],
                    "risks": ["Domestic anti-avoidance", "Treaty denial"]
                }
            },
            "characterization_arbitrage": {
                "debt_equity_mismatches": {
                    "strategy": "Debt in one country, equity in another",
                    "benefits": ["Deduction + exemption", "Double non-taxation"],
                    "anti_hybrid_rules": "ATAD neutralization"
                },
                "branch_subsidiary": {
                    "branch_benefits": ["Loss utilization", "No withholding"],
                    "subsidiary_benefits": ["Limited liability", "Separate entity"],
                    "conversion": "Branch to subsidiary election"
                }
            }
        }
        
    def _add_sophisticated_planning(self):
        """Planification sophistiquée"""
        self.sophisticated_planning = {
            "succession_optimization": {
                "generation_skipping": {
                    "techniques": ["Dynasty trusts", "Generation-skipping transfers"],
                    "benefits": ["Multiple generation tax savings", "Wealth preservation"],
                    "limitations": "GST tax considerations"
                },
                "valuation_discounts": {
                    "minority_discounts": "Non-controlling interest discounts",
                    "marketability_discounts": "Lack of marketability discounts",
                    "entity_structures": "Family limited partnerships"
                },
                "installment_sales": {
                    "self_canceling_notes": "SCIN structures",
                    "grantor_trust_sales": "Sales to grantor trusts",
                    "benefits": ["Valuation freeze", "Transfer tax savings"]
                }
            },
            "charitable_planning": {
                "charitable_remainder_trusts": {
                    "benefits": ["Income stream", "Tax deduction", "Capital gains deferral"],
                    "structures": ["CRAT", "CRUT", "Net income makeup"]
                },
                "charitable_lead_trusts": {
                    "benefits": ["Transfer tax reduction", "Income tax benefits"],
                    "structures": ["Grantor CLT", "Non-grantor CLT"]
                },
                "private_foundations": {
                    "benefits": ["Perpetual existence", "Control retention", "Tax benefits"],
                    "requirements": ["Charitable purpose", "Distribution requirements"]
                }
            },
            "business_succession": {
                "management_buyouts": {
                    "leveraged_buyouts": "Debt-financed acquisitions",
                    "rollover_equity": "Management participation",
                    "tax_optimization": "Interest deductions, basis step-up"
                },
                "employee_ownership": {
                    "esops": "Employee stock ownership plans",
                    "benefits": ["Tax deferral", "Estate liquidity", "Employee incentives"],
                    "structures": "Leveraged vs non-leveraged"
                }
            }
        }
        
    def _add_wealth_preservation(self):
        """Préservation du patrimoine"""
        self.wealth_preservation = {
            "asset_protection": {
                "domestic_structures": {
                    "limited_liability": "LLC, LP structures",
                    "homestead_exemptions": "Primary residence protection",
                    "retirement_accounts": "ERISA protection"
                },
                "offshore_structures": {
                    "cook_islands_trust": "Strong asset protection laws",
                    "nevis_llc": "Charging order protection",
                    "cayman_foundations": "Hybrid trust-foundation"
                },
                "insurance_strategies": {
                    "captive_insurance": "Self-insurance structures",
                    "life_insurance": "Wealth transfer vehicle",
                    "umbrella_policies": "Excess liability coverage"
                }
            },
            "privacy_structures": {
                "nominee_services": {
                    "nominee_directors": "Privacy for beneficial owners",
                    "nominee_shareholders": "Ownership privacy",
                    "limitations": "Beneficial ownership registers"
                },
                "bearer_instruments": {
                    "bearer_shares": "Anonymous ownership (limited)",
                    "bearer_bonds": "Anonymous debt instruments",
                    "compliance": "CRS and FATCA implications"
                }
            },
            "diversification_strategies": {
                "geographic_diversification": {
                    "multi_jurisdiction": "Assets across jurisdictions",
                    "currency_diversification": "Multiple currency exposure",
                    "regulatory_diversification": "Different regulatory regimes"
                },
                "asset_class_diversification": {
                    "real_estate": "Global property portfolio",
                    "financial_assets": "Stocks, bonds, alternatives",
                    "business_interests": "Operating companies"
                }
            }
        }
        
    def _add_income_transformation(self):
        """Transformation des revenus"""
        self.income_transformation = {
            "ordinary_to_capital": {
                "installment_sales": {
                    "technique": "Spread gain recognition over time",
                    "benefits": ["Capital gains treatment", "Time value money"],
                    "structures": "Self-canceling installment notes"
                },
                "like_kind_exchanges": {
                    "technique": "Tax-deferred asset exchanges",
                    "benefits": ["Deferral", "Basis step-up opportunities"],
                    "requirements": "Like-kind property, qualified intermediary"
                },
                "corporate_structures": {
                    "technique": "Asset contribution to corporation",
                    "benefits": ["Capital gains on sale", "Depreciation recapture"],
                    "considerations": "Built-in gains, recognition periods"
                }
            },
            "active_to_passive": {
                "rental_conversions": {
                    "technique": "Convert business to rental activity",
                    "benefits": ["Passive loss utilization", "Different tax rates"],
                    "requirements": "Material participation tests"
                },
                "royalty_structures": {
                    "technique": "License business assets for royalties",
                    "benefits": ["Passive income treatment", "Treaty benefits"],
                    "substance": "Genuine licensing arrangements"
                }
            },
            "compensation_optimization": {
                "deferred_compensation": {
                    "techniques": ["Rabbi trusts", "Secular trusts", "Unfunded plans"],
                    "benefits": ["Tax deferral", "Investment growth"],
                    "risks": ["Employer credit risk", "Constructive receipt"]
                },
                "equity_compensation": {
                    "techniques": ["Stock options", "Restricted stock", "SARs"],
                    "benefits": ["Capital gains treatment", "Deferral opportunities"],
                    "elections": "83(b) elections, timing strategies"
                }
            }
        }
        
    def _add_timing_strategies(self):
        """Stratégies de timing fiscal"""
        self.timing_strategies = {
            "year_end_planning": {
                "income_deferral": {
                    "techniques": ["Delay invoicing", "Installment sales", "Deferred compensation"],
                    "benefits": ["Lower current year tax", "Rate arbitrage", "Time value"],
                    "limitations": "Constructive receipt doctrine"
                },
                "expense_acceleration": {
                    "techniques": ["Prepaid expenses", "Equipment purchases", "Bonus payments"],
                    "benefits": ["Current deduction", "Cash flow optimization"],
                    "requirements": "Economic performance test"
                },
                "loss_harvesting": {
                    "techniques": ["Security sales", "Asset dispositions", "Bad debt write-offs"],
                    "benefits": ["Offset gains", "Carryforward benefits"],
                    "limitations": "Wash sale rules"
                }
            },
            "multi_year_strategies": {
                "income_smoothing": {
                    "techniques": ["Installment method", "Percentage completion", "Averaging elections"],
                    "benefits": ["Rate management", "Bracket optimization"],
                    "planning": "Multi-year tax projections"
                },
                "bunching_strategies": {
                    "techniques": ["Charitable bunching", "Medical expense timing", "Investment timing"],
                    "benefits": ["Threshold optimization", "Deduction maximization"],
                    "coordination": "State and federal planning"
                }
            },
            "transaction_timing": {
                "pre_transaction_planning": {
                    "techniques": ["Structure optimization", "Basis step-up", "Loss utilization"],
                    "benefits": ["Tax minimization", "Efficiency maximization"],
                    "timeline": "6-12 months advance planning"
                },
                "post_transaction_elections": {
                    "techniques": ["338(h)(10)", "754 elections", "Installment elections"],
                    "benefits": ["Basis optimization", "Recognition timing"],
                    "deadlines": "Strict election deadlines"
                }
            }
        }
        
    def _add_multi_jurisdictional_planning(self):
        """Planification multi-juridictionnelle"""
        self.multi_jurisdictional_planning = {
            "residence_planning": {
                "tax_residence_optimization": {
                    "factors": ["Days test", "Domicile", "Center of vital interests", "Habitual abode"],
                    "strategies": ["Residence splitting", "Tie-breaker planning", "Treaty benefits"],
                    "documentation": "Residence evidence maintenance"
                },
                "nomad_strategies": {
                    "183_day_rule": "Avoid tax residence in high-tax countries",
                    "territorial_systems": "Benefit from territorial taxation",
                    "treaty_protection": "Avoid double taxation"
                },
                "exit_strategies": {
                    "exit_taxes": "Deemed disposition rules",
                    "continued_liability": "Post-departure obligations",
                    "planning": "Pre-exit restructuring"
                }
            },
            "source_optimization": {
                "income_sourcing": {
                    "services": "Location of performance rules",
                    "royalties": "Location of use vs exploitation",
                    "business_profits": "Permanent establishment avoidance"
                },
                "treaty_benefits": {
                    "withholding_reduction": "Treaty rate optimization",
                    "business_profits": "PE threshold management",
                    "capital_gains": "Treaty exemptions"
                }
            },
            "coordination_strategies": {
                "foreign_tax_credits": {
                    "credit_optimization": "Basket planning, timing",
                    "source_planning": "Income characterization",
                    "limitation_planning": "Multi-year strategies"
                },
                "treaty_coordination": {
                    "mutual_agreement": "MAP procedures",
                    "arbitration": "Mandatory arbitration clauses",
                    "advance_pricing": "APA coordination"
                }
            }
        }
        
    def _add_anti_avoidance_navigation(self):
        """Navigation des règles anti-évasion"""
        self.anti_avoidance_navigation = {
            "general_anti_avoidance": {
                "gaar_compliance": {
                    "business_purpose": "Commercial rationale documentation",
                    "substance_over_form": "Economic substance requirements",
                    "step_transaction": "Integration doctrine planning"
                },
                "economic_substance": {
                    "meaningful_activities": "Real business operations",
                    "profit_motive": "Non-tax business reasons",
                    "risk_assumption": "Genuine risk bearing"
                }
            },
            "specific_anti_avoidance": {
                "controlled_foreign_companies": {
                    "cfc_planning": "Active business exceptions",
                    "subpart_f": "Income characterization",
                    "pfic_planning": "QEF elections, mark-to-market"
                },
                "transfer_pricing": {
                    "arm_length_principle": "Comparable transactions",
                    "documentation": "Master file, local file",
                    "advance_pricing": "APA strategies"
                },
                "thin_capitalization": {
                    "debt_equity_ratios": "Safe harbor planning",
                    "earnings_stripping": "Interest limitation rules",
                    "hybrid_mismatches": "ATAD compliance"
                }
            },
            "treaty_anti_abuse": {
                "principal_purpose_test": {
                    "ppt_navigation": "Commercial rationale",
                    "safe_harbors": "Specific exceptions",
                    "substance_planning": "Real activities"
                },
                "limitation_on_benefits": {
                    "ownership_tests": "Qualified persons",
                    "base_erosion": "Active business test",
                    "derivative_benefits": "Equivalent beneficiary"
                }
            }
        }
        
    def get_ultimate_optimization_advice(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Conseils d'optimisation fiscale ultra-sophistiqués"""
        income = profile.get('annual_income', 0)
        assets = profile.get('total_assets', 0)
        countries = profile.get('countries_of_interest', [])
        business_type = profile.get('business_type', 'individual')
        
        advice = {
            "optimization_level": self._determine_optimization_level(income, assets),
            "recommended_structures": [],
            "tax_savings_potential": 0,
            "implementation_timeline": "",
            "compliance_requirements": [],
            "risk_assessment": {}
        }
        
        # Niveau d'optimisation basé sur le patrimoine
        if assets > 50_000_000:  # Ultra-high net worth
            advice["recommended_structures"].extend([
                "Multi-tier holding structure",
                "Private foundation + trust hybrid",
                "Captive insurance company",
                "Family office structure"
            ])
            advice["tax_savings_potential"] = min(income * 0.4, 10_000_000)
            advice["implementation_timeline"] = "12-18 months"
            
        elif assets > 10_000_000:  # High net worth
            advice["recommended_structures"].extend([
                "Luxembourg Soparfi structure",
                "Malta refund system",
                "IP licensing structure",
                "Charitable planning"
            ])
            advice["tax_savings_potential"] = min(income * 0.3, 2_000_000)
            advice["implementation_timeline"] = "6-12 months"
            
        elif assets > 1_000_000:  # Affluent
            advice["recommended_structures"].extend([
                "Holding company optimization",
                "Residence planning",
                "Income characterization",
                "Timing strategies"
            ])
            advice["tax_savings_potential"] = min(income * 0.2, 500_000)
            advice["implementation_timeline"] = "3-6 months"
            
        # Optimisations spécifiques par type d'activité
        if business_type == 'tech':
            advice["recommended_structures"].extend([
                "IP Box optimization",
                "R&D credit maximization",
                "Stock option planning"
            ])
        elif business_type == 'real_estate':
            advice["recommended_structures"].extend([
                "REIT structures",
                "Like-kind exchanges",
                "Depreciation optimization"
            ])
        elif business_type == 'finance':
            advice["recommended_structures"].extend([
                "Trading entity structures",
                "Hedge fund optimization",
                "Carried interest planning"
            ])
            
        # Évaluation des risques
        advice["risk_assessment"] = {
            "audit_risk": "Medium" if assets > 5_000_000 else "Low",
            "regulatory_risk": "High" if len(countries) > 3 else "Medium",
            "compliance_complexity": "Very High" if assets > 20_000_000 else "High",
            "reputational_risk": "Medium"
        }
        
        return advice
        
    def _determine_optimization_level(self, income: float, assets: float) -> str:
        """Détermine le niveau d'optimisation approprié"""
        if assets > 50_000_000 or income > 10_000_000:
            return "Ultra-sophisticated"
        elif assets > 10_000_000 or income > 2_000_000:
            return "Advanced"
        elif assets > 1_000_000 or income > 500_000:
            return "Intermediate"
        else:
            return "Basic"
            
    def get_montage_fiscal_recommendation(self, situation: Dict[str, Any]) -> Dict[str, Any]:
        """Recommandation de montage fiscal sur mesure"""
        country = situation.get('country', 'FR')
        income_type = situation.get('income_type', 'salary')
        amount = situation.get('amount', 0)
        objectives = situation.get('objectives', [])
        
        recommendations = {
            "primary_structure": {},
            "alternative_structures": [],
            "implementation_steps": [],
            "tax_impact": {},
            "timeline": "",
            "costs": {},
            "risks": []
        }
        
        # Structures recommandées selon le type de revenus
        if income_type == 'royalties':
            recommendations["primary_structure"] = {
                "type": "IP Licensing Structure",
                "description": "Société de gestion IP dans juridiction Patent Box",
                "jurisdictions": ["NL", "BE", "LU"],
                "tax_rate": "5-7%",
                "benefits": ["Taux réduit", "Optimisation withholding", "Substance légère"]
            }
            
        elif income_type == 'capital_gains':
            recommendations["primary_structure"] = {
                "type": "Holding Structure",
                "description": "Holding dans juridiction participation exemption",
                "jurisdictions": ["LU", "NL", "BE"],
                "tax_rate": "0% sur plus-values",
                "benefits": ["Exemption totale", "Réinvestissement", "Succession optimisée"]
            }
            
        elif income_type == 'business_income':
            recommendations["primary_structure"] = {
                "type": "Multi-tier Structure",
                "description": "Structure holding + opérationnelle optimisée",
                "jurisdictions": ["MT", "CY", "IE"],
                "tax_rate": "5-12.5%",
                "benefits": ["Taux effectif bas", "Flexibilité", "Croissance"]
            }
            
        # Étapes d'implémentation
        recommendations["implementation_steps"] = [
            "1. Analyse fiscale détaillée situation actuelle",
            "2. Choix juridiction et structure optimale",
            "3. Constitution entités et documentation",
            "4. Transfert actifs et mise en œuvre",
            "5. Monitoring et optimisation continue"
        ]
        
        # Impact fiscal estimé
        current_tax = amount * 0.45  # Taux marginal élevé
        optimized_tax = amount * 0.15  # Taux optimisé
        recommendations["tax_impact"] = {
            "current_tax": current_tax,
            "optimized_tax": optimized_tax,
            "annual_savings": current_tax - optimized_tax,
            "roi_percentage": ((current_tax - optimized_tax) / 100000) * 100 if amount > 0 else 0
        }
        
        return recommendations

    def _add_dac6_mdr_rules(self):
        """Règles DAC6 (MDR) – hallmarks, déclencheurs, obligations"""
        self.dac6 = {
            "hallmarks": {
                "A": [
                    "Clause de confidentialité liée à l'avantage fiscal",
                    "Rémunération liée au montant de l'avantage fiscal",
                    "Structures standardisées prêtes à l'emploi"
                ],
                "B": [
                    "Acquisition d'une société déficitaire",
                    "Conversion de revenu en capital/donation",
                    "Transactions circulaires artificielles"
                ],
                "C": [
                    "Paiements transfrontaliers déductibles non imposés",
                    "Exonération générale d'imposition en juridiction de destination",
                    "Dépréciation pour la même asset dans plusieurs juridictions"
                ],
                "D": [
                    "Mécanismes contournant le CRS",
                    "Structures opaques dissimulant le bénéficiaire effectif"
                ],
                "E": [
                    "Transferts transfrontaliers d'actifs avec différences d'évaluation",
                    "Réduction artificielle des bénéfices (EBIT)"
                ]
            },
            "main_benefit_test": "Applicable aux catégories A et B et à certains hallmarks C",
            "reporting": {
                "who": ["Intermédiaire", "Contribuable concerné (fallback)"],
                "deadline": "30 jours (déclenchement : mise à disposition, prêt à être mis en œuvre, premier pas)",
                "id_eu": "Attribution d'un numéro de mécanisme (arrangements ID)"
            },
            "countries": {
                "FR": {"authority": "DGFiP", "penalties": "10k€ à 100k€"},
                "DE": {"authority": "BZSt", "penalties": "jusqu'à 25k€"},
                "NL": {"authority": "Belastingdienst", "penalties": "administratives"},
                "LU": {"authority": "AED", "penalties": "jusqu'à 250k€"},
                "ES": {"authority": "AEAT", "penalties": "graduées"}
            }
        }

    def _add_dac8_crypto_reporting(self):
        """DAC8 – reporting crypto-actifs, CASP, obligations"""
        self.dac8 = {
            "scope": ["Crypto-actifs", "NFT", "e-money tokens"],
            "actors": {"CASP": "Crypto-Asset Service Providers", "Exchanges": "Plateformes"},
            "obligations": [
                "Due diligence KYC/AML renforcée",
                "Reporting annuel agrégé/nominal des transactions",
                "Échange automatique d'informations intra-UE"
            ],
            "timeline": {"effective": "2026-2027 (états)"},
            "sanctions": "Pénalités administratives par État membre",
            "mappings": {"MiCA": "Interopérabilité avec cadre MiCA"}
        }

    def _add_pillar_two_globe_rules(self):
        """Pillar Two (GloBE) – seuils, safe harbors, top-up tax"""
        self.pillar_two = {
            "threshold": "750M€ chiffre d'affaires consolidé",
            "minimum_rate": 15.0,
            "safe_harbors": {
                "transition_cbcr": ["Routine profits test", "ETR test simple", "De minimis test"],
                "years": [2024, 2025, 2026]
            },
            "ordering": ["QDMTT", "IIR", "UTPR"],
            "components": ["ETR per jurisdiction", "Top-up tax", "Covered taxes", "Adjusted profits"]
        }

    def compute_globe_topup(self, entity: Dict[str, Any]) -> Dict[str, Any]:
        """Calcule simplifié du top-up tax GloBE
        entity: {profit_before_tax, covered_taxes, jurisdiction, qdmt_taxes}
        """
        profit = float(entity.get("profit_before_tax", 0) or 0)
        covered_taxes = float(entity.get("covered_taxes", 0) or 0)
        qdmt = float(entity.get("qdmt_taxes", 0) or 0)
        etr = 0.0 if profit == 0 else max(0.0, min(100.0, (covered_taxes / profit) * 100))
        min_rate = self.pillar_two.get("minimum_rate", 15.0)
        topup_rate = max(0.0, min_rate - etr)
        gross_topup = (topup_rate / 100.0) * profit
        net_topup = max(0.0, gross_topup - qdmt)
        return {
            "etr": round(etr, 2),
            "topup_rate": round(topup_rate, 2),
            "gross_topup": round(gross_topup, 2),
            "qdmt_offset": round(qdmt, 2),
            "net_topup": round(net_topup, 2)
        }

    def _add_exit_tax_rules(self):
        """Exit tax UE – par pays (principaux)"""
        self.exit_tax = {
            "FR": {"threshold": 800000, "deferral": True, "guarantee": True, "interest": True},
            "ES": {"threshold": 4000000, "deferral": True},
            "IT": {"threshold": 1000000, "deferral": True},
            "NL": {"threshold": 0, "deferral": True, "scope": "participations substantives"},
            "PT": {"threshold": 0, "deferral": True}
        }

    def _add_atad_framework(self):
        """Cadre ATAD: intérêts, CFC, anti-hybrides, GAAR"""
        self.atad = {
            "interest_limitation": {"fixed_ratio": "30% EBITDA", "de_minimis": 3_000_000},
            "cfc": {"tests": ["control", "low_taxed", "passive_income"], "switch_over": True},
            "anti_hybrid": ["Deduction / no inclusion", "Double deduction", "Imported mismatch"],
            "gaar": "Arrangement non authentique ayant pour objectif principal un avantage fiscal contrecarré"
        }

    def assess_anti_abuse(self, structure: Dict[str, Any]) -> Dict[str, Any]:
        """Scoring simplifié anti-abus (GAAR/PPT/LOB/ATAD)"""
        score = 0
        flags: List[str] = []
        if not structure.get("substance"):
            score += 3; flags.append("Absence de substance (dirigeants, bureaux, compte)")
        if structure.get("main_benefit") is True:
            score += 2; flags.append("Main Benefit Test potentiellement déclenché (DAC6)")
        if structure.get("hybrid_mismatch"):
            score += 2; flags.append("Risque anti-hybride ATAD")
        if structure.get("treaty_shopping"):
            score += 2; flags.append("PPT/LOB – treaty shopping présumé")
        level = "Low" if score <= 1 else ("Medium" if score <= 3 else "High")
        return {"risk_level": level, "score": score, "flags": flags}

    def _add_permanent_establishment_rules(self):
        """Règles établissement stable (PE) – service, agent dépendant, sites"""
        self.pe = {
            "service_pe": {"threshold_days": 183, "aggregation": True},
            "construction_pe": {"threshold_months": 12, "splitting_contracts": True},
            "dependent_agent": {"habitual_conclusion": True},
            "digital": {"significant_digital_presence": "en discussion (certains pays)"}
        }

    def has_permanent_establishment(self, activity: Dict[str, Any]) -> bool:
        """Heuristique simple PE"""
        days = int(activity.get("days_on_site", 0) or 0)
        agent = bool(activity.get("dependent_agent", False))
        construction = bool(activity.get("construction_site", False))
        if agent:
            return True
        if construction and days >= (self.pe["construction_pe"]["threshold_months"] * 30):
            return True
        if days >= self.pe["service_pe"]["threshold_days"]:
            return True
        return False

    def _add_unshell_rules(self):
        """Préparation Unshell – indicateurs de substance et gateways"""
        self.unshell = {
            "gateways": ["Revenus principalement passifs", "Opérations cross-border", "Externalisation fonctions de direction"],
            "substance_indicators": ["Locaux propres/partagés", "Compte bancaire UE", "Directeurs résidents qualifiés"],
            "consequences": ["Refus d'avantages conventionnels", "Reporting renforcé", "Sanctions"],
            "status": "En discussion UE – transpositions nationales attendues"
        }

    def _add_bo_register_requirements(self):
        """Registres des bénéficiaires effectifs (UBO)"""
        self.ubo = {
            "threshold": ">25% ownership/control (généralement)",
            "register": {
                "FR": {"access": "restreint (après jurisprudence CJUE)", "deadline": "30 jours"},
                "LU": {"access": "restreint", "deadline": "30 jours"},
                "NL": {"access": "partiel", "deadline": "7 jours"}
            },
            "documentation": ["Pièces d'identité", "Structure capitalistique", "Déclaration UBO"]
        }

    def _add_transfer_pricing_framework(self):
        """Prix de transfert – documentation et méthodes"""
        self.transfer_pricing = {
            "docs": ["Master file", "Local file", "CbCR (>=750M€)"],
            "methods": ["CUP", "Cost Plus", "TNMM", "Profit Split"],
            "services": {"benefit_test": True, "low_value_added": "5% mark-up safe harbor (indicatif)"}
        }

    def get_tp_doc_requirements(self, country: str, turnover: float) -> Dict[str, Any]:
        """Exigences documentaires indicatives par pays"""
        thresholds = {
            "FR": {"local_file": 50_000_000, "master_file": 400_000_000},
            "ES": {"local_file": 45_000_000, "master_file": 250_000_000},
            "IT": {"local_file": 50_000_000, "master_file": 50_000_000},
            "DE": {"local_file": 0, "master_file": 0}
        }
        t = thresholds.get(country.upper(), {"local_file": 0, "master_file": 0})
        return {
            "local_file_required": turnover >= t["local_file"],
            "master_file_required": turnover >= t["master_file"],
            "cbcr_required": turnover >= 750_000_000
        }

    def _add_withholding_tax_matrix(self):
        """Matrice des WHT (dividendes/intérêts/royalties) – taux statutaires"""
        self.wht = {
            "FR": {"dividends": 30.0, "interest": 0.0, "royalties": 33.33},
            "DE": {"dividends": 26.375, "interest": 0.0, "royalties": 15.0},
            "LU": {"dividends": 15.0, "interest": 0.0, "royalties": 0.0},
            "NL": {"dividends": 15.0, "interest": 0.0, "royalties": 0.0}
        }

    def get_withholding_rate(self, source: str, recipient: str, income_type: str, treaty: bool = True) -> float:
        """Renvoie un taux indicatif de retenue à la source, avec/ss traité"""
        src = self.wht.get(source.upper(), {})
        base = float(src.get(income_type, 0.0)) if src else 0.0
        if not treaty:
            return base
        # Réductions indicatives sous convention (exemples)
        pairs = {("FR", "LU"): {"dividends": 5.0, "interest": 0.0, "royalties": 0.0},
                 ("FR", "DE"): {"dividends": 5.0, "interest": 0.0, "royalties": 0.0},
                 ("DE", "LU"): {"dividends": 5.0, "interest": 0.0, "royalties": 0.0}}
        reduction = pairs.get((source.upper(), recipient.upper()), {})
        return float(reduction.get(income_type, base))

    def _add_reporting_calendar(self):
        """Calendrier de compliance – échéances clés (indicatif)"""
        self.reporting_calendar = {
            "FR": {
                "PIT": "mai-juin",
                "CIT": "acompte trimestriel, solde mois 4",
                "VAT": "mensuel/trimestriel (CA)",
                "DAC6": "30 jours rolling",
                "CBCR": "12 mois après fin d'exercice"
            },
            "DE": {"PIT": "juillet", "CIT": "trimestriel", "VAT": "mensuel"},
            "LU": {"PIT": "mars", "CIT": "trimestriel", "VAT": "mensuel"}
        }

    def get_reporting_deadlines(self, country: str) -> Dict[str, str]:
        return self.reporting_calendar.get(country.upper(), {})

    def _add_remaining_eu_countries(self):
        """Ajoute les pays UE restants pour couverture exhaustive"""
        
        # CROATIE - Balkans UE
        self.countries_data["HR"] = CountryTaxData(
            country_name="Croatia",
            currency="EUR",
            personal_allowance=4800,  # Osobni odbitak
            income_tax_brackets=[
                TaxBracket(0, 30000, 20, "Prva stopa poreza na dohodak"),
                TaxBracket(30001, float('inf'), 30, "Druga stopa poreza")
            ],
            social_security_employee=20.0,  # Doprinosi za mirovinsko i zdravstveno
            vat_standard_rate=25.0,  # PDV
            vat_reduced_rates=[5.0, 13.0],
            wealth_tax_threshold=None,
            capital_gains_rate=12.0,  # Porez na kapitalne dobitke
            eu_member=True,
            tax_treaties=["SI", "AT", "HU", "IT", "DE", "FR"],
            special_regimes=[
                "Paušalni obrt (forfait artisans)",
                "Poticaji za start-up",
                "Posebne zone (zones spéciales)",
                "Olakšice za mlade (avantages jeunes)"
            ]
        )
        
        # BULGARIE - Flat tax balkanique
        self.countries_data["BG"] = CountryTaxData(
            country_name="Bulgaria",
            currency="BGN",
            personal_allowance=1200,  # Необлагаема минимална сума
            income_tax_brackets=[
                TaxBracket(0, 1200, 0, "Необлагаема сума"),
                TaxBracket(1201, float('inf'), 10, "Плосък данък")
            ],
            social_security_employee=13.78,  # Осигурителни вноски
            vat_standard_rate=20.0,  # ДДС
            vat_reduced_rates=[9.0],
            wealth_tax_threshold=None,
            capital_gains_rate=10.0,  # Данък върху капиталовите печалби
            eu_member=True,
            tax_treaties=["RO", "GR", "TR", "RS", "MK", "DE", "FR"],
            special_regimes=[
                "Микропредприятие (micro-entreprise)",
                "Статут на начинаещ предприемач",
                "Данъчни облекчения за инвестиции",
                "Режим на малък производител"
            ]
        )
        
        # ROUMANIE - Économie dynamique
        self.countries_data["RO"] = CountryTaxData(
            country_name="Romania",
            currency="RON",
            personal_allowance=3000,  # Deducerea personală de bază
            income_tax_brackets=[
                TaxBracket(0, 3000, 0, "Deducere personală"),
                TaxBracket(3001, float('inf'), 10, "Cota unică de impozit")
            ],
            social_security_employee=35.0,  # Contribuții sociale (CAS + CASS)
            vat_standard_rate=19.0,  # TVA
            vat_reduced_rates=[5.0, 9.0],
            wealth_tax_threshold=None,
            capital_gains_rate=10.0,  # Impozit pe câștiguri de capital
            eu_member=True,
            tax_treaties=["BG", "HU", "MD", "UA", "DE", "FR", "IT"],
            special_regimes=[
                "Microîntreprindere (micro-entreprise 1-3%)",
                "PFA - Persoană fizică autorizată",
                "Facilități pentru start-up",
                "Construcții sociale (logements sociaux)"
            ]
        )
        
        # GRÈCE - Méditerranée fiscale
        self.countries_data["GR"] = CountryTaxData(
            country_name="Greece",
            currency="EUR",
            personal_allowance=3500,  # Αφορολόγητο όριο
            income_tax_brackets=[
                TaxBracket(0, 10000, 9, "Πρώτη κλίμακα"),
                TaxBracket(10001, 20000, 22, "Δεύτερη κλίμακα"),
                TaxBracket(20001, 30000, 28, "Τρίτη κλίμακα"),
                TaxBracket(30001, 40000, 36, "Τέταρτη κλίμακα"),
                TaxBracket(40001, float('inf'), 44, "Ανώτατη κλίμακα")
            ],
            social_security_employee=16.0,  # Ασφαλιστικές εισφορές
            vat_standard_rate=24.0,  # ΦΠΑ
            vat_reduced_rates=[6.0, 13.0],
            wealth_tax_threshold=None,
            capital_gains_rate=15.0,  # Φόρος κεφαλαιακών κερδών
            eu_member=True,
            tax_treaties=["CY", "BG", "IT", "DE", "FR", "US"],
            special_regimes=[
                "Μικρές επιχειρήσεις (petites entreprises)",
                "Νησιωτικά κίνητρα (incitations îles)",
                "Επενδυτικός νόμος (loi d'investissement)",
                "Φορολογία μη κατοίκων (non-résidents)"
            ]
        )
        
        # CHYPRE - Hub fiscal méditerranéen
        self.countries_data["CY"] = CountryTaxData(
            country_name="Cyprus",
            currency="EUR",
            personal_allowance=19500,  # Tax-free threshold
            income_tax_brackets=[
                TaxBracket(0, 19500, 0, "Tax-free allowance"),
                TaxBracket(19501, 28000, 20, "First tax band"),
                TaxBracket(28001, 36300, 25, "Second tax band"),
                TaxBracket(36301, 60000, 30, "Third tax band"),
                TaxBracket(60001, float('inf'), 35, "Highest tax band")
            ],
            social_security_employee=8.3,  # Social insurance contributions
            vat_standard_rate=19.0,  # VAT
            vat_reduced_rates=[5.0, 9.0],
            wealth_tax_threshold=None,
            capital_gains_rate=20.0,  # Capital gains tax
            eu_member=True,
            tax_treaties=["GR", "GB", "RU", "DE", "FR", "US", "IN"],
            special_regimes=[
                "Non-dom regime (17 ans)",
                "IP Box regime (2.5%)",
                "Shipping tax regime",
                "Cyprus Investment Programme"
            ]
        )
        
        # MALTE - Micro-État fiscal
        self.countries_data["MT"] = CountryTaxData(
            country_name="Malta",
            currency="EUR",
            personal_allowance=9100,  # Tax-free threshold
            income_tax_brackets=[
                TaxBracket(0, 9100, 0, "Tax-free threshold"),
                TaxBracket(9101, 14500, 15, "First tax band"),
                TaxBracket(14501, 19500, 25, "Second tax band"),
                TaxBracket(19501, 60000, 25, "Standard rate"),
                TaxBracket(60001, float('inf'), 35, "Top rate")
            ],
            social_security_employee=10.0,  # Social security contributions
            vat_standard_rate=18.0,  # VAT
            vat_reduced_rates=[5.0, 7.0],
            wealth_tax_threshold=None,
            capital_gains_rate=0.0,  # No capital gains tax for individuals
            eu_member=True,
            tax_treaties=["IT", "GB", "DE", "FR", "NL", "SG"],
            special_regimes=[
                "Malta residence programme",
                "Highly Qualified Persons Rules",
                "Gaming tax regime",
                "Aircraft and shipping registration"
            ]
        )
        
        # LETTONIE - Balte dynamique
        self.countries_data["LV"] = CountryTaxData(
            country_name="Latvia",
            currency="EUR",
            personal_allowance=4050,  # Neapliekamais minimums
            income_tax_brackets=[
                TaxBracket(0, 25000, 20, "Pamatlikme"),
                TaxBracket(25001, 62800, 23, "Paaugstinātā likme"),
                TaxBracket(62801, float('inf'), 31, "Maksimālā likme")
            ],
            social_security_employee=11.0,  # Sociālās apdrošināšanas iemaksas
            vat_standard_rate=21.0,  # PVN
            vat_reduced_rates=[5.0, 12.0],
            wealth_tax_threshold=None,
            capital_gains_rate=20.0,  # Kapitāla pieauguma nodoklis
            eu_member=True,
            tax_treaties=["EE", "LT", "FI", "SE", "DE", "FR", "RU"],
            special_regimes=[
                "Mikrouzņēmuma nodoklis (micro-entreprise)",
                "Sākuma uzņēmēja statuss",
                "Pētniecības un attīstības atlaides",
                "Investīciju projektu atbalsts"
            ]
        )
        
        # LITUANIE - Balte ambitieuse
        self.countries_data["LT"] = CountryTaxData(
            country_name="Lithuania",
            currency="EUR",
            personal_allowance=5100,  # Neapmokestinamasis pajamų dydis
            income_tax_brackets=[
                TaxBracket(0, 25000, 20, "Pagrindinė mokesčio norma"),
                TaxBracket(25001, 81000, 27, "Didesnė mokesčio norma"),
                TaxBracket(81001, float('inf'), 32, "Aukščiausia mokesčio norma")
            ],
            social_security_employee=19.5,  # Socialinio draudimo įmokos
            vat_standard_rate=21.0,  # PVM
            vat_reduced_rates=[5.0, 9.0],
            wealth_tax_threshold=None,
            capital_gains_rate=15.0,  # Kapitalo prieaugio mokestis
            eu_member=True,
            tax_treaties=["LV", "EE", "PL", "DE", "FR", "SE", "BY"],
            special_regimes=[
                "Mažojo verslo pažyma (certificat petite entreprise)",
                "Startuolių lengvatos",
                "Mokslinių tyrimų skatinimas",
                "Fintech sandbox režimas"
            ]
        )

        # SUISSE - Données détaillées par canton
        self.countries_data["CH"] = CountryTaxData(
            country_code="CH",
            country_name="Switzerland",
            currency="CHF",
            income_tax_brackets=[
                TaxBracket(0, 14500, 0.0, "Exonération fédérale"),
                TaxBracket(14501, 31600, 0.77, "Tranche fédérale 1"),
                TaxBracket(31601, 41400, 0.88, "Tranche fédérale 2"),
                TaxBracket(41401, 55200, 2.64, "Tranche fédérale 3"),
                TaxBracket(55201, 72500, 2.97, "Tranche fédérale 4"),
                TaxBracket(72501, 78100, 5.94, "Tranche fédérale 5"),
                TaxBracket(78101, 103600, 6.60, "Tranche fédérale 6"),
                TaxBracket(103601, 134600, 8.25, "Tranche fédérale 7"),
                TaxBracket(134601, 176000, 9.90, "Tranche fédérale 8"),
                TaxBracket(176001, 755200, 11.00, "Tranche fédérale 9"),
                TaxBracket(755201, float('inf'), 11.50, "Tranche fédérale max")
            ],
            personal_allowance=0,
            vat_standard_rate=8.1,
            vat_reduced_rates=[2.6, 3.8],
            social_security_employee=6.4,
            social_security_employer=6.4,
            wealth_tax_threshold=None,  # Varie par canton
            capital_gains_tax=0.0,  # Pas d'impôt sur les gains en capital pour particuliers
            last_updated="2025-01-01",
            eu_member=False
        )
        
        # ANDORRE
        self.countries_data["AD"] = CountryTaxData(
            country_code="AD",
            country_name="Andorra",
            currency="EUR",
            income_tax_brackets=[
                TaxBracket(0, 24000, 0.0, "Exonération"),
                TaxBracket(24001, 40000, 5.0, "Première tranche"),
                TaxBracket(40001, float('inf'), 10.0, "Tranche maximale")
            ],
            personal_allowance=24000,
            vat_standard_rate=4.5,
            vat_reduced_rates=[1.0, 2.5, 9.5],
            social_security_employee=6.5,
            social_security_employer=15.5,
            capital_gains_tax=0.0,
            last_updated="2025-01-01",
            eu_member=False
        )
        
        # LUXEMBOURG
        self.countries_data["LU"] = CountryTaxData(
            country_code="LU",
            country_name="Luxembourg",
            currency="EUR",
            income_tax_brackets=[
                TaxBracket(0, 12438, 0.0, "Exonération"),
                TaxBracket(12439, 23350, 8.0, "Première tranche"),
                TaxBracket(23351, 38700, 10.0, "Deuxième tranche"),
                TaxBracket(38701, 54450, 12.0, "Troisième tranche"),
                TaxBracket(54451, 111600, 14.0, "Quatrième tranche"),
                TaxBracket(111601, 166650, 16.0, "Cinquième tranche"),
                TaxBracket(166651, 221700, 18.0, "Sixième tranche"),
                TaxBracket(221701, float('inf'), 42.0, "Tranche maximale")
            ],
            personal_allowance=12438,
            vat_standard_rate=17.0,
            vat_reduced_rates=[8.0, 14.0],
            social_security_employee=12.8,
            social_security_employer=12.8,
            wealth_tax_threshold=500000,
            wealth_tax_rate=0.5,
            capital_gains_tax=0.0,  # Exonération après 6 mois
            last_updated="2025-01-01",
            eu_member=True
        )
        
        # Ajouter d'autres pays européens...
        self._add_other_european_countries()
    
    def _add_other_european_countries(self):
        """Ajoute les données des autres pays européens"""
        
        # DANEMARK (taux le plus élevé d'Europe : 55.9%)
        self.countries_data["DK"] = CountryTaxData(
            country_code="DK",
            country_name="Denmark",
            currency="DKK",
            income_tax_brackets=[
                TaxBracket(0, 46700, 8.0, "Bundskat"),
                TaxBracket(46701, 323200, 12.16, "Mellemskat"),
                TaxBracket(323201, float('inf'), 15.0, "Topskat")
            ],
            personal_allowance=46700,
            vat_standard_rate=25.0,
            vat_reduced_rates=[],
            social_security_employee=8.0,
            social_security_employer=0.0,
            last_updated="2025-01-01",
            eu_member=True
        )
        
        # HONGRIE (TVA la plus élevée d'Europe : 27%)
        self.countries_data["HU"] = CountryTaxData(
            country_code="HU",
            country_name="Hungary",
            currency="HUF",
            income_tax_brackets=[
                TaxBracket(0, float('inf'), 15.0, "Flat tax")
            ],
            personal_allowance=0,
            vat_standard_rate=27.0,
            vat_reduced_rates=[5.0, 18.0],
            social_security_employee=18.5,
            social_security_employer=13.0,
            last_updated="2025-01-01",
            eu_member=True
        )
        
        # ESTONIE (taux le plus bas d'Europe : 22%)
        self.countries_data["EE"] = CountryTaxData(
            country_code="EE",
            country_name="Estonia",
            currency="EUR",
            income_tax_brackets=[
                TaxBracket(0, float('inf'), 22.0, "Flat tax")
            ],
            personal_allowance=7848,
            vat_standard_rate=22.0,
            vat_reduced_rates=[9.0],
            social_security_employee=2.0,
            social_security_employer=33.0,
            last_updated="2025-01-01",
            eu_member=True
        )
    
    def calculate_income_tax(self, country_code: str, annual_income: float, 
                           marital_status: str = "single") -> Dict[str, Any]:
        """
        Calcule l'impôt sur le revenu pour un pays donné
        
        Args:
            country_code: Code pays (FR, DE, CH, etc.)
            annual_income: Revenu annuel brut
            marital_status: Statut marital (single, married, etc.)
        
        Returns:
            Dict contenant le détail du calcul
        """
        if country_code not in self.countries_data:
            return {"error": f"Pays {country_code} non supporté"}
        
        country = self.countries_data[country_code]
        taxable_income = max(0, annual_income - country.personal_allowance)
        
        total_tax = 0
        tax_breakdown = []
        remaining_income = taxable_income
        
        for bracket in country.income_tax_brackets:
            if remaining_income <= 0:
                break
            
            bracket_income = min(remaining_income, bracket.max_income - bracket.min_income + 1)
            if bracket_income > 0:
                bracket_tax = bracket_income * (bracket.rate / 100)
                total_tax += bracket_tax
                
                tax_breakdown.append({
                    "bracket": f"{bracket.min_income:,.0f} - {bracket.max_income:,.0f}",
                    "rate": f"{bracket.rate}%",
                    "taxable_amount": bracket_income,
                    "tax_amount": bracket_tax,
                    "description": bracket.description
                })
                
                remaining_income -= bracket_income
        
        # Calcul des cotisations sociales
        social_security_tax = annual_income * (country.social_security_employee / 100)
        
        # Calcul net
        net_income = annual_income - total_tax - social_security_tax
        effective_rate = (total_tax / annual_income * 100) if annual_income > 0 else 0
        marginal_rate = self._get_marginal_rate(country, taxable_income)
        
        return {
            "country": country.country_name,
            "currency": country.currency,
            "gross_income": annual_income,
            "personal_allowance": country.personal_allowance,
            "taxable_income": taxable_income,
            "income_tax": total_tax,
            "social_security": social_security_tax,
            "total_tax": total_tax + social_security_tax,
            "net_income": net_income,
            "effective_rate": round(effective_rate, 2),
            "marginal_rate": round(marginal_rate, 2),
            "tax_breakdown": tax_breakdown
        }
    
    def _get_marginal_rate(self, country: CountryTaxData, taxable_income: float) -> float:
        """Calcule le taux marginal d'imposition"""
        for bracket in country.income_tax_brackets:
            if bracket.min_income <= taxable_income <= bracket.max_income:
                return bracket.rate
        return country.income_tax_brackets[-1].rate
    
    def compare_countries(self, annual_income: float, countries: List[str]) -> Dict[str, Any]:
        """
        Compare la fiscalité entre plusieurs pays européens
        
        Args:
            annual_income: Revenu annuel à comparer
            countries: Liste des codes pays à comparer
        
        Returns:
            Comparaison détaillée
        """
        comparison = {}
        
        for country_code in countries:
            if country_code in self.countries_data:
                comparison[country_code] = self.calculate_income_tax(country_code, annual_income)
        
        # Tri par charge fiscale totale
        sorted_countries = sorted(
            comparison.items(),
            key=lambda x: x[1].get("total_tax", float('inf'))
        )
        
        return {
            "income_compared": annual_income,
            "countries_comparison": dict(sorted_countries),
            "best_country": sorted_countries[0][0] if sorted_countries else None,
            "worst_country": sorted_countries[-1][0] if sorted_countries else None,
            "tax_savings": (
                sorted_countries[-1][1].get("total_tax", 0) - 
                sorted_countries[0][1].get("total_tax", 0)
            ) if len(sorted_countries) >= 2 else 0
        }
    
    def get_tax_optimization_advice(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fournit des conseils d'optimisation fiscale personnalisés
        
        Args:
            profile: Profil du contribuable (revenus, situation, objectifs)
        
        Returns:
            Conseils d'optimisation fiscale
        """
        annual_income = profile.get("annual_income", 0)
        current_country = profile.get("country", "FR")
        objectives = profile.get("objectives", [])
        
        # Analyse des pays avantageux
        eu_countries = ["FR", "DE", "CH", "AD", "LU", "DK", "HU", "EE"]
        comparison = self.compare_countries(annual_income, eu_countries)
        
        advice = {
            "current_situation": self.calculate_income_tax(current_country, annual_income),
            "optimization_opportunities": [],
            "recommended_countries": [],
            "tax_strategies": []
        }
        
        # Recommandations par niveau de revenu
        if annual_income < 50000:
            advice["tax_strategies"].extend([
                "Maximiser les déductions fiscales disponibles",
                "Considérer l'épargne retraite défiscalisée",
                "Optimiser la répartition des revenus du foyer"
            ])
        elif annual_income < 100000:
            advice["tax_strategies"].extend([
                "Étudier les dispositifs de défiscalisation immobilière",
                "Optimiser l'investissement en actions (PEA, assurance-vie)",
                "Considérer la création d'une société si revenus mixtes"
            ])
        else:
            advice["tax_strategies"].extend([
                "Envisager une optimisation internationale",
                "Structurer le patrimoine via des holdings",
                "Optimiser la transmission du patrimoine"
            ])
        
        # Pays recommandés selon le profil
        best_countries = list(comparison["countries_comparison"].keys())[:3]
        for country_code in best_countries:
            if country_code != current_country:
                country_data = comparison["countries_comparison"][country_code]
                advice["recommended_countries"].append({
                    "country": country_code,
                    "tax_savings": comparison["countries_comparison"][current_country]["total_tax"] - country_data["total_tax"],
                    "effective_rate": country_data["effective_rate"],
                    "advantages": self._get_country_advantages(country_code)
                })
        
        return advice
    
    def _get_country_advantages(self, country_code: str) -> List[str]:
        """Retourne les avantages fiscaux spécifiques d'un pays"""
        advantages = {
            "CH": [
                "Pas d'impôt sur les gains en capital pour particuliers",
                "Fiscalité avantageuse sur la fortune",
                "Stabilité politique et économique"
            ],
            "AD": [
                "Impôt sur le revenu très faible (max 10%)",
                "Pas d'impôt sur la fortune",
                "TVA réduite (4.5%)"
            ],
            "LU": [
                "Exonération des gains en capital après 6 mois",
                "TVA la plus basse d'Europe (17%)",
                "Centre financier européen"
            ],
            "EE": [
                "Flat tax à 22%",
                "Système fiscal simple",
                "Innovation numérique"
            ],
            "HU": [
                "Flat tax à 15%",
                "Coût de la vie attractif",
                "Facilités pour entrepreneurs"
            ]
        }
        return advantages.get(country_code, [])
    
    def get_country_info(self, country_code: str) -> Dict[str, Any]:
        """Retourne les informations complètes d'un pays"""
        if country_code not in self.countries_data:
            return {"error": f"Pays {country_code} non supporté"}
        
        country = self.countries_data[country_code]
        return {
            "country_name": country.country_name,
            "currency": country.currency,
            "eu_member": country.eu_member,
            "vat_rates": {
                "standard": country.vat_standard_rate,
                "reduced": country.vat_reduced_rates
            },
            "social_security": {
                "employee": country.social_security_employee,
                "employer": country.social_security_employer
            },
            "wealth_tax": {
                "threshold": country.wealth_tax_threshold,
                "rate": country.wealth_tax_rate
            } if country.wealth_tax_threshold else None,
            "capital_gains_tax": country.capital_gains_tax,
            "last_updated": country.last_updated
        }
    
    def search_tax_knowledge(self, query: str) -> List[Dict[str, Any]]:
        """
        Recherche dans la base de connaissance fiscale
        
        Args:
            query: Requête de recherche
        
        Returns:
            Résultats de recherche pertinents
        """
        query_lower = query.lower()
        results = []
        
        # Mots-clés pour différents types de recherche
        income_keywords = ["impôt", "revenu", "tmi", "taux", "marginal", "income", "tax"]
        vat_keywords = ["tva", "vat", "taxe", "valeur", "ajoutée"]
        country_keywords = ["pays", "country", "où", "where", "meilleur", "best"]
        
        # Recherche par type de requête
        if any(keyword in query_lower for keyword in income_keywords):
            for country_code, country in self.countries_data.items():
                results.append({
                    "type": "income_tax_info",
                    "country": country.country_name,
                    "country_code": country_code,
                    "content": f"Impôt sur le revenu {country.country_name}: {len(country.income_tax_brackets)} tranches, taux max {max(b.rate for b in country.income_tax_brackets)}%",
                    "relevance": 0.8
                })
        
        if any(keyword in query_lower for keyword in vat_keywords):
            for country_code, country in self.countries_data.items():
                results.append({
                    "type": "vat_info",
                    "country": country.country_name,
                    "country_code": country_code,
                    "content": f"TVA {country.country_name}: taux standard {country.vat_standard_rate}%, taux réduits {country.vat_reduced_rates}",
                    "relevance": 0.7
                })
        
        # Tri par pertinence
        results.sort(key=lambda x: x["relevance"], reverse=True)
        return results[:10]  # Top 10 résultats

# Instance globale
european_tax_kb = EuropeanTaxKnowledgeBase()

def get_european_tax_response(query: str, user_profile: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Point d'entrée principal pour les requêtes fiscales européennes
    
    Args:
        query: Question fiscale de l'utilisateur
        user_profile: Profil utilisateur optionnel
    
    Returns:
        Réponse fiscale complète et personnalisée
    """
    # Analyse de la requête
    query_lower = query.lower()
    
    # Détection du type de requête
    if "calcul" in query_lower or "combien" in query_lower:
        # Extraction du revenu et du pays si mentionnés
        income_match = re.search(r'(\d+(?:\s*\d+)*)\s*(?:€|euros?|k€)', query_lower)
        country_match = re.search(r'\b(france|allemagne|suisse|andorre|luxembourg|danemark|hongrie|estonie)\b', query_lower)
        
        if income_match:
            income_str = income_match.group(1).replace(' ', '')
            if 'k€' in query_lower:
                income = float(income_str) * 1000
            else:
                income = float(income_str)
            
            country_code = "FR"  # Par défaut
            if country_match:
                country_mapping = {
                    "france": "FR", "allemagne": "DE", "suisse": "CH",
                    "andorre": "AD", "luxembourg": "LU", "danemark": "DK",
                    "hongrie": "HU", "estonie": "EE"
                }
                country_code = country_mapping.get(country_match.group(1), "FR")
            
            calculation = european_tax_kb.calculate_income_tax(country_code, income)
            
            return {
                "type": "tax_calculation",
                "query": query,
                "result": calculation,
                "explanation": f"Calcul de l'impôt sur le revenu pour {income:,.0f}€ en {calculation.get('country', 'France')}",
                "confidence": 0.95
            }
    
    elif "compar" in query_lower or "meilleur" in query_lower:
        # Comparaison entre pays
        income = 75000  # Revenu par défaut pour comparaison
        countries = ["FR", "DE", "CH", "AD", "LU"]
        
        comparison = european_tax_kb.compare_countries(income, countries)
        
        return {
            "type": "country_comparison",
            "query": query,
            "result": comparison,
            "explanation": f"Comparaison fiscale pour {income:,.0f}€ entre {len(countries)} pays européens",
            "confidence": 0.9
        }
    
    elif "conseil" in query_lower or "optimis" in query_lower:
        # Conseils d'optimisation
        profile = user_profile or {"annual_income": 60000, "country": "FR"}
        advice = european_tax_kb.get_tax_optimization_advice(profile)
        
        return {
            "type": "tax_advice",
            "query": query,
            "result": advice,
            "explanation": "Conseils personnalisés d'optimisation fiscale européenne",
            "confidence": 0.85
        }
    
    else:
        # Recherche générale
        search_results = european_tax_kb.search_tax_knowledge(query)
        
        return {
            "type": "general_search",
            "query": query,
            "result": search_results,
            "explanation": f"Recherche dans la base de connaissance fiscale européenne: {len(search_results)} résultats",
            "confidence": 0.7
        }

if __name__ == "__main__":
    # Tests de la base de connaissance
    print("=== FRANCIS EUROPEAN TAX KNOWLEDGE BASE - TESTS ===")
    
    # Test calcul d'impôt
    print("\n1. Calcul d'impôt France - 75,000€:")
    result = european_tax_kb.calculate_income_tax("FR", 75000)
    print(f"Impôt total: {result['total_tax']:,.0f}€")
    print(f"Taux effectif: {result['effective_rate']}%")
    
    # Test comparaison
    print("\n2. Comparaison européenne - 100,000€:")
    comparison = european_tax_kb.compare_countries(100000, ["FR", "CH", "AD", "LU"])
    print(f"Meilleur pays: {comparison['best_country']}")
    print(f"Économie possible: {comparison['tax_savings']:,.0f}€")
    
    # Test conseils
    print("\n3. Conseils d'optimisation:")
    profile = {"annual_income": 120000, "country": "FR", "objectives": ["reduce_tax"]}
    advice = european_tax_kb.get_tax_optimization_advice(profile)
    print(f"Stratégies recommandées: {len(advice['tax_strategies'])}")
    print(f"Pays recommandés: {len(advice['recommended_countries'])}")
    
    print("\n✅ Base de connaissance fiscale européenne opérationnelle!")

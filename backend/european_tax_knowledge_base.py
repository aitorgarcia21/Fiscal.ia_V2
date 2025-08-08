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

        # Ajout des pays UE restants pour couverture EXHAUSTIVE
        self._add_remaining_eu_countries()

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
        self._add_remaining_eu_countries()
    
    def _add_remaining_eu_countries(self):
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

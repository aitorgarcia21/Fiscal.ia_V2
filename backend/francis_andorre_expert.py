"""
Francis Andorre Expert - Système LLM spécialisé fiscalité andorrane
"""
import os
import json
from typing import List, Dict, AsyncGenerator, Optional
import httpx
from datetime import datetime

# Base de connaissances fiscales andorranes exhaustive
ANDORRA_TAX_KNOWLEDGE = {
    "IGI": {
        "description": "Impost General Indirecte (TVA andorrane)",
        "taux": {
            "super_reduit": {"taux": "0%", "application": "Produits de première nécessité, santé, éducation"},
            "special": {"taux": "1%", "application": "Alimentation, boissons non alcoolisées, livres"},
            "reduit": {"taux": "2.5%", "application": "Transport de personnes, culture, sport"},
            "intermediaire": {"taux": "4.5%", "application": "Services généraux, restauration, hôtellerie"},
            "normal": {"taux": "9.5%", "application": "Prestations de services bancaires et financiers"},
            "incrementat": {"taux": "21%", "application": "Tabac, alcool (sauf vin/bière), parfums"}
        },
        "exonerations": [
            "Services médicaux et hospitaliers",
            "Services éducatifs",
            "Services sociaux",
            "Opérations d'assurance et réassurance",
            "Location d'immeubles à usage d'habitation",
            "Exportations de biens et services"
        ],
        "obligations": {
            "declaration": "Mensuelle ou trimestrielle selon CA",
            "seuil_assujettissement": "40.000€ de CA annuel",
            "delai_paiement": "Avant le 20 du mois suivant"
        },
        "base_legale": "Llei 11/2012 del 21 de juny, de l'impost general indirecte"
    },
    
    "IRPF": {
        "description": "Impost sobre la Renda de les Persones Físiques",
        "bareme_2024": [
            {"tranche": "0 à 24.000€", "taux": "0%"},
            {"tranche": "24.001€ à 40.000€", "taux": "5%"},
            {"tranche": "Plus de 40.000€", "taux": "10%"}
        ],
        "deductions": {
            "personnelle": "24.000€ (minimum non imposable)",
            "conjoint": "12.000€",
            "enfants": "6.000€ par enfant",
            "ascendants": "6.000€ par ascendant à charge",
            "handicap": "75% des dépenses, max 8.000€",
            "logement": "Intérêts hypothécaires jusqu'à 15.000€/an"
        },
        "revenus_exoneres": [
            "Indemnités de licenciement dans la limite légale",
            "Prestations de sécurité sociale",
            "Bourses d'études publiques",
            "Prix littéraires, artistiques ou scientifiques"
        ],
        "retenues_source": {
            "salaries": "Barème progressif mensuel",
            "independants": "15% (acomptes trimestriels)",
            "capital_mobilier": "10%",
            "plus_values": "10%"
        },
        "base_legale": "Llei 94/2010 del 29 de desembre, de l'impost sobre la renda de les persones físiques"
    },
    
    "IS": {
        "description": "Impost de Societats",
        "taux": {
            "general": "10%",
            "reduit_nouvelles_entreprises": "5% (3 premières années)",
            "commerce_international": "2% (conditions spécifiques)",
            "holdings": "0% sur dividendes et plus-values (conditions)",
            "socimi": "0% (sociétés immobilières cotées)"
        },
        "deductions": {
            "R&D": "20% des dépenses",
            "creation_emploi": "1.500€ par emploi créé",
            "investissements": "5% à 10% selon nature",
            "formation": "15% des dépenses"
        },
        "regime_holding": {
            "conditions": [
                "Participation minimum 5% ou valeur acquisition > 1M€",
                "Détention minimum 1 an",
                "Filiale soumise à IS équivalent",
                "Activité économique réelle"
            ],
            "avantages": [
                "Exonération dividendes reçus",
                "Exonération plus-values de cession",
                "Pas de retenue à la source sur dividendes distribués"
            ]
        },
        "base_legale": "Llei 95/2010 del 29 de desembre, de l'impost de societats"
    },
    
    "ITP": {
        "description": "Impost sobre Transmissions Patrimonials",
        "taux": {
            "immobilier": "4%",
            "premiere_residence": {
                "general": "3.5%",
                "jeunes_moins_35": "3%",
                "familles_nombreuses": "3%",
                "handicapes": "1%"
            },
            "meubles": "4%",
            "vehicules": "4%",
            "droits_reels": "1%"
        },
        "exemptions": [
            "Transmissions entre époux",
            "Transmissions aux descendants directs (réduction 100%)",
            "Transmissions aux ascendants directs (réduction 100%)",
            "Transmissions d'entreprises familiales (conditions)"
        ],
        "base_calcul": "Valeur réelle du bien ou prix déclaré (le plus élevé)",
        "delai_declaration": "1 mois depuis la transmission",
        "base_legale": "Llei 21/2014 del 16 d'octubre, de bases de l'ordenament tributari"
    },
    
    "RESIDENCE_FISCALE": {
        "types": {
            "active": {
                "description": "Résidence active avec activité économique",
                "conditions": [
                    "Résider min. 90 jours/an en Andorre",
                    "Exercer une activité économique",
                    "Être administrateur société andorrane avec 10% capital",
                    "Ou être salarié en Andorre"
                ],
                "depot_garantie": "15.000€ AFA + 10.000€/personne à charge"
            },
            "passive": {
                "description": "Résidence passive sans activité lucrative",
                "conditions": [
                    "Résider min. 90 jours/an en Andorre",
                    "Investir min. 600.000€ (immobilier, société, AFA)",
                    "Ne pas exercer d'activité lucrative"
                ],
                "depot_garantie": "47.500€ AFA + 9.500€/personne à charge"
            }
        },
        "avantages_fiscaux": [
            "IRPF max 10%",
            "Pas d'impôt sur la fortune",
            "Pas d'impôt sur les successions",
            "Pas d'impôt sur les donations",
            "Conventions fiscales favorables"
        ]
    },
    
    "CONVENTIONS_FISCALES": {
        "pays": [
            "Espagne", "France", "Portugal", "Luxembourg",
            "Liechtenstein", "Malte", "Émirats Arabes Unis",
            "Saint-Marin", "Chypre"
        ],
        "principes": {
            "residence": "Critère principal d'imposition",
            "etablissement_stable": "Imposition dans pays d'activité",
            "dividendes": "0-5-10% selon participation",
            "interets": "0-5% maximum",
            "royalties": "0-5% maximum"
        }
    },
    "IRNR": {
        "description": "Impost sobre la Renda dels No-Residents (2025)",
        "taux": {
            "general": "10%",
            "dividendes": "5%",
            "interets": "5%",
            "redevances": "5%"
        },
        "base_legale": "Llei 5/2014 (actualisée 2025) de l'impost sobre la renda dels no residents"
    },
    "DROITS_SUCCESSION_DONATION": {
        "description": "Droits de succession et de donation (Andorre n'applique PAS de droits spécifiques, seuls les frais d'enregistrement de 0,2% s'appliquent)",
        "frais_enregistrement": "0,2% du bien transmis",
        "note": "Pas d'impôt additionnel sur les héritages ou donations"
    },
    "IPI": {
        "description": "Impost sobre el Patrimoni Immobiliari (taxe annuelle sur la propriété immobilière)",
        "taux": "0,05% de la valeur cadastrale (actualisation 2025)",
        "exonerations": [
            "Première résidence jusqu’à 500 000€ de valeur cadastrale",
            "Biens à vocation sociale ou culturelle"
        ]
    },
    "CASS": {
        "description": "Cotisations sociales Caixa Andorrana de Seguretat Social (2025)",
        "taux_salaires": {
            "employeur": "15,5% (dont 7% retraite, 8,5% maladie)",
            "salarie": "6,5% (dont 3% retraite, 3,5% maladie)"
        },
        "independants": "22% du revenu net presumé (minimum 475€/mois en 2025)"
    },
    "TAXES_MUNICIPALES": {
        "description": "Taxes communales affichage, circulation, déchets (tarifs 2025 par paroisse)",
        "ordures_menageres": "70€ – 180€ / an selon surface logement",
        "vehicules": "0,4% de la valeur CO₂ (minimum 80€)",
        "publicite": "20€ / m² d'enseigne"
    },
    "DROITS_TIMBRE_REGISTRES": {
        "description": "Droits de timbre et frais d'inscription 2025",
        "registre_commerce": "101,25€ lors de la constitution + 31,50€ annuels",
        "registre_foncier": "0,1% de la valeur inscrite"
    },
    "REGIMES_SPECIAUX": {
        "description": "Régimes fiscaux spéciaux complémentaires (2025)",
        "capital_risque": "Exonération IS sur plus-values sous conditions (art. 23bis)",
        "fondations_associations": "IS 0% si but non lucratif et utilité publique",
        "fonds_investissement": "IS 0% (UCI) + IGI 0% sur commissions",
        "startups_innovantes": "Crédit d'impôt R&D majoré à 40% + IS 5% les 5 premières années"
    },
    "PROCEDURES_OBLIGATIONS": {
        "description": "Délais, pénalités et contrôles (2025)",
        "declarations": {
            "IRPF": "31/06 (papier) – 30/09 (télématique)",
            "IS": "Dans les 6 mois suivant la clôture + 25 jours",
            "IGI": "20 du mois suivant la période (mensuelle ou trimestrielle)"
        },
        "penalites_retard": "1% par mois de retard (max 35%) + intérêts 4% annuel",
        "controle_fiscal": "Prescription 4 ans (5 si fraude) – droit de visite des agents tributaris"
    },
    "CONVENTIONS_DETAILS": {
        "description": "Taux retenue à la source selon conventions de non-double imposition (2025)",
        "France": {"dividendes": "0-5%", "interets": "0%", "redevances": "0%"},
        "Espagne": {"dividendes": "0-5%", "interets": "0%", "redevances": "0%"},
        "Portugal": {"dividendes": "5%", "interets": "5%", "redevances": "5%"},
        "Luxembourg": {"dividendes": "0%", "interets": "0%", "redevances": "0%"}
    },
    "MESURES_ANTI_ABUS": {
        "description": "Dispositifs anti-abus (BEPS, substance économique) applicables dès 2025",
        "cfc_rules": "Imposition des revenus passifs de filiales contrôlées <10% d'IS effectif",
        "substance_requirements": "Bureau physique, personnel qualifié minimal, dépenses >15% du CA local",
        "gaar": "Clause anti-abus générale art. 13bis LGT (requalification de montages artificiels)"
    },
    
    "SECTEURS_STRATEGIQUES": {
        "description": "Incitations fiscales sectorielles 2025",
        "tourisme": {
            "hotels_renovation": "Crédit d'impôt 25% travaux écologiques",
            "stations_ski": "IS réduit 5% si investissements durables >500k€",
            "agences_voyage": "IGI réduit 4.5% sur commissions internationales"
        },
        "finance": {
            "gestion_actifs": "IS 2% pour activités internationales (>80% non-résidents)",
            "fintech": "IS 5% premières 5 années + exonération IGI sur services digitaux",
            "assurances": "Régime spécial branches vie/non-vie, IS effectif 2-5%"
        },
        "technologie": {
            "software": "Déduction 200% dépenses R&D + patent box 80% exonération",
            "data_centers": "IS 5% + exonération IPI + tarif électricité réduit",
            "gaming": "IS 10% mais royalties déductibles à 100%"
        }
    },
    
    "CRYPTO_ACTIFS": {
        "description": "Fiscalité crypto-monnaies et actifs numériques 2025",
        "trading": "IRPF 10% sur plus-values (holding >1 an: 5%)",
        "mining": "Activité économique IS 10% + IGI sur vente",
        "staking": "Revenus du capital 10% IRPF",
        "nft": "Plus-values 10%, création artistique exonérée si <40k€/an",
        "defi": "Yields farming imposés comme revenus du capital",
        "declaration": "Obligatoire si valeur >50k€ au 31/12"
    },
    
    "PRIX_TRANSFERT": {
        "description": "Transfer pricing et transactions intragroupe 2025",
        "principe": "Arm's length selon directives OCDE",
        "documentation": "Master file + Local file si CA >10M€",
        "apa": "Accords préalables possibles (validité 3-5 ans)",
        "penalites": "Ajustement primaire + intérêts 4% + amende 2% du redressement"
    },
    
    "TAXES_ENVIRONNEMENTALES": {
        "description": "Fiscalité verte et transition écologique 2025",
        "carbone": "15€/tonne CO2 (industrie) - 25€/tonne (transport)",
        "vehicules_electriques": "IGI 0% achat + exonération taxe circulation 5 ans",
        "panneaux_solaires": "Crédit d'impôt 40% installation + IGI 0%",
        "plastiques": "0,10€/kg plastique non recyclable",
        "eau": "Surtaxe consommation >200m3/an (0,50€/m3)"
    },
    
    "ZONES_FRANCHES": {
        "description": "Zones économiques spéciales 2025",
        "pas_de_la_casa": {
            "commerce_frontalier": "IGI réduit 4.5% + IS 5%",
            "entrepots": "Suspension IGI pour stockage <2 ans"
        },
        "zone_innovation": {
            "location": "Encamp - La Cortinada",
            "avantages": "IS 0% année 1-2, 5% année 3-5, subventions 50% loyer"
        }
    },
    
    "TRUSTS_FONDATIONS": {
        "description": "Régime des trusts et fondations privées 2025",
        "fondations_privees": {
            "constitution": "Capital min 60k€, IS 0% si familiale",
            "distributions": "IRPF bénéficiaires selon résidence"
        },
        "trusts_etrangers": {
            "transparence": "Déclaration obligatoire des bénéficiaires",
            "imposition": "Look-through si contrôle andorran"
        }
    },
    
    "EXPATRIES_IMPATRIES": {
        "description": "Régimes spéciaux expatriés/impatriés 2025",
        "impatries_qualifies": {
            "conditions": "Salaire >100k€ ou compétences stratégiques",
            "avantages": "IRPF plafonné 5% pendant 5 ans sur revenus étrangers"
        },
        "exit_tax": {
            "seuil": "Plus-values latentes >1M€",
            "report": "Possible si garanties bancaires"
        }
    },
    
    "ASSURANCES_PREVOYANCE": {
        "description": "Fiscalité assurance-vie et prévoyance 2025",
        "assurance_vie": {
            "primes": "Déductibles jusqu'à 750€/an",
            "rachats_8ans": "Exonération totale plus-values",
            "rachats_avant": "IRPF 10% sur gains"
        },
        "plans_retraite": {
            "cotisations": "Déductibles jusqu'à 5000€/an",
            "prestations": "IRPF progressif avec abattement 40%"
        }
    },
    
    "RULINGS_PROCEDURES": {
        "description": "Procédures de rescrit et sécurité juridique 2025",
        "ruling_fiscal": {
            "delai": "Réponse sous 3 mois",
            "validite": "Contraignant pour l'administration 3 ans",
            "cout": "500€ ruling simple, 2000€ ruling complexe"
        },
        "regularisation": {
            "volontaire": "Pénalités réduites 50% si spontanée",
            "amnistie_2025": "Programme spécial rapatriement capitaux 3% forfaitaire"
        }
    },
    
    "ACCORDS_BILATERAUX": {
        "description": "Accords spécifiques sécurité sociale et pensions 2025",
        "securite_sociale": {
            "france": "Totalisation périodes, exportation prestations",
            "espagne": "Convention SS complète depuis 2023",
            "portugal": "Accord retraites complémentaires 2024"
        },
        "pensions": {
            "imposition": "Exclusivement pays de résidence sauf fonctionnaires",
            "abattement": "40% sur pensions étrangères"
        }
    },
    
    "PROFESSIONS_LIBERALES": {
        "description": "Régimes spécifiques professions libérales 2025",
        "medecins": {
            "forfait_charges": "35% déductible automatique",
            "equipements": "Amortissement accéléré 3 ans",
            "formation_continue": "Crédit d'impôt 50%"
        },
        "avocats": {
            "honoraires_aide_juridique": "Exonération IGI",
            "bibliotheque": "Déduction intégrale immédiate"
        },
        "architectes": {
            "logiciels_cao": "Déduction 150%",
            "projets_durables": "Bonus fiscal 20% honoraires"
        }
    },
    
    "ARTISTES_SPORTIFS": {
        "description": "Régime fiscal artistes et sportifs professionnels 2025",
        "artistes": {
            "droits_auteur": "IRPF 5% si <100k€/an",
            "ventes_oeuvres": "IGI exonéré première vente",
            "mecenat": "Réduction d'impôt 60% dons reçus"
        },
        "sportifs": {
            "primes_competition": "Lissage sur 3 ans possible",
            "droits_image": "Société dédiée IS 5%",
            "fin_carriere": "Épargne retraite majorée 10k€/an"
        }
    },
    
    "JEUX_PARIS": {
        "description": "Fiscalité jeux de hasard et paris sportifs 2025",
        "casinos": {
            "produit_brut_jeux": "Taxe progressive 10-40%",
            "machines_sous": "55€/machine/mois",
            "tournois_poker": "IGI 9.5% sur buy-ins"
        },
        "paris_sportifs": {
            "operateurs": "Taxe 15% mises + IS 10%",
            "gains_joueurs": "IRPF 10% sur gains >3000€/an"
        },
        "loteries": "Monopole Loteria Nacional, reversement 25% œuvres sociales"
    },
    
    "BIENS_LUXE": {
        "description": "Taxation spéciale biens de luxe 2025",
        "vehicules": {
            "seuil": ">150k€ valeur neuve",
            "taxe_luxe": "20% sur montant dépassant 150k€",
            "yachts": "Taxe annuelle 1% valeur + amarrage 5k€/m"
        },
        "montres_bijoux": {
            "igi_special": "21% sur ventes >50k€",
            "importation": "Droits douane 5% + IGI"
        },
        "jets_prives": "Taxe atterrissage 1000€ + parking 500€/jour"
    },
    
    "ENTREPRISES_FAMILIALES": {
        "description": "Régime entreprises familiales et succession 2025",
        "pacte_dutreil": {
            "exoneration": "95% valeur entreprise si conservation 6 ans",
            "conditions": "Activité opérationnelle + engagement collectif"
        },
        "family_office": {
            "structure": "Holding animatrice IS 0% dividendes",
            "frais_gestion": "Déductibles si <1% actifs gérés"
        },
        "donation_temporaire_usufruit": "Optimisation IRPF parents-enfants autorisée"
    },
    
    "ECONOMIE_CIRCULAIRE": {
        "description": "Incitations économie circulaire et durable 2025",
        "recyclage": {
            "bonus": "IS -2% si taux recyclage >80%",
            "investissements": "Amortissement 150% équipements tri"
        },
        "reparation": {
            "igi_reduit": "2.5% services réparation",
            "credit_consommateurs": "Bon fiscal 50€/an/foyer"
        },
        "economie_fonctionnalite": "Location longue durée IGI 4.5% au lieu de vente"
    },
    
    "COOPERATIVES": {
        "description": "Régime coopératives et économie sociale 2025",
        "cooperatives_travail": {
            "is_reduit": "5% si 80% résultats aux membres",
            "reserves": "Dotation obligatoire 20% exonérée"
        },
        "cooperatives_consommation": {
            "ristournes": "Déductibles IS + non imposables membres",
            "parts_sociales": "Intérêts limités 3% exonérés IRPF"
        },
        "mutuelles": "IS 0% si agrément + 100% activités membres"
    },
    
    "MICRO_ENTREPRISES": {
        "description": "Régime simplifié micro-entreprises 2025",
        "seuils": {
            "services": "CA <100k€",
            "commerce": "CA <200k€"
        },
        "imposition": {
            "forfait": "IRPF 1% CA commerce, 2% CA services",
            "charges_sociales": "15% CA forfaitaire",
            "igi": "Franchise si CA <40k€"
        },
        "comptabilite": "Livre recettes-dépenses simplifié suffisant"
    },
    
    "BLOCKCHAIN_STARTUPS": {
        "description": "Régime spécial startups blockchain/Web3 2025",
        "ico_ito": {
            "tokens_utility": "IGI différé jusqu'à utilisation",
            "tokens_security": "Régime titres financiers classique"
        },
        "dao": {
            "structure": "Assimilation association IS 0% si non lucratif",
            "governance_tokens": "Plus-values exonérées si détention >3 ans"
        },
        "defi_protocoles": {
            "smart_contracts": "Revenus IS 5% première année",
            "liquidity_mining": "Provisions déductibles risques protocole"
        }
    },
    
    "MOBILITE_INTERNATIONALE": {
        "description": "Packages mobilité cadres internationaux 2025",
        "relocation": {
            "frais_demenagement": "Exonérés IRPF jusqu'à 15k€",
            "logement_temporaire": "6 mois pris en charge non imposable",
            "scolarite_enfants": "Déductible jusqu'à 10k€/enfant"
        },
        "detaches": {
            "prime_expatriation": "Exonérée 30% si <2 ans",
            "double_residence": "Frais réels déductibles"
        },
        "frontaliers": "Régime spécial France/Espagne, IRPF réduit 50%"
    },
    
    "AGRICULTURE_ELEVAGE": {
        "description": "Régime agriculteurs et éleveurs 2025",
        "cultures_montagne": {
            "subventions": "Aide directe 300€/ha + bonus bio 150€/ha",
            "irpf": "Estimation objective 0.2% chiffre d'affaires",
            "investissements": "Crédit d'impôt 40% serres et irrigation"
        },
        "elevage": {
            "betail": "Module IRPF 35€/tête bovins, 8€/tête ovins",
            "lait": "Prime qualité 0.05€/litre AOP",
            "viande": "IGI réduit 2.5% vente directe"
        },
        "apiculture": "Exonération totale <50 ruches"
    },
    
    "TABAC_HISTORIQUE": {
        "description": "Régime spécial secteur tabac 2025",
        "plantations": {
            "quota_national": "1200 tonnes/an réparties",
            "prix_garantis": "3.5€/kg qualité A",
            "aide_reconversion": "10k€/ha vers autres cultures"
        },
        "manufactures": {
            "monopole": "Droits exclusifs transformation",
            "taxes_speciales": "65% prix vente public",
            "export": "IGI 0% vers pays tiers"
        },
        "vente_detail": "Licence obligatoire + IS réduit 5%"
    },
    
    "ENERGIE_RENOUVELABLE": {
        "description": "Super incitations énergies vertes 2025",
        "hydroelectrique": {
            "concessions": "Redevance 2% CA + IS 5%",
            "micro_centrales": "Autorisation simplifiée <1MW",
            "autoconsommation": "Vente surplus tarif garanti 0.12€/kWh"
        },
        "solaire": {
            "parcs_photovoltaiques": "IS 0% pendant 10 ans",
            "toitures": "Subvention 50% + prêt 0%",
            "communautes_energie": "IGI 0% échanges entre membres"
        },
        "biomasse": "Prime 100€/tonne CO2 évitée"
    },
    
    "COMMERCE_ELECTRONIQUE": {
        "description": "Règles e-commerce et marketplace 2025",
        "ventes_ue": {
            "seuil": "10k€/an par pays avant TVA locale",
            "oss": "Guichet unique déclaration simplifiée",
            "dropshipping": "IGI lieu livraison finale"
        },
        "marketplaces": {
            "responsabilite": "Collecte IGI si >500 transactions/an",
            "reporting": "Déclaration trimestrielle vendeurs",
            "sanctions": "10k€ par vendeur non déclaré"
        },
        "services_digitaux": {
            "b2b": "Autoliquidation IGI client professionnel",
            "b2c": "IGI pays consommateur",
            "preuves": "2 éléments localisation client"
        }
    },
    
    "BREVETS_PROPRIETE": {
        "description": "Régime propriété intellectuelle 2025",
        "patent_box": {
            "taux_effectif": "IS 2% revenus brevets",
            "conditions": "R&D substantielle Andorre",
            "formule_nexus": "(Dépenses qualifiées/Total dépenses) x 130%"
        },
        "marques": {
            "royalties_internes": "Non déductibles groupe",
            "cession": "Plus-value 10% si >5 ans"
        },
        "software": {
            "developpement": "Amortissement 2 ans",
            "licences": "IGI réduit 2.5% B2B"
        }
    },
    
    "HOTELS_TOURISME": {
        "description": "Avantages secteur hôtelier 2025",
        "construction": {
            "hotels_5etoiles": "IS 0% pendant 7 ans",
            "renovation_energetique": "Subvention 40% + prêt bonifié",
            "accessibilite": "Crédit d'impôt 50%"
        },
        "exploitation": {
            "taux_occupation": "Bonus IS -1% si >80% annuel",
            "emploi_local": "CASS réduit si >90% résidents",
            "formation": "Déduction 200% école hôtelière"
        },
        "spa_wellness": "IGI 2.5% au lieu de 4.5%"
    },
    
    "VEHICULES_OCCASION": {
        "description": "Marché automobile occasion 2025",
        "importation": {
            "age_limite": "Interdiction >10 ans sauf collection",
            "taxes": "IGI + taxe CO2 selon émissions",
            "euro6": "Réduction 50% taxes si norme Euro 6"
        },
        "marge_beneficiaire": {
            "regime": "IGI sur marge uniquement",
            "calcul": "(Prix vente - Prix achat) x 4.5%",
            "documents": "Facture achat obligatoire"
        },
        "garanties": "IGI 9.5% extensions garantie"
    },
    
    "RESIDENCES_SECONDAIRES": {
        "description": "Régime résidences secondaires 2025",
        "acquisition": {
            "etrangers": "Autorisation gouvernement si >2 biens",
            "itp": "4% + surtaxe 1% si >1M€"
        },
        "detention": {
            "ipi": "Majoré 50% si occupé <90 jours/an",
            "location_touristique": "Licence HUT + IGI 9.5%",
            "airbnb": "Déclaration mensuelle + retenue 10%"
        },
        "plus_values": "IRPF 10% réduit à 5% si >10 ans"
    },
    
    "FONDS_INVESTISSEMENT": {
        "description": "Véhicules d'investissement collectif 2025",
        "opcvm": {
            "constitution": "Capital min 1.2M€",
            "gestion": "Commission max 2.5%/an",
            "distribution": "IS 0% fonds + IRPF investisseur"
        },
        "private_equity": {
            "carried_interest": "IRPF 10% si >3 ans",
            "management_fees": "IGI exonéré international",
            "spv": "IS 0% si pure holding"
        },
        "fonds_immobilier": {
            "reit_andorran": "Distribution 90% = IS 0%",
            "investisseurs": "IRPF 5% dividendes"
        }
    },
    
    "PHILANTHROPHIE": {
        "description": "Mécénat et dons caritatifs 2025",
        "fondations_utilite": {
            "reconnaissance": "Procédure 3 mois",
            "avantages": "IS 0% + IGI exonéré",
            "donateurs": "Déduction IRPF 25% (50% si culture)"
        },
        "crowdfunding_solidaire": {
            "plateformes": "Agrément INAF obligatoire",
            "dons": "Reçu fiscal automatique >50€",
            "contreparties": "IGI si valeur >10% don"
        },
        "legs": "Exonération totale droits succession"
    },
    
    "STOCK_OPTIONS_INCENTIVES": {
        "description": "Plans d'intéressement salariés 2025",
        "stock_options": {
            "attribution": "Non imposable si prix exercice = FMV",
            "exercice": "IRPF différé à la vente actions",
            "plus_value": "5% si détention >3 ans post-exercice"
        },
        "actions_gratuites": {
            "vesting": "IRPF 10% valeur attribution",
            "periode_conservation": "2 ans minimum",
            "dirigeants": "Limité 20% capital social"
        },
        "phantom_shares": "IRPF normal sur cash reçu",
        "carried_plans": "Régime capital si risque réel"
    },
    
    "FUSIONS_ACQUISITIONS": {
        "description": "Opérations M&A et restructurations 2025",
        "fusion_neutre": {
            "conditions": "Continuité activité + branch complète",
            "report_imposition": "Automatique si 95% actions",
            "mali_technique": "Amortissable sur 10 ans"
        },
        "lbo": {
            "dette_acquisition": "Intérêts déductibles si ratio <4:1",
            "management_package": "Sweet equity taxé plus-values",
            "earn_out": "IRPF/IS différé au paiement"
        },
        "apport_partiel_actif": "Régime faveur si branche autonome"
    },
    
    "SUCCESSIONS_COMPLEXES": {
        "description": "Planification successorale avancée 2025",
        "demembrement": {
            "quasi_usufruit": "Valeur fiscale 70% si viager",
            "reserve_usufruit": "Abattement 50% donation NP",
            "usufruit_temporaire": "4% par année jusqu'à 23 ans"
        },
        "pactes_successoraux": {
            "renonciation": "Acte notarié + droit fixe 200€",
            "attribution_preferentielle": "Entreprise familiale facilitée"
        },
        "trust_successoral": "Transparent si bénéficiaires déterminés"
    },
    
    "OEUVRES_ART": {
        "description": "Fiscalité collections et œuvres d'art 2025",
        "detention": {
            "ifi_france": "Exonération si prêt musée",
            "assurance": "Prime déductible si exposition publique"
        },
        "transactions": {
            "vente_artiste": "IRPF 5% création propre",
            "galeries": "IGI 2.5% commission <30%",
            "ventes_encheres": "Taxe 5% prix adjudication"
        },
        "importation": "IGI réduit 2.5% + franchise <10k€",
        "donation_musees": "Déduction 100% valeur expertise"
    },
    
    "RESTRUCTURATION_DETTE": {
        "description": "Opérations sur dette et refinancement 2025",
        "abandon_creance": {
            "intragroupe": "Neutre si recapitalisation",
            "tiers": "Produit imposable sauf insolvabilité"
        },
        "debt_equity_swap": {
            "creancier": "Plus-value différée si détention >2 ans",
            "debiteur": "Profit exonéré si difficultés prouvées"
        },
        "cession_decote": "Moins-value déductible immédiatement"
    },
    
    "PERSONNES_HANDICAPEES": {
        "description": "Avantages fiscaux handicap 2025",
        "irpf": {
            "abattement_personnel": "6000€ si invalidité >65%",
            "abattement_famille": "3000€ par personne à charge",
            "deduction_travailleur": "2500€ supplémentaire"
        },
        "patrimoine": {
            "trust_handicap": "IS 0% si bénéficiaire unique",
            "donation": "Franchise 300k€ parents-enfant handicapé"
        },
        "entreprises": "CASS réduit 50% + subvention adaptation poste"
    },
    
    "DUTY_FREE_ZONES": {
        "description": "Zones franches commerciales 2025",
        "aeroport": {
            "ventes": "IGI 0% passagers internationaux",
            "limites": "Alcool 1L, tabac 200 cigarettes",
            "luxe": "Franchise 430€/personne UE"
        },
        "frontieres": {
            "pas_casa": "Zone spéciale 500m frontière",
            "riu_runer": "Entrepôt sous douane autorisé"
        },
        "operations": "Suspension IGI jusqu'à sortie territoire"
    },
    
    "ONG_ASSOCIATIONS": {
        "description": "Régime organisations non lucratives 2025",
        "associations": {
            "culturelles": "IS 0% + IGI exonéré activités",
            "sportives": "Subventions non imposables",
            "sociales": "Dons déductibles 100% entreprises"
        },
        "ong_internationales": {
            "bureau": "Exonération totale si agrément",
            "personnel": "IRPF plafonné 5% expatriés"
        },
        "crowdfunding": "Collectes exonérées si caritatives"
    },
    
    "REGIMES_SPECIAUX_ENTREPRISES": {
        "description": "Statuts spéciaux entreprises 2025",
        "entreprise_insertion": {
            "conditions": ">50% salariés en réinsertion",
            "avantages": "IS 0% + subventions salaires 70%"
        },
        "centres_recherche": {
            "prive": "IS 2% si publications scientifiques",
            "public_prive": "TVA 0% équipements recherche"
        },
        "incubateurs": "Loyers exonérés IGI + mentoring déductible 200%"
    },
    
    "ANTI_BLANCHIMENT_FISCAL": {
        "description": "Compliance et lutte anti-fraude 2025",
        "declaration_suspicious": {
            "seuil_cash": "10k€ déclaration obligatoire",
            "transactions_suspectes": "Signalement UIFAND 24h",
            "sanctions": "100k€ minimum non-déclaration"
        },
        "beneficial_owner": {
            "registre": "Mise à jour annuelle obligatoire",
            "seuil": "25% droits vote ou capital",
            "acces": "Autorités uniquement"
        },
        "cooperation_internationale": "Echange automatique CRS/FATCA"
    },
    
    "PRODUITS_DERIVES": {
        "description": "Fiscalité instruments financiers complexes 2025",
        "options_futures": {
            "speculation": "IRPF 10% gains réalisés",
            "couverture": "Intégration résultat sous-jacent"
        },
        "cfd": {
            "retail": "Interdiction levier >2:1",
            "pro": "Pertes déductibles sans limite"
        },
        "structured_products": "Fiscalité transparente composants"
    },
    
    "HEBERGEMENT_DONNEES": {
        "description": "Data centers et cloud computing 2025",
        "infrastructure": {
            "construction": "IS 0% pendant 5 ans",
            "electricite": "Tarif industriel -40%",
            "refroidissement": "Crédit impôt systèmes écologiques"
        },
        "services_cloud": {
            "b2b_international": "IGI 0% clients non-résidents",
            "donnees_sensibles": "Certification sécurité = IS -2%"
        },
        "backup_disaster": "Amortissement accéléré 200%"
    },
    
    "DIPLOMATES_FONCTIONNAIRES": {
        "description": "Régimes diplomatiques et consulaires 2025",
        "ambassades": {
            "personnel_diplomatique": "Exonération totale IRPF",
            "personnel_administratif": "IRPF si nationalité andorrane",
            "locaux_mission": "Exonération IPI + taxes locales"
        },
        "organisations_internationales": {
            "fonctionnaires": "Imposition interne organisation",
            "consultants": "Retenue 10% honoraires"
        },
        "privileges_reciproques": "Selon conventions Vienne 1961/1963"
    },
    
    "AVIATION_MARITIME": {
        "description": "Fiscalité transport aérien et maritime 2025",
        "compagnies_aeriennes": {
            "benefices_internationaux": "IS 0% si >90% vols internationaux",
            "leasing_aeronefs": "IGI 0% location dry lease",
            "carburant": "Exonération accises aviation commerciale"
        },
        "armateurs": {
            "tonnage_tax": "Option IS forfaitaire 0.5€/100 tonnes",
            "equipages": "IRPF 183 jours = 50% réduction",
            "immatriculation": "Pavillon Andorre tax 2000€/an"
        },
        "yacht_charter": "IGI 9.5% + licence commerciale obligatoire"
    },
    
    "SANTE_PHARMA": {
        "description": "Régime pharmaceutique et dispositifs médicaux 2025",
        "laboratoires": {
            "r&d_medicaments": "Crédit impôt 45% essais cliniques",
            "production": "IS 5% médicaments essentiels",
            "brevets_pharma": "Patent box 1% revenus licences"
        },
        "dispositifs_medicaux": {
            "innovation": "Amortissement 100% année 1",
            "certification_ce": "Subvention 50% coûts"
        },
        "cannabis_medical": "IS 10% + licence spéciale AEMPS"
    },
    
    "BANQUES_PRIVEES": {
        "description": "Gestion de fortune et banque privée 2025",
        "wealth_management": {
            "aum_seuil": ">100M€ actifs gérés",
            "commissions": "IS 2% sur revenus récurrents",
            "performance_fees": "IS 10% si >hurdle rate"
        },
        "family_banking": {
            "pret_actionnaires": "Intérêts non déductibles si <2%",
            "services_concierge": "IGI 9.5% prestations annexes"
        },
        "crypto_custody": "Licence spéciale + IS standard 10%"
    },
    
    "FRANCHISE_COMMERCE": {
        "description": "Réseaux franchise et distribution 2025",
        "franchiseur": {
            "royalties": "IS 5% si marque internationale",
            "droit_entree": "IGI 4.5% services + know-how",
            "formation": "Déductible 150% coûts réels"
        },
        "franchise": {
            "amortissement_droit": "Linéaire sur durée contrat",
            "redevances": "Déductibles si <10% CA",
            "marketing_commun": "Charge déductible 100%"
        },
        "master_franchise": "IS 2% si développement régional"
    },
    
    "METAVERSE_NFT": {
        "description": "Economie virtuelle et métaverse 2025",
        "terrains_virtuels": {
            "achat_vente": "Plus-values IRPF 10%",
            "location": "Revenus locatifs IRPF normal",
            "developpement": "Frais activables comme immo incorporelle"
        },
        "avatars_skins": {
            "creation": "Revenus artistiques IRPF 5%",
            "trading": "IGI 4.5% sur marge bénéficiaire"
        },
        "play_to_earn": {
            "gains_jeu": "IRPF 10% si >3000€/an",
            "guildes": "Structure coopérative possible"
        }
    },
    
    "SECURITE_PRIVEE": {
        "description": "Services sécurité et protection 2025",
        "entreprises_securite": {
            "surveillance": "IS standard + licence obligatoire",
            "transport_fonds": "Assurance RC majorée déductible",
            "gardes_corps": "IRPF expatriés réduit 5%"
        },
        "systemes_alarme": {
            "vente": "IGI 9.5% matériel + installation",
            "monitoring": "IGI 4.5% abonnements"
        },
        "coffres_forts": "Location exonérée IGI particuliers"
    },
    
    "INDUSTRIES_CULTURELLES": {
        "description": "Cinéma, musique et production 2025",
        "production_films": {
            "tax_shelter": "Déduction 150% investissement",
            "tournages": "Remboursement 30% dépenses locales",
            "post_production": "IS 5% si >80% travail Andorre"
        },
        "musique": {
            "studios": "Amortissement équipements 3 ans",
            "streaming": "Retenue 5% royalties vers extérieur",
            "concerts": "IGI 2.5% billetterie culturelle"
        },
        "edition": "IGI 0% livres + presse papier"
    },
    
    "ESG_IMPACT": {
        "description": "Investissement durable et impact 2025",
        "green_bonds": {
            "emission": "Frais émission déductibles 200%",
            "interets": "IRPF réduit 5% souscripteurs",
            "certification": "Subvention 75% coûts audit vert"
        },
        "social_impact": {
            "entreprises_sociales": "IS 0% si réinvestissement 90%",
            "microfinance": "Provisions risque 150% déductibles"
        },
        "carbon_credits": "Trading exonéré IGI + stockage déductible"
    },
    
    "LITIGES_FISCAUX": {
        "description": "Contentieux et procédures fiscales 2025",
        "recours_administratif": {
            "delai": "1 mois après notification",
            "suspensif": "Oui si garantie 30% dette",
            "frais": "Gratuit première instance"
        },
        "tribunal": {
            "procedure": "Orale pour <50k€",
            "representation": "Avocat non obligatoire <10k€",
            "delai_jugement": "6 mois maximum"
        },
        "transaction": "Possible réduction 40% pénalités si accord"
    },
    
    "REGIMES_DOUANIERS": {
        "description": "Procédures douanières spéciales 2025",
        "admission_temporaire": {
            "materiels_pro": "Exonération totale <6 mois",
            "echantillons": "Franchise complète foires",
            "carnet_ata": "Accepté tous usages"
        },
        "perfectionnement": {
            "actif": "Transformation + réexportation = 0 droits",
            "passif": "Importation matières pour production locale"
        },
        "transit": "Garantie 20% droits théoriques"
    },
    
    "PROPRIETE_INTELLECTUELLE_AVANCEE": {
        "description": "Stratégies IP complexes 2025",
        "pool_brevets": {
            "structure": "Entité dédiée IS 2%",
            "cross_licensing": "Valorisation arm's length",
            "standards": "FRAND obligations respectées"
        },
        "trade_secrets": {
            "protection": "Coûts sécurité déductibles 150%",
            "violation": "Dommages déductibles victime"
        },
        "ip_backed_lending": "Intérêts déductibles si valorisation indépendante"
    },
    
    "PILLAR_II": {
        "description": "Impôt minimum mondial OCDE 15% (GloBE) 2025",
        "scope": "Groupes CA >750M€",
        "iir": "Top-up tax Andorre si taux effectif <15% filiale",
        "utr": "IS complémentaire entités locales",
        "safe_harbour": "Exonération si substance + revenus passifs <5%"
    },
    
    "HYBRID_MISMATCH": {
        "description": "Règles anti-montages hybrides ATAD2 2025",
        "deduction_no_inclusion": "Refus déduction intérêts si non imposés débirentier",
        "double_deduction": "Déduction unique dans Etat investisseur",
        "imported_mismatch": "Neutralisation si déduction à l'étranger"
    },
    
    "DIGITAL_SERVICES": {
        "description": "Taxe services numériques (TSN) 3% 2025",
        "seuil": "CA mondial >750M€ ET CA Andorre >500k€",
        "base": "Recettes pub en ligne, plateformes, data utilisateurs",
        "declaration": "Trimestrielle, paiement 20 jours fin trimestre"
    },
    
    "CBAM": {
        "description": "Mécanisme d'ajustement carbone aux frontières 2025",
        "produits": "Ciment, acier, aluminium, engrais, électricité",
        "certificats": "Achat sous forme IGI spéciale",
        "reporting": "Déclarations trimestrielles émissions incorporées"
    },
    
    "SPAC": {
        "description": "Sociétés ad hoc cotées 2025",
        "constitution": "Capital min 5M€, durée 24 mois",
        "fiducie": "90% fonds placés en titres sûrs",
        "fusion_target": "Top-up tax si taux effectif <10%"
    },
    
    "CROWDFUNDING_P2P": {
        "description": "Plateformes prêt participatif 2025",
        "investisseurs": "IRPF 5% intérêts <10k€/an",
        "emprunteurs": "IGI 0% frais dossier",
        "plateforme": "IS 5% commissions + licence INAF"
    },
    
    "FISCALITE_CAPTIVES": {
        "description": "Assurances captives et risk pooling 2025",
        "conditions": "Prime min 1M€, risques diversifiés",
        "is_taux": "2% si captive pure",
        "ceded_reinsurance": "Déduction intégrale primes cédées"
    },
    
    "FIRB": {
        "description": "Contrôle investissements étrangers sensibles 2025",
        "secteurs": "Télécom, énergie, défense, data",
        "seuil_examen": "Participation >10% capital",
        "taxe_dossier": "0.1% valeur transaction (plafond 50k€)"
    }
}


def extract_keywords(query: str) -> List[str]:
    """Extrait les mots-clés pertinents d'une question"""
    keywords = []
    query_lower = query.lower()
    
    # Mots-clés fiscaux importants
    tax_keywords = {
        "igi", "tva", "impost general", "taxe",
        "irpf", "impôt revenu", "salaire", "renda",
        "is", "societat", "société", "empresa",
        "itp", "transmission", "immobilier", "patrimonial",
        "résidence", "residència", "fiscal",
        "holding", "dividende", "convention", "cdi"
    }
    
    for keyword in tax_keywords:
        if keyword in query_lower:
            keywords.append(keyword)
    
    # Détection des montants et pourcentages
    import re
    amounts = re.findall(r'\d+\.?\d*\s*(?:€|euros?|%)', query_lower)
    keywords.extend(amounts)
    
    return keywords


def search_knowledge_base(keywords: List[str]) -> Dict:
    """Recherche dans la base de connaissances fiscales"""
    results = {}
    
    for keyword in keywords:
        keyword_lower = keyword.lower()
        
        # Recherche IGI/TVA
        if any(term in keyword_lower for term in ["igi", "tva", "impost general"]):
            results["IGI"] = ANDORRA_TAX_KNOWLEDGE["IGI"]
        
        # Recherche IRPF
        if any(term in keyword_lower for term in ["irpf", "revenu", "salaire", "renda"]):
            results["IRPF"] = ANDORRA_TAX_KNOWLEDGE["IRPF"]
        
        # Recherche IS
        if any(term in keyword_lower for term in ["is", "societat", "société", "empresa"]):
            results["IS"] = ANDORRA_TAX_KNOWLEDGE["IS"]
        
        # Recherche ITP
        if any(term in keyword_lower for term in ["itp", "transmission", "immobilier"]):
            results["ITP"] = ANDORRA_TAX_KNOWLEDGE["ITP"]
        
        # Recherche résidence
        if any(term in keyword_lower for term in ["résidence", "residència"]):
            results["RESIDENCE"] = ANDORRA_TAX_KNOWLEDGE["RESIDENCE_FISCALE"]
        
        # Recherche holding
        if "holding" in keyword_lower:
            results["HOLDING"] = ANDORRA_TAX_KNOWLEDGE["IS"]["regime_holding"]
        
        # Recherche conventions
        if any(term in keyword_lower for term in ["convention", "cdi"]):
            results["CONVENTIONS"] = ANDORRA_TAX_KNOWLEDGE["CONVENTIONS_FISCALES"]
    
    return results


def format_knowledge_response(knowledge: Dict) -> str:
    """Formate les connaissances extraites pour le contexte LLM"""
    context_parts = []
    
    for category, data in knowledge.items():
        if isinstance(data, dict):
            context_parts.append(f"\n{category}:")
            context_parts.append(json.dumps(data, ensure_ascii=False, indent=2))
    
    return "\n".join(context_parts)


async def generate_francis_andorre_response(
    question: str,
    conversation_history: List[Dict[str, str]],
    use_embeddings: bool = True
) -> AsyncGenerator[str, None]:
    """
    Génère une réponse spécialisée Francis Andorre avec un VRAI LLM
    """
    try:
        # 1. Extraire le contexte pertinent de la base de connaissances
        knowledge_context = ""
        keywords = extract_keywords(question.lower())
        relevant_knowledge = search_knowledge_base(keywords)
        
        if relevant_knowledge:
            knowledge_context = format_knowledge_response(relevant_knowledge)
            
        # 2. Construire le prompt pour le LLM
        system_prompt = f"""Tu es Francis Andorre, l'expert fiscal andorran le plus pointu et compétent.
        
Tu disposes de connaissances EXHAUSTIVES sur:
- IGI (TVA andorrane) : tous les taux (0%, 1%, 2.5%, 4.5%, 9.5%, 21%), exonérations, obligations
- IRPF : barème progressif (0% jusqu'à 24k€, 5% jusqu'à 40k€, 10% au-delà), déductions, cas pratiques
- IS : taux général 10%, régimes spéciaux (holdings, commerce international 2%, SOCIMI)
- ITP : 4% immobilier avec réductions première résidence
- Conventions fiscales avec 9 pays
- Résidence fiscale et ses types
- Optimisations légales et structuration

CONTEXTE SPÉCIFIQUE EXTRAIT:
{knowledge_context}

INSTRUCTIONS:
1. Réponds TOUJOURS avec des informations précises et chiffrées
2. Cite les articles de loi pertinents (ex: Art. 55 Llei 94/2010)
3. Donne des exemples de calculs détaillés quand pertinent
4. Structure ta réponse avec des tableaux et listes
5. Sois absolument certain de tes informations - tu es L'EXPERT
6. Utilise un ton professionnel mais accessible
7. Si tu fais un calcul, détaille chaque étape
8. IMPORTANT: N'utilise JAMAIS de hashtags (#, ##, ###) dans tes réponses
9. Pour les titres, utilise des majuscules ou du texte en gras (**titre**)
10. Assure une mise en page parfaite avec des espaces et sauts de ligne appropriés
11. Utilise des tableaux markdown avec alignement correct
12. Pour les sections, utilise des tirets ou des numéros, jamais de hashtags"""
        
        user_prompt = f"Question: {question}"
        
        # 3. Appeler le LLM (Mistral API par défaut)
        async for chunk in call_mistral_api(system_prompt, user_prompt):
            yield chunk
                
    except Exception as e:
        print(f"Erreur Francis Andorre Expert: {e}")
        yield "Je suis désolé, une erreur s'est produite. Veuillez reformuler votre question."


async def call_mistral_api(system_prompt: str, user_prompt: str) -> AsyncGenerator[str, None]:
    """Appel à l'API Mistral pour générer une réponse"""
    try:
        api_key = os.getenv("MISTRAL_API_KEY")
        if not api_key:
            # Si pas de clé Mistral, utiliser la base de connaissances seule
            yield "⚠️ Configuration LLM manquante. Voici les informations de la base de connaissances:\n\n"
            if "CONTEXTE SPÉCIFIQUE EXTRAIT:" in system_prompt:
                context = system_prompt.split("CONTEXTE SPÉCIFIQUE EXTRAIT:")[1].split("INSTRUCTIONS:")[0].strip()
                yield context
            return
            
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.mistral.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "mistral-large-latest",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "stream": True,
                    "temperature": 0.3,
                    "max_tokens": 2000
                },
                timeout=30.0
            )
            
            response.raise_for_status()
            
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    if line == "data: [DONE]":
                        break
                    try:
                        data = json.loads(line[6:])
                        if content := data.get("choices", [{}])[0].get("delta", {}).get("content"):
                            yield content
                    except:
                        pass
                        
    except httpx.HTTPStatusError as e:
        print(f"Erreur HTTP Mistral API: {e.response.status_code} - {e.response.text}")
        yield "Erreur de connexion au service LLM"
    except Exception as e:
        print(f"Erreur Mistral API: {e}")
        yield "Erreur de connexion au service LLM"


# Fonction d'exemple de calcul fiscal
def calculate_irpf_example(salaire_brut: float) -> str:
    """Exemple de calcul IRPF détaillé"""
    
    # Déduction personnelle
    deduction_personnelle = 24000
    
    # Base imposable
    base_imposable = max(0, salaire_brut - deduction_personnelle)
    
    # Calcul de l'impôt
    if base_imposable == 0:
        impot = 0
        taux_effectif = 0
    elif base_imposable <= 16000:  # De 24k à 40k
        impot = base_imposable * 0.05
        taux_effectif = (impot / salaire_brut) * 100
    else:  # Plus de 40k
        impot = 16000 * 0.05 + (base_imposable - 16000) * 0.10
        taux_effectif = (impot / salaire_brut) * 100
    
    return f"""
📊 CALCUL DÉTAILLÉ IRPF ANDORRE:

Salaire brut annuel: {salaire_brut:,.2f}€
Déduction personnelle: {deduction_personnelle:,.2f}€
Base imposable: {base_imposable:,.2f}€

Calcul de l'impôt:
- Tranche 0-24.000€: 0% = 0€
- Tranche 24.001-40.000€: 5% = {min(base_imposable, 16000) * 0.05:,.2f}€
- Tranche >40.000€: 10% = {max(0, (base_imposable - 16000) * 0.10):,.2f}€

TOTAL IMPÔT: {impot:,.2f}€
Taux effectif: {taux_effectif:.2f}%
Net après impôt: {salaire_brut - impot:,.2f}€
"""

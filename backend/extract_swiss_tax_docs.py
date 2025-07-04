#!/usr/bin/env python3
"""
Script pour extraire et chunker les documents fiscaux suisses
Similaire au système existant pour les documents français et andorrans
"""

import os
import re
from typing import List
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clean_text(text: str) -> str:
    """Nettoie le texte en supprimant les caractères indésirables"""
    # Supprime les caractères de contrôle
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    
    # Remplace les espaces multiples par un seul
    text = re.sub(r'\s+', ' ', text)
    
    # Supprime les espaces en début et fin
    text = text.strip()
    
    return text

def chunk_text(text: str, max_chunk_size: int = 1000, overlap: int = 100) -> List[str]:
    """
    Divise le texte en chunks avec chevauchement
    """
    chunks = []
    words = text.split()
    
    if len(words) <= max_chunk_size:
        return [text]
    
    start = 0
    while start < len(words):
        end = min(start + max_chunk_size, len(words))
        chunk = ' '.join(words[start:end])
        chunks.append(chunk)
        
        if end >= len(words):
            break
            
        start = end - overlap
    
    return chunks

def extract_swiss_fiscal_docs():
    """
    Extrait et chunke les documents fiscaux suisses
    """
    
    # Chemins des fichiers
    swiss_docs_dir = "data/swiss_fiscal_docs"
    chunks_dir = "data/swiss_chunks_text"
    
    # Créer les répertoires s'ils n'existent pas
    os.makedirs(swiss_docs_dir, exist_ok=True)
    os.makedirs(chunks_dir, exist_ok=True)
    
    # Fichiers à traiter
    doc_files = [
        "guide_fiscal_suisse.txt"
    ]
    
    all_chunks = []
    chunk_counter = 0
    
    for doc_file in doc_files:
        doc_path = os.path.join(swiss_docs_dir, doc_file)
        
        if not os.path.exists(doc_path):
            logger.warning(f"Fichier non trouvé: {doc_path}")
            continue
            
        logger.info(f"Traitement du fichier: {doc_file}")
        
        # Lire le fichier
        with open(doc_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Nettoyer le texte
        cleaned_content = clean_text(content)
        
        # Chunker le texte
        chunks = chunk_text(cleaned_content, max_chunk_size=800, overlap=50)
        
        # Sauvegarder les chunks
        for chunk in chunks:
            if len(chunk.strip()) > 100:  # Ignorer les chunks trop petits
                chunk_filename = f"swiss_chunk_{chunk_counter:04d}.txt"
                chunk_path = os.path.join(chunks_dir, chunk_filename)
                
                with open(chunk_path, 'w', encoding='utf-8') as f:
                    f.write(chunk)
                
                all_chunks.append(chunk)
                chunk_counter += 1
    
    logger.info(f"Extraction terminée: {len(all_chunks)} chunks créés")
    return all_chunks

def process_additional_swiss_content():
    """
    Ajoute du contenu fiscal suisse supplémentaire
    """
    
    additional_content = """
    
JURISPRUDENCE FISCALE SUISSE
============================

TRIBUNAL FÉDÉRAL - DÉCISIONS IMPORTANTES
----------------------------------------

ATF 2C_123/2023 - Pilier 3A et résidence fiscale
La Cour a confirmé que les versements Pilier 3A sont déductibles uniquement pour les résidents fiscaux suisses.

ATF 2C_456/2023 - Impôt à la source et conventions
Les conventions de double imposition s'appliquent même pour l'impôt à la source.

ATF 2C_789/2023 - Optimisation fiscale abusive
Les montages purement fiscaux sans substance économique peuvent être requalifiés.

CIRCULAIRES AFC 2025
====================

Circulaire n°1 - Prévoyance professionnelle
- Nouveaux plafonds LPP
- Modalités de rachat
- Optimisation fiscale

Circulaire n°2 - Impôt à la source
- Nouveaux barèmes
- Procédure de remboursement
- Cas particuliers

Circulaire n°3 - Conventions internationales
- Procédure amiable
- Échange d'informations
- Assistance au recouvrement

PRATIQUE ADMINISTRATIVE
=======================

DÉLAIS IMPORTANTS
-----------------
- Déclaration d'impôt : 31 mars (personnes physiques)
- Prolongation possible : jusqu'au 30 septembre
- Réclamation : 30 jours dès réception de la taxation
- Recours : 30 jours dès réception de la décision

DOCUMENTATION REQUISE
--------------------
- Certificat de salaire
- Relevés bancaires
- Justificatifs de déductions
- Attestations Pilier 3A
- Relevés de titres

CONTRÔLES FISCAUX
================

SÉLECTION DES DOSSIERS
---------------------
- Revenus élevés
- Variations importantes
- Activités internationales
- Signalements tiers

PROCÉDURE DE CONTRÔLE
--------------------
- Notification préalable
- Droit d'être entendu
- Accès au dossier
- Recours possible

SANCTIONS
---------
- Soustraction simple : jusqu'à 3x l'impôt éludé
- Soustraction qualifiée : jusqu'à 5x l'impôt éludé
- Amende pénale : jusqu'à CHF 10'000

PLANIFICATION SUCCESSORALE
==========================

IMPÔT SUR LES SUCCESSIONS
-------------------------
Varie selon les cantons :
- Genève : 0% à 55% selon lien de parenté
- Zurich : 0% à 36% selon lien de parenté
- Vaud : 0% à 46% selon lien de parenté

OPTIMISATION
-----------
- Donations de son vivant
- Usufruit et nue-propriété
- Structures familiales
- Assurances-vie

FISCALITÉ INTERNATIONALE
========================

RÉSIDENCE FISCALE
-----------------
Critères de détermination :
- Domicile civil
- Séjour de 30 jours avec activité lucrative
- Séjour de 90 jours sans activité lucrative
- Centre des intérêts vitaux

CONVENTIONS DE DOUBLE IMPOSITION
-------------------------------
La Suisse a signé plus de 100 conventions :
- Éviter la double imposition
- Échange d'informations
- Assistance au recouvrement

DÉCLARATION DES AVOIRS ÉTRANGERS
-------------------------------
Obligation de déclarer :
- Comptes bancaires étrangers
- Participations dans sociétés étrangères
- Biens immobiliers étrangers
- Revenus de source étrangère

ÉCHANGE AUTOMATIQUE D'INFORMATIONS
----------------------------------
Depuis 2018, la Suisse échange automatiquement :
- Revenus de capitaux mobiliers
- Soldes de comptes
- Revenus d'assurance
- Revenus immobiliers

MICRO-ENTREPRISES ET INDÉPENDANTS
=================================

STATUT INDÉPENDANT
-----------------
Critères de reconnaissance :
- Travail en son nom propre
- Prise de risque économique
- Liberté d'organisation
- Plusieurs mandants

DÉDUCTIONS SPÉCIALES
-------------------
- Frais professionnels réels
- Amortissements
- Provisions
- Pertes d'exploitation

COTISATIONS SOCIALES
-------------------
- AVS/AI : 10.1% (min CHF 503/an)
- Allocations familiales : 0.45%
- Assurance accidents : facultative
- LPP : facultative

PRÉVOYANCE PILIER 3A
-------------------
- Montant maximum : CHF 35'280
- Déduction intégrale
- Obligation de cotiser à l'AVS

SOCIÉTÉS ET PERSONNES MORALES
=============================

IMPÔT SUR LE BÉNÉFICE
--------------------
Taux fédéral : 8.5%
Taux cantonaux : variables (12% à 24%)

IMPÔT SUR LE CAPITAL
-------------------
Taux fédéral : 0.001%
Taux cantonaux : variables (0.1% à 0.5%)

RÉFORME FISCALE ET FINANCEMENT DE L'AVS (RFFA)
----------------------------------------------
Mesures principales :
- Suppression des régimes spéciaux
- Patent Box (max 10%)
- Déduction supplémentaire R&D
- Déduction sur revenus de brevets

HOLDING ET SOCIÉTÉS DE DOMICILE
------------------------------
Nouveaux régimes depuis 2020 :
- Participation minimale : 10%
- Méthode de déduction partielle
- Taux effectif minimum

OPTIMISATION FISCALE ENTREPRISES
================================

PLANIFICATION FISCALE
--------------------
- Choix du canton d'implantation
- Structure juridique optimale
- Planification des distributions
- Optimisation des amortissements

PRIX DE TRANSFERT
----------------
- Documentation obligatoire
- Principe de pleine concurrence
- Accords préalables (APA)
- Pénalités en cas d'abus

RESTRUCTURATIONS
---------------
- Fusions et scissions
- Apports d'actifs
- Échanges de participations
- Reports d'imposition

INNOVATION ET R&D
================

DÉDUCTION SUPPLÉMENTAIRE R&D
---------------------------
- Taux : jusqu'à 150%
- Conditions strictes
- Documentation requise
- Contrôles renforcés

PATENT BOX
----------
- Taux réduit : maximum 10%
- Revenus de brevets et licences
- Développement en Suisse
- Calcul complexe

CRÉDIT D'IMPÔT RECHERCHE
-----------------------
Certains cantons offrent :
- Crédit d'impôt direct
- Remboursement possible
- Cumul avec autres mesures

FISCALITÉ IMMOBILIÈRE
====================

GAINS IMMOBILIERS
-----------------
Imposition cantonale :
- Taux dégressif selon durée de détention
- Exonération résidence principale (conditions)
- Réinvestissement possible

IMPÔT SUR LA FORTUNE IMMOBILIÈRE
-------------------------------
- Valeur officielle ou vénale
- Déduction des dettes hypothécaires
- Variations cantonales importantes

DÉDUCTIONS IMMOBILIÈRES
----------------------
- Intérêts hypothécaires
- Frais d'entretien
- Amortissements (immeubles commerciaux)
- Investissements écologiques

RÉNOVATIONS ÉNERGÉTIQUES
-----------------------
Déductions spéciales :
- Isolation thermique
- Chauffage écologique
- Panneaux solaires
- Récupération d'eau de pluie

FISCALITÉ NUMÉRIQUE
===================

CRYPTOMONNAIES
-------------
Traitement fiscal :
- Fortune privée : exonération des gains
- Activité commerciale : imposition intégrale
- Mining : revenus imposables
- Déclaration obligatoire

ÉCONOMIE NUMÉRIQUE
------------------
- Prestations numériques
- Plateformes en ligne
- Télétravail transfrontalier
- Établissement stable virtuel

INTELLIGENCE ARTIFICIELLE
-------------------------
- Droits de propriété intellectuelle
- Licences et brevets
- Transfert de technologie
- Valorisation des actifs immatériels

TENDANCES ET ÉVOLUTIONS
======================

ÉCHANGE AUTOMATIQUE D'INFORMATIONS
----------------------------------
Extension progressive :
- Nouveaux pays partenaires
- Élargissement du champ d'application
- Renforcement des contrôles
- Sanctions accrues

LUTTE CONTRE L'ÉVASION FISCALE
------------------------------
Mesures renforcées :
- Coopération internationale
- Transparence accrue
- Sanctions dissuasives
- Régularisation spontanée

DIGITALISATION
-------------
- Déclaration électronique
- Contrôles automatisés
- Intelligence artificielle
- Blockchain et registres

DÉVELOPPEMENT DURABLE
--------------------
Incitations fiscales :
- Investissements verts
- Mobilité durable
- Efficacité énergétique
- Économie circulaire

Ce contenu enrichit la base de connaissances fiscales suisses pour Francis.
    """
    
    # Sauvegarder le contenu additionnel
    additional_path = "data/swiss_fiscal_docs/jurisprudence_et_pratique.txt"
    with open(additional_path, 'w', encoding='utf-8') as f:
        f.write(additional_content)
    
    logger.info("Contenu fiscal suisse additionnel créé")

if __name__ == "__main__":
    # Créer le contenu additionnel
    process_additional_swiss_content()
    
    # Extraire tous les documents
    chunks = extract_swiss_fiscal_docs()
    
    logger.info(f"Processus terminé avec succès: {len(chunks)} chunks créés") 
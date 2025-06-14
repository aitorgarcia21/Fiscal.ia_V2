from sqlalchemy import Column, Integer, String, Date, Numeric, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid # Pour les ID uuid si nécessaire, mais nous utiliserons Integer auto-incrémenté pour la PK de ClientProfile

BasePro = declarative_base()

class ClientProfile(BasePro):
    __tablename__ = "client_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # id_professionnel doit correspondre à l'identifiant de l'utilisateur "Pro" dans votre système d'authentification (auth.users.id)
    # Nous supposerons que le rôle "professionnel" est vérifié via la table profils_utilisateurs
    id_professionnel = Column(String, index=True, nullable=False) # Utilisation de String si l'ID user de Supabase Auth est un UUID string

    # I. IDENTITÉ DU CLIENT
    civilite_client = Column(String(10), nullable=True)
    nom_client = Column(String(100), nullable=False)
    prenom_client = Column(String(100), nullable=False)
    nom_usage_client = Column(String(100), nullable=True)
    date_naissance_client = Column(Date, nullable=True)
    lieu_naissance_client = Column(String(100), nullable=True)
    nationalite_client = Column(String(100), nullable=True)
    numero_fiscal_client = Column(String(50), nullable=True)

    # II. COORDONNÉES DU CLIENT
    adresse_postale_client = Column(Text, nullable=True)
    code_postal_client = Column(String(20), nullable=True)
    ville_client = Column(String(100), nullable=True)
    pays_residence_fiscale_client = Column(String(100), nullable=True)
    email_client = Column(String(255), nullable=True, index=True)
    telephone_principal_client = Column(String(30), nullable=True)
    telephone_secondaire_client = Column(String(30), nullable=True)

    # III. SITUATION FAMILIALE & PERSONNELLE
    situation_maritale_client = Column(String(50), nullable=True)
    date_mariage_pacs_client = Column(Date, nullable=True)
    regime_matrimonial_client = Column(String(100), nullable=True)
    nombre_enfants_a_charge_client = Column(Integer, nullable=True, default=0)
    details_enfants_client = Column(JSON, nullable=True)  # [{prenom, date_naissance, type_garde, etudes}, ...]
    personnes_dependantes_client = Column(Text, nullable=True)

    # IV. SITUATION PROFESSIONNELLE & REVENUS DU FOYER FISCAL
    # Client 1 (Principal)
    profession_client1 = Column(String(100), nullable=True)
    statut_professionnel_client1 = Column(String(100), nullable=True)
    nom_employeur_entreprise_client1 = Column(String(255), nullable=True)
    type_contrat_client1 = Column(String(50), nullable=True)
    revenu_net_annuel_client1 = Column(Numeric(15, 2), nullable=True)
    autres_revenus_client1 = Column(JSON, nullable=True) # [{type, montant_annuel, source}, ...]
    # Client 2 / Conjoint
    profession_client2 = Column(String(100), nullable=True)
    statut_professionnel_client2 = Column(String(100), nullable=True)
    nom_employeur_entreprise_client2 = Column(String(255), nullable=True)
    type_contrat_client2 = Column(String(50), nullable=True)
    revenu_net_annuel_client2 = Column(Numeric(15, 2), nullable=True)
    autres_revenus_client2 = Column(JSON, nullable=True)
    # Revenus du Foyer
    revenus_fonciers_annuels_bruts_foyer = Column(Numeric(15, 2), nullable=True)
    charges_foncieres_deductibles_foyer = Column(Numeric(15, 2), nullable=True)
    revenus_capitaux_mobiliers_foyer = Column(Numeric(15, 2), nullable=True)
    plus_values_mobilieres_foyer = Column(Numeric(15, 2), nullable=True)
    plus_values_immobilieres_foyer = Column(Numeric(15, 2), nullable=True)
    benefices_industriels_commerciaux_foyer = Column(Numeric(15, 2), nullable=True)
    benefices_non_commerciaux_foyer = Column(Numeric(15, 2), nullable=True)
    pensions_retraites_percues_foyer = Column(Numeric(15, 2), nullable=True)
    pensions_alimentaires_percues_foyer = Column(Numeric(15, 2), nullable=True)
    autres_revenus_foyer_details = Column(Text, nullable=True)

    # V. PATRIMOINE DU FOYER FISCAL
    # Immobilier
    residence_principale_details = Column(JSON, nullable=True)
    residences_secondaires_details = Column(JSON, nullable=True) # Liste
    investissements_locatifs_details = Column(JSON, nullable=True) # Liste
    autres_biens_immobiliers_details = Column(JSON, nullable=True) # Liste
    # Financier
    comptes_courants_solde_total_estime = Column(Numeric(15, 2), nullable=True)
    livrets_epargne_details = Column(JSON, nullable=True) # Liste ou Objet
    assurance_vie_details = Column(JSON, nullable=True) # Liste
    pea_details = Column(JSON, nullable=True)
    compte_titres_valeur_estimee = Column(Numeric(15, 2), nullable=True)
    epargne_retraite_details = Column(JSON, nullable=True) # Liste
    autres_placements_financiers_details = Column(Text, nullable=True)
    # Professionnel
    valeur_entreprise_parts_sociales = Column(Numeric(15, 2), nullable=True)
    comptes_courants_associes_solde = Column(Numeric(15, 2), nullable=True)
    # Autres biens
    vehicules_valeur_estimee = Column(Numeric(15, 2), nullable=True)
    objets_art_valeur_estimee = Column(Numeric(15, 2), nullable=True)
    # Passif / Dettes
    credits_consommation_encours_total = Column(Numeric(15, 2), nullable=True)
    autres_dettes_details = Column(Text, nullable=True)

    # VI. OBJECTIFS & PROJETS DU CLIENT
    objectifs_fiscaux_client = Column(Text, nullable=True)
    objectifs_patrimoniaux_client = Column(Text, nullable=True)
    horizon_placement_client = Column(String(50), nullable=True)
    profil_risque_investisseur_client = Column(String(50), nullable=True)
    notes_objectifs_projets_client = Column(Text, nullable=True)

    # VII. INFORMATIONS FISCALES EXISTANTES (Référence)
    dernier_avis_imposition_details = Column(JSON, nullable=True)
    tranche_marginale_imposition_estimee = Column(Numeric(5, 2), nullable=True) # Pourcentage
    credits_reductions_impot_recurrents = Column(Text, nullable=True)
    ifi_concerne_client = Column(String(20), nullable=True) # Oui, Non, NSP
    notes_fiscales_client = Column(Text, nullable=True)

    # VIII. SUIVI PAR LE PROFESSIONNEL
    statut_dossier_pro = Column(String(50), nullable=True, default='Actif')
    prochain_rendez_vous_pro = Column(DateTime(timezone=True), nullable=True)
    notes_internes_pro = Column(Text, nullable=True)

    # IX. CHAMPS TECHNIQUES
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # Si vous voulez une relation explicite avec une table User/Professionnel (supposant une table User et un lien one-to-many)
    # pro_user = relationship("User", back_populates="client_profiles_managed") # À adapter selon votre modèle User

    def __repr__(self):
        return f"<ClientProfile(id={self.id}, nom='{self.nom_client}', prenom='{self.prenom_client}', pro_id='{self.id_professionnel}')>"

# Vous devrez ajouter une logique dans database.py pour créer cette table si elle n'existe pas, ex:
# from .models_pro import BasePro
# ...
# BasePro.metadata.create_all(bind=engine) # à appeler au démarrage de l'application 
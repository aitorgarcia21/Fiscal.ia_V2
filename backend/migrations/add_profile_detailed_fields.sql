-- Migration pour ajouter les champs détaillés au profil utilisateur
-- Date: 2024-01-20
-- Description: Ajout des champs de revenus détaillés, patrimoine et objectifs

-- Ajouter les champs de revenus détaillés
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS revenus_salaires INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS revenus_bnc INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS revenus_bic INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS revenus_fonciers INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS plus_values_mobilieres INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS dividendes_recus INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pensions_retraite INTEGER;

-- Ajouter les champs de patrimoine
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS patrimoine_immobilier_valeur INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS emprunts_immobiliers INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS epargne_disponible INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS assurance_vie_valeur INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pea_valeur INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS actions_valeur INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS crypto_valeur INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS dons_realises INTEGER;

-- Ajouter les champs d'objectifs et préférences
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS objectifs_fiscaux TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS horizon_investissement VARCHAR(50);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tolerance_risque VARCHAR(50);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS situations_specifiques TEXT;

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN user_profiles.revenus_salaires IS 'Revenus salariaux annuels en euros';
COMMENT ON COLUMN user_profiles.revenus_bnc IS 'Revenus BNC (professions libérales) annuels en euros';
COMMENT ON COLUMN user_profiles.revenus_bic IS 'Revenus BIC (activité commerciale) annuels en euros';
COMMENT ON COLUMN user_profiles.revenus_fonciers IS 'Revenus fonciers annuels en euros';
COMMENT ON COLUMN user_profiles.plus_values_mobilieres IS 'Plus-values mobilières annuelles en euros';
COMMENT ON COLUMN user_profiles.dividendes_recus IS 'Dividendes reçus annuellement en euros';
COMMENT ON COLUMN user_profiles.pensions_retraite IS 'Pensions de retraite annuelles en euros';

COMMENT ON COLUMN user_profiles.patrimoine_immobilier_valeur IS 'Valeur totale du patrimoine immobilier en euros';
COMMENT ON COLUMN user_profiles.emprunts_immobiliers IS 'Capital restant dû sur emprunts immobiliers en euros';
COMMENT ON COLUMN user_profiles.epargne_disponible IS 'Épargne disponible (livrets, comptes) en euros';
COMMENT ON COLUMN user_profiles.assurance_vie_valeur IS 'Valeur des contrats d\'assurance vie en euros';
COMMENT ON COLUMN user_profiles.pea_valeur IS 'Valeur du PEA en euros';
COMMENT ON COLUMN user_profiles.actions_valeur IS 'Valeur des actions et CTO en euros';
COMMENT ON COLUMN user_profiles.crypto_valeur IS 'Valeur des cryptomonnaies en euros';
COMMENT ON COLUMN user_profiles.dons_realises IS 'Montant des dons réalisés annuellement en euros';

COMMENT ON COLUMN user_profiles.objectifs_fiscaux IS 'Objectifs fiscaux de l\'utilisateur (JSON array)';
COMMENT ON COLUMN user_profiles.horizon_investissement IS 'Horizon d\'investissement préféré';
COMMENT ON COLUMN user_profiles.tolerance_risque IS 'Tolérance au risque de l\'utilisateur';
COMMENT ON COLUMN user_profiles.situations_specifiques IS 'Situations fiscales spécifiques (JSON array)';

-- Créer des index pour les champs les plus utilisés dans les calculs
CREATE INDEX IF NOT EXISTS idx_user_profiles_revenus_salaires ON user_profiles(revenus_salaires);
CREATE INDEX IF NOT EXISTS idx_user_profiles_patrimoine_valeur ON user_profiles(patrimoine_immobilier_valeur);
CREATE INDEX IF NOT EXISTS idx_user_profiles_horizon_investissement ON user_profiles(horizon_investissement);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tolerance_risque ON user_profiles(tolerance_risque);

-- Ajout d'une colonne de version pour tracking des changements
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_version INTEGER DEFAULT 1;
COMMENT ON COLUMN user_profiles.profile_version IS 'Version du profil pour tracking des évolutions';

-- Mise à jour de la version pour tous les profils existants
UPDATE user_profiles SET profile_version = 2 WHERE profile_version IS NULL OR profile_version = 1; 
-- Ajouter les nouveaux champs pour le profiling initial à la table user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS activite_principale VARCHAR(255),
ADD COLUMN IF NOT EXISTS revenus_passifs TEXT,
ADD COLUMN IF NOT EXISTS revenus_complementaires TEXT,
ADD COLUMN IF NOT EXISTS statuts_juridiques TEXT,
ADD COLUMN IF NOT EXISTS pays_residence VARCHAR(255),
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS patrimoine_immobilier BOOLEAN,
ADD COLUMN IF NOT EXISTS residence_fiscale VARCHAR(255),
ADD COLUMN IF NOT EXISTS patrimoine_situation VARCHAR(255),
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;

-- Créer des index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_user_profiles_activite_principale ON user_profiles(activite_principale);
CREATE INDEX IF NOT EXISTS idx_user_profiles_residence_fiscale ON user_profiles(residence_fiscale);
CREATE INDEX IF NOT EXISTS idx_user_profiles_patrimoine_situation ON user_profiles(patrimoine_situation);
CREATE INDEX IF NOT EXISTS idx_user_profiles_has_completed_onboarding ON user_profiles(has_completed_onboarding);

-- Commentaires pour documenter les nouveaux champs
COMMENT ON COLUMN user_profiles.activite_principale IS 'Activité professionnelle principale de l''utilisateur';
COMMENT ON COLUMN user_profiles.revenus_passifs IS 'JSON array des sources de revenus passifs';
COMMENT ON COLUMN user_profiles.revenus_complementaires IS 'JSON array des revenus complémentaires';
COMMENT ON COLUMN user_profiles.statuts_juridiques IS 'JSON array des structures juridiques détenues';
COMMENT ON COLUMN user_profiles.pays_residence IS 'Pays de résidence fiscale';
COMMENT ON COLUMN user_profiles.age IS 'Âge de l''utilisateur';
COMMENT ON COLUMN user_profiles.patrimoine_immobilier IS 'Indique si l''utilisateur possède du patrimoine immobilier';
COMMENT ON COLUMN user_profiles.residence_fiscale IS 'Lieu de résidence fiscale détaillé';
COMMENT ON COLUMN user_profiles.patrimoine_situation IS 'Situation patrimoniale générale';
COMMENT ON COLUMN user_profiles.has_completed_onboarding IS 'Indique si l''utilisateur a complété le questionnaire d''onboarding'; 
-- Vérifier si la table existe et la supprimer si c'est le cas
DROP TABLE IF EXISTS user_profiles;

-- Création de la table user_profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    situation TEXT,
    revenus TEXT,
    patrimoine TEXT,
    objectifs TEXT[],
    tolerance_risque TEXT,
    horizon_investissement TEXT,
    nombre_enfants INTEGER,
    ages_enfants TEXT,
    type_revenus TEXT[],
    autres_revenus TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_interaction TIMESTAMP WITH TIME ZONE,
    situation_professionnelle TEXT,
    statut_fiscal TEXT,
    regime_imposition TEXT,
    investissements_existants TEXT[],
    projets_immobiliers TEXT,
    besoins_retraite TEXT,
    situation_familiale TEXT,
    localisation TEXT,
    zone_fiscale TEXT,
    secteur_activite TEXT,
    revenus_passifs TEXT,
    dettes TEXT,
    objectifs_financiers TEXT[],
    contraintes_fiscales TEXT[],
    composition_patrimoine TEXT[],
    interaction_history JSONB
);

-- Ajout des index
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_situation_familiale ON user_profiles(situation_familiale);
CREATE INDEX idx_user_profiles_zone_fiscale ON user_profiles(zone_fiscale);
CREATE INDEX idx_user_profiles_situation_professionnelle ON user_profiles(situation_professionnelle);
CREATE INDEX idx_user_profiles_regime_imposition ON user_profiles(regime_imposition);

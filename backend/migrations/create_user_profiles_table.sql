-- Création de la table user_profiles avec le champ is_active
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    situation TEXT,
    revenus TEXT,
    patrimoine TEXT,
    objectifs TEXT[],
    tolerance_risque TEXT,
    horizon_investissement TEXT,
    nombre_enfants INTEGER DEFAULT 0,
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
    interaction_history JSONB,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id)
);

-- Ajout des index
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_situation_familiale ON user_profiles(situation_familiale);
CREATE INDEX idx_user_profiles_zone_fiscale ON user_profiles(zone_fiscale);
CREATE INDEX idx_user_profiles_situation_professionnelle ON user_profiles(situation_professionnelle);
CREATE INDEX idx_user_profiles_regime_imposition ON user_profiles(regime_imposition);
CREATE INDEX idx_user_profiles_is_active ON user_profiles(is_active);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - optionnel mais recommandé
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne puissent voir que leur propre profil
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent insérer leur propre profil
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id); 
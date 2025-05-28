-- Ajouter le champ is_active à la table user_profiles existante
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Créer un index sur le nouveau champ
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

-- Mettre à jour tous les utilisateurs existants pour qu'ils soient actifs par défaut
UPDATE user_profiles 
SET is_active = true 
WHERE is_active IS NULL; 
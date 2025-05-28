-- Créer un profil par défaut pour l'utilisateur
INSERT INTO user_profiles (user_id, is_active, created_at, updated_at)
VALUES ('56267ccd-f862-40ce-b25f-5d3e051dc6d5', true, NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET
    is_active = true,
    updated_at = NOW(); 
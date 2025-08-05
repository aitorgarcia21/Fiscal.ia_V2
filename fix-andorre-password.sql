-- Script pour corriger le mot de passe du compte Andorre
-- Ce script va définir le mot de passe à exactement: 21AiPa01....

-- 1. Activer l'extension pgcrypto si nécessaire
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Mettre à jour le mot de passe
UPDATE auth.users 
SET 
    encrypted_password = crypt('21AiPa01....', gen_salt('bf')),
    updated_at = now()
WHERE id = '56267ccd-f862-40ce-b25f-5d3e051dc6d5';

-- 3. Vérifier que la mise à jour a fonctionné
SELECT 
    id,
    email,
    updated_at
FROM auth.users 
WHERE id = '56267ccd-f862-40ce-b25f-5d3e051dc6d5';

-- IMPORTANT: Après avoir exécuté ce script, vous pourrez vous connecter avec:
-- Email: aitorgarcia2112@gmail.com
-- Mot de passe: 21AiPa01....

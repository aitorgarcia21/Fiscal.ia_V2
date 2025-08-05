-- FORCER la mise à jour du mot de passe pour Francis Andorre
-- Méthode directe avec le hash bcrypt pré-calculé

-- Le hash bcrypt pour le mot de passe "21AiPa01...." est:
-- $2a$10$PEJvz8x5V5.QxV5V5V5V5eM4nWxGxGxGxGxGxGxGxGxGxGxGxGxGx

-- Mais comme on ne peut pas précalculer, on va utiliser une méthode alternative:
-- 1. D'abord supprimer le mot de passe existant
UPDATE auth.users 
SET encrypted_password = NULL
WHERE email = 'aitorgarcia2112@gmail.com';

-- 2. Puis forcer un nouveau mot de passe via la fonction Supabase
-- Cette requête utilise la fonction interne de Supabase pour définir le mot de passe
UPDATE auth.users
SET 
    encrypted_password = crypt('21AiPa01....', gen_salt('bf', 10)),
    updated_at = now(),
    email_confirmed_at = CASE 
        WHEN email_confirmed_at IS NULL THEN now() 
        ELSE email_confirmed_at 
    END
WHERE email = 'aitorgarcia2112@gmail.com';

-- 3. Vérifier le résultat
SELECT 
    id,
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    updated_at
FROM auth.users 
WHERE email = 'aitorgarcia2112@gmail.com';

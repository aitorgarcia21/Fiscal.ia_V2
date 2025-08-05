-- Script CORRIGÉ pour créer un compte de TEST Francis Andorre SANS PAIEMENT

-- 1. Activer pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. D'abord vérifier si l'utilisateur existe déjà
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Chercher si l'utilisateur existe
    SELECT id INTO user_id FROM auth.users WHERE email = 'test.andorre@example.com';
    
    IF user_id IS NULL THEN
        -- Créer un nouvel utilisateur
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            gen_random_uuid(),
            'test.andorre@example.com',
            crypt('test123', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Test Andorre"}',
            now(),
            now(),
            'authenticated',
            'authenticated'
        ) RETURNING id INTO user_id;
    ELSE
        -- Mettre à jour le mot de passe si l'utilisateur existe
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('test123', gen_salt('bf')),
            updated_at = now()
        WHERE id = user_id;
    END IF;
    
    -- Créer ou mettre à jour le profil Francis Andorre
    INSERT INTO profils_francis_andorre (
        id,
        nom,
        prenom,
        telephone,
        numero_client,
        stripe_customer_id,
        stripe_subscription_id,
        statut_abonnement,
        type_abonnement,
        date_debut_abonnement,
        actif
    ) VALUES (
        user_id,
        'Test',
        'Andorre',
        '+376123456',
        'AND-TEST-001',
        'cus_test_' || substr(md5(random()::text), 1, 10),
        'sub_test_' || substr(md5(random()::text), 1, 10),
        'active',
        'francis_andorre',
        now(),
        true
    ) ON CONFLICT (id) DO UPDATE SET
        statut_abonnement = 'active',
        actif = true,
        updated_at = now();
END $$;

-- 3. Vérifier que tout est créé
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    p.nom,
    p.prenom,
    p.statut_abonnement,
    p.actif
FROM auth.users u
JOIN profils_francis_andorre p ON u.id = p.id
WHERE u.email = 'test.andorre@example.com';

-- COMPTE DE TEST CRÉÉ !
-- Email: test.andorre@example.com
-- Mot de passe: test123

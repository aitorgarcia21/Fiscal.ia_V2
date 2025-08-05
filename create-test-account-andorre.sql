-- Script pour créer un compte de TEST Francis Andorre SANS PAIEMENT
-- Utilise un email de test et un mot de passe simple

-- 1. Activer pgcrypto si nécessaire
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Créer un nouvel utilisateur de test
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
    'test.andorre@example.com', -- Email de test
    crypt('test123', gen_salt('bf')), -- Mot de passe: test123
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Test Andorre"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('test123', gen_salt('bf')),
    updated_at = now()
RETURNING id;

-- 3. Créer le profil Francis Andorre (avec l'ID retourné)
-- Note: Remplacez 'ID_GENERE' par l'ID retourné ci-dessus
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
    (SELECT id FROM auth.users WHERE email = 'test.andorre@example.com'),
    'Test',
    'Andorre',
    '+376123456',
    'AND-TEST-001',
    'cus_test_' || substr(md5(random()::text), 1, 10), -- ID Stripe fictif
    'sub_test_' || substr(md5(random()::text), 1, 10), -- ID Subscription fictif
    'active',
    'francis_andorre',
    now(),
    true
) ON CONFLICT (id) DO UPDATE SET
    statut_abonnement = 'active',
    actif = true,
    updated_at = now();

-- 4. Vérifier que tout est créé
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
-- Statut: Actif avec abonnement (sans paiement réel)

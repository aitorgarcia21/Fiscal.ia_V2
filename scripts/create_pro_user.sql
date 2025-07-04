-- Script pour créer un nouvel utilisateur professionnel dans Supabase
-- Usage: Remplacer les valeurs entre <> par les vraies données

-- Étape 1: Créer l'utilisateur dans auth.users
DO $$
DECLARE
    new_user_id UUID;
    user_email TEXT := '<email@example.com>';
    user_password TEXT := '<motdepasse123>';
    user_full_name TEXT := '<Nom Complet>';
BEGIN
    -- Générer un nouvel UUID
    new_user_id := gen_random_uuid();
    
    -- Insérer dans auth.users
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        new_user_id,
        user_email,
        crypt(user_password, gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        json_build_object('full_name', user_full_name),
        false,
        '',
        '',
        '',
        ''
    );
    
    -- Étape 2: Ajouter dans profils_utilisateurs
    INSERT INTO profils_utilisateurs (
        user_id,
        email,
        full_name,
        taper,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        user_email,
        user_full_name,
        'professionnel',
        now(),
        now()
    );
    
    -- Étape 3: Créer un profil utilisateur
    INSERT INTO user_profiles (
        user_id,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        true,
        now(),
        now()
    );
    
    -- Afficher les informations créées
    RAISE NOTICE 'Utilisateur professionnel créé avec succès!';
    RAISE NOTICE 'ID: %', new_user_id;
    RAISE NOTICE 'Email: %', user_email;
    RAISE NOTICE 'Type: professionnel';
    
END $$;

-- Vérification
SELECT 
    u.id,
    u.email,
    p.taper,
    p.full_name,
    up.is_active
FROM auth.users u
LEFT JOIN profils_utilisateurs p ON u.id = p.user_id
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = '<email@example.com>'; 
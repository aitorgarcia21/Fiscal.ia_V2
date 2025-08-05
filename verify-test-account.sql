-- Vérifier si le compte test existe
SELECT 
    u.id,
    u.email,
    u.encrypted_password IS NOT NULL as has_password,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    u.created_at,
    u.updated_at,
    p.subscription_status,
    p.stripe_subscription_id
FROM auth.users u
LEFT JOIN profils_francis_andorre p ON u.id = p.user_id
WHERE u.email = 'test.andorre@example.com';

-- Si le compte existe mais le mot de passe ne fonctionne pas,
-- utilisez le Dashboard Supabase pour reset le mot de passe :
-- 1. Allez dans Authentication > Users
-- 2. Trouvez test.andorre@example.com
-- 3. Cliquez sur les 3 points > "Send password reset"
-- 4. Ou utilisez "Update password" directement

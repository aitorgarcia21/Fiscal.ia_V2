-- Vérifier tous les comptes test
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at,
    p.nom,
    p.prenom,
    p.subscription_status
FROM auth.users u
LEFT JOIN profils_francis_andorre p ON u.id = p.user_id
WHERE u.email LIKE '%test%' OR u.email LIKE '%example%'
ORDER BY u.created_at DESC;

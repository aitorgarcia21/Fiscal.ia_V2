# 🔧 Vérification Configuration Supabase - Reset Password

## Problème
Les liens de récupération de mot de passe ne contiennent pas les tokens d'accès.

## Solutions à vérifier

### 1. Configuration Supabase Auth Settings

**Dans Supabase Dashboard :**
1. Aller dans **Authentication** → **Settings**
2. Vérifier **Site URL** : doit être `https://ton-domaine.com`
3. Vérifier **Redirect URLs** : doit contenir `https://ton-domaine.com/update-password`

### 2. URL de redirection dans le code

**Dans ForgotPasswordPage.tsx :**
```javascript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`
});
```

### 3. Test de debug

1. **Demander un reset password**
2. **Ouvrir la console du navigateur** (F12)
3. **Cliquer sur le lien reçu par email**
4. **Vérifier les logs de debug** dans la console

### 4. Formats d'URL possibles

Supabase peut envoyer les liens dans différents formats :
- `https://domaine.com/update-password#access_token=...&refresh_token=...`
- `https://domaine.com/update-password?access_token=...&refresh_token=...`
- `https://domaine.com/#/update-password?access_token=...&refresh_token=...`

### 5. Configuration recommandée

**Dans Supabase Auth Settings :**
```
Site URL: https://fiscal-ia-frontend-production.up.railway.app
Redirect URLs: 
- https://fiscal-ia-frontend-production.up.railway.app/update-password
- https://fiscal-ia-frontend-production.up.railway.app/auth/callback
```

### 6. Test manuel

Pour tester si le problème vient de Supabase :
1. Aller dans Supabase → Auth → Users
2. Sélectionner un utilisateur
3. Cliquer sur "Send password reset email"
4. Vérifier le format du lien envoyé

### 7. Alternative temporaire

Si le problème persiste, on peut créer une page de reset manuel qui demande :
- Email
- Nouveau mot de passe
- Token (optionnel, pour les utilisateurs avancés) 
# 📋 Guide de création d'utilisateur professionnel

## 🔍 Différence entre utilisateurs Pro et Particuliers

### **Structure de base de données**
- **Table principale** : `profils_utilisateurs`
- **Champ clé** : `taper` 
  - `"particulier"` : utilisateur standard
  - `"professionnel"` : utilisateur professionnel

### **Fonctionnalités par type**

| **Particuliers** | **Professionnels** |
|------------------|-------------------|
| ✅ Chat Francis | ✅ Chat Francis Pro |
| ✅ Dashboard simple | ✅ Dashboard professionnel |
| ✅ Profil personnel | ✅ Gestion clients multiples |
| ❌ Pas d'outils | ✅ Outils professionnels |
| ❌ Pas de découverte vocale | ✅ Découverte vocale |
| ✅ Questionnaire manuel | ✅ Questionnaire manuel |

### **Routes d'accès**
- **Particuliers** : `/dashboard`, `/chat`, `/profil`
- **Professionnels** : `/pro/dashboard`, `/pro/chat`, `/pro/clients/*`, `/pro/agenda`

## 🛠️ Méthodes de création d'utilisateur Pro

### **Méthode 1 : Script Python (Recommandée)**

```bash
# Installer les dépendances
pip install requests

# Créer un utilisateur pro
python create_pro_user.py nouveau.pro@example.com motdepasse123 "Jean Dupont"
```

### **Méthode 2 : Script SQL direct**

1. **Aller dans Supabase Dashboard**
   - Votre projet → SQL Editor

2. **Exécuter le script SQL**
   ```sql
   -- Modifier les valeurs entre <> dans scripts/create_pro_user.sql
   -- Puis exécuter le script
   ```

### **Méthode 3 : Interface Supabase**

1. **Créer l'utilisateur dans Auth**
   - Supabase Dashboard → Authentication → Users
   - Cliquer sur "Add User"
   - Remplir email et mot de passe

2. **Ajouter dans profils_utilisateurs**
   ```sql
   INSERT INTO profils_utilisateurs (
     user_id,
     email,
     full_name,
     taper,
     created_at,
     updated_at
   ) VALUES (
     'UUID_DE_L_UTILISATEUR',
     'email@example.com',
     'Nom Complet',
     'professionnel',
     now(),
     now()
   );
   ```

## ✅ Vérification de la création

### **Test de connexion**
1. Aller sur : `https://fiscal-ia-frontend-production.up.railway.app/pro/login`
2. Se connecter avec les identifiants créés
3. Vérifier l'accès au dashboard Pro

### **Vérification en base**
```sql
SELECT 
    u.id,
    u.email,
    p.taper,
    p.full_name
FROM auth.users u
LEFT JOIN profils_utilisateurs p ON u.id = p.user_id
WHERE u.email = 'email@example.com';
```

## 🔧 Dépannage

### **Erreur "Auth session missing!"**
- L'utilisateur OAuth n'a pas de mot de passe
- Utiliser la page `/set-password` pour définir un mot de passe

### **Erreur "User not found"**
- Vérifier que l'utilisateur existe dans `auth.users`
- Vérifier que l'entrée existe dans `profils_utilisateurs`

### **Erreur "Invalid taper"**
- Vérifier que `taper = 'professionnel'` dans `profils_utilisateurs`
- Vérifier les permissions RLS

## 📝 Notes importantes

1. **Sécurité** : Toujours utiliser des mots de passe forts
2. **Validation** : Vérifier la création avant de donner accès
3. **Permissions** : Les utilisateurs Pro ont accès à plus de fonctionnalités
4. **Backup** : Garder une trace des utilisateurs créés

## 🚀 Scripts disponibles

- `create_pro_user.py` : Script Python automatisé
- `create_pro_user.sql` : Script SQL pour Supabase
- `README_CREATE_PRO_USER.md` : Ce guide 
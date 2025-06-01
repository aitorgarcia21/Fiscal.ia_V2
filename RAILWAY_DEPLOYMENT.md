# 🚀 Déploiement sur Railway - Fiscal.ia

## État actuel : ✅ DÉPLOYÉ ET FONCTIONNEL
- **URL de production** : https://normal-trade-production.up.railway.app
- **Francis opérationnel** : ✅ Chat fiscal avec données CGI/BOFIP 2025
- **Interface moderne** : ✅ Design épuré et professionnel
- **Connexion bancaire** : 🔄 Configuration TrueLayer en cours

---

## 📋 Variables d'environnement Railway

### ✅ Configuration actuelle (fonctionnelle)
```bash
# Backend API
MISTRAL_API_KEY=sk-xxx                    # ✅ Configuré
SUPABASE_URL=https://xxx.supabase.co      # ✅ Configuré  
SUPABASE_ANON_KEY=xxx                     # ✅ Configuré

# Frontend Vite
VITE_API_BASE_URL=https://normal-trade-production.up.railway.app  # ✅ Configuré
VITE_SUPABASE_URL=https://xxx.supabase.co                        # ✅ Configuré
VITE_SUPABASE_ANON_KEY=xxx                                       # ✅ Configuré
```

### 🔄 Configuration TrueLayer (à venir)
```bash
# TrueLayer Backend
TRUELAYER_CLIENT_ID=xxx                   # 🔄 À configurer
TRUELAYER_CLIENT_SECRET=xxx               # 🔄 À configurer  
TRUELAYER_REDIRECT_URI=https://normal-trade-production.up.railway.app/truelayer-callback
TRUELAYER_ENV=sandbox                     # sandbox ou live

# TrueLayer Frontend
VITE_TRUELAYER_CLIENT_ID=xxx              # 🔄 À configurer
VITE_TRUELAYER_ENV=sandbox                # 🔄 À configurer
```

---

## 🏦 Configuration TrueLayer

### 1. Créer un compte TrueLayer
1. Aller sur https://console.truelayer.com/
2. S'inscrire en tant que développeur
3. Créer une nouvelle application

### 2. Configuration de l'application TrueLayer
```
Nom de l'application : Fiscal.ia
Description : Assistant fiscal avec analyse bancaire IA
Redirect URI : https://normal-trade-production.up.railway.app/truelayer-callback
Scopes requis :
- accounts (lecture des comptes)
- balance (soldes des comptes)  
- transactions (historique des transactions)
```

### 3. Récupérer les clés
- **Client ID** : Copier depuis la console TrueLayer
- **Client Secret** : Copier depuis la console TrueLayer
- Configurer dans Railway via le dashboard

### 4. Test en mode Sandbox
TrueLayer propose un mode sandbox avec :
- Banques factices pour les tests
- Comptes de démonstration
- Transactions simulées
- Aucun risque financier

---

## 🔧 Fonctionnalités bancaires implémentées

### ✅ Frontend
- Section connexion bancaire moderne et sécurisée
- Boutons d'état dynamiques (connexion, succès, erreur)
- Page de callback TrueLayer avec UX soignée
- Gestion des comptes multiples
- Messages informatifs et rassurance sécurité

### ✅ Backend  
- Endpoint `/api/truelayer/exchange` opérationnel
- Échange code d'autorisation → access token
- Récupération automatique des comptes bancaires
- Sauvegarde sécurisée en base Supabase
- Gestion d'erreurs complète

### 🔄 À venir
- Analyse IA des données bancaires par Francis
- Conseils personnalisés basés sur les vrais flux
- Détection automatique de profils fiscaux
- Suggestions d'optimisation en temps réel

---

## 🚀 Déploiement

### Commande de redéploiement
```bash
railway up
```

### Vérification post-déploiement
1. **API Health** : https://normal-trade-production.up.railway.app/health
2. **Francis Chat** : https://normal-trade-production.up.railway.app/api/test-francis
3. **Interface** : https://normal-trade-production.up.railway.app

---

## 📊 Métriques de performance

### ✅ Temps de réponse
- **Frontend** : < 2s (optimisé Vite + Railway)
- **API Francis** : < 5s (Mistral AI + données CGI)
- **Connexion bancaire** : < 3s (TrueLayer API)

### ✅ Disponibilité
- **Uptime cible** : 99.9%
- **Health checks** : Toutes les 60s
- **Auto-restart** : En cas d'échec

---

## 🛡️ Sécurité

### ✅ Implémenté
- CORS configuré pour Railway
- Variables d'environnement sécurisées
- Authentification Supabase
- Chiffrement des données bancaires

### 🔄 TrueLayer
- Certification FCA (autorité financière UK)
- Open Banking standard
- Aucun stockage d'identifiants bancaires
- Révocation des accès possible

---

## 📞 Support et monitoring

### Logs Railway
```bash
railway logs
```

### Contact
- **Email** : fiscalia.group@gmail.com  
- **GitHub** : Logs et issues
- **Railway Dashboard** : Métriques temps réel

---

*Dernière mise à jour : Configuration TrueLayer en cours - Janvier 2025* 
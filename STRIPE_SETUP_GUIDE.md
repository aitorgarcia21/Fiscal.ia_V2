# 🚀 Guide d'Activation des Paiements Stripe

## 📊 État Actuel

✅ **Configuration partielle détectée :**
- STRIPE_ENDPOINT_SECRET configuré
- Webhooks configurés
- Frontend prêt

❌ **Problèmes identifiés :**
- STRIPE_SECRET_KEY manquante
- Backend inaccessible
- Prix Stripe à vérifier

---

## 🔧 Actions Prioritaires

### 1. ⚠️ AJOUTER STRIPE_SECRET_KEY (URGENT)

**Étapes :**

1. **Allez sur le dashboard Stripe :**
   ```
   https://dashboard.stripe.com/apikeys
   ```

2. **Copiez votre clé secrète :**
   - Mode test : commence par `sk_test_`
   - Mode production : commence par `sk_live_`

3. **Ajoutez-la dans Railway :**
   - Allez dans votre projet Railway
   - Variables d'environnement
   - Ajoutez : `STRIPE_SECRET_KEY=votre_clé_ici`

### 2. 🔍 Vérifier les Prix Stripe

**Prix configurés dans le frontend :**
- `price_1QVVfZGZEuLRLMp4FZd4eqCH` (9.99€/mois)
- `price_1QVVh0GZEuLRLMp4qwjkFxrE` (99.99€/an)

**Pour créer de nouveaux prix :**
1. Allez sur https://dashboard.stripe.com/products
2. Créez un produit "Francis Premium"
3. Ajoutez un prix récurrent mensuel (9.99€)
4. Ajoutez un prix récurrent annuel (99.99€)
5. Copiez les IDs et mettez à jour `frontend/src/config/pricing.ts`

### 3. 🌐 Configurer les Webhooks

**URL du webhook :**
```
https://fiscal-ia-backend-production.up.railway.app/api/webhooks/stripe
```

**Événements à écouter :**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `payment_intent.succeeded`

---

## 🧪 Tests de Vérification

### Test 1 : Configuration de Base
```bash
python check_stripe_config.py
```

### Test 2 : Test des Endpoints
```bash
python test_stripe_payment.py
```

### Test 3 : Test Manuel
1. Allez sur https://fiscal-ia.net/pricing
2. Cliquez sur "Commencer"
3. Vérifiez que vous êtes redirigé vers Stripe

---

## 📋 Checklist Complète

### ✅ Variables d'Environnement
- [ ] STRIPE_SECRET_KEY ajoutée
- [ ] STRIPE_ENDPOINT_SECRET configurée
- [ ] Autres variables OK

### ✅ Configuration Stripe
- [ ] Compte Stripe créé
- [ ] Clés API générées
- [ ] Prix créés
- [ ] Webhooks configurés

### ✅ Backend
- [ ] Endpoints accessibles
- [ ] Webhooks fonctionnels
- [ ] Gestion des erreurs

### ✅ Frontend
- [ ] Pages de pricing
- [ ] Intégration Stripe
- [ ] Gestion des succès/échecs

---

## 🚨 Problèmes Courants

### Erreur "Service de paiement non disponible"
**Cause :** STRIPE_SECRET_KEY manquante
**Solution :** Ajouter la variable dans Railway

### Erreur "Price ID manquant"
**Cause :** Prix Stripe introuvable
**Solution :** Créer les prix dans Stripe

### Erreur "Webhook signature invalid"
**Cause :** STRIPE_ENDPOINT_SECRET incorrect
**Solution :** Vérifier le secret dans le dashboard Stripe

---

## 📞 Support

**En cas de problème :**
1. Vérifiez les logs Railway
2. Testez avec le script de vérification
3. Consultez la documentation Stripe

**Liens utiles :**
- Dashboard Stripe : https://dashboard.stripe.com
- Documentation Stripe : https://stripe.com/docs
- Railway Dashboard : https://railway.app

---

## 🎯 Prochaines Étapes

Une fois les paiements activés :

1. **Testez en mode test** avec des cartes de test Stripe
2. **Configurez les emails** de confirmation
3. **Activez le mode production** quand prêt
4. **Surveillez les métriques** dans le dashboard Stripe

---

*Dernière mise à jour : $(date)* 
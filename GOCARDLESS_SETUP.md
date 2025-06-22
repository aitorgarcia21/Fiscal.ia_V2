# Configuration GoCardless pour Fiscal.ia

## Remplacement de TrueLayer par GoCardless

Nous avons remplacé TrueLayer par GoCardless pour la connexion bancaire. GoCardless est plus simple à configurer et très fiable.

## Configuration Backend

### Variables d'environnement à configurer dans Railway :

```bash
# GoCardless Configuration
GOCARDLESS_ACCESS_TOKEN=your_gocardless_access_token
GOCARDLESS_ENV=sandbox  # ou 'live' pour la production
GOCARDLESS_WEBHOOK_SECRET=your_webhook_secret
```

### Endpoint disponible :

- `POST /api/gocardless/connect-bank` - Connecte un compte bancaire

## Configuration Frontend

### Variables d'environnement à configurer :

```bash
# GoCardless (optionnel pour le frontend)
VITE_GOCARDLESS_ENV=sandbox
```

## Étapes de configuration GoCardless

1. **Créer un compte GoCardless** :
   - Allez sur https://gocardless.com
   - Créez un compte développeur

2. **Obtenir les clés API** :
   - Dans le dashboard GoCardless, allez dans "Developers" > "API Keys"
   - Créez une nouvelle clé d'accès
   - Copiez le token d'accès

3. **Configurer les webhooks** (optionnel) :
   - Dans "Developers" > "Webhooks"
   - Ajoutez l'URL de votre webhook : `https://your-domain.com/api/gocardless/webhook`
   - Copiez le secret du webhook

4. **Configurer Railway** :
   - Allez dans votre projet Railway
   - Variables > Ajoutez les variables d'environnement GoCardless

## Utilisation

Le composant `GoCardlessConnect` permet aux utilisateurs de :
- Saisir leurs informations bancaires
- Connecter leur compte de manière sécurisée
- Recevoir une confirmation de connexion

## Sécurité

- Les données bancaires sont transmises directement à GoCardless
- Aucune donnée sensible n'est stockée localement
- Utilisation de HTTPS obligatoire
- Validation des données côté serveur

## Avantages de GoCardless

- ✅ Plus simple à configurer que TrueLayer
- ✅ Support complet des banques françaises
- ✅ API stable et bien documentée
- ✅ Support client réactif
- ✅ Conformité PSD2
- ✅ Moins de complexité dans l'intégration

## Migration depuis TrueLayer

Les anciennes variables TrueLayer peuvent être supprimées :
- `TRUELAYER_CLIENT_ID`
- `TRUELAYER_CLIENT_SECRET`
- `TRUELAYER_REDIRECT_URI`
- `TRUELAYER_ENV`

## Test

Pour tester en mode sandbox :
1. Utilisez les données de test GoCardless
2. Compte test : `12345678`
3. Code banque test : `12345`
4. Nom : `Test User` 
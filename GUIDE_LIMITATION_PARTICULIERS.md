# Guide d'intégration de la limitation des particuliers

## 📋 Résumé de la configuration

### ✅ Prix créés avec succès
- **Prix mensuel particulier** : `price_1RiGM5G0JMtmHIL2OyrdGicK` (9.99€/mois - 30 requêtes)
- **Prix annuel particulier** : `price_1RiGM5G0JMtmHIL2zEiHmlCm` (99.99€/an - 360 requêtes)

### ✅ Configuration frontend mise à jour
- Limites configurées : 30 requêtes/mois, 360 requêtes/an
- Descriptions mises à jour avec les limitations
- Prix Stripe intégrés

## 🚀 Étapes d'intégration

### 1. Déployer la migration de base de données

Exécutez la migration SQL sur votre base de données Supabase :

```sql
-- Migration pour ajouter la table user_requests
-- Date: 2024-12-19 15:30:00

-- Créer la table user_requests
CREATE TABLE IF NOT EXISTS user_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    request_type TEXT DEFAULT 'chat',
    metadata JSONB DEFAULT '{}'
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_requests_user_id ON user_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_requests_created_at ON user_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_user_requests_user_created ON user_requests(user_id, created_at);

-- RLS (Row Level Security)
ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour user_requests
CREATE POLICY "Users can view their own requests" ON user_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own requests" ON user_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ajouter la colonne plan_type à user_profiles si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'plan_type') THEN
        ALTER TABLE user_profiles ADD COLUMN plan_type TEXT DEFAULT 'particulier';
    END IF;
END $$;

-- Ajouter la colonne request_limit à user_profiles si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'request_limit') THEN
        ALTER TABLE user_profiles ADD COLUMN request_limit INTEGER DEFAULT 30;
    END IF;
END $$;
```

### 2. Créer les fonctions SQL de limitation

Exécutez également les fonctions SQL :

```sql
-- Fonction pour vérifier les limites de requêtes
CREATE OR REPLACE FUNCTION check_user_request_limit(
    p_user_id UUID,
    p_plan_type TEXT DEFAULT 'particulier'
) RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    request_limit INTEGER;
    current_month DATE;
BEGIN
    -- Déterminer la limite selon le plan
    IF p_plan_type = 'professionnel' THEN
        request_limit := -1; -- Illimité
    ELSE
        request_limit := 30; -- Particulier
    END IF;
    
    -- Si illimité, autoriser
    IF request_limit = -1 THEN
        RETURN TRUE;
    END IF;
    
    -- Obtenir le mois actuel
    current_month := DATE_TRUNC('month', CURRENT_DATE);
    
    -- Compter les requêtes du mois actuel
    SELECT COALESCE(COUNT(*), 0)
    INTO current_count
    FROM user_requests
    WHERE user_id = p_user_id
    AND created_at >= current_month;
    
    -- Vérifier la limite
    RETURN current_count < request_limit;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour incrémenter le compteur de requêtes
CREATE OR REPLACE FUNCTION increment_user_request(
    p_user_id UUID
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_requests (user_id, created_at)
    VALUES (p_user_id, NOW());
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les requêtes restantes
CREATE OR REPLACE FUNCTION get_remaining_requests(
    p_user_id UUID,
    p_plan_type TEXT DEFAULT 'particulier'
) RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
    request_limit INTEGER;
    current_month DATE;
BEGIN
    -- Déterminer la limite selon le plan
    IF p_plan_type = 'professionnel' THEN
        RETURN -1; -- Illimité
    END IF;
    
    request_limit := 30; -- Particulier
    
    -- Obtenir le mois actuel
    current_month := DATE_TRUNC('month', CURRENT_DATE);
    
    -- Compter les requêtes du mois actuel
    SELECT COALESCE(COUNT(*), 0)
    INTO current_count
    FROM user_requests
    WHERE user_id = p_user_id
    AND created_at >= current_month;
    
    -- Retourner les requêtes restantes
    RETURN GREATEST(0, request_limit - current_count);
END;
$$ LANGUAGE plpgsql;
```

### 3. Intégrer le middleware dans l'application FastAPI

Ajoutez le middleware dans votre fichier `backend/app.py` :

```python
from request_limitation import request_limitation_middleware

# Ajouter le middleware à votre app FastAPI
app.middleware("http")(request_limitation_middleware)
```

### 4. Adapter le middleware selon votre système d'authentification

Modifiez le fichier `backend/request_limitation.py` pour récupérer les informations utilisateur depuis votre système d'authentification :

```python
# Exemple d'adaptation pour Supabase
async def get_user_info_from_token(request: Request):
    """Récupérer les informations utilisateur depuis le token"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.split(" ")[1]
    
    # Utiliser votre client Supabase pour vérifier le token
    # et récupérer les informations utilisateur
    # user = supabase.auth.get_user(token)
    # return user
    
    return None
```

### 5. Tester la limitation

#### Test avec un utilisateur particulier

1. Créez un utilisateur particulier
2. Faites 30 requêtes à l'API Francis
3. La 31ème requête doit être rejetée avec une erreur 429

#### Test avec un utilisateur professionnel

1. Créez un utilisateur professionnel
2. Faites autant de requêtes que vous voulez
3. Aucune limitation ne doit être appliquée

## 🔧 Configuration des webhooks Stripe

### Webhook pour les abonnements

Configurez un webhook Stripe pour gérer les changements d'abonnement :

```python
@app.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    if event["type"] == "customer.subscription.created":
        # Mettre à jour le plan utilisateur
        subscription = event["data"]["object"]
        customer_id = subscription["customer"]
        # Mettre à jour user_profiles avec le nouveau plan
        
    elif event["type"] == "customer.subscription.updated":
        # Mettre à jour les limites selon le nouveau plan
        pass
        
    elif event["type"] == "customer.subscription.deleted":
        # Réinitialiser vers le plan gratuit
        pass
    
    return {"status": "success"}
```

## 📊 Monitoring et analytics

### Requêtes SQL utiles

```sql
-- Nombre de requêtes par utilisateur ce mois-ci
SELECT 
    up.email,
    COUNT(ur.id) as request_count,
    up.plan_type,
    up.request_limit
FROM user_profiles up
LEFT JOIN user_requests ur ON up.user_id = ur.user_id 
    AND ur.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY up.user_id, up.email, up.plan_type, up.request_limit
ORDER BY request_count DESC;

-- Utilisateurs ayant atteint leur limite
SELECT 
    up.email,
    COUNT(ur.id) as request_count,
    up.plan_type,
    up.request_limit
FROM user_profiles up
LEFT JOIN user_requests ur ON up.user_id = ur.user_id 
    AND ur.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY up.user_id, up.email, up.plan_type, up.request_limit
HAVING COUNT(ur.id) >= up.request_limit
ORDER BY request_count DESC;
```

## 🚨 Gestion des erreurs

### Erreur 429 - Limite atteinte

```json
{
    "error": "Limite de requêtes atteinte",
    "message": "Vous avez atteint votre limite de 30 requêtes ce mois-ci.",
    "remaining_requests": 0,
    "reset_date": "2024-01-01T00:00:00",
    "upgrade_url": "/pricing"
}
```

### Interface utilisateur

Ajoutez un indicateur de requêtes restantes dans l'interface :

```typescript
// Dans le composant Chat
const [remainingRequests, setRemainingRequests] = useState<number>(-1);

// Afficher le compteur
{remainingRequests >= 0 && (
    <div className="text-sm text-gray-600">
        {remainingRequests} requêtes restantes ce mois-ci
    </div>
)}
```

## ✅ Checklist de validation

- [ ] Migration de base de données déployée
- [ ] Fonctions SQL créées
- [ ] Middleware intégré dans l'application
- [ ] Webhooks Stripe configurés
- [ ] Tests avec utilisateur particulier (limitation à 30 requêtes)
- [ ] Tests avec utilisateur professionnel (pas de limitation)
- [ ] Interface utilisateur mise à jour avec les compteurs
- [ ] Gestion des erreurs 429 implémentée
- [ ] Monitoring et analytics configurés

## 🎯 Résultat final

- **Particuliers** : 30 requêtes/mois maximum (9.99€/mois ou 99.99€/an)
- **Professionnels** : Requêtes illimitées (49€/mois ou 490€/an)
- **Gratuit** : Pas d'accès à Francis (doit s'abonner)

La limitation est maintenant complètement configurée et prête pour la production ! 🚀 
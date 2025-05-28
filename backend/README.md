# Backend Fiscal.ia

API FastAPI pour l'assistant fiscal intelligent.

## 🚀 Fonctionnalités

- **Authentification** : Inscription, connexion, gestion des tokens JWT
- **Assistant IA** : Questions/réponses fiscales avec OpenAI GPT-4
- **Upload de documents** : Traitement de documents fiscaux
- **Paiements** : Intégration Stripe pour les abonnements
- **Historique** : Sauvegarde des conversations
- **Sécurité** : CORS, validation, authentification Bearer

## 🛠️ Technologies

- **FastAPI** : Framework web moderne et rapide
- **Supabase** : Base de données et authentification
- **OpenAI** : IA pour les réponses fiscales
- **Stripe** : Gestion des paiements
- **SQLAlchemy** : ORM pour la base de données
- **JWT** : Authentification par tokens

## 📋 Prérequis

- Python 3.11+
- Variables d'environnement configurées
- Accès à Supabase, OpenAI, et Stripe

## 🔧 Installation locale

```bash
# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 🌐 Endpoints principaux

### Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /auth/me` - Profil utilisateur

### Assistant fiscal
- `POST /ask` - Poser une question fiscale
- `GET /questions/history` - Historique des questions

### Documents
- `POST /upload/document` - Upload de document
- `GET /documents` - Liste des documents

### Paiements
- `POST /payment/create-intent` - Créer un paiement
- `POST /webhooks/stripe` - Webhook Stripe

### Monitoring
- `GET /` - Informations de base
- `GET /health` - Vérification de santé

## 🔒 Sécurité

- CORS configuré
- Authentification JWT
- Validation des entrées avec Pydantic
- Hachage des mots de passe avec bcrypt

## 📊 Base de données

Modèles principaux :
- `User` : Utilisateurs
- `Question` : Questions/réponses
- `Document` : Documents uploadés
- `Payment` : Paiements
- `Settings` : Configuration

## 🚀 Déploiement

Le backend est configuré pour Railway avec :
- Dockerfile multi-stage
- Variables d'environnement
- Configuration Nginx pour le reverse proxy

## 📝 Variables d'environnement

Voir `.env.example` pour la liste complète des variables nécessaires.

## 🐛 Débogage

Pour activer les logs détaillés :
```bash
export LOG_LEVEL=debug
```

## 📚 Documentation API

Une fois lancé, accédez à :
- `http://localhost:8000/docs` - Documentation Swagger
- `http://localhost:8000/redoc` - Documentation ReDoc 
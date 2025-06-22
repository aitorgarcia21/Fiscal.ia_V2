# 🎤 Reconnaissance Vocale avec Whisper

## Vue d'ensemble

Fiscal.ia intègre maintenant la reconnaissance vocale grâce à **Whisper** (OpenAI) via la bibliothèque `faster-whisper`. Cette fonctionnalité permet aux utilisateurs de poser leurs questions vocales à Francis, l'assistant fiscal.

## 🚀 Fonctionnalités

### Backend (Python/FastAPI)
- **Service Whisper** : `backend/whisper_service.py`
- **Endpoints API** :
  - `POST /api/whisper/transcribe` - Transcription d'audio base64
  - `POST /api/whisper/transcribe-file` - Transcription de fichier uploadé
  - `GET /api/whisper/model-info` - Informations sur le modèle
  - `POST /api/whisper/health` - Statut du service

### Frontend (React/TypeScript)
- **Composant VoiceRecorder** : `frontend/src/components/VoiceRecorder.tsx`
- **Intégration ChatPage** : Bouton microphone dans l'interface de chat
- **Interface utilisateur** :
  - Bouton d'enregistrement (microphone)
  - Indicateur de durée d'enregistrement
  - Statut de transcription
  - Gestion des erreurs

## 🛠️ Configuration

### Dépendances
```bash
# Backend
faster-whisper==0.10.0

# Frontend
# Aucune dépendance supplémentaire (utilise l'API Web Audio)
```

### Variables d'environnement
Aucune variable d'environnement spécifique requise. Whisper fonctionne entièrement en local.

## 📱 Utilisation

### Pour les utilisateurs
1. **Ouvrir le chat** avec Francis
2. **Cliquer sur le bouton microphone** (🎤) à côté du champ de saisie
3. **Autoriser l'accès au microphone** si demandé
4. **Enregistrer votre question** en cliquant sur le bouton rouge
5. **Arrêter l'enregistrement** en cliquant à nouveau
6. **Cliquer sur "Transcrire l'audio"** pour convertir en texte
7. **Le texte apparaît dans le champ de saisie** - vous pouvez le modifier si nécessaire
8. **Envoyer la question** normalement

### Fonctionnalités techniques
- **Format audio** : WebM avec codec Opus (optimisé pour le web)
- **Langue** : Français par défaut
- **Modèle Whisper** : "base" (bon compromis performance/précision)
- **Optimisations** :
  - CPU uniquement (compatible Railway)
  - Quantification int8 (économie mémoire)
  - Filtre VAD (détection de voix)

## 🔧 Développement

### Test local
```bash
# Tester le service Whisper
python test_whisper.py

# Lancer le backend
cd backend
uvicorn main:app --reload

# Lancer le frontend
cd frontend
npm run dev
```

### Structure des fichiers
```
backend/
├── whisper_service.py          # Service Whisper principal
├── main.py                     # Endpoints API
└── requirements.txt            # Dépendances

frontend/src/
├── components/
│   └── VoiceRecorder.tsx       # Composant d'enregistrement
└── pages/
    └── ChatPage.tsx            # Intégration dans le chat
```

## 🎯 API Endpoints

### POST /api/whisper/transcribe
Transcrit un audio encodé en base64.

**Request:**
```json
{
  "audio_base64": "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT..."
}
```

**Response:**
```json
{
  "text": "Bonjour, j'ai une question sur mes impôts",
  "segments": [...],
  "language": "fr",
  "language_probability": 0.95,
  "duration": 3.2,
  "error": null
}
```

### GET /api/whisper/model-info
Informations sur le modèle Whisper.

**Response:**
```json
{
  "model_size": "base",
  "status": "loaded",
  "device": "cpu",
  "compute_type": "int8"
}
```

## 🚨 Gestion des erreurs

### Erreurs communes
- **Microphone non autorisé** : Demander l'autorisation dans le navigateur
- **Whisper non disponible** : Vérifier le déploiement backend
- **Aucun texte détecté** : Parler plus clairement ou plus longtemps
- **Erreur de transcription** : Vérifier la qualité audio

### Logs
Les erreurs sont loggées côté backend avec des détails pour le debugging.

## 🔄 Workflow de transcription

1. **Enregistrement** → WebM/Opus
2. **Conversion** → Base64
3. **Envoi** → API `/api/whisper/transcribe`
4. **Traitement** → Whisper (CPU)
5. **Retour** → Texte français
6. **Affichage** → Champ de saisie

## 📊 Performance

### Modèle "base"
- **Taille** : ~244 MB
- **Précision** : Bonne pour le français
- **Vitesse** : ~1-2x temps réel sur CPU
- **Mémoire** : ~500 MB

### Optimisations Railway
- **CPU uniquement** : Compatible avec les contraintes Railway
- **Quantification int8** : Réduction mémoire de 50%
- **Chargement lazy** : Modèle chargé au premier appel

## 🔮 Améliorations futures

- [ ] Modèle "small" pour plus de précision
- [ ] Support multi-langues
- [ ] Transcription en temps réel
- [ ] Correction automatique du texte
- [ ] Intégration avec l'historique vocal

## 🐛 Dépannage

### Le microphone ne fonctionne pas
1. Vérifier les permissions du navigateur
2. Tester sur HTTPS (requis pour getUserMedia)
3. Vérifier qu'aucune autre app n'utilise le micro

### Whisper ne répond pas
1. Vérifier les logs Railway
2. Tester l'endpoint `/api/whisper/health`
3. Vérifier l'espace disque (modèle ~244MB)

### Transcription de mauvaise qualité
1. Parler plus clairement
2. Réduire le bruit ambiant
3. Enregistrer plus longtemps (>2 secondes)
4. Vérifier la qualité du microphone 
# Changelog - Fiscal.ia

## Version 2.3.0 - Système de Profiling Initial (2024-01-XX)

### ✨ Nouvelles Fonctionnalités

#### **Questionnaire de Découverte Automatique**
- **Déclenchement intelligent** lors de la première connexion des particuliers
- **5 questions stratégiques** pour analyser le profil fiscal complet :
  - Activité principale (salarié, dirigeant, auto-entrepreneur, retraité, etc.)
  - Revenus complémentaires (immobilier locatif, dividendes, plus-values, crypto, etc.)
  - Structures juridiques détenues (SASU, SARL, SCI, holding, etc.)
  - Résidence fiscale (France, DOM-TOM, Portugal, Belgique, Suisse, etc.)
  - Situation patrimoniale (primo-accédant, multi-propriétaire, IFI, etc.)

#### **Interface Responsive Optimisée**
- **Design mobile-first** avec breakpoints adaptatifs (sm/lg)
- **Animations fluides** avec Framer Motion
- **Barre de progression** interactive
- **Boutons tactiles** optimisés pour mobile
- **Layout flexible** qui s'adapte à tous les écrans

#### **Données et Persistance**
- **Nouveau modèle de données** avec 10+ champs spécialisés
- **API REST complète** (GET, POST, PUT, DELETE) pour profils utilisateur
- **Gestion JSON** automatique pour champs multi-choix
- **Migration de base de données** avec indexes optimisés
- **Validation côté serveur** et client

#### **Dashboard Personnalisé**
- **KPIs authentiques** basés sur le profil réel de l'utilisateur
- **Messages d'accueil adaptés** selon l'activité professionnelle
- **Actions suggérées** personnalisées en fonction du profil
- **Gestion des états** (loading, première connexion, profil complété)

#### **Intégration Francis IA**
- **Conseils personnalisés** selon le profil fiscal détecté
- **Contexte enrichi** pour des réponses plus précises
- **Suggestions adaptées** selon la situation de l'utilisateur

### 🛠 Améliorations Techniques

#### **Backend**
- Nouveau schéma `UserProfile` avec champs étendus
- Gestion automatique conversion JSON pour listes
- Routes API sécurisées avec authentification JWT
- Migration SQL avec commentaires explicatifs

#### **Frontend**
- Composant `InitialProfileQuestions` réutilisable
- Hook `useAuth` intégré pour gestion session
- Types TypeScript complets pour profil utilisateur
- Responsive design avec Tailwind CSS

#### **Base de Données**
- Table `user_profiles` étendue avec nouveaux champs :
  - `activite_principale` : Type d'activité professionnelle
  - `revenus_passifs` : Sources de revenus passifs (JSON)
  - `revenus_complementaires` : Revenus complémentaires (JSON)
  - `statuts_juridiques` : Structures juridiques détenues (JSON)
  - `residence_fiscale` : Lieu de résidence fiscale
  - `patrimoine_situation` : Situation patrimoniale
  - `has_completed_onboarding` : Flag onboarding terminé

### 📱 Optimisations Mobile

#### **Questionnaire de Profiling**
- Textes et boutons adaptés aux petits écrans
- Spacing optimisé pour navigation tactile
- Icônes et progress bar redimensionnés
- Layout vertical/horizontal adaptatif

#### **Dashboard**
- Grid responsif pour KPI cards (1/2/3 colonnes)
- Navigation sidebar adaptée mobile
- Boutons et inputs optimisés pour touch
- Header mobile avec menu hamburger

### 🎯 Impact Utilisateur

#### **Expérience Personnalisée**
- **Onboarding fluide** en moins de 2 minutes
- **Interface adaptée** au profil fiscal détecté
- **Conseils pertinents** dès la première utilisation
- **Progression claire** dans le questionnaire

#### **Performance**
- **Chargement rapide** des questionnaires
- **Sauvegarde instantanée** des réponses
- **Navigation fluide** entre les questions
- **Responsive design** performant sur tous devices

---

## Version 2.2.0 - Interface Pro et Demo (2024-01-XX)

### ✨ Fonctionnalités
- Dashboard professionnel pour CGP
- Modal demo interactif avec Francis
- Gestion des clients et rendez-vous
- Interface d'authentification unifiée

### 🛠 Améliorations
- Design system cohérent
- Base de données pro dédiée
- Authentification multi-rôles

---

*Pour les versions antérieures, voir l'historique Git.* 
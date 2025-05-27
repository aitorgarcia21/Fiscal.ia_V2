import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  Settings, 
  Menu, 
  X, 
  Send, 
  FileText, 
  PieChart,
  ChevronRight,
  Bell,
  Search,
  Plus,
  User,
  UserCircle,
  Briefcase,
  Scale,
  PiggyBank,
  Target,
  Euro,
  Loader2,
  Upload,
  File,
  CheckCircle2,
  AlertCircle,
  Receipt,
  CreditCard,
  Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, UserProfile } from '../lib/supabase';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TrueLayerSuccessData {
  accessToken: string;
  provider: {
    id: string;
    display_name: string;
  };
}

interface TrueLayerError {
  error: string;
  error_description: string;
}

declare global {
  interface Window {
    TrueLayer: new (config: {
      clientId: string;
      redirectUri: string;
      scope: string[];
      locale: string;
      onSuccess: (data: TrueLayerSuccessData) => void;
      onError: (error: TrueLayerError) => void;
    }) => {
      open: () => void;
    };
  }
}

export function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Bonjour ! Je suis Francis, votre conseiller fiscal IA 🤖

Je peux vous aider à :
• Optimiser vos impôts
• Analyser vos documents fiscaux
• Répondre à vos questions sur la fiscalité

Posez-moi votre question ou choisissez un parcours :
1. 🎯 Parcours guidé
2. 💬 Chat libre

Voici quelques questions que vous pouvez me poser :
• Comment optimiser ma déclaration d'impôts ?
• Quelles sont les meilleures stratégies de défiscalisation ?
• Comment gérer ma TVA en tant qu'auto-entrepreneur ?
• Quels sont les avantages fiscaux pour les investissements immobiliers ?

Je suis là pour vous accompagner ! 💡`
    }
  ]);
  const [activeTab, setActiveTab] = useState('home');
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({
    situation: '',
    revenus: '',
    patrimoine: '',
    objectifs: [],
    toleranceRisque: '',
    horizonInvestissement: '',
    nombreEnfants: 0,
    agesEnfants: '',
    typeRevenus: [],
    autresRevenus: '',
    situationProfessionnelle: '',
    statutFiscal: '',
    regimeImposition: '',
    investissementsExistants: [],
    projetsImmobiliers: '',
    besoinsRetraite: '',
    situationFamiliale: '',
    localisation: '',
    zoneFiscale: '',
    secteurActivite: '',
    revenusPassifs: '',
    dettes: '',
    objectifsFinanciers: [],
    contraintesFiscales: [],
    compositionPatrimoine: [],
    is_active: false,
  });

  const [profileCompleted, setProfileCompleted] = useState(false);
  const [chatMode, setChatMode] = useState('libre');
  const [userId, setUserId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedBanks, setConnectedBanks] = useState<string[]>([]);
  const [bankData, setBankData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    type: string;
    status: 'processing' | 'success' | 'error';
    data?: any;
  }>>([]);
  const [dragActive, setDragActive] = useState(false);

  // Ajouter des suggestions de questions
  const suggestedQuestions = [
    "Comment optimiser ma déclaration d'impôts ?",
    "Quelles sont les meilleures stratégies de défiscalisation ?",
    "Comment gérer ma TVA en tant qu'auto-entrepreneur ?",
    "Quels sont les avantages fiscaux pour les investissements immobiliers ?"
  ];

  const calculateProgress = () => {
    const requiredFields = [
      'situationFamiliale',
      'nombreEnfants',
      'localisation',
      'zoneFiscale',
      'situationProfessionnelle',
      'secteurActivite',
      'regimeImposition',
      'statutFiscal',
      'revenus',
      'typeRevenus',
      'patrimoine',
      'compositionPatrimoine',
      'investissementsExistants',
      'projetsImmobiliers',
      'besoinsRetraite',
      'horizonInvestissement',
      'toleranceRisque',
      'objectifs',
      'contraintesFiscales'
    ];

    const filledFields = requiredFields.filter(field => {
      const value = profileData[field as keyof typeof profileData];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== '';
    });

    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  // Vérifier l'authentification et charger le profil au chargement
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await loadUserProfile(user.id);
      }
    };
    checkUser();
  }, []);

  // Charger le profil utilisateur depuis Supabase
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData(data);
        setProfileCompleted(true);
        // Charger l'historique des interactions
        if (data.interaction_history) {
          const history = data.interaction_history.map((interaction: { question: string; response: string }) => ({
            role: 'assistant',
            content: `Q: ${interaction.question}\nR: ${interaction.response}`
          }));
          setChatHistory(history);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  // Sauvegarder le profil utilisateur dans Supabase
  const saveUserProfile = async (profileData: Partial<UserProfile>) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
    }
  };

  // Mettre à jour le profil avec les insights de la conversation
  const updateProfileWithInsights = async (question: string, response: string, insights: Array<{ type: string, value: string, confidence: number }>) => {
    if (!userId) return;

    try {
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!currentProfile) return;

      // Mettre à jour le profil avec les nouveaux insights
      const updatedProfile = { ...currentProfile };
      insights.forEach(insight => {
        if (insight.confidence > 0.8) { // Seuil de confiance pour la mise à jour
          updatedProfile[insight.type as keyof UserProfile] = insight.value;
        }
      });

      // Ajouter l'interaction à l'historique
      const newInteraction = {
        role: 'assistant',
        content: `Q: ${question}\nR: ${response}`
      };

      updatedProfile.interaction_history = [
        ...(currentProfile.interaction_history || []),
        newInteraction
      ].slice(-50); // Garder les 50 dernières interactions

      // Sauvegarder les modifications
      const { error } = await supabase
        .from('user_profiles')
        .update(updatedProfile)
        .eq('user_id', userId);

      if (error) throw error;

      // Mettre à jour l'état local
      setProfileData(updatedProfile);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsLoading(true);
    try {
      await saveUserProfile(profileData);
      setProfileCompleted(true);
      
      const { recommendations, opportunities } = analyzeProfile();
      const welcomeMessage = `Bonjour ! Je suis Francis, votre conseiller fiscal propulsé par intelligence artificielle. \n\nBasé sur votre profil, je peux vous aider à optimiser votre fiscalité. Voici mes premières recommandations :\n\n${recommendations.map(rec => `• ${rec}`).join('\n')}\n\nOpportunités identifiées :\n${opportunities.map(opp => `• ${opp}`).join('\n')}\n\nPosez-moi des questions spécifiques pour en savoir plus sur ces recommandations.`;
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: welcomeMessage }]);
      setActiveTab('chat');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter la fonction pour gérer le parcours guidé
  const startGuidedPath = (path: string) => {
    let initialMessage = '';
    switch (path) {
      case 'optimisation':
        initialMessage = `Parfait ! Commençons l'optimisation de votre fiscalité. 🎯

Pour vous accompagner au mieux, j'ai besoin de quelques informations :
1. Quel est votre statut fiscal actuel ?
2. Quels sont vos principaux revenus ?
3. Avez-vous des investissements en cours ?

Vous pouvez répondre à ces questions dans l'ordre qui vous convient.`;
        break;
      case 'documents':
        initialMessage = `Très bien ! Analysons vos documents fiscaux. 📄

Vous pouvez :
1. Partager vos avis d'imposition
2. Télécharger vos justificatifs
3. Me poser des questions sur vos documents

Je vous guiderai dans l'analyse et l'optimisation de votre situation.`;
        break;
      case 'conseil':
        initialMessage = `Excellent choix ! Je vais vous donner des conseils personnalisés. 💡

Pour vous conseiller au mieux, dites-moi :
1. Quels sont vos objectifs fiscaux ?
2. Avez-vous des projets spécifiques ?
3. Quel est votre horizon d'investissement ?

Je vous aiderai à atteindre vos objectifs.`;
        break;
    }
    
    setChatHistory(prev => [...prev, { role: 'assistant', content: initialMessage }]);
  };

  // Modifier la fonction handleSubmit pour améliorer la gestion des erreurs
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !userId) return;

    setIsLoading(true);
    const userQuestion = question;
    setQuestion('');
    
    // Ajouter la question de l'utilisateur avec une animation
    setChatHistory(prev => [...prev, { role: 'user', content: userQuestion }]);
    
    try {
      const response = await fetch('http://localhost:8080/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userQuestion,
          profile: profileData,
          chatMode: chatMode,
          userId: userId,
          context: chatHistory.slice(-5).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Vérifier si la réponse contient une suggestion de parcours guidé
      if (data.suggestedPath) {
        startGuidedPath(data.suggestedPath);
      } else {
        // Ajouter la réponse de Francis avec une animation
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
      }

      // Mettre à jour le profil avec les insights de la réponse
      if (data.insights) {
        await updateProfileWithInsights(userQuestion, data.response, data.insights);
      }
    } catch (error) {
      console.error('Erreur:', error);
      // Message d'erreur plus détaillé et constructif
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "Oups ! Je rencontre une difficulté technique. 🤔\n\n" +
                "Voici ce que vous pouvez faire :\n" +
                "1. Vérifiez votre connexion internet\n" +
                "2. Rafraîchissez la page\n" +
                "3. Réessayez dans quelques instants\n\n" +
                "Si le problème persiste, vous pouvez :\n" +
                "• Me reposer votre question différemment\n" +
                "• Choisir une autre question parmi les suggestions\n" +
                "• Me contacter via le support si le problème persiste\n\n" +
                "Je m'excuse pour ce désagrément et reste à votre disposition ! 🙏"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour gérer le drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Fonction pour gérer le drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Fonction pour gérer le clic sur le bouton de téléchargement
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  // Fonction pour traiter le fichier
  const handleFileUpload = async (file: File | undefined, type: 'document' | 'tva' | 'frais' = 'document') => {
    if (!file) return;
    
    setIsUploading(true);
    const newFile = {
      name: file.name,
      type: file.type,
      status: 'processing' as const
    };
    
    setUploadedFiles(prev => [...prev, newFile]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId || '');
      formData.append('type', type);

      const response = await fetch('http://localhost:8000/process-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Erreur lors du traitement du document');

      const data = await response.json();
      
      setUploadedFiles(prev => prev.map(f => 
        f.name === file.name 
          ? { ...f, status: 'success', data: data }
          : f
      ));

      // Message personnalisé selon le type de document
      let chatMessage = '';
      if (type === 'tva') {
        chatMessage = `J'ai analysé votre ticket TVA "${file.name}". Voici les informations :\n\n` +
          `• Montant HT: ${data.montantHT}€\n` +
          `• TVA: ${data.tva}€\n` +
          `• Montant TTC: ${data.montantTTC}€\n` +
          `• Date: ${data.date}\n` +
          `• Numéro de ticket: ${data.numeroTicket}\n\n` +
          `Le ticket a été enregistré pour votre déclaration de TVA.`;
      } else if (type === 'frais') {
        chatMessage = `J'ai analysé votre note de frais "${file.name}". Voici les informations :\n\n` +
          `• Montant: ${data.montant}€\n` +
          `• Catégorie: ${data.categorie}\n` +
          `• Date: ${data.date}\n` +
          `• Description: ${data.description}\n\n` +
          `La note de frais a été enregistrée pour votre déclaration.`;
      } else {
        chatMessage = `J'ai analysé votre document "${file.name}". Voici les informations importantes :\n\n` +
          Object.entries(data)
            .map(([key, value]) => `• ${key}: ${value}`)
            .join('\n');
      }
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: chatMessage }]);
      setActiveTab('chat');

    } catch (error) {
      console.error('Erreur OCR:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.name === file.name 
          ? { ...f, status: 'error' }
          : f
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeProfile = () => {
    const { situation, revenus, patrimoine, objectifs, toleranceRisque, horizonInvestissement } = profileData;
    
    let recommendations = [];
    let opportunities = [];

    // Analyse de la situation familiale
    if (situation === 'marie' || situation === 'pacs') {
      recommendations.push("Optimisation du quotient familial");
      opportunities.push("Déclaration commune pour optimiser les tranches d'imposition");
    }

    // Analyse des revenus
    if (revenus === '50k-100k') {
      recommendations.push("Optimisation de la TMI avec le PER");
      opportunities.push("Défiscalisation via l'investissement locatif");
    } else if (revenus === '100k-200k') {
      recommendations.push("Mise en place d'une holding");
      opportunities.push("Optimisation IS/IR");
    } else if (revenus === '>200k') {
      recommendations.push("Stratégie de défiscalisation globale");
      opportunities.push("Optimisation des niches fiscales");
    }

    // Analyse du patrimoine
    if (patrimoine === '100k-300k') {
      recommendations.push("Diversification patrimoniale");
      opportunities.push("Investissement en SCPI");
    } else if (patrimoine === '300k-500k') {
      recommendations.push("Stratégie de transmission anticipée");
      opportunities.push("Optimisation des droits de succession");
    } else if (patrimoine === '500k-1M' || patrimoine === '>1M') {
      recommendations.push("Stratégie patrimoniale globale");
      opportunities.push("Optimisation fiscale multi-supports");
    }

    // Analyse des objectifs
    if (objectifs?.includes('retraite')) {
      recommendations.push("PER et assurance vie");
      opportunities.push("Défiscalisation retraite");
    } else if (objectifs?.includes('patrimoine')) {
      recommendations.push("Donation progressive");
      opportunities.push("Optimisation des abattements");
    } else if (objectifs?.includes('investissement')) {
      recommendations.push("Mix d'investissements défiscalisés");
      opportunities.push("Optimisation des plus-values");
    } else if (objectifs?.includes('protection')) {
      recommendations.push("Assurance décès et invalidité");
      opportunities.push("Protection du conjoint et des enfants");
    }

    // Analyse du profil de risque
    if (toleranceRisque === 'conservateur') {
      recommendations.push("Investissements défiscalisés sécurisés");
      opportunities.push("SCPI de rendement");
    } else if (toleranceRisque === 'modere') {
      recommendations.push("Mix d'investissements équilibré");
      opportunities.push("Diversification multi-supports");
    } else if (toleranceRisque === 'dynamique') {
      recommendations.push("Investissements à fort potentiel");
      opportunities.push("Optimisation des plus-values");
    }

    // Analyse de l'horizon d'investissement
    if (horizonInvestissement === 'court') {
      recommendations.push("Investissements liquides");
      opportunities.push("Optimisation court terme");
    } else if (horizonInvestissement === 'moyen') {
      recommendations.push("Investissements mixtes");
      opportunities.push("Diversification temporelle");
    } else if (horizonInvestissement === 'long') {
      recommendations.push("Investissements de long terme");
      opportunities.push("Optimisation transmission");
    }

    return { recommendations, opportunities };
  };

  // Modifier la fonction de connexion bancaire
  const connectBank = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('http://localhost:8001/init-truelayer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'initialisation de TrueLayer');
      
      const { clientId, redirectUri } = await response.json();

      const truelayer = new window.TrueLayer({
        clientId: clientId,
        redirectUri: redirectUri,
        scope: ['accounts', 'transactions', 'balance'],
        locale: 'fr',
        onSuccess: async (data: TrueLayerSuccessData) => {
          const bankResponse = await fetch('http://localhost:8001/bank-data', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.accessToken}`,
            },
          });

          if (!bankResponse.ok) throw new Error('Erreur lors de la récupération des données');

          const bankData = await bankResponse.json();
          setBankData(bankData);
          setConnectedBanks(prev => [...prev, 'Compte bancaire']);
          
          const chatMessage = `J'ai analysé vos données bancaires. Voici un résumé :\n\n` +
            `• Solde total : ${bankData.totalBalance}€\n` +
            `• Revenus mensuels : ${bankData.analysis.revenus.total}€\n` +
            `• Dépenses mensuelles : ${bankData.analysis.depenses.total}€\n` +
            `• Taux d'épargne : ${bankData.analysis.tendances.taux_epargne.toFixed(1)}%\n\n` +
            `Je peux vous aider à optimiser votre situation fiscale en fonction de ces données.`;
          
          setChatHistory(prev => [...prev, { role: 'assistant', content: chatMessage }]);
        },
        onError: (error: TrueLayerError) => {
          console.error('Erreur TrueLayer:', error);
          setChatHistory(prev => [...prev, { 
            role: 'assistant', 
            content: `Désolé, je n'ai pas pu me connecter à votre compte bancaire : ${error.error_description}` 
          }]);
        }
      });

      truelayer.open();
    } catch (error) {
      console.error('Erreur de connexion bancaire:', error);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans quelques instants." 
      }]);
    } finally {
      setIsConnecting(false);
    }
  };

  if (profileData && profileData.is_active === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876]">
        <div className="bg-[#1a2942]/80 p-8 rounded-2xl shadow-xl border border-[#c5a572]/30 text-center">
          <h2 className="text-2xl font-bold text-[#c5a572] mb-4">Compte en attente d'activation</h2>
          <p className="text-white mb-2">Votre compte n'est pas encore activé.</p>
          <p className="text-gray-300">Merci de finaliser votre paiement pour accéder à toutes les fonctionnalités.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876]">
      {/* Barre de navigation supérieure */}
      <header className="fixed top-0 left-0 right-0 bg-[#1a2942]/95 backdrop-blur-sm border-b border-[#234876] z-30">
        <div className="h-16 max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 group">
            <div className="relative inline-flex items-center justify-center">
              <MessageSquare className="h-7 w-7 text-[#c5a572] transition-transform group-hover:scale-110" />
              <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1.5 -right-1.5 bg-[#1a2942] rounded-full p-0.5 transition-transform group-hover:scale-110" />
            </div>
          </div>

          {/* Navigation principale */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'home' 
                  ? 'bg-[#c5a572] text-[#1a2942]' 
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center space-x-2">
                <UserCircle className="w-5 h-5" />
                <span>Tableau de bord</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'chat' 
                  ? 'bg-[#c5a572] text-[#1a2942]' 
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Chat</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'analytics' 
                  ? 'bg-[#c5a572] text-[#1a2942]' 
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Analytics</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-[#c5a572] text-[#1a2942]' 
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Paramètres</span>
              </span>
            </button>
          </div>

          {/* Profil utilisateur */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#c5a572] flex items-center justify-center">
              <User className="w-6 h-6 text-[#1a2942]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Utilisateur</p>
              <p className="text-xs text-gray-400">Voir le profil</p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="pt-16 min-h-[calc(100vh-theme(spacing.16)-theme(spacing.16))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] rounded-2xl shadow-2xl overflow-hidden border border-[#c5a572]/30"
              >
                {/* En-tête du tableau de bord */}
                <div className="bg-gradient-to-r from-[#1a2942] to-[#223c63] px-8 py-10 border-b border-[#c5a572]/30">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-[#c5a572] flex items-center justify-center">
                      <UserCircle className="w-10 h-10 text-[#1a2942]" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold text-white">Bienvenue chez Francis</h1>
                      <p className="text-xl text-gray-300">Votre conseiller fiscal propulsé par intelligence artificielle</p>
                    </div>
                  </div>
                </div>

                {/* Grille des catégories */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Catégorie Profil */}
                    <div 
                      onClick={() => setActiveTab('profile')}
                      className="bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 p-6 cursor-pointer hover:bg-[#1a2942]/60 transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-[#c5a572] flex items-center justify-center">
                          <UserCircle className="w-6 h-6 text-[#1a2942]" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Profil Fiscal</h3>
                      </div>
                      <p className="text-gray-400">Gérez votre profil et vos informations fiscales</p>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-300 mb-2">
                          <span>Progression</span>
                          <span className="text-[#c5a572] font-semibold">{calculateProgress()}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#c5a572] to-[#d4b583] transition-all duration-500 ease-out"
                            style={{ width: `${calculateProgress()}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Catégorie Chat */}
                    <div 
                      onClick={() => setActiveTab('chat')}
                      className="bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 p-6 cursor-pointer hover:bg-[#1a2942]/60 transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-[#c5a572] flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-[#1a2942]" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Chat avec Francis</h3>
                      </div>
                      <p className="text-gray-400">Posez vos questions et obtenez des conseils personnalisés</p>
                    </div>

                    {/* Catégorie Analytics */}
                    <div 
                      onClick={() => setActiveTab('analytics')}
                      className="bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 p-6 cursor-pointer hover:bg-[#1a2942]/60 transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-[#c5a572] flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-[#1a2942]" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Analytics</h3>
                      </div>
                      <p className="text-gray-400">Suivez vos performances et optimisations fiscales</p>
                    </div>

                    {/* Catégorie Paramètres */}
                    <div 
                      onClick={() => setActiveTab('settings')}
                      className="bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 p-6 cursor-pointer hover:bg-[#1a2942]/60 transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-[#c5a572] flex items-center justify-center">
                          <Settings className="w-6 h-6 text-[#1a2942]" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Paramètres</h3>
                      </div>
                      <p className="text-gray-400">Configurez vos préférences et notifications</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] rounded-2xl shadow-2xl overflow-hidden border border-[#c5a572]/30"
              >
                {/* En-tête avec barre de progression */}
                <div className="bg-gradient-to-r from-[#1a2942] to-[#223c63] px-8 py-10 border-b border-[#c5a572]/30">
                  <h1 className="text-4xl font-bold text-white mb-6 flex items-center">
                    <UserCircle className="w-10 h-10 mr-4 text-[#c5a572]" />
                    Votre Profil Fiscal
                  </h1>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-300">
                      <span className="font-medium">Progression du profil</span>
                      <span className="text-[#c5a572] font-semibold">{calculateProgress()}%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#c5a572] to-[#d4b583] transition-all duration-500 ease-out"
                        style={{ width: `${calculateProgress()}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Contenu du formulaire */}
                <div className="p-8">
                  <form onSubmit={handleProfileSubmit} className="space-y-10">
                    {/* Section Situation Personnelle */}
                    <div className="bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 overflow-hidden shadow-lg">
                      <div className="bg-gradient-to-r from-[#1a2942] to-[#223c63] px-8 py-6 border-b border-[#c5a572]/30">
                        <h2 className="text-2xl font-semibold text-white flex items-center">
                          <UserCircle className="w-8 h-8 mr-4 text-[#c5a572]" />
                          Situation Personnelle
                        </h2>
                      </div>
                      <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              Situation Familiale
                              <span className="text-[#c5a572] ml-1">*</span>
                            </label>
                            <select
                              value={profileData.situationFamiliale}
                              onChange={(e) => setProfileData({...profileData, situationFamiliale: e.target.value})}
                              className="w-full rounded-lg bg-[#1a2942]/60 border border-[#c5a572]/30 text-white focus:border-[#c5a572] focus:ring-[#c5a572] px-4 py-3"
                              required
                            >
                              <option value="">Sélectionnez votre situation</option>
                              <option value="celibataire">Célibataire</option>
                              <option value="marie">Marié(e)</option>
                              <option value="pacs">PACS</option>
                              <option value="divorce">Divorcé(e)</option>
                              <option value="veuf">Veuf(ve)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              Nombre d'Enfants
                              <span className="text-[#c5a572] ml-1">*</span>
                            </label>
                            <input
                              type="number"
                              value={profileData.nombreEnfants}
                              onChange={(e) => setProfileData({...profileData, nombreEnfants: parseInt(e.target.value)})}
                              className="w-full rounded-lg bg-[#1a2942]/60 border border-[#c5a572]/30 text-white focus:border-[#c5a572] focus:ring-[#c5a572] px-4 py-3"
                              min="0"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Localisation
                            <span className="text-[#c5a572] ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            value={profileData.localisation}
                            onChange={(e) => setProfileData({...profileData, localisation: e.target.value})}
                            className="w-full rounded-lg bg-[#1a2942]/60 border border-[#c5a572]/30 text-white focus:border-[#c5a572] focus:ring-[#c5a572] px-4 py-3"
                            placeholder="Ville, département"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section Situation Professionnelle */}
                    <div className="bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 overflow-hidden shadow-lg">
                      <div className="bg-gradient-to-r from-[#1a2942] to-[#223c63] px-8 py-6 border-b border-[#c5a572]/30">
                        <h2 className="text-2xl font-semibold text-white flex items-center">
                          <Briefcase className="w-8 h-8 mr-4 text-[#c5a572]" />
                          Situation Professionnelle
                        </h2>
                      </div>
                      <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              Statut Professionnel
                              <span className="text-[#c5a572] ml-1">*</span>
                            </label>
                            <select
                              value={profileData.situationProfessionnelle}
                              onChange={(e) => setProfileData({...profileData, situationProfessionnelle: e.target.value})}
                              className="w-full rounded-lg bg-[#1a2942]/60 border border-[#c5a572]/30 text-white focus:border-[#c5a572] focus:ring-[#c5a572] px-4 py-3"
                              required
                            >
                              <option value="">Sélectionnez votre statut</option>
                              <option value="salarie">Salarié</option>
                              <option value="independant">Indépendant</option>
                              <option value="retraite">Retraité</option>
                              <option value="chomeur">Chômeur</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              Secteur d'Activité
                              <span className="text-[#c5a572] ml-1">*</span>
                            </label>
                            <input
                              type="text"
                              value={profileData.secteurActivite}
                              onChange={(e) => setProfileData({...profileData, secteurActivite: e.target.value})}
                              className="w-full rounded-lg bg-[#1a2942]/60 border border-[#c5a572]/30 text-white focus:border-[#c5a572] focus:ring-[#c5a572] px-4 py-3"
                              placeholder="Ex: Informatique, Santé, etc."
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Situation Fiscale */}
                    <div className="bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 overflow-hidden shadow-lg">
                      <div className="bg-gradient-to-r from-[#1a2942] to-[#223c63] px-8 py-6 border-b border-[#c5a572]/30">
                        <h2 className="text-2xl font-semibold text-white flex items-center">
                          <Scale className="w-8 h-8 mr-4 text-[#c5a572]" />
                          Situation Fiscale
                        </h2>
                      </div>
                      <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              Régime d'Imposition
                              <span className="text-[#c5a572] ml-1">*</span>
                            </label>
                            <select
                              value={profileData.regimeImposition}
                              onChange={(e) => setProfileData({...profileData, regimeImposition: e.target.value})}
                              className="w-full rounded-lg bg-[#1a2942]/60 border border-[#c5a572]/30 text-white focus:border-[#c5a572] focus:ring-[#c5a572] px-4 py-3"
                              required
                            >
                              <option value="">Sélectionnez votre régime</option>
                              <option value="micro">Micro-entreprise</option>
                              <option value="reel">Régime réel</option>
                              <option value="auto">Auto-entrepreneur</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              Zone Fiscale
                              <span className="text-[#c5a572] ml-1">*</span>
                            </label>
                            <select
                              value={profileData.zoneFiscale}
                              onChange={(e) => setProfileData({...profileData, zoneFiscale: e.target.value})}
                              className="w-full rounded-lg bg-[#1a2942]/60 border border-[#c5a572]/30 text-white focus:border-[#c5a572] focus:ring-[#c5a572] px-4 py-3"
                              required
                            >
                              <option value="">Sélectionnez votre zone</option>
                              <option value="zone1">Zone 1</option>
                              <option value="zone2">Zone 2</option>
                              <option value="zone3">Zone 3</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Patrimoine et Investissements */}
                    <div className="bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 overflow-hidden shadow-lg">
                      <div className="bg-gradient-to-r from-[#1a2942] to-[#223c63] px-8 py-6 border-b border-[#c5a572]/30">
                        <h2 className="text-2xl font-semibold text-white flex items-center">
                          <PiggyBank className="w-8 h-8 mr-4 text-[#c5a572]" />
                          Patrimoine et Investissements
                        </h2>
                      </div>
                      <div className="p-8 space-y-8">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-4">
                            Composition du Patrimoine
                            <span className="text-[#c5a572] ml-1">*</span>
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['Immobilier', 'Actions', 'Obligations', 'Assurance-vie', 'SCPI'].map((type) => (
                              <label key={type} className="flex items-center space-x-3 p-3 rounded-lg bg-[#1a2942]/60 border border-[#c5a572]/30 hover:bg-[#1a2942]/80 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={profileData.compositionPatrimoine?.includes(type) || false}
                                  onChange={(e) => {
                                    const newTypes = e.target.checked
                                      ? [...(profileData.compositionPatrimoine || []), type]
                                      : (profileData.compositionPatrimoine || []).filter(t => t !== type);
                                    setProfileData({...profileData, compositionPatrimoine: newTypes});
                                  }}
                                  className="h-5 w-5 text-[#c5a572] focus:ring-[#c5a572] border-[#c5a572]/30 rounded bg-[#1a2942]/60"
                                />
                                <span className="text-gray-300 font-medium">{type}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Objectifs */}
                    <div className="bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 overflow-hidden shadow-lg">
                      <div className="bg-gradient-to-r from-[#1a2942] to-[#223c63] px-8 py-6 border-b border-[#c5a572]/30">
                        <h2 className="text-2xl font-semibold text-white flex items-center">
                          <Target className="w-8 h-8 mr-4 text-[#c5a572]" />
                          Objectifs
                        </h2>
                      </div>
                      <div className="h-[calc(100vh-16rem)] overflow-y-auto p-6">
                        <div className="space-y-6">
                          {chatHistory.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-2xl p-4 ${
                                  message.role === 'user'
                                    ? 'bg-[#c5a572] text-[#1a2942]'
                                    : 'bg-white/5 text-white'
                                }`}
                              >
                                <div className="flex items-center space-x-2 mb-2">
                                  {message.role === 'assistant' && (
                                    <div className="w-6 h-6 rounded-full bg-[#c5a572] flex items-center justify-center">
                                      <MessageSquare className="w-4 h-4 text-[#1a2942]" />
                                    </div>
                                  )}
                                  <span className="text-sm font-medium">
                                    {message.role === 'user' ? 'Vous' : 'Francis'}
                                  </span>
                                </div>
                                <div className="prose prose-invert max-w-none">
                                  {message.content.split('\n').map((line, i) => (
                                    <p key={i} className="mb-2 last:mb-0">
                                      {line}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#1a2942]/95 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-[#c5a572]/20 h-[calc(100vh-12rem)] flex flex-col"
              >
                {/* En-tête du chat */}
                <div className="bg-gradient-to-r from-[#1a2942] to-[#223c63] px-6 py-4 border-b border-[#c5a572]/20">
                  <div className="flex items-center space-x-4">
                    <div className="relative inline-flex items-center justify-center group">
                      <MessageSquare className="h-7 w-7 text-[#c5a572] transition-transform group-hover:scale-110" />
                      <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1.5 -right-1.5 bg-[#1a2942] rounded-full p-0.5 transition-transform group-hover:scale-110" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Francis</h2>
                      <p className="text-sm text-gray-300">Conseiller fiscal propulsé par IA</p>
                    </div>
                  </div>
                </div>

                {/* Zone des messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {chatHistory.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.role === 'user'
                            ? 'bg-[#c5a572] text-[#1a2942]'
                            : 'bg-white/5 text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          {message.role === 'assistant' && (
                            <div className="w-6 h-6 rounded-full bg-[#c5a572] flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-[#1a2942]" />
                            </div>
                          )}
                          <span className="text-sm font-medium">
                            {message.role === 'user' ? 'Vous' : 'Francis'}
                          </span>
                        </div>
                        <div className="prose prose-invert max-w-none">
                          {message.content.split('\n').map((line, i) => (
                            <p key={i} className="mb-2 last:mb-0">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Suggestions de questions */}
                {!isLoading && chatHistory.length > 1 && (
                  <div className="px-6 py-4 border-t border-[#c5a572]/20">
                    <p className="text-sm text-gray-400 mb-3">Questions suggérées :</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuestion(question);
                            handleSubmit(new Event('submit') as any);
                          }}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-sm text-gray-300 rounded-full transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Zone de saisie */}
                <div className="p-4 border-t border-[#c5a572]/20 bg-[#1a2942]/50">
                  <form onSubmit={handleSubmit} className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Posez votre question à Francis..."
                        className="w-full rounded-xl bg-white/5 border border-[#c5a572]/30 text-white focus:border-[#c5a572] focus:ring-[#c5a572] pl-4 pr-12 py-3"
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="file-upload"
                          className={`text-gray-400 hover:text-white cursor-pointer transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <File className="w-5 h-5" />
                        </label>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 bg-[#c5a572] text-[#1a2942] rounded-xl hover:bg-[#d4b583] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c5a572] transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                </div>

                {/* Indicateur de chargement */}
                {isLoading && (
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-[#1a2942] rounded-lg shadow-lg p-4 border border-[#c5a572]/30">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="w-5 h-5 text-[#c5a572] animate-spin" />
                      <span className="text-white">Francis réfléchit...</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#1a2942]/95 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-[#c5a572]/20"
              >
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Analytics</h2>
                  
                  {/* Section Connexion Bancaire */}
                  <div className="bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">Connexion Bancaire</h3>
                        <p className="text-gray-400">Connectez votre compte bancaire pour une analyse en temps réel</p>
                      </div>
                      <button
                        onClick={connectBank}
                        disabled={isConnecting}
                        className="px-4 py-2 bg-[#c5a572] text-[#1a2942] rounded-lg hover:bg-[#d4b583] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Connexion en cours...</span>
                          </>
                        ) : (
                          <>
                            <PiggyBank className="w-5 h-5" />
                            <span>Connecter mon compte</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    {connectedBanks.length > 0 && (
                      <div className="mt-4 p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </div>
                            <span className="text-white font-medium">Compte bancaire connecté</span>
                          </div>
                          <span className="text-[#c5a572] text-sm">Données à jour</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section Analytics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 p-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Performance</h3>
                      {bankData ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Solde total</span>
                            <span className="text-[#c5a572] font-semibold">{bankData.totalBalance}€</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Revenus mensuels</span>
                            <span className="text-[#c5a572] font-semibold">{bankData.analysis.revenus.total}€</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400">Connectez votre compte pour voir les analyses</p>
                      )}
                    </div>
                    <div className="bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 p-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Risques</h3>
                      {bankData ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Ratio d'endettement</span>
                            <span className="text-[#c5a572] font-semibold">{bankData.debtRatio}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Épargne mensuelle</span>
                            <span className="text-[#c5a572] font-semibold">{bankData.analysis.tendances.taux_epargne.toFixed(1)}%</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400">Connectez votre compte pour voir les analyses</p>
                      )}
                    </div>
                    <div className="bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 p-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Objectifs</h3>
                      {bankData ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Progression</span>
                            <span className="text-[#c5a572] font-semibold">{bankData.goalsProgress}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Objectif mensuel</span>
                            <span className="text-[#c5a572] font-semibold">{bankData.monthlyGoal}€</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400">Connectez votre compte pour voir les analyses</p>
                      )}
                    </div>
                  </div>

                  {/* Section Analyse des dépenses */}
                  <div className="mt-8 bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Analyse de vos dépenses</h3>
                    <p className="text-gray-300 mb-6">
                      Francis analyse vos transactions bancaires pour vous aider à :
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-[#c5a572]/20 flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-6 h-6 text-[#c5a572]" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-white mb-2">Équilibrer votre budget</h4>
                          <p className="text-gray-400">
                            Visualisez vos dépenses par catégorie et identifiez les postes où vous pouvez optimiser votre budget.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-[#c5a572]/20 flex items-center justify-center flex-shrink-0">
                          <Calculator className="w-6 h-6 text-[#c5a572]" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-white mb-2">Comprendre vos dépenses</h4>
                          <p className="text-gray-400">
                            Découvrez où va votre argent et recevez des recommandations personnalisées pour optimiser vos finances.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#1a2942]/95 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-[#c5a572]/20"
              >
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Paramètres</h2>
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-lg p-6 border border-[#c5a572]/20">
                      <h3 className="text-lg font-semibold text-white mb-2">Profil</h3>
                      <p className="text-gray-400">Gérez vos informations personnelles</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-6 border border-[#c5a572]/20">
                      <h3 className="text-lg font-semibold text-white mb-2">Notifications</h3>
                      <p className="text-gray-400">Configurez vos préférences de notification</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-6 border border-[#c5a572]/20">
                      <h3 className="text-lg font-semibold text-white mb-2">Sécurité</h3>
                      <p className="text-gray-400">Gérez votre sécurité et confidentialité</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
} 
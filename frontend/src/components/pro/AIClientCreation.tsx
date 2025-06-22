import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Brain, Save, RotateCcw, Volume2, VolumeX, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { ClientProfile } from '../../types/clientProfile';

interface AIClientCreationProps {
  onClientCreated?: (client: ClientProfile) => void;
  onCancel?: () => void;
}

interface ExtractedData {
  nom_client?: string;
  prenom_client?: string;
  email_client?: string;
  telephone_principal_client?: string;
  profession_client1?: string;
  revenu_net_annuel_client1?: string;
  situation_maritale_client?: string;
  nombre_enfants_a_charge_client?: string;
  adresse_postale_client?: string;
  code_postal_client?: string;
  ville_client?: string;
  objectifs_fiscaux_client?: string;
  objectifs_patrimoniaux_client?: string;
  notes_objectifs_projets_client?: string;
}

export function AIClientCreation({ onClientCreated, onCancel }: AIClientCreationProps) {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [currentStep, setCurrentStep] = useState<'listening' | 'processing' | 'review' | 'saving'>('listening');
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialiser la reconnaissance vocale
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(prev => prev + finalTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        setError('Erreur de reconnaissance vocale. Veuillez réessayer.');
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    } else {
      setError('La reconnaissance vocale n\'est pas supportée par votre navigateur.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const startListening = () => {
    setError(null);
    setTranscript('');
    setExtractedData({});
    setCurrentStep('listening');
    setIsListening(true);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Erreur lors du démarrage de la reconnaissance vocale:', error);
        setError('Impossible de démarrer la reconnaissance vocale.');
      }
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    processTranscript();
  };

  const processTranscript = async () => {
    if (!transcript.trim()) {
      setError('Aucun texte détecté. Veuillez parler plus clairement.');
      return;
    }

    setCurrentStep('processing');
    setIsProcessing(true);

    try {
      // Envoyer le transcript à l'API pour extraction des données
      const response = await apiClient('/api/pro/extract-client-data', {
        method: 'POST',
        body: JSON.stringify({
          transcript: transcript,
          instructions: `
            Extrais les informations client suivantes du transcript :
            - Nom et prénom
            - Email et téléphone
            - Profession et revenus
            - Situation familiale
            - Adresse
            - Objectifs fiscaux et patrimoniaux
            - Notes et projets
            
            Retourne les données au format JSON.
          `
        })
      });

      setExtractedData(response.extracted_data || {});
      setCurrentStep('review');
    } catch (err: any) {
      console.error('Erreur lors du traitement:', err);
      setError('Erreur lors du traitement des données. Veuillez réessayer.');
      setCurrentStep('listening');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveClient = async () => {
    setCurrentStep('saving');
    
    try {
      const clientData = {
        ...extractedData,
        statut_dossier_pro: 'Prospect',
        civilite_client: 'M.',
        pays_residence_fiscale_client: 'France',
        ifi_concerne_client: 'Non précisé',
        // Valeurs par défaut pour les champs requis
        situation_maritale_client: extractedData.situation_maritale_client || 'Célibataire',
        nombre_enfants_a_charge_client: extractedData.nombre_enfants_a_charge_client || '0',
        revenu_net_annuel_client1: extractedData.revenu_net_annuel_client1 || '0',
      };

      const newClient = await apiClient<ClientProfile>('/api/pro/clients/', {
        method: 'POST',
        body: JSON.stringify(clientData)
      });

      if (onClientCreated) {
        onClientCreated(newClient);
      } else {
        navigate('/pro/dashboard');
      }
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Erreur lors de la sauvegarde du client. Veuillez réessayer.');
      setCurrentStep('review');
    }
  };

  const resetForm = () => {
    setTranscript('');
    setExtractedData({});
    setError(null);
    setCurrentStep('listening');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#162238] to-[#1E3253] text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Ajout Client IA</h1>
              <p className="text-[#c5a572] text-lg">Parlez, l'IA écoute et remplit automatiquement</p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-[#162238]/60 rounded-2xl border border-[#c5a572]/20 p-8">
          {/* Étape 1: Écoute */}
          {currentStep === 'listening' && (
            <div className="text-center">
              <div className="mb-8">
                <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg shadow-purple-500/50 animate-pulse' 
                    : 'bg-[#162238] border-2 border-[#c5a572]'
                }`}>
                  {isListening ? (
                    <Mic className="w-16 h-16 text-white" />
                  ) : (
                    <MicOff className="w-16 h-16 text-[#c5a572]" />
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isListening ? 'Écoute en cours...' : 'Prêt à écouter'}
                </h2>
                <p className="text-gray-400 mb-6">
                  {isListening 
                    ? 'Parlez clairement pour que l\'IA puisse extraire les informations' 
                    : 'Cliquez sur "Commencer" pour démarrer l\'écoute'
                  }
                </p>
              </div>

              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={startListening}
                  disabled={isListening}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  <Mic className="w-5 h-5" />
                  Commencer
                </button>
                
                <button
                  onClick={toggleMute}
                  className={`px-6 py-4 rounded-xl transition-all flex items-center gap-3 ${
                    isMuted 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  {isMuted ? 'Désactivé' : 'Activé'}
                </button>
              </div>

              {isListening && (
                <button
                  onClick={stopListening}
                  className="px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5" />
                  Terminer l'écoute
                </button>
              )}

              {/* Transcript en temps réel */}
              {transcript && (
                <div className="mt-8 text-left">
                  <h3 className="text-lg font-semibold text-white mb-3">Transcription en cours :</h3>
                  <div className="bg-[#0A192F]/60 rounded-xl p-4 border border-[#c5a572]/20 max-h-40 overflow-y-auto">
                    <p className="text-gray-300 leading-relaxed">{transcript}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Étape 2: Traitement */}
          {currentStep === 'processing' && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Traitement en cours...</h2>
              <p className="text-gray-400">L'IA analyse votre discours et extrait les informations client</p>
            </div>
          )}

          {/* Étape 3: Révision */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Données extraites</h2>
                <p className="text-gray-400">Vérifiez et complétez les informations avant de sauvegarder</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div className="bg-[#0A192F]/40 rounded-xl p-6 border border-[#c5a572]/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#c5a572]" />
                    Informations personnelles
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Prénom</label>
                      <input
                        type="text"
                        value={extractedData.prenom_client || ''}
                        onChange={(e) => setExtractedData(prev => ({ ...prev, prenom_client: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#162238]/60 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                        placeholder="Prénom"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                      <input
                        type="text"
                        value={extractedData.nom_client || ''}
                        onChange={(e) => setExtractedData(prev => ({ ...prev, nom_client: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#162238]/60 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                        placeholder="Nom"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        value={extractedData.email_client || ''}
                        onChange={(e) => setExtractedData(prev => ({ ...prev, email_client: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#162238]/60 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                        placeholder="email@exemple.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Téléphone</label>
                      <input
                        type="tel"
                        value={extractedData.telephone_principal_client || ''}
                        onChange={(e) => setExtractedData(prev => ({ ...prev, telephone_principal_client: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#162238]/60 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>
                </div>

                {/* Informations professionnelles */}
                <div className="bg-[#0A192F]/40 rounded-xl p-6 border border-[#c5a572]/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#c5a572]" />
                    Informations professionnelles
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Profession</label>
                      <input
                        type="text"
                        value={extractedData.profession_client1 || ''}
                        onChange={(e) => setExtractedData(prev => ({ ...prev, profession_client1: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#162238]/60 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                        placeholder="Profession"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Revenu net annuel</label>
                      <input
                        type="number"
                        value={extractedData.revenu_net_annuel_client1 || ''}
                        onChange={(e) => setExtractedData(prev => ({ ...prev, revenu_net_annuel_client1: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#162238]/60 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                        placeholder="50000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Situation familiale</label>
                      <select
                        value={extractedData.situation_maritale_client || ''}
                        onChange={(e) => setExtractedData(prev => ({ ...prev, situation_maritale_client: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#162238]/60 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      >
                        <option value="">Sélectionner</option>
                        <option value="Célibataire">Célibataire</option>
                        <option value="Marié(e)">Marié(e)</option>
                        <option value="Pacsé(e)">Pacsé(e)</option>
                        <option value="Divorcé(e)">Divorcé(e)</option>
                        <option value="Veuf/Veuve">Veuf/Veuve</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Nombre d'enfants</label>
                      <input
                        type="number"
                        value={extractedData.nombre_enfants_a_charge_client || ''}
                        onChange={(e) => setExtractedData(prev => ({ ...prev, nombre_enfants_a_charge_client: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#162238]/60 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div className="bg-[#0A192F]/40 rounded-xl p-6 border border-[#c5a572]/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#c5a572]" />
                  Adresse
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Adresse</label>
                    <input
                      type="text"
                      value={extractedData.adresse_postale_client || ''}
                      onChange={(e) => setExtractedData(prev => ({ ...prev, adresse_postale_client: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#162238]/60 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="123 Rue de la Paix"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Code postal</label>
                    <input
                      type="text"
                      value={extractedData.code_postal_client || ''}
                      onChange={(e) => setExtractedData(prev => ({ ...prev, code_postal_client: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#162238]/60 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="75001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Ville</label>
                    <input
                      type="text"
                      value={extractedData.ville_client || ''}
                      onChange={(e) => setExtractedData(prev => ({ ...prev, ville_client: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#162238]/60 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="Paris"
                    />
                  </div>
                </div>
              </div>

              {/* Objectifs */}
              <div className="bg-[#0A192F]/40 rounded-xl p-6 border border-[#c5a572]/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#c5a572]" />
                  Objectifs et projets
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Objectifs fiscaux</label>
                    <textarea
                      value={extractedData.objectifs_fiscaux_client || ''}
                      onChange={(e) => setExtractedData(prev => ({ ...prev, objectifs_fiscaux_client: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#162238]/60 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572] min-h-[80px]"
                      placeholder="Optimisation fiscale, réduction d'impôts..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Objectifs patrimoniaux</label>
                    <textarea
                      value={extractedData.objectifs_patrimoniaux_client || ''}
                      onChange={(e) => setExtractedData(prev => ({ ...prev, objectifs_patrimoniaux_client: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#162238]/60 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572] min-h-[80px]"
                      placeholder="Épargne, investissement, transmission..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Notes et projets</label>
                    <textarea
                      value={extractedData.notes_objectifs_projets_client || ''}
                      onChange={(e) => setExtractedData(prev => ({ ...prev, notes_objectifs_projets_client: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#162238]/60 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572] min-h-[80px]"
                      placeholder="Projets spécifiques, contraintes particulières..."
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4 pt-6">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all flex items-center gap-3"
                >
                  <RotateCcw className="w-5 h-5" />
                  Recommencer
                </button>
                
                <button
                  onClick={saveClient}
                  className="px-8 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-3"
                >
                  <Save className="w-5 h-5" />
                  Sauvegarder le client
                </button>
              </div>
            </div>
          )}

          {/* Étape 4: Sauvegarde */}
          {currentStep === 'saving' && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Sauvegarde en cours...</h2>
              <p className="text-gray-400">Création du profil client dans votre base de données</p>
            </div>
          )}

          {/* Messages d'erreur */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Bouton de retour */}
          {onCancel && (
            <div className="mt-8 text-center">
              <button
                onClick={onCancel}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              >
                ← Retour au dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
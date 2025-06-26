import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Building2, Target, Zap, Home, Globe, Clock, TrendingUp, Mic, MicOff } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface InitialData {
  activite_principale?: string;
  revenus_passifs?: string[];
  statuts_juridiques?: string[];
  pays_residence?: string;
  age?: number;
  patrimoine_immobilier?: boolean;
  revenus_complementaires?: string[];
  residence_fiscale?: string;
  patrimoine_situation?: string;
  // Champs pour saisie libre
  activite_principale_libre?: string;
  revenus_complementaires_libre?: string;
  statuts_juridiques_libre?: string;
  residence_fiscale_libre?: string;
  patrimoine_situation_libre?: string;
}

interface InitialProfileQuestionsProps {
  onComplete: (data: InitialData) => void;
}

export function InitialProfileQuestions({ onComplete }: InitialProfileQuestionsProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<InitialData>({});
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>('');
  const [dictatedText, setDictatedText] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [dictationError, setDictationError] = useState<string | null>(null);

  const questions = [
    {
      id: 'activite_principale',
      title: 'Quelle est votre activité principale ?',
      type: 'single-choice',
      icon: Target,
      options: [
        { value: 'salarie_cdi', label: 'Salarié en CDI', trigger: ['salarie'] },
        { value: 'fonctionnaire', label: 'Fonctionnaire', trigger: ['salarie'] },
        { value: 'dirigeant_sasu', label: 'Dirigeant SASU', trigger: ['dirigeant_IS'] },
        { value: 'dirigeant_sarl', label: 'Dirigeant SARL', trigger: ['dirigeant_IS'] },
        { value: 'autoentrepreneur', label: 'Auto-entrepreneur', trigger: ['independant'] },
        { value: 'profession_liberale', label: 'Profession libérale', trigger: ['independant'] },
        { value: 'retraite', label: 'Retraité', trigger: ['retraite'] },
        { value: 'sans_activite', label: 'Sans activité', trigger: [] }
      ]
    },
    {
      id: 'revenus_complementaires',
      title: 'Avez-vous des revenus complémentaires ?',
      type: 'multiple-choice',
      icon: TrendingUp,
      options: [
        { value: 'immobilier_locatif', label: 'Immobilier locatif', trigger: ['investisseur_immobilier'] },
        { value: 'dividendes', label: 'Dividendes', trigger: ['dirigeant_IS'] },
        { value: 'plus_values', label: 'Plus-values mobilières', trigger: ['investisseur'] },
        { value: 'crypto', label: 'Cryptomonnaies', trigger: ['investisseur'] },
        { value: 'scpi', label: 'SCPI', trigger: ['investisseur_immobilier'] },
        { value: 'lmnp', label: 'Location meublée (LMNP)', trigger: ['investisseur_immobilier'] },
        { value: 'aucun', label: 'Aucun revenu complémentaire', trigger: [] }
      ]
    },
    {
      id: 'statuts_juridiques',
      title: 'Détenez-vous des structures juridiques ?',
      type: 'multiple-choice',
      icon: Building2,
      options: [
        { value: 'SASU', label: 'SASU', trigger: ['dirigeant_IS'] },
        { value: 'SARL', label: 'SARL', trigger: ['dirigeant_IS'] },
        { value: 'SCI', label: 'SCI', trigger: ['investisseur_immobilier'] },
        { value: 'holding', label: 'Holding', trigger: ['dirigeant_IS'] },
        { value: 'EURL', label: 'EURL', trigger: ['independant'] },
        { value: 'aucune', label: 'Aucune structure', trigger: [] }
      ]
    },
    {
      id: 'residence_fiscale',
      title: 'Où résidez-vous fiscalement ?',
      type: 'single-choice',
      icon: Globe,
      options: [
        { value: 'france', label: 'France métropolitaine', trigger: [] },
        { value: 'dom_tom', label: 'DOM-TOM', trigger: ['expatrie'] },
        { value: 'portugal', label: 'Portugal', trigger: ['expatrie'] },
        { value: 'belgique', label: 'Belgique', trigger: ['expatrie'] },
        { value: 'suisse', label: 'Suisse', trigger: ['expatrie'] },
        { value: 'luxembourg', label: 'Luxembourg', trigger: ['expatrie'] },
        { value: 'autre_ue', label: 'Autre UE', trigger: ['expatrie'] },
        { value: 'hors_ue', label: 'Hors UE', trigger: ['expatrie'] }
      ]
    },
    {
      id: 'patrimoine_situation',
      title: 'Quelle est votre situation patrimoniale ?',
      type: 'single-choice',
      icon: Home,
      options: [
        { value: 'primo_accedant', label: 'Primo-accédant', trigger: [] },
        { value: 'proprietaire_rp', label: 'Propriétaire résidence principale', trigger: [] },
        { value: 'multi_proprietaire', label: 'Multi-propriétaire', trigger: ['investisseur_immobilier'] },
        { value: 'patrimoine_important', label: 'Patrimoine > 1M€', trigger: ['investisseur_immobilier'] },
        { value: 'ifi_concerne', label: 'Concerné par l\'IFI', trigger: ['investisseur_immobilier'] },
        { value: 'locataire', label: 'Locataire', trigger: [] }
      ]
    }
  ];

  const currentQ = questions[currentQuestion];

  const handleAnswer = (value: string | string[]) => {
    const newAnswers = {
      ...answers,
      [currentQ.id]: value
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      // Finaliser et calculer les déclencheurs
      const processedData = processAnswers(newAnswers);
      onComplete(processedData);
    }
  };

  const processAnswers = (data: InitialData): InitialData => {
    // Traitement des réponses pour créer le profil initial
    const processed: InitialData = { ...data };

    // Conversion des activités en structure
    if (data.activite_principale) {
      if (data.activite_principale.includes('dirigeant')) {
        processed.statuts_juridiques = processed.statuts_juridiques || [];
        if (data.activite_principale.includes('sasu')) {
          processed.statuts_juridiques.push('SASU');
        } else if (data.activite_principale.includes('sarl')) {
          processed.statuts_juridiques.push('SARL');
        }
      }
    }

    // Détection automatique pays de résidence
    if (data.residence_fiscale && data.residence_fiscale !== 'france') {
      processed.pays_residence = data.residence_fiscale;
    }

    // Détection patrimoine immobilier
    if (data.patrimoine_situation?.includes('multi') || 
        data.patrimoine_situation?.includes('ifi') ||
        data.revenus_complementaires?.includes('immobilier')) {
      processed.patrimoine_immobilier = true;
    }

    return processed;
  };

  const handleVoiceTranscription = async (text: string) => {
    setVoiceText(text);
    console.log('🎤 Texte reçu:', text);
    
    // Logique de mapping INTELLIGENT pour chaque question
    const lowerText = text.toLowerCase();
    let matched = false;
    
    switch (currentQ.id) {
      case 'activite_principale':
        // Mapping direct par mots-clés
        if (lowerText.includes('salarié') || lowerText.includes('salarie') || lowerText.includes('cdi') || lowerText.includes('employé')) {
          handleAnswer('salarie_cdi');
          matched = true;
        } else if (lowerText.includes('fonctionnaire') || lowerText.includes('fonction publique') || lowerText.includes('état')) {
          handleAnswer('fonctionnaire');
          matched = true;
        } else if (lowerText.includes('dirigeant') && (lowerText.includes('sasu') || lowerText.includes('sas'))) {
          handleAnswer('dirigeant_sasu');
          matched = true;
        } else if (lowerText.includes('dirigeant') && lowerText.includes('sarl')) {
          handleAnswer('dirigeant_sarl');
          matched = true;
        } else if (lowerText.includes('auto') || lowerText.includes('entrepreneur') || lowerText.includes('micro')) {
          handleAnswer('autoentrepreneur');
          matched = true;
        } else if (lowerText.includes('libéral') || lowerText.includes('liberal') || lowerText.includes('profession')) {
          handleAnswer('profession_liberale');
          matched = true;
        } else if (lowerText.includes('retraité') || lowerText.includes('retraite') || lowerText.includes('pensionné')) {
          handleAnswer('retraite');
          matched = true;
        } else if (lowerText.includes('sans activité') || lowerText.includes('chômage') || lowerText.includes('inactive')) {
          handleAnswer('sans_activite');
          matched = true;
        }
        
        // Si pas de correspondance directe, utiliser l'IA
        if (!matched) {
          await analyzeWithAI(text, currentQ.id);
        }
        break;
        
      case 'revenus_complementaires':
        const revenus = [];
        if (lowerText.includes('immobilier') || lowerText.includes('locatif') || lowerText.includes('loyer')) {
          revenus.push('immobilier_locatif');
        }
        if (lowerText.includes('dividende') || lowerText.includes('actions') || lowerText.includes('société')) {
          revenus.push('dividendes');
        }
        if (lowerText.includes('plus-value') || lowerText.includes('mobilier') || lowerText.includes('bourse')) {
          revenus.push('plus_values');
        }
        if (lowerText.includes('crypto') || lowerText.includes('bitcoin') || lowerText.includes('ethereum')) {
          revenus.push('crypto');
        }
        if (lowerText.includes('scpi') || lowerText.includes('pierre papier')) {
          revenus.push('scpi');
        }
        if (lowerText.includes('lmnp') || lowerText.includes('meublé') || lowerText.includes('location meublée')) {
          revenus.push('lmnp');
        }
        if (lowerText.includes('aucun') || lowerText.includes('pas de') || lowerText.includes('rien')) {
          revenus.push('aucun');
        }
        
        if (revenus.length > 0) {
          handleAnswer(revenus);
          matched = true;
        } else {
          await analyzeWithAI(text, currentQ.id);
        }
        break;
        
      case 'statuts_juridiques':
        const statuts = [];
        if (lowerText.includes('sasu') || lowerText.includes('sas')) {
          statuts.push('SASU');
        }
        if (lowerText.includes('sarl')) {
          statuts.push('SARL');
        }
        if (lowerText.includes('sci') || lowerText.includes('société civile')) {
          statuts.push('SCI');
        }
        if (lowerText.includes('holding') || lowerText.includes('société mère')) {
          statuts.push('holding');
        }
        if (lowerText.includes('eurl') || lowerText.includes('entreprise unipersonnelle')) {
          statuts.push('EURL');
        }
        if (lowerText.includes('aucune') || lowerText.includes('pas de') || lowerText.includes('rien')) {
          statuts.push('aucune');
        }
        
        if (statuts.length > 0) {
          handleAnswer(statuts);
          matched = true;
        } else {
          await analyzeWithAI(text, currentQ.id);
        }
        break;
        
      case 'residence_fiscale':
        if (lowerText.includes('france') && !lowerText.includes('dom') && !lowerText.includes('tom')) {
          handleAnswer('france');
          matched = true;
        } else if (lowerText.includes('dom') || lowerText.includes('tom') || lowerText.includes('martinique') || lowerText.includes('guadeloupe') || lowerText.includes('réunion')) {
          handleAnswer('dom_tom');
          matched = true;
        } else if (lowerText.includes('portugal')) {
          handleAnswer('portugal');
          matched = true;
        } else if (lowerText.includes('belgique')) {
          handleAnswer('belgique');
          matched = true;
        } else if (lowerText.includes('suisse')) {
          handleAnswer('suisse');
          matched = true;
        } else if (lowerText.includes('luxembourg')) {
          handleAnswer('luxembourg');
          matched = true;
        } else if (lowerText.includes('europe') || lowerText.includes('union européenne')) {
          handleAnswer('autre_ue');
          matched = true;
        } else {
          await analyzeWithAI(text, currentQ.id);
        }
        break;
        
      case 'patrimoine_situation':
        if (lowerText.includes('primo') || lowerText.includes('première fois') || lowerText.includes('premier achat')) {
          handleAnswer('primo_accedant');
          matched = true;
        } else if (lowerText.includes('propriétaire') && (lowerText.includes('résidence') || lowerText.includes('principale'))) {
          handleAnswer('proprietaire_rp');
          matched = true;
        } else if (lowerText.includes('multi') || lowerText.includes('plusieurs') || lowerText.includes('investisseur')) {
          handleAnswer('multi_proprietaire');
          matched = true;
        } else if (lowerText.includes('million') || lowerText.includes('1m') || lowerText.includes('patrimoine important')) {
          handleAnswer('patrimoine_important');
          matched = true;
        } else if (lowerText.includes('ifi') || lowerText.includes('impôt fortune')) {
          handleAnswer('ifi_concerne');
          matched = true;
        } else if (lowerText.includes('locataire') || lowerText.includes('loue')) {
          handleAnswer('locataire');
          matched = true;
        } else {
          await analyzeWithAI(text, currentQ.id);
        }
        break;
        
      default:
        await analyzeWithAI(text, currentQ.id);
    }
    
    if (matched) {
      console.log('✅ Correspondance trouvée par mapping direct');
    }
  };

  // Fonction d'analyse IA intelligente pour extraction automatique
  const analyzeWithAI = async (text: string, questionId: string) => {
    try {
      console.log('🤖 Analyse IA intelligente du texte:', text);
      setIsAIAnalyzing(true);
      setAiAnalysisResult('Francis analyse votre profil...');
      
      const response = await fetch('/api/ai/analyze-profile-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          context: `Question: ${currentQ.title}`,
          question_type: questionId,
          extract_all: true  // Demander d'extraire TOUTES les informations possibles
        }),
      });

      if (response.ok) {
        const aiResult = await response.json();
        console.log('🤖 Résultat IA complet:', aiResult);
        
        if (aiResult.success && aiResult.data) {
          const extractedData = aiResult.data;
          
          // Remplir TOUS les champs détectés, pas seulement celui de la question actuelle
          const updatedAnswers = { ...answers };
          let fieldsUpdated = 0;
          let detectedFields: string[] = [];
          
          // Mapper TOUTES les informations extraites
          if (extractedData.activite_principale) {
            updatedAnswers.activite_principale = extractedData.activite_principale;
            fieldsUpdated++;
            detectedFields.push('Activité principale');
            console.log('✅ Activité détectée:', extractedData.activite_principale);
          }
          
          if (extractedData.revenus_complementaires && extractedData.revenus_complementaires.length > 0) {
            updatedAnswers.revenus_complementaires = extractedData.revenus_complementaires;
            fieldsUpdated++;
            detectedFields.push('Revenus complémentaires');
            console.log('✅ Revenus complémentaires détectés:', extractedData.revenus_complementaires);
          }
          
          if (extractedData.statuts_juridiques && extractedData.statuts_juridiques.length > 0) {
            updatedAnswers.statuts_juridiques = extractedData.statuts_juridiques;
            fieldsUpdated++;
            detectedFields.push('Statuts juridiques');
            console.log('✅ Statuts juridiques détectés:', extractedData.statuts_juridiques);
          }
          
          if (extractedData.residence_fiscale) {
            updatedAnswers.residence_fiscale = extractedData.residence_fiscale;
            fieldsUpdated++;
            detectedFields.push('Résidence fiscale');
            console.log('✅ Résidence fiscale détectée:', extractedData.residence_fiscale);
          }
          
          if (extractedData.patrimoine_situation) {
            updatedAnswers.patrimoine_situation = extractedData.patrimoine_situation;
            fieldsUpdated++;
            detectedFields.push('Patrimoine');
            console.log('✅ Patrimoine détecté:', extractedData.patrimoine_situation);
          }
          
          // Informations supplémentaires détectées
          if (extractedData.age) {
            updatedAnswers.age = extractedData.age;
            detectedFields.push('Âge');
            console.log('✅ Âge détecté:', extractedData.age);
          }
          
          if (extractedData.pays_residence) {
            updatedAnswers.pays_residence = extractedData.pays_residence;
            detectedFields.push('Pays de résidence');
            console.log('✅ Pays de résidence détecté:', extractedData.pays_residence);
          }
          
          if (extractedData.patrimoine_immobilier !== null) {
            updatedAnswers.patrimoine_immobilier = extractedData.patrimoine_immobilier;
            detectedFields.push('Patrimoine immobilier');
            console.log('✅ Patrimoine immobilier détecté:', extractedData.patrimoine_immobilier);
          }
          
          if (extractedData.revenus_passifs && extractedData.revenus_passifs.length > 0) {
            updatedAnswers.revenus_passifs = extractedData.revenus_passifs;
            detectedFields.push('Revenus passifs');
            console.log('✅ Revenus passifs détectés:', extractedData.revenus_passifs);
          }
          
          // Mettre à jour l'état avec TOUTES les informations détectées
          setAnswers(updatedAnswers);
          
          // Afficher un message de succès
          if (fieldsUpdated > 0) {
            const resultMessage = `🎯 Francis a détecté et rempli automatiquement : ${detectedFields.join(', ')}`;
            setAiAnalysisResult(resultMessage);
            console.log(`🎯 IA a détecté et rempli ${fieldsUpdated} champs automatiquement`);
            
            // Si on a détecté l'information pour la question actuelle, passer à la suivante
            const currentFieldDetected = extractedData[questionId as keyof typeof extractedData];
            if (currentFieldDetected && 
                (typeof currentFieldDetected === 'string' || 
                 (Array.isArray(currentFieldDetected) && currentFieldDetected.length > 0))) {
              
              // Attendre un peu pour que l'utilisateur voie les changements
              setTimeout(() => {
                if (currentQuestion < questions.length - 1) {
                  setCurrentQuestion(currentQuestion + 1);
                  setAiAnalysisResult('');
                }
              }, 2000);
            } else {
              // Effacer le message après 3 secondes
              setTimeout(() => setAiAnalysisResult(''), 3000);
            }
          } else {
            // Aucune information détectée, sauvegarder en texte libre
            setAnswers(prev => ({ ...prev, [`${questionId}_libre`]: text }));
            setAiAnalysisResult('📝 Francis n\'a pas détecté d\'informations structurées, sauvegarde en texte libre');
            console.log('📝 Aucune information structurée détectée, sauvegarde en texte libre');
            setTimeout(() => setAiAnalysisResult(''), 3000);
          }
          
        } else {
          console.log('❌ IA n\'a pas pu analyser, saisie libre');
          setAnswers(prev => ({ ...prev, [`${questionId}_libre`]: text }));
          setAiAnalysisResult('❌ Erreur d\'analyse, sauvegarde en texte libre');
          setTimeout(() => setAiAnalysisResult(''), 3000);
        }
      } else {
        console.log('❌ Erreur API IA, saisie libre');
        setAnswers(prev => ({ ...prev, [`${questionId}_libre`]: text }));
        setAiAnalysisResult('❌ Erreur de connexion, sauvegarde en texte libre');
        setTimeout(() => setAiAnalysisResult(''), 3000);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse IA:', error);
      setAnswers(prev => ({ ...prev, [`${questionId}_libre`]: text }));
      setAiAnalysisResult('❌ Erreur technique, sauvegarde en texte libre');
      setTimeout(() => setAiAnalysisResult(''), 3000);
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  const handleVoiceError = (error: string) => {
    console.error('Erreur dictée:', error);
    // Optionnel: afficher un message d'erreur à l'utilisateur
  };

  const handleTranscriptionUpdate = (text: string) => {
    setDictatedText(text);
  };

  const handleTranscriptionComplete = async (text: string) => {
    setFinalTranscript(text);
    if (text) {
      handleDictation(text);
    }
  };

  const handleDictation = (text: string) => {
    // Logique pour gérer la transcription en temps réel
    console.log('🎤 Texte dicté:', text);
    handleVoiceTranscription(text);
  };

  const IconComponent = currentQ.icon;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      {/* Progress Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm text-gray-400">Question {currentQuestion + 1} sur {questions.length}</span>
          <span className="text-xs sm:text-sm text-[#c5a572] font-semibold">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-[#162238] rounded-full h-2">
          <motion.div 
            className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="bg-[#1E3253]/60 backdrop-blur-md rounded-xl border border-[#2A3F6C]/30 p-4 sm:p-6 lg:p-8 shadow-xl"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full mb-3 sm:mb-4">
            <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-[#162238]" />
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-2 px-2">{currentQ.title}</h2>
          <p className="text-sm sm:text-base text-gray-400 px-2">Cette information nous aide à personnaliser vos conseils fiscaux</p>
          
          {/* Bouton de dictée */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowVoiceInput(!showVoiceInput)}
              className="flex items-center gap-2 px-4 py-2 bg-[#c5a572]/20 border border-[#c5a572] rounded-lg text-[#c5a572] hover:bg-[#c5a572]/30 transition-colors"
            >
              {showVoiceInput ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="text-sm">{showVoiceInput ? 'Masquer' : 'Dictée vocale'}</span>
            </button>
          </div>
          
          {/* Interface de dictée */}
          {showVoiceInput && (
            <div className="mt-4 p-4 bg-[#162238]/50 rounded-lg border border-[#c5a572]/30">
              <div className="mt-6 flex justify-center">
                <VoiceRecorder
                  onTranscriptionUpdate={handleTranscriptionUpdate}
                  onTranscriptionComplete={handleTranscriptionComplete}
                  onError={(err) => setDictationError(err)}
                />
              </div>

              {dictatedText && (
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">Texte dicté (en direct) :</p>
                  <p className="text-white font-mono">{dictatedText}</p>
                </div>
              )}
              
              {/* Indicateur d'analyse IA */}
              {isAIAnalyzing && (
                <div className="mt-3 p-3 bg-[#1a2942] rounded border border-blue-500/50">
                  <div className="flex items-center gap-2 text-blue-400">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Francis analyse votre profil...</span>
                  </div>
                </div>
              )}
              
              {/* Résultat de l'analyse IA */}
              {aiAnalysisResult && !isAIAnalyzing && (
                <div className="mt-3 p-3 bg-[#1a2942] rounded border border-green-500/50">
                  <div className="text-sm text-green-400">{aiAnalysisResult}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 sm:space-y-3">
          {currentQ.options.map((option, index) => (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                if (currentQ.type === 'single-choice') {
                  handleAnswer(option.value);
                } else {
                  // Multiple choice logic
                  const currentValues = (answers[currentQ.id as keyof InitialData] as string[]) || [];
                  let newValues: string[];
                  
                  if (option.value === 'aucun' || option.value === 'aucune') {
                    newValues = [option.value];
                  } else {
                    newValues = currentValues.includes(option.value)
                      ? currentValues.filter(v => v !== option.value && v !== 'aucun' && v !== 'aucune')
                      : [...currentValues.filter(v => v !== 'aucun' && v !== 'aucune'), option.value];
                  }
                  
                  setAnswers(prev => ({ ...prev, [currentQ.id]: newValues }));
                }
              }}
              className={`w-full p-3 sm:p-4 text-left rounded-lg border transition-all duration-200 active:scale-95 sm:hover:scale-[1.02] ${
                currentQ.type === 'multiple-choice' && 
                ((answers[currentQ.id as keyof InitialData] as string[]) || []).includes(option.value)
                  ? 'bg-[#c5a572]/20 border-[#c5a572] text-white'
                  : 'bg-[#101A2E]/50 border-[#2A3F6C]/50 text-gray-300 hover:border-[#c5a572]/50 hover:bg-[#162238]/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base font-medium pr-2">{option.label}</span>
                <div className="flex-shrink-0">
                  {currentQ.type === 'single-choice' && (
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5a572] opacity-70" />
                  )}
                  {currentQ.type === 'multiple-choice' && 
                   ((answers[currentQ.id as keyof InitialData] as string[]) || []).includes(option.value) && (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#c5a572] rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Bouton Continuer pour les questions à choix multiples */}
        {currentQ.type === 'multiple-choice' && 
         (answers[currentQ.id as keyof InitialData] as string[])?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <button
              onClick={() => handleAnswer(answers[currentQ.id as keyof InitialData] as string[])}
              className="px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-lg shadow-lg hover:shadow-[#c5a572]/40 active:scale-95 sm:hover:scale-105 transition-all duration-300 flex items-center space-x-2 mx-auto text-sm sm:text-base"
            >
              <span>Continuer</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Navigation */}
      {currentQuestion > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
          className="mt-4 text-gray-400 hover:text-white transition-colors text-sm flex items-center px-4 sm:px-0"
        >
          ← Question précédente
        </motion.button>
      )}
    </div>
  );
} 
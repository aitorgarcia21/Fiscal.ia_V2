import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Building2, Target, Zap, Home, Globe, Clock, TrendingUp, Mic, MicOff, X, CheckCircle } from 'lucide-react';

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

  const handleDictation = (text: string) => {
    // Fonction simplifiée pour compatibilité
    console.log('🎤 Texte dicté:', text);
  };

  const IconComponent = currentQ.icon;

  // --- Mode vocal supprimé ---

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8">
        <div className="px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl shadow-lg opacity-50">
          <span>Mode vocal désactivé</span>
        </div>
      </div>

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
          
          {/* Assistant Francis Vocal */}
          <div className="mt-6">
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
            >
              <MicOff className="w-4 h-4" />
              Assistant vocal désactivé
            </button>
          </div>
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
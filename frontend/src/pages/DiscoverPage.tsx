import React, { useState } from 'react';
import { ArrowLeft, Users, MapPin, Briefcase, Home, TrendingUp, MessageCircle, Plus, Mic, MicOff, Volume2, Sparkles, AlertCircle, ChevronRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { VoiceRecorder } from '../components/VoiceRecorder';

interface UserCardProps {
  name: string;
  location: string;
  job: string;
  situation: string;
  goals: string[];
  score: number;
}

interface GuidedQuestion {
  id: string;
  question: string;
  placeholder: string;
  type: 'text' | 'voice';
  completed: boolean;
  answer: string;
}

const UserCard: React.FC<UserCardProps> = ({ name, location, job, situation, goals, score }) => {
  return (
    <div className="bg-[#1a2942]/80 backdrop-blur-sm rounded-xl p-6 border border-[#c5a572]/20 hover:border-[#c5a572]/40 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <div className="flex items-center text-gray-400 text-sm mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            {location}
          </div>
        </div>
        <div className="bg-[#c5a572] text-[#1a2942] font-bold px-3 py-1 rounded-full text-sm">
          {score}% match
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center text-sm">
          <Briefcase className="w-4 h-4 mr-2 text-[#c5a572]" />
          <span className="text-gray-300">{job}</span>
        </div>
        <div className="flex items-center text-sm">
          <Home className="w-4 h-4 mr-2 text-[#c5a572]" />
          <span className="text-gray-300">{situation}</span>
        </div>
        
        <div className="pt-2 mt-2 border-t border-[#c5a572]/20">
          <h4 className="text-sm font-medium text-[#c5a572] mb-2">Objectifs communs</h4>
          <div className="flex flex-wrap gap-2">
            {goals.map((goal, index) => (
              <span key={index} className="text-xs bg-[#c5a572]/10 text-[#c5a572] px-2 py-1 rounded">
                {goal}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-2 pt-3">
          <button className="flex-1 bg-[#c5a572] text-[#1a2942] font-medium py-2 px-4 rounded-lg hover:bg-[#e8cfa0] transition-colors flex items-center justify-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            Discuter
          </button>
          <button className="flex-1 bg-[#1a2942] text-[#c5a572] font-medium py-2 px-4 rounded-lg border border-[#c5a572]/30 hover:bg-[#223c63] transition-colors flex items-center justify-center">
            <Plus className="w-4 h-4 mr-2" />
            Suivre
          </button>
        </div>
      </div>
    </div>
  );
};

const GuidedQuestionCard: React.FC<{
  question: GuidedQuestion;
  onAnswer: (id: string, answer: string) => void;
  onVoiceComplete: (id: string, text: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}> = ({ question, onAnswer, onVoiceComplete, isRecording, setIsRecording }) => {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const handleVoiceComplete = (text: string) => {
    onVoiceComplete(question.id, text);
    setShowVoiceRecorder(false);
    setIsRecording(false);
  };

  const handleVoiceError = (error: string) => {
    setVoiceError(error);
    setTimeout(() => setVoiceError(null), 5000);
  };

  const toggleVoiceRecorder = () => {
    if (showVoiceRecorder) {
      setShowVoiceRecorder(false);
      setIsRecording(false);
    } else {
      setShowVoiceRecorder(true);
      setIsRecording(true);
    }
  };

  return (
    <div className={`bg-[#1a2942]/80 backdrop-blur-sm rounded-xl p-6 border transition-colors ${
      question.completed 
        ? 'border-[#c5a572]/40 bg-[#c5a572]/5' 
        : 'border-[#c5a572]/20 hover:border-[#c5a572]/40'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {question.completed ? (
            <CheckCircle className="w-6 h-6 text-[#c5a572]" />
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-[#c5a572] flex items-center justify-center">
              <span className="text-[#c5a572] text-sm font-bold">?</span>
            </div>
          )}
          <h3 className="text-lg font-semibold text-white">{question.question}</h3>
        </div>
      </div>

      {!question.completed ? (
        <div className="space-y-4">
          {/* Input textuel */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={question.answer}
              onChange={(e) => onAnswer(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="flex-1 px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
            />
            
            {/* Bouton dictée vocale */}
            <button
              type="button"
              onClick={toggleVoiceRecorder}
              className={`p-3 rounded-lg transition-all duration-300 flex items-center justify-center shadow-md border ${
                isRecording 
                  ? 'bg-[#c5a572] text-[#1a2942] border-[#c5a572]' 
                  : 'bg-[#1a2942] text-[#c5a572] border-[#c5a572]/30 hover:bg-[#223c63]'
              }`}
              aria-label={isRecording ? "Arrêter la dictée" : "Commencer la dictée"}
            >
              {isRecording ? <Volume2 className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          {/* Enregistreur vocal */}
          {showVoiceRecorder && (
            <div className="p-4 bg-[#1a2942]/30 border border-[#c5a572]/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-[#c5a572] flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Dictée vocale
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowVoiceRecorder(false);
                    setIsRecording(false);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {voiceError && (
                <div className="mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {voiceError}
                </div>
              )}
              
              <VoiceRecorder
                onTranscriptionUpdate={(text) => onAnswer(question.id, text)}
                onTranscriptionComplete={handleVoiceComplete}
                onError={handleVoiceError}
                className="flex justify-center"
              />
            </div>
          )}

          {/* Bouton de validation */}
          {question.answer.trim() && (
            <button
              onClick={() => onAnswer(question.id, question.answer)}
              className="w-full bg-[#c5a572] text-[#1a2942] font-medium py-3 px-4 rounded-lg hover:bg-[#e8cfa0] transition-colors flex items-center justify-center"
            >
              Valider ma réponse
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#c5a572]/10 border border-[#c5a572]/20 rounded-lg p-4">
          <p className="text-[#c5a572] font-medium">Votre réponse :</p>
          <p className="text-white mt-1">{question.answer}</p>
        </div>
      )}
    </div>
  );
};

export function DiscoverPage() {
  const navigate = useNavigate();
  const { isProfessional } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  
  // Questions guidées pour les particuliers
  const [guidedQuestions, setGuidedQuestions] = useState<GuidedQuestion[]>([
    {
      id: '1',
      question: "Quel est votre objectif fiscal principal ?",
      placeholder: "Ex: Optimiser mes impôts, préparer ma retraite, investir...",
      type: 'voice',
      completed: false,
      answer: ''
    },
    {
      id: '2', 
      question: "Quelle est votre situation familiale ?",
      placeholder: "Ex: Célibataire, marié avec 2 enfants...",
      type: 'voice',
      completed: false,
      answer: ''
    },
    {
      id: '3',
      question: "Quels sont vos revenus approximatifs ?",
      placeholder: "Ex: 3000€ par mois, 50000€ par an...",
      type: 'voice',
      completed: false,
      answer: ''
    },
    {
      id: '4',
      question: "Avez-vous des investissements ou un patrimoine ?",
      placeholder: "Ex: Un appartement, des actions, de l'épargne...",
      type: 'voice',
      completed: false,
      answer: ''
    },
    {
      id: '5',
      question: "Quel est votre niveau de connaissance fiscale ?",
      placeholder: "Ex: Débutant, intermédiaire, avancé...",
      type: 'voice',
      completed: false,
      answer: ''
    }
  ]);

  const handleAnswer = (id: string, answer: string) => {
    setGuidedQuestions(prev => prev.map(q => 
      q.id === id 
        ? { ...q, answer, completed: answer.trim().length > 0 }
        : q
    ));
  };

  const handleVoiceComplete = (id: string, text: string) => {
    handleAnswer(id, text);
  };

  const completedQuestions = guidedQuestions.filter(q => q.completed).length;
  const totalQuestions = guidedQuestions.length;
  
  // Données factices pour les utilisateurs (pros uniquement)
  const users = [
    {
      id: 1,
      name: 'Marie D.',
      location: 'Paris, France',
      job: 'Freelance en communication',
      situation: 'Auto-entrepreneur',
      goals: ['Optimisation fiscale', 'Épargne retraite'],
      score: 87
    },
    {
      id: 2,
      name: 'Thomas L.',
      location: 'Lyon, France',
      job: 'Développeur indépendant',
      situation: 'SASU',
      goals: ['Déduction des frais', 'Investissement locatif'],
      score: 76
    },
    {
      id: 3,
      name: 'Sophie M.',
      location: 'Bordeaux, France',
      job: 'Consultante en gestion',
      situation: 'Portage salarial',
      goals: ['Optimisation fiscale', 'Épargne retraite'],
      score: 92
    },
    {
      id: 4,
      name: 'Alexandre P.',
      location: 'Paris, France',
      job: 'Graphiste freelance',
      situation: 'Auto-entrepreneur',
      goals: ['Déduction des frais', 'Investissement locatif'],
      score: 81
    },
    {
      id: 5,
      name: 'Julie T.',
      location: 'Toulouse, France',
      job: 'Rédactrice web',
      situation: 'Portage salarial',
      goals: ['Optimisation fiscale', 'Épargne retraite'],
      score: 79
    },
    {
      id: 6,
      name: 'Nicolas B.',
      location: 'Marseille, France',
      job: 'Photographe indépendant',
      situation: 'Auto-entrepreneur',
      goals: ['Déduction des frais', 'Réduction d\'impôts'],
      score: 85
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-[#c5a572] hover:text-[#e8cfa0] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Retour au chat
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center">
            {isProfessional ? (
              <>
                <Users className="w-6 h-6 mr-2 text-[#c5a572]" />
                Découvrez des utilisateurs
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-2 text-[#c5a572]" />
                Découvrez vos options
              </>
            )}
          </h1>
          <div className="w-24"></div>
        </div>

        {isProfessional ? (
          // Interface pour les professionnels
          <>
            {/* Filtres */}
            <div className="mb-8 p-4 bg-[#1a2942]/80 backdrop-blur-sm rounded-xl border border-[#c5a572]/20">
              <h2 className="text-lg font-semibold text-white mb-4">Filtrer par</h2>
              <div className="flex flex-wrap gap-3">
                <select className="px-4 py-2 bg-[#1a2942] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#c5a572]" aria-label="Filtrer par localisation">
                  <option>Toutes les localisations</option>
                  <option>Paris</option>
                  <option>Lyon</option>
                  <option>Bordeaux</option>
                  <option>Toulouse</option>
                  <option>Marseille</option>
                </select>
                
                <select className="px-4 py-2 bg-[#1a2942] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#c5a572]" aria-label="Filtrer par statut">
                  <option>Tous les statuts</option>
                  <option>Auto-entrepreneur</option>
                  <option>SASU</option>
                  <option>Portage salarial</option>
                </select>
                
                <select className="px-4 py-2 bg-[#1a2942] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#c5a572]" aria-label="Filtrer par objectif">
                  <option>Tous les objectifs</option>
                  <option>Optimisation fiscale</option>
                  <option>Déduction des frais</option>
                  <option>Investissement locatif</option>
                  <option>Épargne retraite</option>
                </select>
                
                <button className="ml-auto px-4 py-2 bg-[#c5a572] text-[#1a2942] font-medium rounded-lg hover:bg-[#e8cfa0] transition-colors">
                  Appliquer les filtres
                </button>
              </div>
            </div>

            {/* Grille d'utilisateurs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map(user => (
                <UserCard
                  key={user.id}
                  name={user.name}
                  location={user.location}
                  job={user.job}
                  situation={user.situation}
                  goals={user.goals}
                  score={user.score}
                />
              ))}
            </div>
          </>
        ) : (
          // Interface pour les particuliers
          <>
            {/* Progression */}
            <div className="mb-8 p-6 bg-[#1a2942]/80 backdrop-blur-sm rounded-xl border border-[#c5a572]/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Votre profil fiscal</h2>
                <div className="text-[#c5a572] font-medium">
                  {completedQuestions}/{totalQuestions} questions
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-[#1a2942] rounded-full h-3 mb-4">
                <div 
                  className="bg-[#c5a572] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(completedQuestions / totalQuestions) * 100}%` }}
                ></div>
              </div>
              
              <p className="text-gray-300 text-sm">
                Répondez à ces questions pour que Francis puisse mieux vous accompagner. 
                Utilisez la dictée vocale pour répondre plus naturellement !
              </p>
            </div>

            {/* Questions guidées */}
            <div className="space-y-6">
              {guidedQuestions.map((question) => (
                <GuidedQuestionCard
                  key={question.id}
                  question={question}
                  onAnswer={handleAnswer}
                  onVoiceComplete={handleVoiceComplete}
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                />
              ))}
            </div>

            {/* Résumé final */}
            {completedQuestions === totalQuestions && (
              <div className="mt-8 p-6 bg-[#c5a572]/10 border border-[#c5a572]/30 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-[#c5a572]" />
                  <h3 className="text-xl font-bold text-white">Profil complété !</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Francis a maintenant toutes les informations nécessaires pour vous proposer 
                  des conseils personnalisés et des stratégies d'optimisation adaptées.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-[#c5a572] text-[#1a2942] font-medium py-3 px-6 rounded-lg hover:bg-[#e8cfa0] transition-colors"
                >
                  Retourner au chat avec Francis
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

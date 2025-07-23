import React, { useState, useEffect, useRef } from 'react';
import { FileCheck, AlertCircle, CheckCircle, Clock, Users, Shield, Eye, Mic } from 'lucide-react';

interface KYCData {
  // Identification
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  pieceIdentite: string;
  numeroPiece: string;
  
  // Adresse
  adresse: string;
  codePostal: string;
  ville: string;
  pays: string;
  
  // Situation professionnelle
  profession: string;
  employeur: string;
  revenus: string;
  
  // Situation patrimoniale
  patrimoineTotal: string;
  originePatrimoine: string;
  
  // MiFID II
  connaissancesFinancieres: 'debutant' | 'intermediaire' | 'expert';
  experienceInvestissement: string;
  toleranceRisque: 'faible' | 'moyenne' | 'elevee';
  objectifsInvestissement: string[];
  horizonInvestissement: string;
  
  // AML/LCB-FT
  personnePolitiquementExposee: boolean;
  sanctionsEconomiques: boolean;
  originesFonds: string;
  
  // ESG/Durabilité
  preferencesESG: boolean;
  criteresESG: string[];
}

interface ComplianceAssistantProps {
  onDataUpdate: (data: Partial<KYCData>) => void;
  onCompleteCheck: (score: number) => void;
}

const ComplianceAssistant: React.FC<ComplianceAssistantProps> = ({
  onDataUpdate,
  onCompleteCheck
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [kycData, setKycData] = useState<Partial<KYCData>>({});
  const [isListening, setIsListening] = useState(false);
  const [completenessScore, setCompletenessScore] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const complianceSteps = [
    {
      title: "Identification du client",
      icon: Users,
      questions: [
        "Pouvez-vous me donner vos nom et prénom complets ?",
        "Quelle est votre date de naissance ?",
        "Où êtes-vous né(e) ?",
        "Quelle est votre nationalité ?",
        "Quel type de pièce d'identité avez-vous ? (CNI, passeport, etc.)"
      ],
      fields: ['nom', 'prenom', 'dateNaissance', 'lieuNaissance', 'nationalite', 'pieceIdentite']
    },
    {
      title: "Adresse de résidence",
      icon: FileCheck,
      questions: [
        "Quelle est votre adresse complète ?",
        "Dans quelle ville résidez-vous ?",
        "Quel est votre code postal ?"
      ],
      fields: ['adresse', 'ville', 'codePostal', 'pays']
    },
    {
      title: "Situation professionnelle",
      icon: Shield,
      questions: [
        "Quelle est votre profession actuelle ?",
        "Pour quel employeur travaillez-vous ?",
        "Quels sont vos revenus annuels approximatifs ?"
      ],
      fields: ['profession', 'employeur', 'revenus']
    },
    {
      title: "Patrimoine & Origine des fonds",
      icon: Eye,
      questions: [
        "Quel est le montant approximatif de votre patrimoine total ?",
        "Quelle est l'origine principale de votre patrimoine ?",
        "D'où proviennent les fonds que vous souhaitez investir ?"
      ],
      fields: ['patrimoineTotal', 'originePatrimoine', 'originesFonds']
    },
    {
      title: "Connaissances financières (MiFID II)",
      icon: CheckCircle,
      questions: [
        "Comment évalueriez-vous vos connaissances en matière d'investissement ?",
        "Quelle est votre expérience des marchés financiers ?",
        "Quel est votre appétit pour le risque ?",
        "Quels sont vos objectifs d'investissement ?"
      ],
      fields: ['connaissancesFinancieres', 'experienceInvestissement', 'toleranceRisque', 'objectifsInvestissement']
    },
    {
      title: "Vérifications AML/LCB-FT",
      icon: AlertCircle,
      questions: [
        "Êtes-vous ou avez-vous été une personne politiquement exposée ?",
        "Faites-vous l'objet de sanctions économiques ?",
        "Avez-vous des préférences en matière d'investissement durable (ESG) ?"
      ],
      fields: ['personnePolitiquementExposee', 'sanctionsEconomiques', 'preferencesESG']
    }
  ];

  // Calcul du score de complétude
  useEffect(() => {
    const totalFields = complianceSteps.flatMap(step => step.fields).length;
    const completedFields = Object.keys(kycData).filter(key => 
      kycData[key as keyof KYCData] && kycData[key as keyof KYCData] !== ''
    ).length;
    
    const score = Math.round((completedFields / totalFields) * 100);
    setCompletenessScore(score);
    
    // Identification des champs manquants
    const allFields = complianceSteps.flatMap(step => step.fields);
    const missing = allFields.filter(field => 
      !kycData[field as keyof KYCData] || kycData[field as keyof KYCData] === ''
    );
    setMissingFields(missing);
    
    onCompleteCheck(score);
  }, [kycData, onCompleteCheck]);

  // Reconnaissance vocale
  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';
      
      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        processVoiceInput(transcript);
      };
      
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Traitement de l'input vocal avec IA
  const processVoiceInput = async (transcript: string) => {
    try {
      const response = await fetch('/api/compliance/extract-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript,
          currentStep: complianceSteps[currentStep].title,
          existingData: kycData
        })
      });
      
      const extractedData = await response.json();
      
      setKycData(prev => ({ ...prev, ...extractedData }));
      onDataUpdate(extractedData);
    } catch (error) {
      console.error('Erreur extraction KYC:', error);
    }
  };

  const currentStepData = complianceSteps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header avec score de complétude */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#162238]">
            Assistant Conformité KYC/AML
          </h2>
          <p className="text-gray-600">Collecte automatisée des données réglementaires</p>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-[#c5a572]">
            {completenessScore}%
          </div>
          <div className="text-sm text-gray-500">Complétude</div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {complianceSteps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center ${
                index <= currentStep ? 'text-[#c5a572]' : 'text-gray-400'
              }`}
            >
              <step.icon size={20} />
              <span className="ml-1 text-xs hidden md:block">{step.title}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#c5a572] h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / complianceSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Section principale */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Questions dynamiques */}
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <StepIcon className="text-[#c5a572] mr-3" size={24} />
            <h3 className="text-xl font-semibold">{currentStepData.title}</h3>
          </div>
          
          {currentStepData.questions.map((question, index) => (
            <div key={index} className="p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-[#162238] mb-2">{question}</p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center px-3 py-1 rounded-full text-sm ${
                    isListening 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-[#c5a572] text-white hover:bg-[#b8985f]'
                  }`}
                >
                  <Mic size={16} className="mr-1" />
                  {isListening ? 'Arrêter' : 'Répondre'}
                </button>
                {isListening && (
                  <div className="flex items-center text-red-600">
                    <div className="animate-pulse w-2 h-2 bg-red-600 rounded-full mr-1" />
                    En écoute...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Données collectées */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-[#162238]">Données collectées</h3>
          
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {currentStepData.fields.map(field => (
              <div key={field} className="mb-3 pb-3 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize text-gray-700">
                    {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  {kycData[field as keyof KYCData] ? (
                    <CheckCircle className="text-green-500" size={16} />
                  ) : (
                    <Clock className="text-gray-400" size={16} />
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {kycData[field as keyof KYCData] || 'Non renseigné'}
                </div>
              </div>
            ))}
          </div>

          {/* Alertes champs manquants */}
          {missingFields.length > 0 && (
            <div className="bg-orange-100 border-l-4 border-orange-500 p-4">
              <div className="flex items-center">
                <AlertCircle className="text-orange-500 mr-2" size={20} />
                <h4 className="font-semibold text-orange-800">
                  {missingFields.length} champ(s) manquant(s)
                </h4>
              </div>
              <ul className="mt-2 text-sm text-orange-700">
                {missingFields.slice(0, 5).map(field => (
                  <li key={field}>• {field.replace(/([A-Z])/g, ' $1').toLowerCase()}</li>
                ))}
                {missingFields.length > 5 && (
                  <li>... et {missingFields.length - 5} autre(s)</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6 pt-6 border-t">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
        >
          Précédent
        </button>
        
        <div className="text-center">
          <div className="text-sm text-gray-500">
            Étape {currentStep + 1} sur {complianceSteps.length}
          </div>
        </div>
        
        <button
          onClick={() => setCurrentStep(Math.min(complianceSteps.length - 1, currentStep + 1))}
          disabled={currentStep === complianceSteps.length - 1}
          className="px-6 py-2 bg-[#c5a572] text-white rounded-lg hover:bg-[#b8985f] disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default ComplianceAssistant;

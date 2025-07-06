import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Settings, Headphones, MessageSquare, 
  Zap, Shield, Globe2, Download, FileText, 
  Play, Pause, Volume2, Users, Clock, Calendar,
  CheckCircle, AlertCircle, Info, HelpCircle
} from 'lucide-react';

// Déclaration de type pour Chrome Extension API
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage: (message: any, callback?: (response: any) => void) => void;
      };
    };
  }
}

export function ProTeamsAssistantPage() {
  const navigate = useNavigate();
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [isExtensionActive, setIsExtensionActive] = useState(false);
  const [teamsSettings, setTeamsSettings] = useState({
    autoListen: false,
    realTimeSuggestions: true,
    saveTranscriptions: true,
    privacyMode: true,
    meetingNotifications: true,
    autoSummary: false
  });

  const [recentMeetings, setRecentMeetings] = useState([
    {
      id: 1,
      title: "Réunion client - Optimisation fiscale",
      date: "2024-01-15",
      duration: 45,
      participants: 3,
      status: "completed"
    },
    {
      id: 2,
      title: "Consultation patrimoniale",
      date: "2024-01-14",
      duration: 30,
      participants: 2,
      status: "completed"
    }
  ]);

  useEffect(() => {
    checkExtensionStatus();
  }, []);

  const checkExtensionStatus = () => {
    // Vérifier si l'extension Francis Teams est installée
    if (typeof window !== 'undefined' && window.chrome?.runtime) {
      window.chrome.runtime.sendMessage({ type: 'CHECK_TEAMS_STATUS' }, (response) => {
        setIsExtensionInstalled(!!response?.installed);
        setIsExtensionActive(!!response?.active);
      });
    }
  };

  const installExtension = () => {
    // Lien vers l'installation de l'extension
    window.open('https://chrome.google.com/webstore/detail/francis-teams-assistant', '_blank');
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setTeamsSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const startTeamsMeeting = () => {
    window.open('https://teams.microsoft.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] to-[#0D1F3A] text-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Francis pour Microsoft Teams
          </h1>
          <p className="text-gray-400">
            Votre assistant fiscal intelligent pendant les réunions Teams
          </p>
        </div>

        {/* Statut de l'extension */}
        <div className="bg-[#0E2444]/50 rounded-xl p-6 mb-6 border border-[#2A3F6C]/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isExtensionActive ? 'bg-green-500/20 border border-green-500/40' : 'bg-yellow-500/20 border border-yellow-500/40'
              }`}>
                <Headphones className={`w-6 h-6 ${isExtensionActive ? 'text-green-400' : 'text-yellow-400'}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Extension Teams</h2>
                <p className="text-gray-400">
                  {isExtensionActive ? 'Active et prête' : isExtensionInstalled ? 'Installée mais inactive' : 'Non installée'}
                </p>
              </div>
            </div>
            {!isExtensionInstalled && (
              <button
                onClick={installExtension}
                className="px-4 py-2 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] text-[#0A192F] font-semibold rounded-lg"
              >
                Installer l'extension
              </button>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={startTeamsMeeting}
            className="bg-[#0E2444]/50 rounded-xl p-6 border border-[#2A3F6C]/40 hover:border-[#88C0D0]/40 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#88C0D0] to-[#81A1C1] rounded-xl flex items-center justify-center">
                <Play className="w-6 h-6 text-[#0A192F]" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-[#88C0D0] transition-colors">
                  Nouvelle réunion Teams
                </h3>
                <p className="text-sm text-gray-400">Lancer une réunion avec Francis</p>
              </div>
            </div>
          </button>

          <div className="bg-[#0E2444]/50 rounded-xl p-6 border border-[#2A3F6C]/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#B48EAD] to-[#A3BE8C] rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#0A192F]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Transcriptions</h3>
                <p className="text-sm text-gray-400">Accéder aux transcriptions</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0E2444]/50 rounded-xl p-6 border border-[#2A3F6C]/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#8FBCBB] to-[#88C0D0] rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-[#0A192F]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Paramètres</h3>
                <p className="text-sm text-gray-400">Configurer Francis Teams</p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration et paramètres */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0E2444]/50 rounded-xl p-6 border border-[#2A3F6C]/40">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#88C0D0]" />
              Paramètres Francis Teams
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={teamsSettings.autoListen}
                  onChange={(e) => handleSettingChange('autoListen', e.target.checked)}
                  className="w-4 h-4 text-[#88C0D0] bg-[#0A192F] border-[#2A3F6C] rounded"
                />
                <span className="text-gray-300">Écoute automatique en réunion</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={teamsSettings.realTimeSuggestions}
                  onChange={(e) => handleSettingChange('realTimeSuggestions', e.target.checked)}
                  className="w-4 h-4 text-[#88C0D0] bg-[#0A192F] border-[#2A3F6C] rounded"
                />
                <span className="text-gray-300">Suggestions en temps réel</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={teamsSettings.saveTranscriptions}
                  onChange={(e) => handleSettingChange('saveTranscriptions', e.target.checked)}
                  className="w-4 h-4 text-[#88C0D0] bg-[#0A192F] border-[#2A3F6C] rounded"
                />
                <span className="text-gray-300">Sauvegarder les transcriptions</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={teamsSettings.privacyMode}
                  onChange={(e) => handleSettingChange('privacyMode', e.target.checked)}
                  className="w-4 h-4 text-[#88C0D0] bg-[#0A192F] border-[#2A3F6C] rounded"
                />
                <span className="text-gray-300">Mode confidentialité</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={teamsSettings.meetingNotifications}
                  onChange={(e) => handleSettingChange('meetingNotifications', e.target.checked)}
                  className="w-4 h-4 text-[#88C0D0] bg-[#0A192F] border-[#2A3F6C] rounded"
                />
                <span className="text-gray-300">Notifications de réunion</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={teamsSettings.autoSummary}
                  onChange={(e) => handleSettingChange('autoSummary', e.target.checked)}
                  className="w-4 h-4 text-[#88C0D0] bg-[#0A192F] border-[#2A3F6C] rounded"
                />
                <span className="text-gray-300">Résumé automatique</span>
              </label>
            </div>
          </div>

          <div className="bg-[#0E2444]/50 rounded-xl p-6 border border-[#2A3F6C]/40">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#88C0D0]" />
              Fonctionnalités Francis Teams
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <Mic className="w-4 h-4 text-[#88C0D0]" />
                <span>Transcription en temps réel</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300">
                <MessageSquare className="w-4 h-4 text-[#88C0D0]" />
                <span>Suggestions contextuelles</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300">
                <Shield className="w-4 h-4 text-[#88C0D0]" />
                <span>Chiffrement des données</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300">
                <Globe2 className="w-4 h-4 text-[#88C0D0]" />
                <span>Intégration Teams native</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300">
                <Volume2 className="w-4 h-4 text-[#88C0D0]" />
                <span>Détection automatique</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300">
                <FileText className="w-4 h-4 text-[#88C0D0]" />
                <span>Export des transcriptions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Réunions récentes */}
        <div className="mt-8 bg-[#0E2444]/50 rounded-xl p-6 border border-[#2A3F6C]/40">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#88C0D0]" />
            Réunions récentes avec Francis
          </h3>
          
          <div className="space-y-3">
            {recentMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 bg-[#0A192F]/30 rounded-lg border border-[#2A3F6C]/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#88C0D0] to-[#81A1C1] rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#0A192F]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{meeting.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{meeting.date}</span>
                      <span>{meeting.duration} min</span>
                      <span>{meeting.participants} participants</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {meeting.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  )}
                  <button className="px-3 py-1 bg-[#88C0D0]/20 text-[#88C0D0] rounded text-sm hover:bg-[#88C0D0]/30 transition-colors">
                    Voir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guide d'utilisation */}
        <div className="mt-8 bg-[#0E2444]/50 rounded-xl p-6 border border-[#2A3F6C]/40">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#88C0D0]" />
            Comment utiliser Francis dans Teams
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#0A192F]/30 rounded-lg">
              <div className="w-12 h-12 bg-[#88C0D0] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-[#0A192F] font-bold">1</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Installer l'extension</h4>
              <p className="text-sm text-gray-400">Téléchargez l'extension Francis depuis le Chrome Web Store</p>
            </div>
            
            <div className="text-center p-4 bg-[#0A192F]/30 rounded-lg">
              <div className="w-12 h-12 bg-[#88C0D0] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-[#0A192F] font-bold">2</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Rejoindre Teams</h4>
              <p className="text-sm text-gray-400">Lancez Microsoft Teams et rejoignez votre réunion</p>
            </div>
            
            <div className="text-center p-4 bg-[#0A192F]/30 rounded-lg">
              <div className="w-12 h-12 bg-[#88C0D0] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-[#0A192F] font-bold">3</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Activer Francis</h4>
              <p className="text-sm text-gray-400">Cliquez sur "Activer Francis" pour commencer l'assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
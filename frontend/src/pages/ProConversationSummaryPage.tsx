import React from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { Bot, User, ArrowLeft } from 'lucide-react';

// Structure flexible pour l'historique de conversation
interface ConversationTurn {
  type: 'question' | 'answer' | 'info';
  text: string;
  sender: 'Francis' | 'User' | 'System';
}

const ProConversationSummaryPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();

  // Accepte un format plus flexible pour l'historique
  const conversationHistory = (location.state?.conversationHistory as any[])?.map(item => ({
    type: item.type || (item.sender === 'Francis' ? 'question' : 'answer'),
    text: item.text || item.question || item.answer || 'Contenu non disponible',
    sender: item.sender || 'System',
  })) || [];
  
  const clientName = location.state?.clientName || "Client";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#101d35] to-[#1a2942] text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to={`/pro/clients/${clientId}`}
            className="inline-flex items-center text-[#c5a572] hover:text-[#e8cfa0] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour au dossier de {clientName}
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Historique de la Conversation
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Client : <span className="font-semibold text-white">{clientName}</span>
          </p>
        </div>

        <div className="bg-[#1E3253]/60 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl">
          {conversationHistory.length > 0 ? (
            <div className="space-y-8">
              {conversationHistory.map((turn, index) => {
                const isFrancis = turn.sender === 'Francis';
                return (
                  <div key={index} className={`flex items-start gap-4 ${!isFrancis ? 'justify-end' : ''}`}>
                    {isFrancis && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#c5a572] flex items-center justify-center">
                        <Bot className="w-6 h-6 text-[#162238]" />
                      </div>
                    )}
                    <div className={`p-4 rounded-xl max-w-lg ${
                        isFrancis 
                        ? 'bg-[#2A3F6C]/50 rounded-tl-none' 
                        : 'bg-[#3e8e7e]/70 rounded-tr-none'
                    }`}>
                      <p className={`font-semibold text-white ${!isFrancis ? 'text-right' : ''}`}>{turn.sender}</p>
                      <p className="text-gray-200 whitespace-pre-wrap">{turn.text}</p>
                    </div>
                     {!isFrancis && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Aucun historique de conversation disponible pour ce client.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProConversationSummaryPage; 
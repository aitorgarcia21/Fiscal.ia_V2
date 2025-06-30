import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bot, User } from 'lucide-react';

interface ConversationTurn {
  question: string;
  answer: string;
}

const DiscoverySummaryPage: React.FC = () => {
  const location = useLocation();
  const conversationHistory = location.state?.conversationHistory as ConversationTurn[] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Résumé de votre Découverte
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Voici le récapitulatif de votre échange avec Francis.
          </p>
        </div>

        <div className="bg-[#1E3253]/60 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl">
          {conversationHistory.length > 0 ? (
            <div className="space-y-8">
              {conversationHistory.map((turn, index) => (
                <div key={index} className="flex flex-col space-y-4">
                  {/* Question de Francis */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#c5a572] flex items-center justify-center">
                      <Bot className="w-6 h-6 text-[#162238]" />
                    </div>
                    <div className="bg-[#2A3F6C]/50 p-4 rounded-xl rounded-tl-none">
                      <p className="font-semibold text-white">Francis</p>
                      <p className="text-gray-200">{turn.question}</p>
                    </div>
                  </div>

                  {/* Réponse de l'utilisateur */}
                  <div className="flex items-start gap-4 justify-end">
                     <div className="bg-[#3e8e7e]/70 p-4 rounded-xl rounded-tr-none">
                      <p className="font-semibold text-white text-right">Vous</p>
                      <p className="text-gray-200 text-right">{turn.answer}</p>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Aucun historique de conversation n'a été trouvé.</p>
              <p className="mt-2 text-gray-500">
                Il semble que vous soyez arrivé ici sans compléter le parcours de découverte.
              </p>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/dashboard"
            className="inline-block bg-[#c5a572] text-[#162238] py-3 px-8 rounded-lg font-semibold hover:bg-[#d4b484] transition-colors duration-200 shadow-lg"
          >
            Retourner au Tableau de Bord
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DiscoverySummaryPage; 
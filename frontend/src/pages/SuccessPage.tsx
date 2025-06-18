import React from 'react';
import { Check, ArrowRight, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icône de succès */}
        <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center">
          <Check className="w-10 h-10 text-[#162238]" />
        </div>

        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Paiement réussi ! 🎉
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          Félicitations ! Votre abonnement à <span className="text-[#c5a572] font-semibold">Francis</span> est maintenant actif.
          <br />
          Vous pouvez commencer à optimiser votre fiscalité dès maintenant.
        </p>

        {/* Prochaines étapes */}
        <div className="bg-[#1A2942]/60 rounded-2xl p-8 mb-8 border border-[#c5a572]/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Prochaines étapes :</h2>
          <div className="space-y-4 text-left">
            {[
              'Accédez à votre tableau de bord personnel',
              'Complétez votre profil fiscal',
              'Commencez à discuter avec Francis',
              'Découvrez vos premières optimisations'
            ].map((step, index) => (
              <div key={index} className="flex items-center text-gray-300">
                <div className="w-6 h-6 rounded-full bg-[#c5a572] text-[#162238] flex items-center justify-center mr-4 text-sm font-semibold">
                  {index + 1}
                </div>
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            <MessageSquare className="w-5 h-5" />
            Accéder au tableau de bord
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigate('/chat')}
            className="px-8 py-4 bg-white/10 text-gray-100 font-semibold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-3"
          >
            Parler à Francis
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Support */}
        <div className="mt-12 text-gray-400 text-sm">
          <p>
            Besoin d'aide ? Contactez notre support à{' '}
            <a href="mailto:support@fiscal-ia.net" className="text-[#c5a572] hover:text-[#e8cfa0] transition-colors">
              support@fiscal-ia.net
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 
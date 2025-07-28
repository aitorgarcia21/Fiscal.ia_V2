import React, { useState } from 'react';
import { Logo } from '../components/ui/Logo';
import { Mail, Send, Check, AlertCircle } from 'lucide-react';
import { addEmailSubscriber } from '../lib/supabase';

export default function EmailCollectorPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer les paramètres UTM de l'URL si présents
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');
      
      // Envoyer l'email vers Supabase
      const result = await addEmailSubscriber({
        email: email,
        source: 'email-collector',
        utm_source: utmSource || undefined,
        utm_medium: utmMedium || undefined,
        utm_campaign: utmCampaign || undefined,
        metadata: {
          page_url: window.location.href,
          referrer: document.referrer || null,
          timestamp: new Date().toISOString()
        }
      });
      
      if (result.success) {
        setIsSubmitted(true);
        setSuccessMessage(result.message);
        setEmail('');
        
        // Envoyer un événement à Google Analytics si disponible
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'email_signup', {
            event_category: 'engagement',
            event_label: 'email_collector',
            value: 1
          });
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#162238] to-[#1E3A8A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Logo Francis */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Francis</h1>
            <p className="text-white/80 text-sm">Votre copilote fiscal intelligent</p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null); // Réinitialiser l'erreur quand l'utilisateur tape
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#c5a572] focus:border-transparent transition-all duration-200"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              {/* Affichage des erreurs */}
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-gradient-to-r from-[#c5a572] to-[#d4b982] text-[#0A192F] font-semibold py-3 px-6 rounded-lg hover:from-[#d4b982] hover:to-[#c5a572] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A192F]"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Rejoindre la liste
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-500 rounded-full p-3">
                  <Check className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white">Merci !</h2>
              <p className="text-white/80">
                {successMessage || 'Votre email a été enregistré avec succès. Vous serez parmi les premiers à découvrir Francis.'}
              </p>
              <button
                onClick={handleReset}
                className="text-[#c5a572] hover:text-[#d4b982] transition-colors duration-200 underline"
              >
                Ajouter un autre email
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-xs text-white/60">
              En vous inscrivant, vous acceptez de recevoir des informations sur Francis.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#c5a572]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#c5a572]/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}

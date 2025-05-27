import React, { useState } from 'react';
import { ArrowRight, CreditCard, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStripe } from '../hooks/useStripe';
import { PRICING, PricingPlan } from '../config/pricing';
import { StripeError } from '../components/stripe/StripeError';

export function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
    role: '',
  });
  const [plan, setPlan] = useState<PricingPlan>('MONTHLY');
  const { handleCheckout, isLoading, error } = useStripe();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        await handleCheckout(plan);
      } catch (err) {
        console.error('Erreur lors du paiement:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] overflow-hidden relative">
      {/* Effet de dégradé en arrière-plan */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2942]/95 via-[#223c63]/85 to-[#234876]/75"></div>
      
      {/* Motif géométrique discret */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #c5a572 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* En-tête */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center text-[#e8cfa0] hover:text-white transition-colors mb-8">
            <ArrowRight className="h-5 w-5 rotate-180 mr-2" />
            Retour à l'accueil
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Créez votre compte <span className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-transparent bg-clip-text">Francis</span>
          </h1>
          <p className="text-xl text-gray-200">
            Rejoignez la communauté des utilisateurs qui optimisent leur fiscalité
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-[#1a2942]/50 backdrop-blur-sm rounded-2xl p-8 border border-[#c5a572]/20 shadow-xl">
          {/* Étapes */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 text-center ${
                  s === step
                    ? 'text-[#c5a572]'
                    : s < step
                    ? 'text-[#e8cfa0]'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
                    s === step
                      ? 'bg-[#c5a572] text-[#1a2942]'
                      : s < step
                      ? 'bg-[#e8cfa0] text-[#1a2942]'
                      : 'bg-gray-700'
                  }`}
                >
                  {s}
                </div>
                <span className="text-sm">
                  {s === 1 ? 'Compte' : s === 2 ? 'Profil' : 'Paiement'}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                    Rôle
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                    required
                  >
                    <option value="">Sélectionnez votre rôle</option>
                    <option value="salarie">Salarié</option>
                    <option value="independant">Indépendant</option>
                    <option value="retraite">Retraité</option>
                  </select>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-[#223c63]/50 rounded-xl p-6 border border-[#c5a572]/20">
                  <h3 className="text-xl font-bold text-white mb-4">Abonnement Premium</h3>
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setPlan('MONTHLY')}
                      className={`flex-1 px-4 py-3 rounded-xl border font-bold transition-all ${plan === 'MONTHLY' ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] border-[#c5a572]' : 'bg-[#1a2942]/40 text-white border-[#c5a572]/30 hover:bg-[#1a2942]/60'}`}
                      disabled={isLoading}
                    >
                      {PRICING.MONTHLY.price}€ / mois
                      <div className="text-xs font-normal text-gray-300">Sans engagement</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlan('ANNUAL')}
                      className={`flex-1 px-4 py-3 rounded-xl border font-bold transition-all ${plan === 'ANNUAL' ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] border-[#c5a572]' : 'bg-[#1a2942]/40 text-white border-[#c5a572]/30 hover:bg-[#1a2942]/60'}`}
                      disabled={isLoading}
                    >
                      {PRICING.ANNUAL.price}€ / an
                      <div className="text-xs font-normal text-[#c5a572]">Économisez 17%</div>
                    </button>
                  </div>
                  <ul className="space-y-3 text-gray-300">
                    {PRICING[plan].features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Sparkles className="h-5 w-5 text-[#c5a572] mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 text-[#e8cfa0] hover:text-white transition-colors"
                >
                  Retour
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="ml-auto px-8 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] rounded-xl font-bold hover:shadow-lg hover:shadow-[#c5a572]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Chargement...' : step === 3 ? "Finaliser l'inscription et payer" : 'Continuer'}
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </button>
            </div>
          </form>

          <StripeError message={error || ''} />
        </div>
      </div>
    </div>
  );
} 
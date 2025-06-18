import React, { useState } from 'react';
import { ArrowRight, CreditCard, Shield, Sparkles, Building, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStripe } from '../hooks/useStripe';
import { PRICING, PricingPlan } from '../config/pricing';
import { StripeError } from '../components/stripe/StripeError';

export function ProSignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
    role: '',
    siret: '',
    phone: '',
  });
  const [plan, setPlan] = useState<PricingPlan>('PRO_MONTHLY');
  const { redirectToCheckout, isLoading, error } = useStripe();

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
        await redirectToCheckout({
          priceId: PRICING[plan].stripePriceId,
          successUrl: `${window.location.origin}/success?type=pro`,
          cancelUrl: `${window.location.origin}/pro/signup`
        });
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
          <Link to="/pro" className="inline-flex items-center text-[#e8cfa0] hover:text-white transition-colors mb-8">
            <ArrowRight className="h-5 w-5 rotate-180 mr-2" />
            Retour à Pro
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <Building className="h-12 w-12 text-[#c5a572]" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Compte <span className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-transparent bg-clip-text">Pro</span>
            </h1>
          </div>
          <p className="text-xl text-gray-200">
            Rejoignez les experts-comptables qui révolutionnent leur cabinet
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
                  {s === 1 ? 'Compte' : s === 2 ? 'Cabinet' : 'Abonnement'}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email professionnel
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                    placeholder="expert@cabinet.fr"
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
                    Nom du cabinet
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                    placeholder="Cabinet Dubois & Associés"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                    Fonction
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                    required
                  >
                    <option value="">Sélectionnez votre fonction</option>
                    <option value="expert-comptable">Expert-comptable</option>
                    <option value="comptable">Comptable</option>
                    <option value="conseiller-fiscal">Conseiller fiscal</option>
                    <option value="directeur">Directeur de cabinet</option>
                    <option value="associe">Associé</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="siret" className="block text-sm font-medium text-gray-300 mb-1">
                      SIRET
                    </label>
                    <input
                      type="text"
                      id="siret"
                      name="siret"
                      value={formData.siret}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                      placeholder="12345678912345"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                      placeholder="01 23 45 67 89"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-[#223c63]/50 rounded-xl p-6 border border-[#c5a572]/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Building className="h-6 w-6 text-[#c5a572]" />
                    Abonnement Professionnel
                  </h3>
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setPlan('PRO_MONTHLY')}
                      className={`flex-1 px-4 py-3 rounded-xl border font-bold transition-all ${plan === 'PRO_MONTHLY' ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] border-[#c5a572]' : 'bg-[#1a2942]/40 text-white border-[#c5a572]/30 hover:bg-[#1a2942]/60'}`}
                      disabled={isLoading}
                    >
                      {PRICING.PRO_MONTHLY.price}€ / mois
                      <div className="text-xs font-normal text-gray-300">Facturation mensuelle</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlan('PRO_ANNUAL')}
                      className={`flex-1 px-4 py-3 rounded-xl border font-bold transition-all ${plan === 'PRO_ANNUAL' ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] border-[#c5a572]' : 'bg-[#1a2942]/40 text-white border-[#c5a572]/30 hover:bg-[#1a2942]/60'}`}
                      disabled={isLoading}
                    >
                      {PRICING.PRO_ANNUAL.price}€ / an
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
                
                {/* Garanties */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-[#1a2942]/50 rounded-lg p-4">
                    <Shield className="h-8 w-8 text-[#c5a572] mx-auto mb-2" />
                    <div className="text-white font-semibold text-sm">Sécurisé</div>
                    <div className="text-gray-400 text-xs">Données chiffrées</div>
                  </div>
                  <div className="bg-[#1a2942]/50 rounded-lg p-4">
                    <Users className="h-8 w-8 text-[#c5a572] mx-auto mb-2" />
                    <div className="text-white font-semibold text-sm">Support dédié</div>
                    <div className="text-gray-400 text-xs">Formation incluse</div>
                  </div>
                  <div className="bg-[#1a2942]/50 rounded-lg p-4">
                    <Zap className="h-8 w-8 text-[#c5a572] mx-auto mb-2" />
                    <div className="text-white font-semibold text-sm">Sans engagement</div>
                    <div className="text-gray-400 text-xs">Annulation simple</div>
                  </div>
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
                {isLoading ? 'Chargement...' : step === 3 ? "Finaliser l'abonnement Pro" : 'Continuer'}
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
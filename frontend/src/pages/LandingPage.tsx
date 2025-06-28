import React, { useState, useEffect } from 'react';
import { ArrowRight, CreditCard, Euro, MessageSquare, Shield, Users, Sparkles, Check, Briefcase, FileText, Zap, Eye, Target, TrendingUp, Lightbulb } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, Variants, Transition } from 'framer-motion';
import { DemoModal } from '../components/demo/DemoModal';
import { useStripe } from '../hooks/useStripe';
import { PRICING, PricingPlan } from '../config/pricing';
import { StripeError } from '../components/stripe/StripeError';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const cardTransition: Transition = { duration: 0.6 };
const stepTransition = (i: number): Transition => ({ delay: i * 0.15, duration: 0.5 });
const heroTransition: Transition = { duration: 0.8, delay: 0.2 };
const heroTextTransition: Transition = { duration: 0.8, delay: 0.4 };
const heroButtonTransition: Transition = { duration: 0.8, delay: 0.5 };
const heroBadgeTransition: Transition = { duration: 0.8, delay: 0.8 };
const heroH1Transition: Transition = {delay: 0.2, duration: 0.7};
const heroH1SpanTransition: Transition = { duration: 0.7, delay: 0.8};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: cardTransition
  }
};

const stepItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: stepTransition(i)
  })
};

export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDemo, setShowDemo] = useState(false);
  const { redirectToCheckout, isLoading, error } = useStripe();
  const { checkAuthStatus } = useAuth();
  const [authProcessing, setAuthProcessing] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const searchParams = new URLSearchParams(location.search);
      
      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
      const type = hashParams.get('type') || searchParams.get('type');
      
      if (accessToken && refreshToken && type === 'recovery') {
        if (location.hash) {
          navigate(`/update-password${location.hash}`, { replace: true });
        } else {
          navigate(`/update-password${location.search}`, { replace: true });
        }
        return;
      }
      
      if (accessToken && refreshToken && type !== 'recovery') {
        setAuthProcessing(true);
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Erreur session:', error);
            return;
          }

          await checkAuthStatus();
          window.history.replaceState({}, document.title, window.location.pathname);

          const user = data.user;
          if (user) {
            const { data: profile } = await supabase
              .from('profils_utilisateurs')
              .select('taper')
              .eq('user_id', user.id)
              .single();

            if (profile?.taper === 'professionnel') {
              navigate('/pro/dashboard', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          }
        } catch (err) {
          console.error('Erreur auth:', err);
        } finally {
          setAuthProcessing(false);
        }
      }
    };

    handleAuthCallback();
  }, [location, navigate, checkAuthStatus]);

  if (authProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c5a572] mx-auto"></div>
          <p className="mt-4 text-gray-300">Activation en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100 font-sans antialiased">
      <header className="fixed top-0 left-0 right-0 bg-[#162238]/95 backdrop-blur-lg border-b border-[#2A3F6C]/50 z-50 shadow-lg">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="relative inline-flex items-center justify-center group cursor-pointer" onClick={() => navigate('/')}>
            <MessageSquare className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
            <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
          </div>

          <div className="flex items-center gap-x-3 sm:gap-x-5">
            <button
              onClick={() => navigate('/pro')}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Espace Pro
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-300 hover:text-white"
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-5 py-2.5 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl shadow-lg hover:shadow-[#c5a572]/30 hover:scale-105 transition-all duration-300 text-sm"
            >
              S'inscrire
            </button>
          </div>
        </div>
      </header>

      {showDemo && ( <DemoModal onClose={() => setShowDemo(false)} onStart={() => { setShowDemo(false); navigate('/signup'); }} /> )}

      {/* Le reste de la page... */}
    </div>
  );
} 
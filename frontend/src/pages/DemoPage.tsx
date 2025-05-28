import React, { useState } from 'react';
import { ArrowRight, Shield, Sparkles, TrendingUp, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Transition } from '../components/ui/Transition';
import { DemoConversation } from '../components/demo/DemoConversation';

export function DemoPage() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'assistant', content: string }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    const userQuestion = question;
    setQuestion('');
    
    // Ajouter la question de l'utilisateur à l'historique
    setChatHistory(prev => [...prev, { type: 'user', content: userQuestion }]);
    
    // Simuler une réponse de Francis
    setTimeout(() => {
      const assistantResponse = "Bonjour ! Je suis Francis, votre conseiller fiscal intelligent. Je peux vous aider à optimiser votre fiscalité et à prendre les meilleures décisions pour votre patrimoine. Posez-moi une question sur la fiscalité française, et je vous répondrai de manière claire et précise.";
      setResponse(assistantResponse);
      setChatHistory(prev => [...prev, { type: 'assistant', content: assistantResponse }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] overflow-hidden relative">
      {/* Effet de dégradé en arrière-plan */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2942]/95 via-[#223c63]/85 to-[#234876]/75"></div>
      
      {/* Motif géométrique discret */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #c5a572 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        {/* En-tête */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <Link to="/" className="inline-flex items-center text-[#e8cfa0] hover:text-white transition-colors mb-8 group">
            <ArrowRight className="h-5 w-5 rotate-180 mr-2 transform group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>
          <div className="flex flex-col items-center mb-4">
            <span className="inline-block bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-semibold px-4 py-1 rounded-full text-xs shadow-md border border-[#c5a572]/40 mb-4">Démo IA Francis</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Découvrez Francis en action</h1>
            <p className="text-lg text-gray-300 max-w-xl">Testez gratuitement notre assistant fiscal intelligent et voyez comment il peut vous aider à optimiser votre fiscalité.</p>
          </div>
        </motion.div>
        {/* Bloc démo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full max-w-2xl mx-auto bg-[#1a2942]/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#c5a572]/30 p-0 mb-10"
        >
          <DemoConversation />
        </motion.div>
        {/* Call to action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Link
            to="/"
            className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all transform flex items-center justify-center gap-2"
          >
            <ArrowRight className="h-5 w-5 rotate-180" />
            Retour à l'accueil
          </Link>
          <button
            onClick={() => window.location.href = '/signup'}
            className="px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-bold rounded-xl hover:shadow-lg hover:shadow-[#c5a572]/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            Créer un compte
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 
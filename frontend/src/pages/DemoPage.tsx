import React, { useState } from 'react';
import { ArrowRight, Shield, Sparkles, TrendingUp, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Transition } from '../components/ui/Transition';

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
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #c5a572 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* En-tête */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Link to="/" className="inline-flex items-center text-[#e8cfa0] hover:text-white transition-colors mb-8 group">
            <ArrowRight className="h-5 w-5 rotate-180 mr-2 transform group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Découvrez <span className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-transparent bg-clip-text">Francis</span>
          </h1>
          <p className="text-xl text-gray-200">
            Testez gratuitement notre assistant fiscal intelligent
          </p>
        </motion.div>

        {/* Zone de chat */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1a2942]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#c5a572]/20 shadow-xl mb-8"
        >
          <div className="h-[400px] overflow-y-auto mb-4 p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#c5a572] scrollbar-track-transparent">
            <AnimatePresence>
              {chatHistory.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start space-x-4 ${message.type === 'user' ? 'justify-end' : ''}`}
                >
                  {message.type === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-[#1a2942]" />
                      </div>
                    </div>
                  )}
                  <div className={`flex-1 ${message.type === 'user' ? 'max-w-[80%]' : ''}`}>
                    <div className={`rounded-2xl p-4 ${
                      message.type === 'user' 
                        ? 'bg-[#c5a572] text-[#1a2942] ml-auto' 
                        : 'bg-[#223c63]/50 text-gray-200'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                  {message.type === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[#223c63] flex items-center justify-center">
                        <span className="text-[#c5a572] font-bold">Vous</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-4"
              >
                <div className="w-8 h-8 border-4 border-[#c5a572] border-t-transparent rounded-full animate-spin"></div>
              </motion.div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Posez votre question sur la fiscalité..."
              className="flex-1 px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-all"
            />
            <motion.button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] rounded-xl font-bold hover:shadow-lg hover:shadow-[#c5a572]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#1a2942] border-t-transparent rounded-full animate-spin"></div>
                  Envoi...
                </>
              ) : (
                <>
                  Envoyer
                  <Send className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Fonctionnalités */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-[#1a2942]/50 backdrop-blur-sm rounded-xl p-6 border border-[#c5a572]/20 hover:border-[#c5a572]/40 transition-all"
          >
            <Shield className="h-8 w-8 text-[#c5a572] mb-4" />
            <h3 className="text-white font-bold mb-2">Conseils personnalisés</h3>
            <p className="text-gray-300 text-sm">Des réponses adaptées à votre situation fiscale</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-[#1a2942]/50 backdrop-blur-sm rounded-xl p-6 border border-[#c5a572]/20 hover:border-[#c5a572]/40 transition-all"
          >
            <TrendingUp className="h-8 w-8 text-[#c5a572] mb-4" />
            <h3 className="text-white font-bold mb-2">Optimisation fiscale</h3>
            <p className="text-gray-300 text-sm">Identifiez les meilleures opportunités</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-[#1a2942]/50 backdrop-blur-sm rounded-xl p-6 border border-[#c5a572]/20 hover:border-[#c5a572]/40 transition-all"
          >
            <Sparkles className="h-8 w-8 text-[#c5a572] mb-4" />
            <h3 className="text-white font-bold mb-2">IA de pointe</h3>
            <p className="text-gray-300 text-sm">Basé sur le Code Général des Impôts</p>
          </motion.div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] rounded-xl font-bold hover:shadow-lg hover:shadow-[#c5a572]/20 transition-all group"
          >
            Commencer maintenant
            <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 
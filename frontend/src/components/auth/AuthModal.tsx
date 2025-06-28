import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, User, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, isProfessional } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      onClose();
      // Redirection immédiate selon le rôle enregistré
      if (isProfessional) {
        navigate('/pro/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
          setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // Le type de compte est géré ici
      await signup(email, password, fullName, activeTab === 'login' ? 'particulier' : 'professionnel');
      onClose();
      // La redirection sera gérée par le composant appelant ou un protected route
    } catch (err: any) {
      setError(err.message || 'Erreur d\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setError(null);
    onClose();
  };
  
  const inputStyles = "w-full bg-[#162238]/50 border border-[#2A3F6C] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c5a572]";
  const tabButtonStyles = (isActive: boolean) => 
    `w-1/2 py-3 text-center font-semibold transition-colors ${
      isActive ? 'text-[#c5a572] border-b-2 border-[#c5a572]' : 'text-gray-400 hover:text-white'
    }`;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#1E3253] border border-[#2A3F6C] p-8 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-2xl font-bold text-center text-white mb-2">
                  {activeTab === 'login' ? 'Connexion' : 'Inscription'}
                </Dialog.Title>
                <p className="text-center text-gray-400 mb-6">Accédez à votre espace.</p>

                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Fermer">
                    <X />
        </button>

                <div className="border-b border-[#2A3F6C] mb-6">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <button onClick={() => setActiveTab('login')} className={tabButtonStyles(activeTab === 'login')}>Connexion</button>
                        <button onClick={() => setActiveTab('signup')} className={tabButtonStyles(activeTab === 'signup')}>Inscription</button>
                    </nav>
        </div>

                {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                
                {activeTab === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`${inputStyles} pl-12`} />
              </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputStyles} pl-12`} />
                </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold py-3 rounded-lg hover:from-[#e8cfa0] transition-all disabled:opacity-50">
                      {isLoading ? 'Connexion...' : 'Se connecter'}
                    </button>
                    <div className="text-center text-sm">
                      <Link to="/activate-account" className="text-gray-400 hover:text-[#c5a572] transition-colors">
                        Activer mon compte
                      </Link>
              </div>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-6">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input type="text" placeholder="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={`${inputStyles} pl-12`} />
          </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`${inputStyles} pl-12`} />
          </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputStyles} pl-12`} />
            </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold py-3 rounded-lg hover:from-[#e8cfa0] transition-all disabled:opacity-50">
                      {isLoading ? 'Création...' : 'Créer un compte'}
          </button>
        </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 
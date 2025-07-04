import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Eye, Edit3, Trash2, MessageSquare as MessageSquareIcon, Euro, Users, Mic, MicOff, Brain, Settings, Plus, Edit2, TrendingUp, Shield, Globe2, ArrowRight, Calculator } from 'lucide-react';
import apiClient from '../services/apiClient';
import { ClientProfile } from '../types/clientProfile';
import { useAuth } from '../contexts/AuthContext';
import { useCountry } from '../contexts/CountryContext';

const ITEMS_PER_PAGE = 8;

export function ProDashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { country } = useCountry();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchClients = async () => {
      if (isAuthenticated) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await apiClient<ClientProfile[]>('/api/pro/clients/');
          setClients(response || []);
        } catch (err: any) {
          console.error("Erreur lors du chargement des clients:", err);
          setError(err.data?.detail || err.message || 'Erreur lors du chargement des clients.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchClients();
  }, [isAuthenticated]);

  const filteredClients = clients.filter(client => 
    `${client.prenom_client} ${client.nom_client}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email_client && client.email_client.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  const handleAddNewClient = () => {
    navigate('/pro/clients/new');
  };
  
  const handleViewClient = (clientId: number | string) => {
    navigate(`/pro/clients/${clientId}`);
  };
  
  const handleEditClient = (clientId: number | string) => {
    navigate(`/pro/clients/${clientId}/edit`);
  };
  
  const handleDeleteClient = async (clientId: number | string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.")){
      try {
        await apiClient(`/api/pro/clients/${clientId}`, { method: 'DELETE' });
        setClients(prevClients => prevClients.filter(c => c.id !== clientId));
        setError(null);
      } catch (err: any) {
        console.error("Erreur lors de la suppression du client:", err);
        setError(err.data?.detail || err.message || 'Une erreur est survenue lors de la suppression du client.');
      }
    }
  };

  const professionalName = user?.user_metadata?.full_name || user?.email || 'Professionnel';

  // Simulateurs adaptés au pays
  const getSimulateursByCountry = () => {
    switch (country) {
      case 'CH':
        return [
          {
            id: 'impot-suisse',
            title: 'Simulateur Impôt Suisse',
            description: 'Calcul d\'impôt fédéral, cantonal et communal',
            icon: Calculator,
            color: 'from-blue-500 to-blue-600',
            route: '/simulateur-impot-suisse'
          },
          {
            id: 'tva-suisse',
            title: 'Calculateur TVA Suisse',
            description: 'TVA 7.7%, 2.5% et 3.7%',
            icon: TrendingUp,
            color: 'from-green-500 to-green-600',
            route: '/simulateur-tva-suisse'
          }
        ];
      case 'AD':
        return [
          {
            id: 'irpf-andorre',
            title: 'Simulateur IRPF Andorre',
            description: 'Impôt sur le revenu andorran',
            icon: Calculator,
            color: 'from-yellow-500 to-yellow-600',
            route: '/simulateur-irpf'
          },
          {
            id: 'igi-andorre',
            title: 'Calculateur IGI Andorre',
            description: 'Impost General Indirecte',
            icon: TrendingUp,
            color: 'from-orange-500 to-orange-600',
            route: '/simulateur-igi-andorre'
          }
        ];
      case 'LU':
        return [
          {
            id: 'impot-luxembourg',
            title: 'Simulateur Impôt Luxembourg',
            description: 'Barème progressif luxembourgeois',
            icon: Calculator,
            color: 'from-red-500 to-red-600',
            route: '/simulateur-impot-luxembourg'
          },
          {
            id: 'tva-luxembourg',
            title: 'Calculateur TVA Luxembourg',
            description: 'TVA 17%, 14%, 8% et 3%',
            icon: TrendingUp,
            color: 'from-purple-500 to-purple-600',
            route: '/simulateur-tva-luxembourg'
          }
        ];
      default: // FR
        return [
          {
            id: 'impot-france',
            title: 'Simulateur Impôt France',
            description: 'Barème progressif français 2025',
            icon: Calculator,
            color: 'from-blue-500 to-blue-600',
            route: '/simulateur-impot'
          },
          {
            id: 'tmi-calculator',
            title: 'Calculateur TMI',
            description: 'Taux Marginal d\'Imposition',
            icon: TrendingUp,
            color: 'from-green-500 to-green-600',
            route: '/simulateur-tmi'
          },
          {
            id: 'optimisation-fiscale',
            title: 'Optimisation Fiscale',
            description: 'Stratégies d\'optimisation avancées',
            icon: Shield,
            color: 'from-purple-500 to-purple-600',
            route: '/simulateur-optimisation'
          }
        ];
    }
  };

  const simulateurs = getSimulateursByCountry();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447] text-gray-100">
      {/* Header amélioré avec logo */}
      <div className="bg-[#162238] border-b border-[#c5a572]/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo Francis (bulle + euro) */}
            <div className="flex items-center gap-3">
              <div className="relative inline-flex items-center justify-center group">
                <MessageSquareIcon className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
                <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Francis</h1>
                <p className="text-sm text-[#c5a572] font-medium">Le copilote financier</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Globe2 className="w-4 h-4 text-[#c5a572]" />
              <span className="text-white font-medium">
                {country === 'FR' && '🇫🇷 France'}
                {country === 'CH' && '🇨🇭 Suisse'}
                {country === 'AD' && '🇦🇩 Andorre'}
                {country === 'LU' && '🇱🇺 Luxembourg'}
              </span>
            </div>
            <button
              onClick={() => navigate('/pro/extension')}
              className="px-4 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-gray-300 hover:text-white hover:border-[#c5a572]/50 transition-colors text-sm"
            >
              Extension Chrome
            </button>
            <span className="text-sm text-gray-300 hidden md:block">
              {professionalName}
            </span>
          </div>
        </div>
      </div>

      {/* Contenu principal amélioré */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Section Simulateurs adaptés au pays */}
          <div className="bg-[#1a2332]/60 backdrop-blur-sm border border-[#c5a572]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Simulateurs {country === 'FR' ? 'Français' : 
                               country === 'CH' ? 'Suisses' : 
                               country === 'AD' ? 'Andorrans' : 'Luxembourgeois'}
                </h2>
                <p className="text-gray-400">
                  Outils de calcul adaptés à la juridiction sélectionnée
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {simulateurs.map((simulateur) => (
                <button
                  key={simulateur.id}
                  onClick={() => navigate(simulateur.route)}
                  className="group bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6 hover:border-[#c5a572]/40 hover:shadow-lg hover:shadow-[#c5a572]/10 transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${simulateur.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <simulateur.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{simulateur.title}</h3>
                      <p className="text-gray-400 text-sm">{simulateur.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#c5a572] text-sm font-medium">Accéder</span>
                    <ArrowRight className="w-4 h-4 text-[#c5a572] group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section Clients existante */}
          <div className="bg-[#1a2332]/60 backdrop-blur-sm border border-[#c5a572]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Mes Clients</h2>
                <p className="text-gray-400">
                  {clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => navigate('/pro/clients/new')}
                className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouveau Client
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a572]"></div>
                <p className="mt-2 text-gray-400">Chargement des clients...</p>
              </div>
            ) : clients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-[#162238] border border-[#c5a572]/20 rounded-xl p-6 hover:border-[#c5a572]/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-[#162238]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {client.prenom_client} {client.nom_client}
                          </h3>
                          <p className="text-sm text-gray-400">{client.email_client}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {client.situation_maritale_client && (
                        <p className="text-sm text-gray-300">
                          <span className="text-gray-400">Situation:</span> {client.situation_maritale_client}
                        </p>
                      )}
                      {client.revenu_net_annuel_client1 && (
                        <p className="text-sm text-gray-300">
                          <span className="text-gray-400">Revenus:</span> {Number(client.revenu_net_annuel_client1).toLocaleString('fr-FR')}€
                        </p>
                      )}
                      {client.tranche_marginale_imposition_estimee && (
                        <p className="text-sm text-gray-300">
                          <span className="text-gray-400">TMI:</span> {client.tranche_marginale_imposition_estimee}%
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewClient(client.id)}
                        className="flex-1 bg-[#1a2332] text-[#c5a572] px-3 py-2 rounded-lg text-sm hover:bg-[#223c63] transition-colors"
                      >
                        Voir
                      </button>
                                              <button
                          onClick={() => handleEditClient(client.id)}
                          className="bg-[#1a2332] text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-[#223c63] transition-colors"
                          title="Modifier le client"
                          aria-label="Modifier le client"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="bg-[#1a2332] text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-[#223c63] transition-colors"
                          title="Supprimer le client"
                          aria-label="Supprimer le client"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Aucun client</h3>
                <p className="text-gray-400 mb-4">
                  Commencez par ajouter votre premier client pour utiliser Francis Pro.
                </p>
                <button
                  onClick={() => navigate('/pro/clients/new')}
                  className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Ajouter mon premier client
                </button>
              </div>
            )}
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/pro/chat')}
              className="bg-[#1a2332] border border-[#c5a572]/20 rounded-xl p-6 hover:border-[#c5a572]/40 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-xl flex items-center justify-center">
                  <MessageSquareIcon className="w-6 h-6 text-[#162238]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-[#c5a572] transition-colors">
                    Chat Francis
                  </h3>
                  <p className="text-sm text-gray-400">Posez vos questions</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/pro/agenda')}
              className="bg-[#1a2332] border border-[#c5a572]/20 rounded-xl p-6 hover:border-[#c5a572]/40 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#162238]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-[#c5a572] transition-colors">
                    Agenda
                  </h3>
                  <p className="text-sm text-gray-400">Gérez vos rendez-vous</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/pro/settings')}
              className="bg-[#1a2332] border border-[#c5a572]/20 rounded-xl p-6 hover:border-[#c5a572]/40 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#162238]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-[#c5a572] transition-colors">
                    Paramètres
                  </h3>
                  <p className="text-sm text-gray-400">Configurez votre compte</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
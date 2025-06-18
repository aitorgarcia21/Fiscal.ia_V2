import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Edit3, Trash2, Eye, ChevronLeft, ChevronRight, Briefcase, Users, MessageSquare as MessageSquareIcon } from 'lucide-react';
import apiClient from '../services/apiClient';
import { ClientProfile } from '../types/clientProfile';
import { useAuth } from '../contexts/AuthContext';

const ITEMS_PER_PAGE = 10;

export function ProDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient<ClientProfile[]>('/api/pro/clients/', { method: 'GET' });
        setClients(response);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des clients:", err);
        setError(err.data?.detail || err.message || 'Une erreur est survenue lors de la récupération des clients.');
      }
      setIsLoading(false);
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => 
    `${client.prenom_client} ${client.nom_client}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email_client && client.email_client.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcul des KPIs réels uniquement
  const kpiData = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.statut_dossier_pro === 'Actif').length;
    const clientsWithRdv = clients.filter(c => c.prochain_rendez_vous_pro && c.prochain_rendez_vous_pro.trim() !== '').length;
    return { totalClients, activeClients, clientsWithRdv };
  }, [clients]);

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#162238] to-[#1E3253] text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0A192F]/95 to-[#162238]/95 backdrop-blur-xl border-b border-[#c5a572]/20 shadow-2xl sticky top-0 z-40">
        <div className="h-20 max-w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-2xl blur-md opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="relative bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] p-2 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="h-8 w-8 text-[#162238]" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent">
                Fiscal.ia Pro
              </span>
              <p className="text-xs text-gray-400 font-medium">Dashboard Clients</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-[#c5a572]/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-300">En ligne</span>
              </div>
              <span className="text-sm text-gray-400">Bienvenue, <span className="text-[#c5a572] font-medium">{professionalName}</span></span>
            </div>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 border border-transparent hover:border-white/20">
              Espace Particulier
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 sm:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* En-tête du dashboard */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
                Gestion Clients
              </h1>
              <p className="text-lg text-gray-400">Interface professionnelle - Fiscal.ia</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/pro/chat')}
                className="group px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <MessageSquareIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Consulter Francis
              </button>
              <button
                onClick={handleAddNewClient}
                className="group px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-bold rounded-xl shadow-lg hover:shadow-[#c5a572]/30 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Nouveau Client
              </button>
            </div>
          </div>

          {/* KPI Cards - Données réelles uniquement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Clients */}
            <div className="group bg-gradient-to-br from-[#1E3253]/80 to-[#162238]/80 backdrop-blur-sm border border-[#c5a572]/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-[#c5a572]/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-[#c5a572]/20 to-[#e8cfa0]/20 rounded-xl">
                  <Users className="w-7 h-7 text-[#c5a572]" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white group-hover:text-[#c5a572] transition-colors">
                  {kpiData.totalClients}
                </p>
                <p className="text-sm text-gray-400">Clients Total</p>
              </div>
            </div>

            {/* Clients Actifs */}
            <div className="group bg-gradient-to-br from-[#1E3253]/80 to-[#162238]/80 backdrop-blur-sm border border-[#c5a572]/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-[#c5a572]/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                  <Users className="w-7 h-7 text-green-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors">
                  {kpiData.activeClients}
                </p>
                <p className="text-sm text-gray-400">Clients Actifs</p>
              </div>
            </div>

            {/* Rendez-vous Programmés */}
            <div className="group bg-gradient-to-br from-[#1E3253]/80 to-[#162238]/80 backdrop-blur-sm border border-[#c5a572]/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-[#c5a572]/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                  <Users className="w-7 h-7 text-purple-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  {kpiData.clientsWithRdv}
                </p>
                <p className="text-sm text-gray-400">RDV Programmés</p>
              </div>
            </div>
          </div>

          {/* Section Gestion Clients */}
          <div className="bg-gradient-to-br from-[#1E3253]/80 to-[#162238]/80 backdrop-blur-sm border border-[#c5a572]/20 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users className="w-6 h-6 text-[#c5a572]" />
                Portefeuille Clients ({kpiData.totalClients})
              </h2>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/30 border border-[#c5a572]/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 transition-all"
                />
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3 text-[#c5a572]">
                  <div className="w-5 h-5 border-2 border-[#c5a572] border-t-transparent rounded-full animate-spin" />
                  <span>Chargement des clients...</span>
                </div>
              </div>
            )}

            {/* Liste des clients */}
            {!isLoading && !error && (
              <div className="overflow-hidden">
                {filteredClients.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#c5a572]/20 to-[#e8cfa0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-[#c5a572]" />
                    </div>
                    <p className="text-xl text-gray-400 mb-2">Aucun client trouvé</p>
                    <p className="text-gray-500 mb-6">Commencez par ajouter votre premier client</p>
                    <button 
                      onClick={handleAddNewClient}
                      className="px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-bold rounded-xl hover:scale-105 transition-transform duration-300"
                    >
                      Nouveau Client
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-[#c5a572]/20">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-[#c5a572] uppercase tracking-wider">Client</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-[#c5a572] uppercase tracking-wider hidden sm:table-cell">Contact</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-[#c5a572] uppercase tracking-wider hidden md:table-cell">Statut</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-[#c5a572] uppercase tracking-wider hidden lg:table-cell">Dernière Activité</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-[#c5a572] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#c5a572]/10">
                        {currentClients.map((client) => (
                          <tr key={client.id} className="hover:bg-[#1E3253]/30 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center text-[#162238] font-bold text-lg shadow-lg">
                                  {client.prenom_client?.charAt(0) || ''}{client.nom_client?.charAt(0) || ''}
                                </div>
                                <div className="ml-4">
                                  <div className="text-lg font-semibold text-white">
                                    {client.prenom_client} {client.nom_client}
                                  </div>
                                  <div className="text-sm text-gray-400">ID: {client.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                              <div className="text-sm text-gray-300">{client.email_client || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{client.telephone_principal_client || ''}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                client.statut_dossier_pro === 'Actif' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 
                                client.statut_dossier_pro === 'En attente informations' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 
                                client.statut_dossier_pro === 'Optimisation en cours' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 
                                client.statut_dossier_pro === 'Prospect' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 
                                'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                              }`}>
                                {client.statut_dossier_pro || 'Non défini'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 hidden lg:table-cell">
                              {client.updated_at ? new Date(client.updated_at).toLocaleDateString('fr-FR') : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-3">
                                <button 
                                  onClick={() => handleViewClient(client.id)} 
                                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                                  title="Voir détails"
                                  aria-label="Voir les détails du client"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleEditClient(client.id)} 
                                  className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-all duration-200"
                                  title="Modifier"
                                  aria-label="Modifier le client"
                                >
                                  <Edit3 className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteClient(client.id)} 
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                                  title="Supprimer"
                                  aria-label="Supprimer le client"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-[#c5a572]/20 mt-6">
                    <div className="text-sm text-gray-400">
                      Affichage {startIndex + 1} à {Math.min(endIndex, filteredClients.length)} sur {filteredClients.length} clients
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-[#c5a572]/30 text-gray-400 hover:text-white hover:bg-[#c5a572]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        aria-label="Page précédente"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="px-4 py-2 text-sm text-gray-300">
                        Page {currentPage} sur {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-[#c5a572]/30 text-gray-400 hover:text-white hover:bg-[#c5a572]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        aria-label="Page suivante"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 
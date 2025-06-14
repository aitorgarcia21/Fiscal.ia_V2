import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, User as UserIcon, Search, Edit3, Trash2, Eye, ChevronLeft, ChevronRight, Briefcase, Users, UserCheck, CalendarClock } from 'lucide-react';
import apiClient from '../services/apiClient';
import { ClientProfile } from '../types/clientProfile';
import { useAuth } from '../contexts/AuthContext';

const ITEMS_PER_PAGE = 10;

// Styles pour les cartes KPI
const kpiCardStyle = "bg-[#0E2444]/70 border border-[#3E5F8A]/60 p-6 rounded-xl shadow-lg flex items-center space-x-4";
const kpiIconStyle = "p-3 bg-gradient-to-br from-[#88C0D0] to-[#81A1C1] rounded-lg text-[#0A192F]";
const kpiValueStyle = "text-3xl font-bold text-white";
const kpiLabelStyle = "text-sm text-gray-400";

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

  // Calcul des KPIs avec useMemo pour éviter les recalculs inutiles
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
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] to-[#0D1F3A] text-gray-100 flex flex-col font-sans">
      <header className="bg-[#0A192F]/95 backdrop-blur-lg border-b border-[#2A3F6C]/30 shadow-lg sticky top-0 z-40">
        <div className="h-20 max-w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/patrimonia')}>
            <Briefcase className="h-10 w-10 text-[#88C0D0] transition-transform group-hover:scale-110 duration-300" />
            <span className="text-2xl font-bold text-[#88C0D0]">Patrimonia</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden md:block">Bienvenue, {professionalName}</span>
            <button 
              onClick={() => navigate('/')} 
              className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              Site Principal
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 sm:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Tableau de Bord Clients</h1>
            <button
              onClick={handleAddNewClient}
              className="px-6 py-3 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] text-[#0A192F] font-semibold rounded-xl shadow-lg hover:shadow-[#88C0D0]/40 hover:scale-105 transition-all duration-300 flex items-center gap-2 text-base"
            >
              <PlusCircle className="w-5 h-5" />
              Nouveau Client
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={kpiCardStyle}>
              <div className={kpiIconStyle}><Users className="w-7 h-7" /></div>
              <div>
                <p className={kpiValueStyle}>{kpiData.totalClients}</p>
                <p className={kpiLabelStyle}>Clients au total</p>
              </div>
            </div>
            <div className={kpiCardStyle}>
              <div className={kpiIconStyle}><UserCheck className="w-7 h-7" /></div>
              <div>
                <p className={kpiValueStyle}>{kpiData.activeClients}</p>
                <p className={kpiLabelStyle}>Clients Actifs</p>
              </div>
            </div>
            <div className={kpiCardStyle}>
              <div className={kpiIconStyle}><CalendarClock className="w-7 h-7" /></div>
              <div>
                <p className={kpiValueStyle}>{kpiData.clientsWithRdv}</p>
                <p className={kpiLabelStyle}>RDV Planifiés</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <input 
                type="text"
                placeholder="Rechercher un client (nom, email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-[#0E2444]/80 border border-[#3E5F8A]/60 rounded-lg text-gray-200 focus:ring-2 focus:ring-[#88C0D0] focus:border-[#88C0D0] transition-colors placeholder-gray-400"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {isLoading && <div className="text-center py-10"><div className="w-10 h-10 border-4 border-dashed border-[#88C0D0] rounded-full animate-spin mx-auto"></div><p className="mt-3 text-gray-400">Chargement des clients...</p></div>}
          {error && <p className="text-center text-red-400 py-8 bg-red-900/20 border border-red-700/50 rounded-lg p-4">{error}</p>}
          
          {!isLoading && !error && (
            <div className="bg-[#0E2444]/70 border border-[#2A3F6C]/40 rounded-xl shadow-2xl overflow-hidden">
              {filteredClients.length === 0 ? (
                <p className="text-center text-gray-400 py-16 px-6">Aucun client trouvé. Cliquez sur "Nouveau Client" pour commencer.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#2A3F6C]/50">
                    <thead className="bg-black/20">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nom Complet</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">Email</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">Statut Dossier</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell">Dernière Modif.</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A3F6C]/40">
                      {currentClients.map((client) => (
                        <tr key={client.id} className="hover:bg-[#15305D]/50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#88C0D0] to-[#81A1C1] rounded-full flex items-center justify-center text-[#0A192F] font-semibold">
                                {client.prenom_client?.charAt(0) || ''}{client.nom_client?.charAt(0) || ''}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-100">{client.prenom_client} {client.nom_client}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 hidden sm:table-cell">{client.email_client || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${client.statut_dossier_pro === 'Actif' ? 'bg-green-600/30 text-green-300' : 
                               client.statut_dossier_pro === 'En attente informations' ? 'bg-yellow-600/30 text-yellow-300' : 
                               client.statut_dossier_pro === 'Optimisation en cours' ? 'bg-blue-600/30 text-blue-300' : 
                               client.statut_dossier_pro === 'Prospect' ? 'bg-purple-600/30 text-purple-300' : 
                               'bg-gray-600/30 text-gray-300'}`}>
                              {client.statut_dossier_pro || 'Non défini'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 hidden lg:table-cell">
                            {client.updated_at ? new Date(client.updated_at).toLocaleDateString('fr-FR') : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                            <button onClick={() => handleViewClient(client.id)} className="text-[#88C0D0] hover:text-[#A3BE8C] transition-colors" title="Voir détails"><Eye className="w-5 h-5 inline"/></button>
                            <button onClick={() => handleEditClient(client.id)} className="text-[#EBCB8B] hover:text-[#D08770] transition-colors" title="Modifier"><Edit3 className="w-5 h-5 inline"/></button>
                            <button onClick={() => handleDeleteClient(client.id)} className="text-[#BF616A] hover:text-[#D08770] transition-colors" title="Supprimer"><Trash2 className="w-5 h-5 inline"/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {totalPages > 1 && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-[#2A3F6C]/50 sm:px-6 bg-[#0A192F]/60">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-[#3E5F8A]/80 text-sm font-medium rounded-md text-gray-300 bg-[#0E2444]/80 hover:bg-[#15305D]/80 disabled:opacity-50"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-[#3E5F8A]/80 text-sm font-medium rounded-md text-gray-300 bg-[#0E2444]/80 hover:bg-[#15305D]/80 disabled:opacity-50"
                    >
                      Suivant
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-400">
                        Page <span className="font-medium text-gray-200">{currentPage}</span> sur <span className="font-medium text-gray-200">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#3E5F8A]/80 bg-[#0E2444]/80 text-sm font-medium text-gray-400 hover:bg-[#15305D]/80 disabled:opacity-50"
                        >
                          <span className="sr-only">Précédent</span>
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(pageNumber => 
                            pageNumber === 1 || 
                            pageNumber === totalPages || 
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1) ||
                            (currentPage <= 2 && pageNumber <= 3) || 
                            (currentPage >= totalPages -1 && pageNumber >= totalPages -2) 
                          )
                          .map((pageNumber, index, array) => (
                            <React.Fragment key={pageNumber}>
                              {index > 0 && array[index-1] !== pageNumber - 1 && (
                                <span className="relative inline-flex items-center px-4 py-2 border border-[#3E5F8A]/80 bg-[#0E2444]/80 text-sm font-medium text-gray-400">...</span>
                              )}
                              <button
                                onClick={() => handlePageChange(pageNumber)}
                                aria-current={pageNumber === currentPage ? 'page' : undefined}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                  ${pageNumber === currentPage 
                                    ? 'z-10 bg-[#88C0D0] border-[#88C0D0] text-[#0A192F]' 
                                    : 'bg-[#0E2444]/80 border-[#3E5F8A]/80 text-gray-400 hover:bg-[#15305D]/80'
                                  }
                                `}
                              >
                                {pageNumber}
                              </button>
                            </React.Fragment>
                          ))}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#3E5F8A]/80 bg-[#0E2444]/80 text-sm font-medium text-gray-400 hover:bg-[#15305D]/80 disabled:opacity-50"
                        >
                          <span className="sr-only">Suivant</span>
                          <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
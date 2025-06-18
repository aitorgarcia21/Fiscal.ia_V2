import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Eye, Edit3, Trash2, MessageSquare as MessageSquareIcon, Euro, Users } from 'lucide-react';
import apiClient from '../services/apiClient';
import { ClientProfile } from '../types/clientProfile';
import { useAuth } from '../contexts/AuthContext';

const ITEMS_PER_PAGE = 8;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#162238] to-[#1E3253] text-gray-100">
      {/* Header simplifié */}
      <header className="bg-[#162238]/95 backdrop-blur-lg border-b border-[#c5a572]/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative inline-flex items-center justify-center group">
              <MessageSquareIcon className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
              <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent">
                Fiscal.ia
              </h1>
              <p className="text-xs text-gray-400">Gestion Clients</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300 hidden md:block">
              {professionalName}
            </span>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              Espace Particulier
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal simplifié */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Header avec actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Mes Clients ({clients.length})</h2>
            <p className="text-gray-400">Gérez votre portefeuille client</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/pro/chat')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <MessageSquareIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Francis Pro</span>
            </button>
            <button
              onClick={handleAddNewClient}
              className="px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Nouveau Client
            </button>
          </div>
        </div>

        {/* Recherche */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#162238]/80 border border-[#c5a572]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-all"
            />
          </div>
        </div>

        {/* Messages d'état */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-[#c5a572]">
              <div className="w-5 h-5 border-2 border-[#c5a572] border-t-transparent rounded-full animate-spin" />
              <span>Chargement...</span>
            </div>
          </div>
        )}

        {/* Liste simple des clients */}
        {!isLoading && !error && (
          <>
            {filteredClients.length === 0 ? (
              <div className="text-center py-16 bg-[#162238]/60 rounded-xl border border-[#c5a572]/20">
                <Users className="w-16 h-16 text-[#c5a572] mx-auto mb-4" />
                <h3 className="text-xl text-white mb-2">Aucun client</h3>
                <p className="text-gray-400 mb-6">Commencez par ajouter votre premier client</p>
                <button 
                  onClick={handleAddNewClient}
                  className="px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Nouveau Client
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentClients.map((client) => (
                  <div key={client.id} className="bg-[#162238]/60 rounded-xl border border-[#c5a572]/20 p-6 hover:bg-[#162238]/80 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center text-[#162238] font-bold">
                        {client.prenom_client?.charAt(0) || ''}{client.nom_client?.charAt(0) || ''}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {client.prenom_client} {client.nom_client}
                        </h3>
                        <p className="text-sm text-gray-400">{client.email_client || 'Pas d\'email'}</p>
                      </div>
                    </div>
                    
                    {client.statut_dossier_pro && (
                      <div className="mb-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          client.statut_dossier_pro === 'Actif' ? 'bg-green-500/20 text-green-300' : 
                          client.statut_dossier_pro === 'Prospect' ? 'bg-blue-500/20 text-blue-300' : 
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {client.statut_dossier_pro}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewClient(client.id)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClient(client.id)}
                        className="p-2 text-[#c5a572] hover:bg-[#c5a572]/20 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination simple */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm bg-[#162238]/80 border border-[#c5a572]/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#c5a572]/20 transition-colors"
                >
                  Précédent
                </button>
                <span className="px-4 py-2 text-sm text-gray-300">
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm bg-[#162238]/80 border border-[#c5a572]/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#c5a572]/20 transition-colors"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 
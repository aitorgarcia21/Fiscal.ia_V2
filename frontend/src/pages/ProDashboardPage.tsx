import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Eye, Edit3, Trash2, MessageSquare as MessageSquareIcon, Euro, Users, Mic, MicOff, Brain, Settings } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header avec actions améliorées */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Mes Clients ({clients.length})</h2>
            <p className="text-gray-400 text-lg">Gérez votre portefeuille client avec l'IA</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/pro/chat')}
              className="px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-3 shadow-lg"
            >
              <MessageSquareIcon className="w-5 h-5" />
              <span className="font-semibold">Francis Pro</span>
            </button>
            
            <button
              onClick={handleAddNewClient}
              className="px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-3 shadow-lg"
            >
              <PlusCircle className="w-5 h-5" />
              Nouveau Client
            </button>
          </div>
        </div>

        {/* Recherche améliorée */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un client par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#162238]/80 border border-[#c5a572]/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 transition-all text-lg"
            />
          </div>
        </div>

        {/* Messages d'état */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-4 text-[#c5a572]">
              <div className="w-8 h-8 border-3 border-[#c5a572] border-t-transparent rounded-full animate-spin" />
              <span className="text-lg">Chargement de vos clients...</span>
            </div>
          </div>
        )}

        {/* Liste des clients améliorée */}
        {!isLoading && !error && (
          <>
            {filteredClients.length === 0 ? (
              <div className="text-center py-20 bg-[#162238]/60 rounded-2xl border border-[#c5a572]/20">
                <div className="w-24 h-24 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-[#162238]" />
                </div>
                <h3 className="text-2xl text-white mb-3">Aucun client</h3>
                <p className="text-gray-400 mb-8 text-lg">Commencez par ajouter votre premier client avec l'aide de l'IA</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={handleAddNewClient}
                    className="px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Ajout Manuel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentClients.map((client) => (
                  <div key={client.id} className="bg-[#162238]/60 rounded-xl border border-[#c5a572]/20 p-6 hover:bg-[#162238]/80 hover:border-[#c5a572]/40 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center text-[#162238] font-bold text-lg shadow-lg">
                        {client.prenom_client?.charAt(0) || ''}{client.nom_client?.charAt(0) || ''}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {client.prenom_client} {client.nom_client}
                        </h3>
                        <p className="text-sm text-gray-400">{client.email_client || 'Pas d\'email'}</p>
                      </div>
                    </div>
                    
                    {client.statut_dossier_pro && (
                      <div className="mb-4">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          client.statut_dossier_pro === 'Actif' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 
                          client.statut_dossier_pro === 'Prospect' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 
                          'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {client.statut_dossier_pro}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewClient(client.id)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Voir le profil"
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

            {/* Pagination améliorée */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 text-sm bg-[#162238]/80 border border-[#c5a572]/30 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#c5a572]/20 transition-all font-medium"
                >
                  Précédent
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-[#c5a572] text-[#162238]'
                          : 'bg-[#162238]/60 text-gray-300 hover:bg-[#162238]/80'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 text-sm bg-[#162238]/80 border border-[#c5a572]/30 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#c5a572]/20 transition-all font-medium"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {/* Footer */}
      <footer className="mt-auto bg-[#162238] border-t border-[#c5a572]/20 p-4 text-center">
        <button
          onClick={() => navigate('/pro/settings')}
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
          Paramètres
        </button>
      </footer>
    </div>
  );
} 
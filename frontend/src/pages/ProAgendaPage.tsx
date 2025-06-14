import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, Edit3, Trash2, CalendarDays, Users, Clock, MapPin, AlignLeft, Tag, Loader2 } from 'lucide-react';
import { RendezVousModal } from '../components/pro/RendezVousModal';

// Interfaces pour les données de rendez-vous (correspondant aux schémas Pydantic)
export interface RendezVous {
  id: string; // UUID
  id_client: number;
  titre: string;
  description?: string | null;
  date_heure_debut: string; // DateTime en string ISO
  date_heure_fin: string; // DateTime en string ISO
  lieu?: string | null;
  statut?: string | null;
  notes_rdv?: string | null;
  created_at: string;
  updated_at: string;
  id_professionnel: string; // UUID
  // Pourrait être enrichi côté client avec le nom du client si nécessaire
  nom_client?: string; 
  prenom_client?: string;
}

export function ProAgendaPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rendezVousList, setRendezVousList] = useState<RendezVous[]>([]);
  const [clients, setClients] = useState<{ id: number; nom_client: string; prenom_client: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRendezVous, setEditingRendezVous] = useState<RendezVous | null>(null);
  const [isSavingRdv, setIsSavingRdv] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isLoadingClientsForModal, setIsLoadingClientsForModal] = useState(false);

  const fetchRendezVous = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient<RendezVous[]>('/api/pro/rendezvous', { method: 'GET' });
      const augmentedResponse = await Promise.all(response.map(async (rdv) => {
        try {
          const clientDetails = await apiClient<any>(`/api/pro/clients/${rdv.id_client}`);
          return { ...rdv, nom_client: clientDetails.nom_client, prenom_client: clientDetails.prenom_client };
        } catch (clientError) {
          console.warn(`Impossible de charger les détails pour le client ID ${rdv.id_client} du RDV ${rdv.id}`);
          return { ...rdv, nom_client: 'Client inconnu', prenom_client: '' };
        }
      }));
      const sortedRdv = augmentedResponse.sort((a, b) => new Date(b.date_heure_debut).getTime() - new Date(a.date_heure_debut).getTime());
      setRendezVousList(sortedRdv);
    } catch (err: any) {
      console.error("Erreur lors de la récupération des rendez-vous:", err);
      setError(err.data?.detail || err.message || 'Erreur de chargement des rendez-vous.');
    }
    setIsLoading(false);
  }, []);

  const fetchClientsForModal = useCallback(async () => {
    setIsLoadingClientsForModal(true);
    try {
      const response = await apiClient<{id: number; nom_client: string; prenom_client: string}[]>('/api/pro/clients?limit=500');
      setClients(response || []);
    } catch (err) {
      console.error("Erreur chargement des clients pour la modale:", err);
      setModalError("Impossible de charger la liste des clients pour la modale.");
      setClients([]); 
    }
    setIsLoadingClientsForModal(false);
  }, []);

  useEffect(() => {
    fetchRendezVous();
    fetchClientsForModal();
  }, [fetchRendezVous, fetchClientsForModal]);

  const handleOpenModal = (rdv?: RendezVous) => {
    setEditingRendezVous(rdv || null);
    setModalError(null);
    if (clients.length === 0 && !isLoadingClientsForModal) {
        fetchClientsForModal();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRendezVous(null);
    setModalError(null);
  };

  const handleSaveRendezVous = async (rdvData: Partial<RendezVous>) => {
    if (!user?.id) {
        setModalError("Utilisateur non authentifié.");
        return;
    }
    setIsSavingRdv(true);
    setModalError(null);
    
    const payload = { ...rdvData };

    try {
      if (editingRendezVous?.id) {
        await apiClient<RendezVous>(`/api/pro/rendezvous/${editingRendezVous.id}`, {
          method: 'PUT',
          data: payload,
        });
      } else {
        await apiClient<RendezVous>('/api/pro/rendezvous', {
          method: 'POST',
          data: payload,
        });
      }
      fetchRendezVous(); 
      handleCloseModal();
    } catch (err: any) {
      console.error("Erreur lors de la sauvegarde du rendez-vous:", err);
      setModalError(err.data?.detail || err.message || 'Erreur lors de la sauvegarde du RDV.');
    } finally {
      setIsSavingRdv(false);
    }
  };

  const handleDeleteRendezVous = async (rdvId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous ?")) {
      try {
        await apiClient(`/api/pro/rendezvous/${rdvId}`, { method: 'DELETE' });
        fetchRendezVous();
      } catch (err: any) {
        console.error("Erreur lors de la suppression du rendez-vous:", err);
        setError(err.data?.detail || err.message || 'Erreur lors de la suppression.');
      }
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] to-[#0D1F3A] text-gray-100 flex flex-col font-sans">
      <header className="bg-[#0A192F]/95 backdrop-blur-lg border-b border-[#2A3F6C]/30 shadow-lg sticky top-0 z-30">
        <div className="h-20 max-w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/pro/dashboard')}>
            <CalendarDays className="h-8 w-8 text-[#88C0D0]" />
            <span className="text-2xl font-bold text-[#88C0D0]">Agenda Professionnel</span>
          </div>
          <button
            onClick={() => handleOpenModal()} 
            className="px-6 py-3 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] text-[#0A192F] font-semibold rounded-xl shadow-lg hover:shadow-[#88C0D0]/40 hover:scale-105 transition-all duration-300 flex items-center gap-2 text-base"
          >
            <PlusCircle className="w-5 h-5" />
            Nouveau RDV
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 sm:p-8 lg:p-10">
        <div className="max-w-5xl mx-auto">
          {isLoading && (
            <div className="text-center py-10 flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-[#88C0D0] animate-spin" />
              <p className="mt-3 text-gray-400">Chargement de l'agenda...</p>
            </div>
          )}
          {error && <p className="text-center text-red-400 py-8 bg-red-900/20 border border-red-700/50 rounded-lg p-4">{error}</p>}
          
          {!isLoading && !error && rendezVousList.length === 0 && (
            <div className="text-center text-gray-400 py-16 px-6 bg-[#0E2444]/50 border border-[#2A3F6C]/30 rounded-xl">
              <CalendarDays size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-xl text-white mb-2">Aucun rendez-vous programmé.</h3>
              <p className="mb-4">Cliquez sur "Nouveau RDV" pour planifier votre premier rendez-vous.</p>
            </div>
          )}

          {!isLoading && !error && rendezVousList.length > 0 && (
            <div className="space-y-4">
              {rendezVousList.map(rdv => (
                <div key={rdv.id} className="bg-[#0E2444]/70 border border-[#2A3F6C]/40 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2">
                    <h3 className="text-lg font-semibold text-[#88C0D0] mb-1 sm:mb-0 break-all">{rdv.titre}</h3>
                    <div className="text-xs text-gray-400 space-x-3 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rdv.statut === 'Confirmé' ? 'bg-green-600/30 text-green-300' : rdv.statut === 'Terminé' ? 'bg-gray-600/30 text-gray-300' : 'bg-yellow-600/30 text-yellow-300'}`}>
                            {rdv.statut || 'N/A'}
                        </span>
                        <span>ID: {rdv.id.substring(0,8)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
                    <div className="flex items-center text-gray-300"><Users className="w-4 h-4 mr-2 text-gray-500" /> Client: {rdv.prenom_client} {rdv.nom_client || '(ID: ' + rdv.id_client + ')'}</div>
                    <div className="flex items-center text-gray-300"><Clock className="w-4 h-4 mr-2 text-gray-500" /> Début: {formatDate(rdv.date_heure_debut)}</div>
                    <div className="flex items-center text-gray-300"><Clock className="w-4 h-4 mr-2 text-gray-500" /> Fin: {formatDate(rdv.date_heure_fin)}</div>
                    {rdv.lieu && <div className="flex items-center text-gray-300"><MapPin className="w-4 h-4 mr-2 text-gray-500" /> {rdv.lieu}</div>}
                  </div>

                  {rdv.description && <div className="mb-3 text-sm text-gray-300 bg-[#0A192F]/40 p-2 rounded"><AlignLeft className="w-4 h-4 mr-1.5 text-gray-500 inline-block" />{rdv.description}</div>}
                  {rdv.notes_rdv && <div className="text-xs text-gray-400 italic bg-[#0A192F]/30 p-2 rounded"><Tag className="w-3 h-3 mr-1.5 text-gray-500 inline-block" />Notes: {rdv.notes_rdv}</div>}
                  
                  <div className="mt-3 pt-3 border-t border-[#2A3F6C]/30 flex justify-end space-x-2">
                    <button onClick={() => handleOpenModal(rdv)} className="text-sm text-[#EBCB8B] hover:text-[#D08770] p-1.5 rounded hover:bg-white/5"><Edit3 size={16} className="inline mr-1"/> Modifier</button>
                    <button onClick={() => handleDeleteRendezVous(rdv.id)} className="text-sm text-[#BF616A] hover:text-[#D08770] p-1.5 rounded hover:bg-white/5"><Trash2 size={16} className="inline mr-1"/> Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <RendezVousModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveRendezVous} 
        initialData={editingRendezVous}
        clients={clients}
        isLoading={isSavingRdv}
        error={modalError}
      />
    </div>
  );
} 
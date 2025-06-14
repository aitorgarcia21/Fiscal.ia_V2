import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, MapPin, AlignLeft, Tag, AlertTriangle, Loader2 } from 'lucide-react';
import { RendezVous } from '../../pages/ProAgendaPage'; // Importer l'interface RendezVous

// Interface pour les props de la modale
interface RendezVousModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rdvData: Partial<RendezVous>) => Promise<void>; // Partial car l'ID est géré par le backend pour la création
  initialData?: RendezVous | null;
  clients: { id: number; nom_client: string; prenom_client: string }[];
  isLoading?: boolean; // Pour indiquer si une sauvegarde est en cours
  error?: string | null; // Pour afficher les erreurs de sauvegarde
  isLoadingClients?: boolean; // Ajout de la prop manquante
}

// Type pour les données du formulaire interne
interface RendezVousFormData {
  id_client: string; // Sera un nombre, mais le select HTML donne une chaîne
  titre: string;
  description: string;
  date_heure_debut: string; // Format YYYY-MM-DDTHH:mm
  date_heure_fin: string; // Format YYYY-MM-DDTHH:mm
  lieu: string;
  statut: string;
  notes_rdv: string;
}

const STATUT_OPTIONS = ['Confirmé', 'En attente', 'Annulé', 'Terminé'];

export const RendezVousModal: React.FC<RendezVousModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  clients,
  isLoading = false,
  error = null,
  isLoadingClients = false // Récupérer la prop
}) => {
  const [formData, setFormData] = useState<RendezVousFormData>({
    id_client: initialData?.id_client?.toString() || (clients.length > 0 ? clients[0].id.toString() : ''),
    titre: initialData?.titre || '',
    description: initialData?.description || '',
    // Formater les dates pour datetime-local input: YYYY-MM-DDTHH:mm
    date_heure_debut: initialData?.date_heure_debut ? new Date(new Date(initialData.date_heure_debut).getTime() - new Date(initialData.date_heure_debut).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
    date_heure_fin: initialData?.date_heure_fin ? new Date(new Date(initialData.date_heure_fin).getTime() - new Date(initialData.date_heure_fin).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
    lieu: initialData?.lieu || '',
    statut: initialData?.statut || STATUT_OPTIONS[0],
    notes_rdv: initialData?.notes_rdv || '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Pré-remplir le formulaire si initialData change (mode édition)
    setFormData({
      id_client: initialData?.id_client?.toString() || (clients.length > 0 ? clients[0].id.toString() : ''),
      titre: initialData?.titre || '',
      description: initialData?.description || '',
      date_heure_debut: initialData?.date_heure_debut ? new Date(new Date(initialData.date_heure_debut).getTime() - new Date(initialData.date_heure_debut).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
      date_heure_fin: initialData?.date_heure_fin ? new Date(new Date(initialData.date_heure_fin).getTime() - new Date(initialData.date_heure_fin).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
      lieu: initialData?.lieu || '',
      statut: initialData?.statut || STATUT_OPTIONS[0],
      notes_rdv: initialData?.notes_rdv || '',
    });
    setFormError(null); // Réinitialiser l'erreur du formulaire lors du changement de données initiales
  }, [initialData, clients]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.titre || !formData.id_client || !formData.date_heure_debut || !formData.date_heure_fin) {
      setFormError("Le client, le titre et les dates/heures de début et fin sont obligatoires.");
      return;
    }
    if (new Date(formData.date_heure_fin) < new Date(formData.date_heure_debut)) {
        setFormError("La date de fin ne peut pas être antérieure à la date de début.");
        return;
    }

    const payload: Partial<RendezVous> = {
      ...formData,
      id_client: parseInt(formData.id_client, 10),
      // Les dates sont déjà en format ISO string partiel, le backend les gèrera
    };
    if (initialData?.id) {
      payload.id = initialData.id;
    }
    
    await onSave(payload);
    // La fermeture de la modale et la gestion des erreurs globales sont gérées par la page parente (ProAgendaPage)
  };

  if (!isOpen) return null;

  const inputBaseStyle = "w-full px-3 py-2 bg-[#0A192F]/70 border border-[#2A3F6C]/60 rounded-md text-gray-200 focus:outline-none focus:border-[#88C0D0] focus:ring-1 focus:ring-[#88C0D0] transition-colors placeholder-gray-500";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out" style={{ opacity: isOpen ? 1 : 0 }}>
      <div className="bg-gradient-to-br from-[#0E2444] to-[#15305D] p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-xl border border-[#3E5F8A]/70 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">{initialData ? 'Modifier le' : 'Nouveau'} Rendez-vous</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Fermer la modale">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="id_client" className="block text-sm font-medium text-gray-300 mb-1">Client</label>
            <select id="id_client" name="id_client" value={formData.id_client} onChange={handleChange} className={`${inputBaseStyle} appearance-none`} required disabled={isLoadingClients}>
              {isLoadingClients && clients.length === 0 && <option value="">Chargement des clients...</option>} 
              {!isLoadingClients && clients.length === 0 && <option value="">Aucun client trouvé</option>} 
              {clients.map(client => (
                <option key={client.id} value={client.id.toString()}>{client.prenom_client} {client.nom_client}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="titre" className="block text-sm font-medium text-gray-300 mb-1">Titre du RDV</label>
            <input type="text" id="titre" name="titre" value={formData.titre} onChange={handleChange} className={inputBaseStyle} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date_heure_debut" className="block text-sm font-medium text-gray-300 mb-1">Début</label>
              <input type="datetime-local" id="date_heure_debut" name="date_heure_debut" value={formData.date_heure_debut} onChange={handleChange} className={inputBaseStyle} required />
            </div>
            <div>
              <label htmlFor="date_heure_fin" className="block text-sm font-medium text-gray-300 mb-1">Fin</label>
              <input type="datetime-local" id="date_heure_fin" name="date_heure_fin" value={formData.date_heure_fin} onChange={handleChange} className={inputBaseStyle} required />
            </div>
          </div>

          <div>
            <label htmlFor="lieu" className="block text-sm font-medium text-gray-300 mb-1">Lieu (Optionnel)</label>
            <input type="text" id="lieu" name="lieu" value={formData.lieu} onChange={handleChange} className={inputBaseStyle} />
          </div>

          <div>
            <label htmlFor="statut" className="block text-sm font-medium text-gray-300 mb-1">Statut</label>
            <select id="statut" name="statut" value={formData.statut} onChange={handleChange} className={`${inputBaseStyle} appearance-none`}>
              {STATUT_OPTIONS.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description (Optionnel)</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className={`${inputBaseStyle} resize-y`}></textarea>
          </div>

          <div>
            <label htmlFor="notes_rdv" className="block text-sm font-medium text-gray-300 mb-1">Notes sur le RDV (Optionnel)</label>
            <textarea id="notes_rdv" name="notes_rdv" value={formData.notes_rdv} onChange={handleChange} rows={3} className={`${inputBaseStyle} resize-y`}></textarea>
          </div>

          {formError && (
            <div className="p-3 bg-red-900/40 border border-red-700/60 rounded-md text-red-300 text-sm flex items-center">
              <AlertTriangle size={18} className="mr-2 flex-shrink-0" /> {formError}
            </div>
          )}
          {error && !formError && (
            <div className="p-3 bg-red-900/40 border border-red-700/60 rounded-md text-red-300 text-sm flex items-center">
              <AlertTriangle size={18} className="mr-2 flex-shrink-0" /> {error} {/* Erreur de sauvegarde globale */}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-70">
              Annuler
            </button>
            <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] text-[#0A192F] font-semibold rounded-xl shadow-lg hover:shadow-[#88C0D0]/30 hover:scale-105 transition-all duration-300 text-sm disabled:opacity-70 flex items-center">
              {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
              {isLoading ? 'Enregistrement...' : (initialData ? 'Mettre à jour' : 'Créer RDV')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
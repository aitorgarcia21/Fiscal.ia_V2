import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  Calendar,
  ArrowLeft,
  Plus,
  FolderOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Document {
  id: string;
  name: string;
  type: 'declaration' | 'justificatif' | 'recu' | 'contrat' | 'autre';
  size: number;
  uploadDate: string;
  year: number;
  status: 'verified' | 'pending' | 'error';
  url?: string;
}

export function DocumentsFiscauxPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Charger les documents (simulation pour démo)
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    // Simulation de documents pour la démo
    const demoDocuments: Document[] = [
      {
        id: '1',
        name: 'Déclaration IR 2023.pdf',
        type: 'declaration',
        size: 2457600,
        uploadDate: '2024-05-15',
        year: 2023,
        status: 'verified'
      },
      {
        id: '2',
        name: 'Justificatif frais professionnels 2023.pdf',
        type: 'justificatif',
        size: 891200,
        uploadDate: '2024-03-10',
        year: 2023,
        status: 'verified'
      },
      {
        id: '3',
        name: 'Reçu don association.pdf',
        type: 'recu',
        size: 234500,
        uploadDate: '2024-01-20',
        year: 2023,
        status: 'pending'
      },
      {
        id: '4',
        name: 'Contrat assurance vie.pdf',
        type: 'contrat',
        size: 1567800,
        uploadDate: '2023-12-05',
        year: 2023,
        status: 'verified'
      }
    ];
    setDocuments(demoDocuments);
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'declaration': 'Déclaration',
      'justificatif': 'Justificatif',
      'recu': 'Reçu fiscal',
      'contrat': 'Contrat',
      'autre': 'Autre'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'declaration': 'bg-blue-100 text-blue-800',
      'justificatif': 'bg-green-100 text-green-800',
      'recu': 'bg-purple-100 text-purple-800',
      'contrat': 'bg-orange-100 text-orange-800',
      'autre': 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesYear = filterYear === 'all' || doc.year.toString() === filterYear;
    return matchesSearch && matchesType && matchesYear;
  });

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const years = Array.from(new Set(documents.map(doc => doc.year))).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#1a2332] to-[#2d3748]">
      {/* Header */}
      <div className="bg-[#1a2332] border-b border-[#c5a572]/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-[#c5a572] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour au dashboard</span>
              </button>
              <div className="h-6 w-px bg-[#c5a572]/30"></div>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-[#c5a572]" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Mes Documents Fiscaux</h1>
                  <p className="text-gray-400">Gérez vos documents fiscaux et justificatifs</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleUpload}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Ajouter un document
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Filtres */}
        <div className="mb-6 bg-[#1a2332] rounded-xl p-6 border border-[#c5a572]/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0A192F] border border-[#c5a572]/20 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:outline-none"
              />
            </div>

            {/* Filtre par type */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0A192F] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
              >
                <option value="all">Tous les types</option>
                <option value="declaration">Déclarations</option>
                <option value="justificatif">Justificatifs</option>
                <option value="recu">Reçus fiscaux</option>
                <option value="contrat">Contrats</option>
                <option value="autre">Autres</option>
              </select>
            </div>

            {/* Filtre par année */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0A192F] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
              >
                <option value="all">Toutes les années</option>
                {years.map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des documents */}
        <div className="bg-[#1a2332] rounded-xl border border-[#c5a572]/20 overflow-hidden">
          {filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Aucun document trouvé</h3>
              <p className="text-gray-400 mb-6">
                {documents.length === 0 
                  ? "Vous n'avez pas encore uploadé de documents fiscaux."
                  : "Aucun document ne correspond à vos critères de recherche."
                }
              </p>
              <button
                onClick={handleUpload}
                className="px-6 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Ajouter votre premier document
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A192F]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Année
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Taille
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5a572]/10">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#0A192F]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#c5a572]" />
                          <span className="text-white font-medium">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(doc.type)}`}>
                          {getTypeLabel(doc.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">{doc.year}</td>
                      <td className="px-6 py-4 text-gray-400">{formatFileSize(doc.size)}</td>
                      <td className="px-6 py-4 text-gray-400">{formatDate(doc.uploadDate)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(doc.status)}
                          <span className="text-sm text-gray-400 capitalize">{doc.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-gray-400 hover:text-[#c5a572] transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-[#c5a572] transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal upload (placeholder) */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2332] border border-[#c5a572]/20 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Ajouter un document</h3>
              <p className="text-gray-400 mb-6">
                Fonctionnalité d'upload en cours de développement...
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-[#c5a572]/20 text-[#c5a572] rounded-lg hover:bg-[#c5a572]/10 transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

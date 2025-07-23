/**
 * ReportsManager.tsx - Interface de gestion des rapports clients
 * 
 * Fonctionnalités:
 * - Vue d'ensemble des rapports générés
 * - Création de nouveaux rapports
 * - Templates personnalisables
 * - Envoi automatisé
 * - Suivi des consultations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import {
  FileText, Plus, Send, Eye, Download, Calendar, Filter,
  Users, TrendingUp, Clock, CheckCircle, AlertCircle, Settings,
  BarChart3, PieChart, FileSpreadsheet, Presentation
} from 'lucide-react';

import reportGenerator from '../../utils/ReportGenerator';

interface ReportStats {
  total: number;
  thisMonth: number;
  pending: number;
  sent: number;
  viewed: number;
}

const ReportsManager: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    total: 0,
    thisMonth: 0,
    pending: 0,
    sent: 0,
    viewed: 0
  });
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      
      const [allReports, allTemplates] = await Promise.all([
        reportGenerator.getReports(),
        reportGenerator.getTemplates()
      ]);

      setReports(allReports);
      setTemplates(allTemplates);

      // Calcul des statistiques
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      setStats({
        total: allReports.length,
        thisMonth: allReports.filter(r => new Date(r.generatedAt || 0) >= thisMonth).length,
        pending: allReports.filter(r => r.status === 'DRAFT' || r.status === 'GENERATING').length,
        sent: allReports.filter(r => r.status === 'SENT').length,
        viewed: allReports.filter(r => r.status === 'VIEWED').length
      });

    } catch (error) {
      console.error('Erreur chargement rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (clientId: string, templateId: string) => {
    try {
      await reportGenerator.generateReport(clientId, templateId, {
        includeFrancisInsights: true
      });
      await loadReportsData();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erreur création rapport:', error);
    }
  };

  const handleSendReport = async (reportId: string) => {
    try {
      await reportGenerator.sendReport(reportId, ['client@example.com']);
      await loadReportsData();
    } catch (error) {
      console.error('Erreur envoi rapport:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'GENERATING': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'READY': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'SENT': return <Send className="h-4 w-4 text-blue-600" />;
      case 'VIEWED': return <Eye className="h-4 w-4 text-purple-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'GENERATING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'READY': return 'bg-green-100 text-green-800 border-green-200';
      case 'SENT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'VIEWED': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'excel': return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      case 'powerpoint': return <Presentation className="h-4 w-4 text-orange-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesClient = selectedClient === 'all' || report.clientId === selectedClient;
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClient && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Rapports</h1>
          <p className="text-gray-600">Générez et gérez vos rapports clients personnalisés</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Rapport
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ce mois</p>
                <p className="text-2xl font-bold text-green-600">{stats.thisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Envoyés</p>
                <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
              </div>
              <Send className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultés</p>
                <p className="text-2xl font-bold text-purple-600">{stats.viewed}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Rechercher un rapport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                <SelectItem value="client-1">Client Exemple 1</SelectItem>
                <SelectItem value="client-2">Client Exemple 2</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
                <SelectItem value="READY">Prêt</SelectItem>
                <SelectItem value="SENT">Envoyé</SelectItem>
                <SelectItem value="VIEWED">Consulté</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Onglets */}
      <Tabs value="reports" onValueChange={() => {}} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Rapports
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-6">
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getFormatIcon(report.metadata.format)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-600">
                          Client: {report.clientId} • {report.summary.totalPages} pages
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge className={getStatusColor(report.status)}>
                            <div className="flex items-center">
                              {getStatusIcon(report.status)}
                              <span className="ml-1">{report.status}</span>
                            </div>
                          </Badge>
                          {report.generatedAt && (
                            <span className="text-xs text-gray-500">
                              {new Date(report.generatedAt).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {report.status === 'READY' && (
                        <Button
                          size="sm"
                          onClick={() => handleSendReport(report.id)}
                          className="flex items-center"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Envoyer
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Aperçu
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredReports.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun rapport trouvé
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Aucun rapport ne correspond à vos critères de recherche.
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer le premier rapport
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {getFormatIcon(template.format)}
                    <h3 className="font-semibold text-gray-900 ml-2">{template.name}</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {template.sections.length} sections • Format {template.format}
                  </p>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{template.type}</Badge>
                    <Button
                      size="sm"
                      onClick={() => {
                        // Logique pour utiliser ce template
                      }}
                    >
                      Utiliser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de création (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Créer un nouveau rapport</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Fonctionnalité de création en cours de développement...</p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </Button>
                <Button onClick={() => handleCreateReport('client-example', 'patrimonial-summary')}>
                  Créer (Demo)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsManager;

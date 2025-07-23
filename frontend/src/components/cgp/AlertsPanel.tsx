import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { 
  AlertTriangle, 
  Bell, 
  Search, 
  Filter,
  Clock,
  User,
  TrendingDown,
  Calendar,
  CheckCircle,
  X,
  Eye,
  Settings,
  Shield,
  Zap,
  Target
} from 'lucide-react';

import proactiveAlerts from '../../utils/ProactiveAlerts';

interface ProactiveAlert {
  id: string;
  type: 'CLIENT_BEHAVIOR' | 'MARKET_CHANGE' | 'FISCAL_UPDATE' | 'PORTFOLIO_RISK' | 'COMPLIANCE_DEADLINE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  clientId?: string;
  clientName?: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  createdAt: Date;
  lastUpdated: Date;
  francisAnalysis: {
    context: string;
    implications: string[];
    urgency: 'IMMEDIATE' | 'THIS_WEEK' | 'THIS_MONTH' | 'MONITORING';
    confidence: number;
  };
  recommendations: Array<{
    action: string;
    priority: number;
    timeline: string;
    resources: string[];
  }>;
}

const AlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<ProactiveAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [selectedAlert, setSelectedAlert] = useState<ProactiveAlert | null>(null);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, searchQuery, selectedType, selectedSeverity, selectedStatus]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      
      // Simulation d'alertes pour la démo
      const demoAlerts: ProactiveAlert[] = [
        {
          id: 'alert-001',
          type: 'CLIENT_BEHAVIOR',
          severity: 'HIGH',
          title: 'Changement comportemental détecté - Client Dupont',
          description: 'Réduction significative des interactions et satisfaction en baisse',
          clientId: 'client-001',
          clientName: 'Jean Dupont',
          status: 'ACTIVE',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
          francisAnalysis: {
            context: 'Client historiquement engagé montrant des signes de désengagement',
            implications: [
              'Risque de perte du client (probabilité 75%)',
              'Impact estimé: 450k€ d\'AUM',
              'Besoin d\'intervention immédiate'
            ],
            urgency: 'IMMEDIATE',
            confidence: 82
          },
          recommendations: [
            {
              action: 'Appel téléphonique dans les 24h',
              priority: 10,
              timeline: 'Immédiat',
              resources: ['Conseiller principal', 'Questionnaire satisfaction']
            }
          ]
        },
        {
          id: 'alert-002',
          type: 'MARKET_CHANGE',
          severity: 'MEDIUM',
          title: 'Volatilité accrue sur les marchés actions',
          description: 'Impact potentiel sur les portefeuilles à profil agressif',
          status: 'ACKNOWLEDGED',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
          francisAnalysis: {
            context: 'Volatilité inhabituelle détectée, impact sur 23 clients',
            implications: [
              '23 clients avec exposition actions > 70%',
              'Potentielle perte de valeur 3-8%',
              'Opportunité de rééquilibrage'
            ],
            urgency: 'THIS_WEEK',
            confidence: 74
          },
          recommendations: [
            {
              action: 'Revue des allocations clients à haut risque',
              priority: 7,
              timeline: '3-5 jours',
              resources: ['Outils d\'analyse risque', 'Historique marché']
            }
          ]
        },
        {
          id: 'alert-003',
          type: 'FISCAL_UPDATE',
          severity: 'CRITICAL',
          title: 'Nouveau barème fiscal 2024 - Impact clients',
          description: 'Modifications importantes sur l\'IR nécessitant révision des stratégies',
          status: 'IN_PROGRESS',
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          lastUpdated: new Date(Date.now() - 30 * 60 * 1000),
          francisAnalysis: {
            context: 'Nouveau barème fiscal publié avec impact significatif',
            implications: [
              '67 clients nécessitent révision stratégie',
              'Économies potentielles: 180k€ total',
              'Deadline optimisation: 31 décembre'
            ],
            urgency: 'THIS_MONTH',
            confidence: 95
          },
          recommendations: [
            {
              action: 'Audit fiscal complet pour clients > 100k€ revenus',
              priority: 9,
              timeline: '2 semaines',
              resources: ['Simulateur fiscal Francis', 'Équipe fiscaliste']
            }
          ]
        }
      ];

      setAlerts(demoAlerts);
      
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = [...alerts];

    if (searchQuery) {
      filtered = filtered.filter(alert => 
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (alert.clientName && alert.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(alert => alert.type === selectedType);
    }

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === selectedSeverity);
    }

    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        filtered = filtered.filter(alert => ['ACTIVE', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(alert.status));
      } else {
        filtered = filtered.filter(alert => alert.status === selectedStatus.toUpperCase());
      }
    }

    setFilteredAlerts(filtered.sort((a, b) => {
      const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    }));
  };

  const handleAlertAction = async (alertId: string, action: 'acknowledge' | 'resolve' | 'dismiss') => {
    try {
      const updatedAlerts = alerts.map(alert => {
        if (alert.id === alertId) {
          const now = new Date();
          switch (action) {
            case 'acknowledge':
              return { ...alert, status: 'ACKNOWLEDGED' as const, lastUpdated: now };
            case 'resolve':
              return { ...alert, status: 'RESOLVED' as const, lastUpdated: now };
            case 'dismiss':
              return { ...alert, status: 'DISMISSED' as const, lastUpdated: now };
            default:
              return alert;
          }
        }
        return alert;
      });
      
      setAlerts(updatedAlerts);
      
      if (selectedAlert?.id === alertId) {
        const updatedAlert = updatedAlerts.find(a => a.id === alertId);
        if (updatedAlert) setSelectedAlert(updatedAlert);
      }
      
    } catch (error) {
      console.error('Erreur mise à jour alerte:', error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'CLIENT_BEHAVIOR': return <User className="h-5 w-5" />;
      case 'MARKET_CHANGE': return <TrendingDown className="h-5 w-5" />;
      case 'FISCAL_UPDATE': return <Shield className="h-5 w-5" />;
      case 'PORTFOLIO_RISK': return <Target className="h-5 w-5" />;
      case 'COMPLIANCE_DEADLINE': return <Calendar className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-red-100 text-red-800 border-red-300';
      case 'ACKNOWLEDGED': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-300';
      case 'DISMISSED': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'IMMEDIATE': return 'text-red-700 bg-red-100';
      case 'THIS_WEEK': return 'text-orange-700 bg-orange-100';
      case 'THIS_MONTH': return 'text-blue-700 bg-blue-100';
      case 'MONITORING': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 60) return `il y a ${diffMins}min`;
    return `il y a ${diffHours}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="h-8 w-8 mr-3 text-red-600" />
            Alertes Proactives
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredAlerts.length} alertes • Surveillance automatique Francis IA
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={loadAlerts}>
            <Bell className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configurer
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.severity === 'CRITICAL').length}
              </div>
              <div className="text-sm text-gray-600">Critiques</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {alerts.filter(a => a.severity === 'HIGH').length}
              </div>
              <div className="text-sm text-gray-600">Élevées</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {alerts.filter(a => ['ACTIVE', 'ACKNOWLEDGED'].includes(a.status)).length}
              </div>
              <div className="text-sm text-gray-600">En cours</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {alerts.filter(a => a.status === 'RESOLVED').length}
              </div>
              <div className="text-sm text-gray-600">Résolues</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(alerts.reduce((acc, a) => acc + a.francisAnalysis.confidence, 0) / alerts.length) || 0}%
              </div>
              <div className="text-sm text-gray-600">Confiance Moy.</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une alerte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="CLIENT_BEHAVIOR">Comportement client</SelectItem>
                <SelectItem value="MARKET_CHANGE">Changement marché</SelectItem>
                <SelectItem value="FISCAL_UPDATE">Mise à jour fiscale</SelectItem>
                <SelectItem value="PORTFOLIO_RISK">Risque portefeuille</SelectItem>
                <SelectItem value="COMPLIANCE_DEADLINE">Échéance compliance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Sévérité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes sévérités</SelectItem>
                <SelectItem value="CRITICAL">Critique</SelectItem>
                <SelectItem value="HIGH">Élevée</SelectItem>
                <SelectItem value="MEDIUM">Moyenne</SelectItem>
                <SelectItem value="LOW">Faible</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="ACTIVE">Nouvelles</SelectItem>
                <SelectItem value="ACKNOWLEDGED">Reconnues</SelectItem>
                <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                <SelectItem value="RESOLVED">Résolues</SelectItem>
                <SelectItem value="DISMISSED">Ignorées</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedSeverity('all');
              setSelectedStatus('active');
            }}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Aucune alerte correspondante
                </h3>
                <p className="text-gray-500">
                  Tout semble sous contrôle ! Modifiez vos filtres pour voir d'autres alertes.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card 
                key={alert.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedAlert?.id === alert.id ? 'ring-2 ring-red-500' : ''
                } ${alert.status === 'ACTIVE' ? 'border-l-4 border-l-red-500' : ''}`}
                onClick={() => setSelectedAlert(alert)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {alert.title}
                        </h3>
                        {alert.clientName && (
                          <p className="text-sm text-gray-600 mb-2">
                            Client: {alert.clientName}
                          </p>
                        )}
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-2">
                        {formatTimeAgo(alert.createdAt)}
                      </p>
                      <Badge className={getUrgencyColor(alert.francisAnalysis.urgency)}>
                        {alert.francisAnalysis.urgency}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {alert.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {alert.francisAnalysis.confidence}% confiance
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {alert.status === 'ACTIVE' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlertAction(alert.id, 'acknowledge');
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Voir
                          </Button>
                          <Button 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlertAction(alert.id, 'resolve');
                            }}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Résoudre
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Détail de l'alerte sélectionnée */}
        <div className="lg:sticky lg:top-6">
          {selectedAlert ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getAlertIcon(selectedAlert.type)}
                    <span className="ml-2">Détails de l'alerte</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setSelectedAlert(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="pb-4 border-b">
                  <h3 className="font-semibold text-lg mb-2">{selectedAlert.title}</h3>
                  <p className="text-gray-700 mb-3">{selectedAlert.description}</p>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge className={getSeverityColor(selectedAlert.severity)}>
                      {selectedAlert.severity}
                    </Badge>
                    <Badge className={getStatusColor(selectedAlert.status)}>
                      {selectedAlert.status}
                    </Badge>
                    <Badge className={getUrgencyColor(selectedAlert.francisAnalysis.urgency)}>
                      {selectedAlert.francisAnalysis.urgency}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Créée: {formatTimeAgo(selectedAlert.createdAt)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Analyse Francis IA ({selectedAlert.francisAnalysis.confidence}%)
                  </h4>
                  
                  <div className="bg-purple-50 p-4 rounded-lg space-y-3">
                    <div>
                      <span className="font-medium">Contexte:</span>
                      <p className="text-sm text-gray-700 mt-1">
                        {selectedAlert.francisAnalysis.context}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Implications:</span>
                      <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                        {selectedAlert.francisAnalysis.implications.map((implication, idx) => (
                          <li key={idx}>{implication}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Recommandations
                  </h4>
                  
                  <div className="space-y-3">
                    {selectedAlert.recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-900">{rec.action}</span>
                          <Badge variant="outline" className="text-xs">
                            Priorité {rec.priority}/10
                          </Badge>
                        </div>
                        <p className="text-xs text-blue-600">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {rec.timeline}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex space-x-3">
                    <Button 
                      className="flex-1"
                      onClick={() => handleAlertAction(selectedAlert.id, 'resolve')}
                    >
                      Marquer résolue
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleAlertAction(selectedAlert.id, 'dismiss')}
                    >
                      Ignorer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Sélectionnez une alerte
                </h3>
                <p className="text-gray-500">
                  Cliquez sur une alerte dans la liste pour voir ses détails complets.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsPanel;

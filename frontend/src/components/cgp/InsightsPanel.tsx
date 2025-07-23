import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { 
  Brain, 
  Search, 
  Filter,
  TrendingUp,
  AlertCircle,
  Calendar,
  User,
  DollarSign,
  Target,
  ChevronRight,
  Lightbulb,
  BarChart3,
  Shield,
  Clock
} from 'lucide-react';

import clientInsights from '../../utils/ClientInsights';

interface ClientInsight {
  id: string;
  clientId: string;
  type: 'NEED_PREDICTION' | 'RISK_WARNING' | 'OPPORTUNITY' | 'LIFECYCLE_CHANGE' | 'BEHAVIOR_PATTERN';
  title: string;
  description: string;
  confidence: number;
  priority: 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'FAIBLE';
  predictions: {
    primaryNeed: {
      category: string;
      probability: number;
      timeframe: string;
      estimatedValue: number;
    };
    secondaryNeeds: any[];
    riskFactors: any[];
  };
  recommendations: Array<{
    action: string;
    rationale: string;
    expectedOutcome: string;
    timeline: string;
    resources: string[];
    priority: number;
  }>;
  supportingData: {
    historicalPatterns: string[];
    similarClients: number;
    marketTrends: string[];
    dataQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  createdAt: Date;
  validUntil: Date;
  modelUsed: string;
  version: string;
}

const InsightsPanel: React.FC = () => {
  const [insights, setInsights] = useState<ClientInsight[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<ClientInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedInsight, setSelectedInsight] = useState<ClientInsight | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  useEffect(() => {
    filterInsights();
  }, [insights, searchQuery, selectedType, selectedPriority, selectedClient]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const allInsights = await clientInsights.getAllInsights();
      setInsights(allInsights.map(insight => ({
        ...insight,
        createdAt: new Date(insight.createdAt),
        validUntil: new Date(insight.validUntil)
      })));
    } catch (error) {
      console.error('Erreur chargement insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInsights = () => {
    let filtered = [...insights];

    // Recherche textuelle
    if (searchQuery) {
      filtered = filtered.filter(insight => 
        insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insight.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(insight => insight.type === selectedType);
    }

    // Filtre par priorité
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(insight => insight.priority === selectedPriority);
    }

    // Filtre par client
    if (selectedClient !== 'all') {
      filtered = filtered.filter(insight => insight.clientId === selectedClient);
    }

    setFilteredInsights(filtered);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'NEED_PREDICTION': return <Lightbulb className="h-5 w-5" />;
      case 'RISK_WARNING': return <AlertCircle className="h-5 w-5" />;
      case 'OPPORTUNITY': return <TrendingUp className="h-5 w-5" />;
      case 'LIFECYCLE_CHANGE': return <Calendar className="h-5 w-5" />;
      case 'BEHAVIOR_PATTERN': return <BarChart3 className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'NEED_PREDICTION': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'RISK_WARNING': return 'text-red-600 bg-red-50 border-red-200';
      case 'OPPORTUNITY': return 'text-green-600 bg-green-50 border-green-200';
      case 'LIFECYCLE_CHANGE': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'BEHAVIOR_PATTERN': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITIQUE': return 'bg-red-100 text-red-800 border-red-300';
      case 'HAUTE': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MOYENNE': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'FAIBLE': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDataQualityIcon = (quality: string) => {
    switch (quality) {
      case 'HIGH': return <Shield className="h-4 w-4 text-green-600" />;
      case 'MEDIUM': return <Shield className="h-4 w-4 text-yellow-600" />;
      case 'LOW': return <Shield className="h-4 w-4 text-red-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getUniqueClients = () => {
    const clientIds = [...new Set(insights.map(i => i.clientId))];
    return clientIds.map(id => ({
      id,
      name: `Client ${id.substring(0, 8)}` // Simplified for demo
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="h-8 w-8 mr-3 text-purple-600" />
            Insights Clients IA
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredInsights.length} insights générés par Francis • Analyse prédictive avancée
          </p>
        </div>
        
        <Button onClick={loadInsights} className="flex items-center">
          <Brain className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Opportunities</p>
                <p className="text-2xl font-bold text-green-600">
                  {insights.filter(i => i.type === 'OPPORTUNITY').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertes Risques</p>
                <p className="text-2xl font-bold text-red-600">
                  {insights.filter(i => i.type === 'RISK_WARNING').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confiance Moy.</p>
                <p className="text-2xl font-bold text-purple-600">
                  {insights.length ? Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length) : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valeur Potentielle</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(insights.reduce((acc, i) => acc + (i.predictions.primaryNeed.estimatedValue || 0), 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
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
                placeholder="Rechercher un insight..."
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
                <SelectItem value="OPPORTUNITY">Opportunités</SelectItem>
                <SelectItem value="RISK_WARNING">Alertes risques</SelectItem>
                <SelectItem value="NEED_PREDICTION">Prédictions besoins</SelectItem>
                <SelectItem value="LIFECYCLE_CHANGE">Changements cycle</SelectItem>
                <SelectItem value="BEHAVIOR_PATTERN">Patterns comportement</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="CRITIQUE">Critique</SelectItem>
                <SelectItem value="HAUTE">Haute</SelectItem>
                <SelectItem value="MOYENNE">Moyenne</SelectItem>
                <SelectItem value="FAIBLE">Faible</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                {getUniqueClients().map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedPriority('all');
              setSelectedClient('all');
            }}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste principale */}
        <div className="space-y-4">
          {filteredInsights.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Aucun insight trouvé
                </h3>
                <p className="text-gray-500">
                  Essayez de modifier vos filtres ou d'actualiser les données.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredInsights.map((insight) => (
              <Card 
                key={insight.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedInsight?.id === insight.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedInsight(insight)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg border ${getInsightColor(insight.type)}`}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {insight.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Client {insight.clientId.substring(0, 8)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {insight.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {insight.confidence}% confiance
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {formatCurrency(insight.predictions.primaryNeed.estimatedValue)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getDataQualityIcon(insight.supportingData.dataQuality)}
                      <span className="text-xs text-gray-500">
                        {formatDate(insight.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Détail de l'insight sélectionné */}
        <div className="lg:sticky lg:top-6">
          {selectedInsight ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getInsightIcon(selectedInsight.type)}
                  <span className="ml-2">Détails de l'insight</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* En-tête insight */}
                <div className="pb-4 border-b">
                  <h3 className="font-semibold text-lg mb-2">{selectedInsight.title}</h3>
                  <p className="text-gray-700 mb-3">{selectedInsight.description}</p>
                  
                  <div className="flex items-center space-x-4">
                    <Badge className={getPriorityColor(selectedInsight.priority)}>
                      {selectedInsight.priority}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Confiance: {selectedInsight.confidence}%
                    </span>
                    <span className="text-sm text-gray-600">
                      Modèle: {selectedInsight.modelUsed}
                    </span>
                  </div>
                </div>

                {/* Prédictions */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Prédictions
                  </h4>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-3">
                      <span className="font-medium">Besoin principal:</span>
                      <p className="text-sm text-gray-700">
                        {selectedInsight.predictions.primaryNeed.category} 
                        ({selectedInsight.predictions.primaryNeed.probability}% probabilité)
                      </p>
                      <p className="text-sm text-gray-600">
                        Délai: {selectedInsight.predictions.primaryNeed.timeframe} • 
                        Valeur: {formatCurrency(selectedInsight.predictions.primaryNeed.estimatedValue)}
                      </p>
                    </div>
                    
                    {selectedInsight.predictions.riskFactors.length > 0 && (
                      <div>
                        <span className="font-medium text-red-700">Facteurs de risque:</span>
                        {selectedInsight.predictions.riskFactors.map((risk, idx) => (
                          <p key={idx} className="text-sm text-red-600">
                            • {risk.impact} ({risk.probability}%)
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommandations */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Recommandations
                  </h4>
                  
                  <div className="space-y-3">
                    {selectedInsight.recommendations.slice(0, 3).map((rec, idx) => (
                      <div key={idx} className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-900">{rec.action}</span>
                          <Badge variant="outline" className="text-xs">
                            Priorité {rec.priority}/10
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-800 mb-1">{rec.rationale}</p>
                        <p className="text-xs text-blue-600">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {rec.timeline} • {rec.expectedOutcome}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Données d'appui */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Données d'appui
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Clients similaires:</span>
                      <p className="text-gray-600">{selectedInsight.supportingData.similarClients}</p>
                    </div>
                    <div>
                      <span className="font-medium">Qualité données:</span>
                      <div className="flex items-center">
                        {getDataQualityIcon(selectedInsight.supportingData.dataQuality)}
                        <span className="ml-1 text-gray-600">
                          {selectedInsight.supportingData.dataQuality}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedInsight.supportingData.marketTrends.length > 0 && (
                    <div className="mt-3">
                      <span className="font-medium">Tendances marché:</span>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        {selectedInsight.supportingData.marketTrends.slice(0, 3).map((trend, idx) => (
                          <li key={idx}>{trend}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t">
                  <div className="flex space-x-3">
                    <Button className="flex-1">
                      Créer Action
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Programmer RDV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Sélectionnez un insight
                </h3>
                <p className="text-gray-500">
                  Cliquez sur un insight dans la liste pour voir ses détails complets.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;

/**
 * APIDashboard.tsx - Interface de gestion des APIs et intégrations
 * 
 * Fonctionnalités:
 * - Configuration des APIs externes
 * - Monitoring des connexions
 * - Gestion des credentials OAuth2
 * - Historique des requêtes
 * - Tests de connectivité
 * - Alertes et notifications
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import {
  Settings, Zap, Shield, Activity, AlertTriangle, CheckCircle,
  Clock, Database, Globe, Key, Monitor, RefreshCw, Wifi,
  WifiOff, TrendingUp, TrendingDown, ExternalLink, Eye,
  EyeOff, Plus, Trash2, Edit, Play, Pause, BarChart3
} from 'lucide-react';

import apiManager from '../../utils/APIManager';

interface APIStats {
  totalAPIs: number;
  activeAPIs: number;
  healthyAPIs: number;
  errorAPIs: number;
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
}

const APIDashboard: React.FC = () => {
  const [apis, setAPIs] = useState<any[]>([]);
  const [stats, setStats] = useState<APIStats>({
    totalAPIs: 0,
    activeAPIs: 0,
    healthyAPIs: 0,
    errorAPIs: 0,
    totalRequests: 0,
    successRate: 0,
    avgResponseTime: 0
  });
  const [requestHistory, setRequestHistory] = useState<any[]>([]);
  const [selectedAPI, setSelectedAPI] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [testingAPIs, setTestingAPIs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAPIData();
    const interval = setInterval(loadAPIData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadAPIData = async () => {
    try {
      setLoading(true);
      
      const availableAPIs = apiManager.getAvailableAPIs();
      const history = apiManager.getRequestHistory(undefined, 200);
      
      setAPIs(availableAPIs);
      setRequestHistory(history);

      // Calcul des statistiques
      const totalAPIs = availableAPIs.length;
      const activeAPIs = availableAPIs.filter(api => api.active).length;
      const healthyAPIs = availableAPIs.filter(api => api.healthStatus === 'HEALTHY').length;
      const errorAPIs = availableAPIs.filter(api => api.healthStatus === 'ERROR').length;
      
      const totalRequests = history.length;
      const successfulRequests = history.filter(req => req.status === 'SUCCESS').length;
      const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
      const avgResponseTime = history.filter(req => req.responseTime).length > 0 
        ? history.reduce((sum, req) => sum + (req.responseTime || 0), 0) / history.filter(req => req.responseTime).length
        : 0;

      setStats({
        totalAPIs,
        activeAPIs,
        healthyAPIs,
        errorAPIs,
        totalRequests,
        successRate,
        avgResponseTime
      });

    } catch (error) {
      console.error('Erreur chargement données API:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (apiId: string) => {
    setTestingAPIs(prev => new Set([...Array.from(prev), apiId]));
    
    try {
      const result = await apiManager.testAPIConnection(apiId);
      console.log(`Test API ${apiId}:`, result);
      await loadAPIData(); // Refresh data
    } catch (error) {
      console.error(`Erreur test API ${apiId}:`, error);
    } finally {
      setTestingAPIs(prev => {
        const newSet = new Set(prev);
        newSet.delete(apiId);
        return newSet;
      });
    }
  };

  const handleActivateAPI = async (apiId: string) => {
    try {
      // Pour la démo, utiliser des credentials fictifs
      await apiManager.activateAPI(apiId, {
        clientId: 'demo-client',
        clientSecret: 'demo-secret',
        scopes: []
      });
      await loadAPIData();
    } catch (error) {
      console.error('Erreur activation API:', error);
    }
  };

  const handleDeactivateAPI = async (apiId: string) => {
    try {
      await apiManager.deactivateAPI(apiId);
      await loadAPIData();
    } catch (error) {
      console.error('Erreur désactivation API:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'WARNING': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'ERROR': return <WifiOff className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'bg-green-100 text-green-800 border-green-200';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ERROR': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BANKING': return <Database className="h-5 w-5 text-blue-600" />;
      case 'FISCAL': return <Shield className="h-5 w-5 text-green-600" />;
      case 'MARKET_DATA': return <TrendingUp className="h-5 w-5 text-purple-600" />;
      case 'CRM': return <Globe className="h-5 w-5 text-orange-600" />;
      case 'COMMUNICATION': return <Wifi className="h-5 w-5 text-pink-600" />;
      case 'REGULATORY': return <Settings className="h-5 w-5 text-gray-600" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const formatResponseTime = (time: number) => {
    return time < 1000 ? `${Math.round(time)}ms` : `${(time / 1000).toFixed(1)}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des APIs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des APIs</h1>
          <p className="text-gray-600">Configurez et surveillez vos intégrations externes</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadAPIData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter API
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total APIs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAPIs}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actives</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeAPIs}</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saines</p>
                <p className="text-2xl font-bold text-green-600">{stats.healthyAPIs}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Erreurs</p>
                <p className="text-2xl font-bold text-red-600">{stats.errorAPIs}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Requêtes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalRequests}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Succès</p>
                <p className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Temps moy.</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatResponseTime(stats.avgResponseTime)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center">
            <Monitor className="h-4 w-4 mr-2" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6">
            {apis.map((api) => (
              <Card key={api.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getCategoryIcon(api.category)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{api.name}</h3>
                          <Badge variant="outline">{api.category}</Badge>
                          <Badge className={getStatusColor(api.healthStatus)}>
                            <div className="flex items-center">
                              {getStatusIcon(api.healthStatus)}
                              <span className="ml-1">{api.healthStatus}</span>
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {api.baseUrl} • Version {api.version} • Auth: {api.authType}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {Object.keys(api.endpoints).length} endpoints
                          </span>
                          <span className="text-xs text-gray-500">
                            Limite: {api.rateLimit.requestsPerMinute}/min
                          </span>
                          {api.lastSync && (
                            <span className="text-xs text-gray-500">
                              Dernière sync: {api.lastSync.toLocaleString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestConnection(api.id)}
                        disabled={testingAPIs.has(api.id)}
                      >
                        {testingAPIs.has(api.id) ? (
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Wifi className="h-4 w-4 mr-1" />
                        )}
                        Test
                      </Button>
                      
                      {api.active ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeactivateAPI(api.id)}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Désactiver
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleActivateAPI(api.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Activer
                        </Button>
                      )}

                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Configurer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration des APIs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Configurez les credentials et paramètres de vos APIs externes.
              </p>
              
              <div className="space-y-4">
                {apis.map((api) => (
                  <div key={api.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(api.category)}
                        <h4 className="font-medium">{api.name}</h4>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCredentials(prev => ({
                          ...prev,
                          [api.id]: !prev[api.id]
                        }))}
                      >
                        {showCredentials[api.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {showCredentials[api.id] && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client ID
                          </label>
                          <Input
                            type="text"
                            placeholder="Votre Client ID"
                            defaultValue={api.credentials.clientId}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client Secret
                          </label>
                          <Input
                            type="password"
                            placeholder="Votre Client Secret"
                            defaultValue={api.credentials.clientSecret}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Historique des Requêtes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {requestHistory.slice(0, 20).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <Badge 
                          className={request.status === 'SUCCESS' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        >
                          {request.status}
                        </Badge>
                        <span className="text-sm font-medium">{request.apiId}</span>
                        <span className="text-sm text-gray-600">{request.endpoint}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {request.responseTime && (
                          <span>{formatResponseTime(request.responseTime)}</span>
                        )}
                        <span>{request.timestamp.toLocaleTimeString('fr-FR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIDashboard;

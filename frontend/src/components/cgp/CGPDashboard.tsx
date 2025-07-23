import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  FileText,
  Target,
  Brain,
  DollarSign,
  Clock,
  Activity,
  Settings
} from 'lucide-react';

// Import des utilitaires
import clientInsights from '../../utils/ClientInsights';
import proactiveAlerts from '../../utils/ProactiveAlerts';
import actionExtractor from '../../utils/ActionExtractor';

interface DashboardStats {
  totalClients: number;
  activeInsights: number;
  pendingActions: number;
  criticalAlerts: number;
  monthlyRevenue: number;
  satisfactionScore: number;
}

interface QuickAction {
  id: string;
  title: string;
  type: 'CLIENT_CALL' | 'DOCUMENT_REVIEW' | 'MEETING_PREP' | 'COMPLIANCE_CHECK';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: Date;
  clientName?: string;
  estimatedDuration: number; // minutes
}

interface RecentActivity {
  id: string;
  type: 'NEW_CLIENT' | 'MEETING_COMPLETED' | 'INSIGHT_GENERATED' | 'ALERT_TRIGGERED';
  title: string;
  description: string;
  timestamp: Date;
  clientId?: string;
}

const CGPDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeInsights: 0,
    pendingActions: 0,
    criticalAlerts: 0,
    monthlyRevenue: 0,
    satisfactionScore: 85
  });

  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Actualisation toutes les 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Chargement des données parallèle
      const [insights, alerts, actions] = await Promise.all([
        clientInsights.getAllInsights(),
        proactiveAlerts.getActiveAlerts(),
        actionExtractor.getAllActions()
      ]);

      // Calcul des statistiques
      const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;
      const pendingActions = actions.filter(a => a.status === 'PENDING' || a.status === 'IN_PROGRESS').length;

      setStats(prev => ({
        ...prev,
        activeInsights: insights.length,
        criticalAlerts,
        pendingActions,
        totalClients: new Set(insights.map(i => i.clientId)).size
      }));

      // Actions rapides (top 5 par priorité)
      const topActions = actions
        .filter(a => a.status !== 'COMPLETED')
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5)
        .map(action => ({
          id: action.id,
          title: action.title,
          type: mapActionType(action.category),
          priority: action.priority > 7 ? 'HIGH' : action.priority > 4 ? 'MEDIUM' : 'LOW',
          dueDate: action.dueDate,
          clientName: action.assignedTo,
          estimatedDuration: action.estimatedDuration || 30
        }));

      setQuickActions(topActions);

      // Activité récente
      const activities: RecentActivity[] = [
        ...insights.slice(0, 3).map(insight => ({
          id: `insight-${insight.id}`,
          type: 'INSIGHT_GENERATED' as const,
          title: 'Nouveau insight généré',
          description: insight.title,
          timestamp: insight.createdAt,
          clientId: insight.clientId
        })),
        ...alerts.slice(0, 2).map(alert => ({
          id: `alert-${alert.id}`,
          type: 'ALERT_TRIGGERED' as const,
          title: 'Alerte déclenchée',
          description: alert.title,
          timestamp: alert.createdAt
        }))
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8);

      setRecentActivity(activities);
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapActionType = (category: string): QuickAction['type'] => {
    switch (category) {
      case 'CALL': return 'CLIENT_CALL';
      case 'DOCUMENT': return 'DOCUMENT_REVIEW';
      case 'MEETING': return 'MEETING_PREP';
      case 'COMPLIANCE': return 'COMPLIANCE_CHECK';
      default: return 'DOCUMENT_REVIEW';
    }
  };

  const getActionIcon = (type: QuickAction['type']) => {
    switch (type) {
      case 'CLIENT_CALL': return <Users className="h-4 w-4" />;
      case 'DOCUMENT_REVIEW': return <FileText className="h-4 w-4" />;
      case 'MEETING_PREP': return <Calendar className="h-4 w-4" />;
      case 'COMPLIANCE_CHECK': return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'NEW_CLIENT': return <Users className="h-4 w-4" />;
      case 'MEETING_COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'INSIGHT_GENERATED': return <Brain className="h-4 w-4" />;
      case 'ALERT_TRIGGERED': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `il y a ${diffMins}min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    return `il y a ${diffDays}j`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard CGP</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de votre activité conseil</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-600">Francis IA Actif</span>
          </div>
          
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clients Totaux</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">+12% ce mois</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Insights Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeInsights}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">Francis IA</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actions En Cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingActions}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">Cockpit IA</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertes Critiques</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-4">
              <Badge variant="destructive" className="text-xs">Action requise</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions Rapides */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Actions Prioritaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quickActions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Aucune action urgente !</p>
                  <p className="text-sm">Vous êtes à jour sur toutes vos tâches.</p>
                </div>
              ) : (
                quickActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getActionIcon(action.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {action.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {action.clientName && (
                            <span className="text-xs text-gray-600">{action.clientName}</span>
                          )}
                          <span className="text-xs text-gray-500">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {action.estimatedDuration}min
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(action.priority)}>
                        {action.priority}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Traiter
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activité Récente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Activité Récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets Modules */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="insights" className="flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                Insights IA
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Alertes
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Actions
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="insights" className="mt-6">
              <div className="text-center py-8">
                <Brain className="h-16 w-16 mx-auto mb-4 text-purple-500" />
                <h3 className="text-lg font-semibold mb-2">Insights Clients IA</h3>
                <p className="text-gray-600 mb-4">
                  Analyse prédictive des besoins et recommandations personnalisées
                </p>
                <Button>
                  Voir tous les insights
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="alerts" className="mt-6">
              <div className="text-center py-8">
                <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold mb-2">Alertes Proactives</h3>
                <p className="text-gray-600 mb-4">
                  Surveillance automatique et notifications contextuelles
                </p>
                <Button>
                  Gérer les alertes
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="actions" className="mt-6">
              <div className="text-center py-8">
                <Target className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">Cockpit Actions</h3>
                <p className="text-gray-600 mb-4">
                  To-do intelligent extrait des réunions et interactions
                </p>
                <Button>
                  Ouvrir le cockpit
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6">
              <div className="text-center py-8">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold mb-2">Analytics Francis</h3>
                <p className="text-gray-600 mb-4">
                  Tableaux de bord et métriques de performance
                </p>
                <Button>
                  Voir les analytics
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CGPDashboard;

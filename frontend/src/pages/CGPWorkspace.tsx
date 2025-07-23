import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  LayoutDashboard, 
  Brain, 
  AlertTriangle, 
  Target, 
  Settings,
  Users,
  TrendingUp,
  Shield,
  HelpCircle,
  Bell
} from 'lucide-react';

// Import des composants CGP
import CGPDashboard from '../components/cgp/CGPDashboard';
import InsightsPanel from '../components/cgp/InsightsPanel';
import AlertsPanel from '../components/cgp/AlertsPanel';
import ActionsCockpit from '../components/cgp/ActionsCockpit';

interface WorkspaceStats {
  totalClients: number;
  activeInsights: number;
  pendingActions: number;
  criticalAlerts: number;
}

const CGPWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<WorkspaceStats>({
    totalClients: 47,
    activeInsights: 12,
    pendingActions: 8,
    criticalAlerts: 3
  });

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', message: 'Client Dupont nécessite un suivi urgent', time: '5min' },
    { id: 2, type: 'insight', message: 'Nouvelle opportunité fiscale détectée', time: '12min' },
    { id: 3, type: 'action', message: 'Audit fiscal Martin à terminer aujourd\'hui', time: '1h' }
  ]);

  const getTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CGPDashboard />;
      case 'insights':
        return <InsightsPanel />;
      case 'alerts':
        return <AlertsPanel />;
      case 'actions':
        return <ActionsCockpit />;
      default:
        return <CGPDashboard />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'insight': return <Brain className="h-4 w-4 text-purple-500" />;
      case 'action': return <Target className="h-4 w-4 text-green-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo et titre */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Francis CGP</h1>
                  <p className="text-sm text-gray-600">Copilote IA Avancé</p>
                </div>
              </div>
              
              {/* Indicateur de statut */}
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">IA Active</span>
              </div>
            </div>

            {/* Stats rapides */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{stats.totalClients}</div>
                  <div className="text-xs text-gray-600">Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{stats.activeInsights}</div>
                  <div className="text-xs text-gray-600">Insights</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{stats.pendingActions}</div>
                  <div className="text-xs text-gray-600">Actions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{stats.criticalAlerts}</div>
                  <div className="text-xs text-gray-600">Alertes</div>
                </div>
              </div>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[1.25rem] h-5">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Paramètres */}
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>

              {/* Help */}
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4 mb-8 bg-white shadow-sm border">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                Live
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="insights" 
              className="flex items-center space-x-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              <Brain className="h-4 w-4" />
              <span>Insights IA</span>
              {stats.activeInsights > 0 && (
                <Badge className="ml-1 bg-purple-500 text-white text-xs">
                  {stats.activeInsights}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="alerts" 
              className="flex items-center space-x-2 data-[state=active]:bg-red-50 data-[state=active]:text-red-700"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Alertes</span>
              {stats.criticalAlerts > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-xs animate-pulse">
                  {stats.criticalAlerts}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="actions" 
              className="flex items-center space-x-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
            >
              <Target className="h-4 w-4" />
              <span>Actions</span>
              {stats.pendingActions > 0 && (
                <Badge className="ml-1 bg-green-500 text-white text-xs">
                  {stats.pendingActions}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Contenu des onglets */}
          <TabsContent value="dashboard" className="mt-0">
            <CGPDashboard />
          </TabsContent>
          
          <TabsContent value="insights" className="mt-0">
            <InsightsPanel />
          </TabsContent>
          
          <TabsContent value="alerts" className="mt-0">
            <AlertsPanel />
          </TabsContent>
          
          <TabsContent value="actions" className="mt-0">
            <ActionsCockpit />
          </TabsContent>
        </Tabs>
      </div>

      {/* Notifications flottantes */}
      {notifications.length > 0 && (
        <div className="fixed bottom-6 right-6 space-y-3 z-50">
          {notifications.slice(0, 3).map((notification) => (
            <div 
              key={notification.id}
              className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm animate-slide-up"
            >
              <div className="flex items-start space-x-3">
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Il y a {notification.time}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setNotifications(prev => 
                    prev.filter(n => n.id !== notification.id)
                  )}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Francis IA Status Footer */}
      <div className="fixed bottom-6 left-6 z-40">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm font-medium text-gray-900">Francis IA</p>
            <p className="text-xs text-gray-600">Surveillance active • {stats.activeInsights + stats.criticalAlerts} événements</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGPWorkspace;

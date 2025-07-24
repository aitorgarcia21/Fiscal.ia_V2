/**
 * SecurityDashboard.tsx - Interface de monitoring sécurisé et audit
 * 
 * Fonctionnalités:
 * - Vue d'ensemble des événements d'audit
 * - Alertes sécuritaires temps réel
 * - Analyse comportementale des utilisateurs
 * - Rapports de conformité GDPR/CNIL
 * - Monitoring des accès et tentatives d'intrusion
 * - Tableau de bord executive avec métriques clés
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import {
  Shield, AlertTriangle, Eye, Users, Activity, Lock,
  CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
  FileText, Download, Search, Filter, RefreshCw, Bell,
  MapPin, Smartphone, Monitor, Globe, Key, Zap,
  BarChart3, PieChart, LineChart, Settings, Calendar
} from 'lucide-react';

import securityAuditService from '../../utils/SecurityAuditService';

interface SecurityStats {
  totalEvents: number;
  todayEvents: number;
  securityAlerts: number;
  unresolvedAlerts: number;
  criticalAlerts: number;
  eventsByCategory: Record<string, number>;
  riskDistribution: Record<string, number>;
  complianceReports: number;
}

const SecurityDashboard: React.FC = () => {
  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    todayEvents: 0,
    securityAlerts: 0,
    unresolvedAlerts: 0,
    criticalAlerts: 0,
    eventsByCategory: {},
    riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
    complianceReports: 0
  });

  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
  const [complianceReports, setComplianceReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    severity: '',
    category: '',
    userId: '',
    dateRange: '',
    resolved: ''
  });

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      const dashboardStats = securityAuditService.getDashboardStats();
      const events = await securityAuditService.getAuditEvents({ limit: 100 });
      const alerts = securityAuditService.getSecurityAlerts();
      const reports = securityAuditService.getComplianceReports();

      setStats(dashboardStats);
      setAuditEvents(events);
      setSecurityAlerts(alerts);
      setComplianceReports(reports);

    } catch (error) {
      console.error('Erreur chargement données sécurité:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateComplianceReport = async (type: 'GDPR' | 'CNIL' | 'INTERNAL') => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Dernier mois

      const reportId = await securityAuditService.generateComplianceReport(
        type,
        { start: startDate, end: endDate },
        'admin-user'
      );

      console.log(`Rapport ${type} généré:`, reportId);
      await loadSecurityData(); // Refresh data
    } catch (error) {
      console.error('Erreur génération rapport:', error);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await securityAuditService.resolveSecurityAlert(alertId, 'admin-user');
      await loadSecurityData(); // Refresh data
    } catch (error) {
      console.error('Erreur résolution alerte:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AUTHENTICATION': return <Key className="h-4 w-4 text-blue-600" />;
      case 'DATA_ACCESS': return <Eye className="h-4 w-4 text-green-600" />;
      case 'MODIFICATION': return <Settings className="h-4 w-4 text-orange-600" />;
      case 'SECURITY': return <Shield className="h-4 w-4 text-red-600" />;
      case 'COMPLIANCE': return <FileText className="h-4 w-4 text-purple-600" />;
      case 'SYSTEM': return <Monitor className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('fr-FR');
  };

  const formatRiskScore = (score: number) => {
    if (score <= 25) return { level: 'Faible', color: 'text-green-600' };
    if (score <= 50) return { level: 'Moyen', color: 'text-yellow-600' };
    if (score <= 75) return { level: 'Élevé', color: 'text-orange-600' };
    return { level: 'Critique', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données de sécurité...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Sécurité</h1>
          <p className="text-gray-600">Monitoring et audit des activités système</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadSecurityData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={() => handleGenerateComplianceReport('INTERNAL')}>
            <FileText className="h-4 w-4 mr-2" />
            Rapport
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Événements Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                <p className="text-xs text-gray-500">+{stats.todayEvents} aujourd'hui</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertes Sécurité</p>
                <p className="text-2xl font-bold text-orange-600">{stats.securityAlerts}</p>
                <p className="text-xs text-gray-500">{stats.unresolvedAlerts} non résolues</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertes Critiques</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
                <p className="text-xs text-gray-500">Action immédiate requise</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rapports Conformité</p>
                <p className="text-2xl font-bold text-purple-600">{stats.complianceReports}</p>
                <p className="text-xs text-gray-500">GDPR, CNIL, ACPR</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score Sécurité</p>
                <p className="text-2xl font-bold text-green-600">94%</p>
                <p className="text-xs text-gray-500">Excellent niveau</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques de distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Événements par Catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.eventsByCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getCategoryIcon(category)}
                    <span className="ml-2 text-sm font-medium">{category}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">{count}</span>
                    <div 
                      className="h-2 bg-blue-200 rounded-full"
                      style={{ width: `${Math.max((count / stats.totalEvents) * 100, 5)}px` }}
                    >
                      <div 
                        className="h-2 bg-blue-600 rounded-full"
                        style={{ width: `${(count / stats.totalEvents) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Distribution des Risques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.riskDistribution).map(([level, count]) => {
                const colors = {
                  low: 'bg-green-600',
                  medium: 'bg-yellow-600',
                  high: 'bg-orange-600',
                  critical: 'bg-red-600'
                };
                const total = Object.values(stats.riskDistribution).reduce((a, b) => a + b, 0);
                
                return (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${colors[level as keyof typeof colors]} mr-2`}></div>
                      <span className="text-sm font-medium capitalize">{level}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">{count}</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${colors[level as keyof typeof colors]}`}
                          style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets détaillés */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center">
            <Monitor className="h-4 w-4 mr-2" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Événements
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alertes
            {stats.unresolvedAlerts > 0 && (
              <Badge className="ml-1 bg-red-500 text-white text-xs">
                {stats.unresolvedAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Conformité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditEvents.slice(0, 10).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(event.category)}
                        <div>
                          <p className="text-sm font-medium">{event.action}</p>
                          <p className="text-xs text-gray-600">
                            {event.userId} • {event.resource} • {formatDate(event.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        <div className={`text-sm font-medium ${formatRiskScore(event.riskScore).color}`}>
                          {formatRiskScore(event.riskScore).level}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Journal des Événements</CardTitle>
              <div className="flex space-x-2">
                <Input placeholder="Rechercher..." className="max-w-sm" />
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditEvents.map((event) => (
                  <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(event.category)}
                        <div>
                          <p className="font-medium">{event.action}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>👤 {event.userId}</span>
                            <span>📍 {event.resource}</span>
                            <span>🌐 {event.ipAddress}</span>
                            <span>🕒 {formatDate(event.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(event.severity)} variant="outline">
                          {event.severity}
                        </Badge>
                        <span className={`text-sm ${formatRiskScore(event.riskScore).color}`}>
                          Risk: {event.riskScore}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alertes Sécurité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className={`border-l-4 ${
                    alert.severity === 'CRITICAL' ? 'border-red-500 bg-red-50' :
                    alert.severity === 'HIGH' ? 'border-orange-500 bg-orange-50' :
                    alert.severity === 'MEDIUM' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  } pl-4 py-4 rounded-r`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline">{alert.type}</Badge>
                          {alert.resolved && (
                            <Badge className="bg-green-100 text-green-800">
                              ✓ Résolu
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold">{alert.description}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(alert.timestamp)}
                          {alert.userId && ` • Utilisateur: ${alert.userId}`}
                        </p>
                        {alert.affectedResources.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Ressources affectées: {alert.affectedResources.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {!alert.resolved && (
                          <Button 
                            size="sm" 
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Résoudre
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Génération de Rapports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => handleGenerateComplianceReport('GDPR')}
                    className="flex items-center justify-center p-6 h-auto"
                  >
                    <div className="text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <h3 className="font-semibold">Rapport GDPR</h3>
                      <p className="text-sm opacity-90">Conformité RGPD</p>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => handleGenerateComplianceReport('CNIL')}
                    className="flex items-center justify-center p-6 h-auto"
                    variant="outline"
                  >
                    <div className="text-center">
                      <Shield className="h-8 w-8 mx-auto mb-2" />
                      <h3 className="font-semibold">Rapport CNIL</h3>
                      <p className="text-sm opacity-70">Audit réglementaire</p>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => handleGenerateComplianceReport('INTERNAL')}
                    className="flex items-center justify-center p-6 h-auto"
                    variant="outline"
                  >
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                      <h3 className="font-semibold">Rapport Interne</h3>
                      <p className="text-sm opacity-70">Analyse périodique</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rapports Existants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Rapport {report.type}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(report.generatedAt)} • {report.summary.totalEvents} événements
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant="outline">
                          {report.encrypted ? '🔒 Chiffré' : '📄 Standard'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
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

export default SecurityDashboard;

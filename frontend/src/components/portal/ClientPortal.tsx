/**
 * ClientPortal.tsx - Portail client marque blanche
 * 
 * Fonctionnalités:
 * - Interface client personnalisée
 * - Consultation des rapports
 * - Suivi du patrimoine en temps réel
 * - Messagerie sécurisée avec conseiller
 * - Rendez-vous en ligne
 * - Documents partagés
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import {
  User, FileText, TrendingUp, Calendar, MessageCircle,
  Download, Eye, Bell, Settings, Shield, Wallet,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle, AlertCircle, Phone, Video
} from 'lucide-react';

interface ClientProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  advisor: string;
  memberSince: Date;
  riskProfile: 'CONSERVATEUR' | 'MODÉRÉ' | 'DYNAMIQUE';
  objectives: string[];
}

interface PortfolioOverview {
  totalValue: number;
  monthlyChange: number;
  monthlyChangePercent: number;
  ytdReturn: number;
  allocation: Record<string, number>;
  recentTransactions: Transaction[];
}

interface Transaction {
  id: string;
  date: Date;
  type: 'ACHAT' | 'VENTE' | 'DIVIDENDE' | 'INTÉRÊT';
  description: string;
  amount: number;
  status: 'CONFIRMÉ' | 'EN_COURS' | 'ANNULÉ';
}

interface ClientDocument {
  id: string;
  title: string;
  type: 'RAPPORT' | 'CONTRAT' | 'FISCAL' | 'INFORMATION';
  date: Date;
  size: number;
  status: 'NOUVEAU' | 'LU' | 'ARCHIVÉ';
  confidential: boolean;
}

const ClientPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioOverview | null>(null);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      setLoading(true);
      
      // Simulation données client
      const mockProfile: ClientProfile = {
        id: 'client-demo',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@email.com',
        phone: '+33 6 12 34 56 78',
        advisor: 'Francis CGP',
        memberSince: new Date('2020-03-15'),
        riskProfile: 'MODÉRÉ',
        objectives: ['Retraite', 'Transmission', 'Fiscalité']
      };

      const mockPortfolio: PortfolioOverview = {
        totalValue: 847500,
        monthlyChange: 12750,
        monthlyChangePercent: 1.53,
        ytdReturn: 8.2,
        allocation: {
          'Actions': 45,
          'Obligations': 30,
          'Immobilier': 15,
          'Liquidités': 10
        },
        recentTransactions: [
          {
            id: 'tx-1',
            date: new Date('2024-01-15'),
            type: 'ACHAT',
            description: 'MSCI World ETF',
            amount: 5000,
            status: 'CONFIRMÉ'
          },
          {
            id: 'tx-2',
            date: new Date('2024-01-10'),
            type: 'DIVIDENDE',
            description: 'Dividendes T4 2023',
            amount: 1250,
            status: 'CONFIRMÉ'
          }
        ]
      };

      const mockDocuments: ClientDocument[] = [
        {
          id: 'doc-1',
          title: 'Rapport Patrimonial T4 2023',
          type: 'RAPPORT',
          date: new Date('2024-01-01'),
          size: 2.5 * 1024 * 1024,
          status: 'NOUVEAU',
          confidential: true
        },
        {
          id: 'doc-2',
          title: 'Analyse Fiscale 2023',
          type: 'FISCAL',
          date: new Date('2023-12-15'),
          size: 1.8 * 1024 * 1024,
          status: 'LU',
          confidential: true
        }
      ];

      setProfile(mockProfile);
      setPortfolio(mockPortfolio);
      setDocuments(mockDocuments);
      setNotifications([
        { id: 1, type: 'info', message: 'Nouveau rapport disponible', date: new Date() },
        { id: 2, type: 'reminder', message: 'Rendez-vous prévu demain à 14h', date: new Date() }
      ]);

    } catch (error) {
      console.error('Erreur chargement données client:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'ACHAT': return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'VENTE': return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case 'DIVIDENDE': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'INTÉRÊT': return <TrendingUp className="h-4 w-4 text-green-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'RAPPORT': return <BarChart3 className="h-4 w-4 text-blue-600" />;
      case 'FISCAL': return <FileText className="h-4 w-4 text-green-600" />;
      case 'CONTRAT': return <Shield className="h-4 w-4 text-purple-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre espace client...</p>
        </div>
      </div>
    );
  }

  if (!profile || !portfolio) {
    return <div className="text-center p-12">Erreur de chargement des données</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête personnalisé */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-gray-900">
                  Bonjour {profile.firstName} !
                </h1>
                <p className="text-sm text-gray-600">
                  Votre conseiller: {profile.advisor}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contacter mon conseiller
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Prendre RDV
              </Button>
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600 cursor-pointer" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              Portefeuille
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Valeur du patrimoine */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    Valeur de votre patrimoine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(portfolio.totalValue)}
                      </p>
                      <div className="flex items-center mt-2">
                        {portfolio.monthlyChange >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          portfolio.monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(Math.abs(portfolio.monthlyChange))} 
                          ({portfolio.monthlyChangePercent > 0 ? '+' : ''}{portfolio.monthlyChangePercent}%)
                        </span>
                        <span className="text-sm text-gray-600 ml-2">ce mois</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600">Performance annuelle</p>
                      <p className="text-lg font-semibold text-green-600">
                        +{portfolio.ytdReturn}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Répartition */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Répartition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(portfolio.allocation).map(([asset, percentage]) => (
                      <div key={asset} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{asset}</span>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Transactions récentes */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Transactions récentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {portfolio.recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.type)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-gray-600">
                              {transaction.date.toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            transaction.type === 'VENTE' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'VENTE' ? '-' : '+'}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Détail du portefeuille</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Vue détaillée de votre portefeuille en cours de développement...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <div className="space-y-4">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getDocumentIcon(doc.type)}
                        <div>
                          <h3 className="font-medium text-gray-900">{doc.title}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">
                              {doc.date.toLocaleDateString('fr-FR')}
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatFileSize(doc.size)}
                            </span>
                            {doc.confidential && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Confidentiel
                              </Badge>
                            )}
                            {doc.status === 'NOUVEAU' && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                Nouveau
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nom complet</label>
                    <p className="text-gray-900">{profile.firstName} {profile.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Téléphone</label>
                    <p className="text-gray-900">{profile.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Client depuis</label>
                    <p className="text-gray-900">
                      {profile.memberSince.toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profil d'investissement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Profil de risque</label>
                    <Badge className="ml-2">{profile.riskProfile}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Objectifs</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.objectives.map((objective, index) => (
                        <Badge key={index} variant="outline">{objective}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientPortal;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Euro,
  CreditCard,
  PieChart,
  TrendingUp,
  Calculator,
  FileText,
  Bell,
  Settings,
  LogOut,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  User,
  ExternalLink,
  Download,
  Upload,
  Zap,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import gocardlessService, { BankAccount, Transaction, FinancialSummary, Institution } from '../services/gocardlessService';

// Interfaces moved to gocardlessService.ts

export function ParticulierDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // États pour les données bancaires
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [showConnectBank, setShowConnectBank] = useState(false);
  const [hideAmounts, setHideAmounts] = useState(false);
  const [availableInstitutions, setAvailableInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setError(null);
      await Promise.all([
        loadBankAccounts(),
        loadFinancialSummary()
      ]);
    } catch (err) {
      console.error('Erreur chargement données utilisateur:', err);
      setError('Erreur lors du chargement des données');
    }
  };

  const loadBankAccounts = async () => {
    setIsLoadingBanks(true);
    try {
      const accounts = await gocardlessService.getUserAccounts();
      setBankAccounts(accounts);
      
      // Charger les transactions pour tous les comptes
      await loadTransactions();
    } catch (error) {
      console.error('Erreur chargement comptes:', error);
      // En cas d'erreur, utiliser des données de démonstration
      setBankAccounts([]);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const loadTransactions = async () => {
    try {
      // Récupérer les transactions des 30 derniers jours
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);
      
      const allTransactions = await gocardlessService.getAllTransactions(
        dateFrom.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );
      
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Erreur chargement transactions:', error);
      setTransactions([]);
    }
  };

  const loadFinancialSummary = async () => {
    try {
      const summary = await gocardlessService.getFinancialSummary();
      setFinancialSummary(summary);
    } catch (error) {
      console.error('Erreur chargement résumé financier:', error);
      setFinancialSummary(null);
    }
  };

  const loadAvailableInstitutions = async () => {
    try {
      const institutions = await gocardlessService.getInstitutions('FR');
      setAvailableInstitutions(institutions);
    } catch (error) {
      console.error('Erreur chargement institutions:', error);
      // Fallback vers des institutions de démonstration
      setAvailableInstitutions([
        { id: 'BNP_PARIBAS', name: 'BNP Paribas', bic: 'BNPAFRPP', countries: ['FR'], logo: '🏦' },
        { id: 'CREDIT_AGRICOLE', name: 'Crédit Agricole', bic: 'AGRIFRPP', countries: ['FR'], logo: '🌱' },
        { id: 'SOCIETE_GENERALE', name: 'Société Générale', bic: 'SOGEFRPP', countries: ['FR'], logo: '🔴' },
        { id: 'BOURSORAMA', name: 'Boursorama', bic: 'BOUSFRPP', countries: ['FR'], logo: '📱' },
        { id: 'REVOLUT', name: 'Revolut', bic: 'REVOFR22', countries: ['FR'], logo: '💳' }
      ]);
    }
  };

  const handleConnectBank = async () => {
    if (!selectedInstitution) return;
    
    setIsConnecting(true);
    try {
      // Lancer le flow de connexion GoCardless
      const redirectUrl = await gocardlessService.connectBank(selectedInstitution);
      
      // Rediriger l'utilisateur vers la banque
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Erreur connexion bancaire:', error);
      setError('Impossible de se connecter à cette banque. Veuillez réessayer.');
      setIsConnecting(false);
    }
  };

  const formatAmount = (amount: number, hideAmount = false) => {
    if (hideAmount) return '••••••';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getTotalBalance = () => {
    return bankAccounts.reduce((total, account) => total + account.balance, 0);
  };

  const getMonthlyIncome = () => {
    const thisMonth = new Date().getMonth();
    return transactions
      .filter(t => new Date(t.date).getMonth() === thisMonth && t.type === 'credit')
      .reduce((total, t) => total + t.amount, 0);
  };

  const getMonthlyExpenses = () => {
    const thisMonth = new Date().getMonth();
    return Math.abs(transactions
      .filter(t => new Date(t.date).getMonth() === thisMonth && t.type === 'debit')
      .reduce((total, t) => total + t.amount, 0));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#162238] to-[#1a2332]">
      {/* Header */}
      <header className="bg-[#162238]/80 backdrop-blur-sm border-b border-[#c5a572]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative inline-flex items-center justify-center">
                <MessageSquare className="h-10 w-10 text-[#c5a572]" />
                <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Francis</h1>
                <p className="text-sm text-gray-400">Dashboard Particulier</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setHideAmounts(!hideAmounts)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                {hideAmounts ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setShowConnectBank(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg font-medium"
              >
                <Plus className="w-4 h-4" />
                Connecter une banque
              </button>

              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Solde Total</h3>
              <Zap className="w-5 h-5 text-[#c5a572]" />
            </div>
            <p className="text-2xl font-bold text-white">{formatAmount(getTotalBalance(), hideAmounts)}</p>
            <p className="text-sm text-green-400 mt-1">+2.4% ce mois</p>
          </div>

          <div className="bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Revenus ce mois</h3>
              <ArrowUpRight className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatAmount(getMonthlyIncome(), hideAmounts)}</p>
            <p className="text-sm text-green-400 mt-1">Salaire + autres</p>
          </div>

          <div className="bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Dépenses ce mois</h3>
              <ArrowDownRight className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatAmount(getMonthlyExpenses(), hideAmounts)}</p>
            <p className="text-sm text-red-400 mt-1">+5% vs mois dernier</p>
          </div>

          <div className="bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Économies fiscales</h3>
              <Calculator className="w-5 h-5 text-[#c5a572]" />
            </div>
            <p className="text-2xl font-bold text-white">
              {financialSummary ? formatAmount(financialSummary.fiscal_summary.economies_possibles, hideAmounts) : '---'}
            </p>
            <p className="text-sm text-[#c5a572] mt-1">Optimisation possible</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Comptes bancaires */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Mes Comptes</h2>
                <button onClick={loadBankAccounts} className="p-2 text-gray-400 hover:text-white">
                  <RefreshCw className={`w-5 h-5 ${isLoadingBanks ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-4">
                {bankAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 bg-[#0A192F]/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#c5a572]/20 to-[#e8cfa0]/20 rounded-full flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-[#c5a572]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{account.name}</h3>
                        <p className="text-sm text-gray-400">{account.bank_name}</p>
                        <p className="text-xs text-gray-500">{account.iban}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">
                        {formatAmount(account.balance, hideAmounts)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400">Connecté</span>
                      </div>
                    </div>
                  </div>
                ))}

                {bankAccounts.length === 0 && !isLoadingBanks && (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Aucun compte connecté</p>
                    <button
                      onClick={() => setShowConnectBank(true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg font-medium"
                    >
                      Connecter votre première banque
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Transactions récentes */}
            <div className="bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6 mt-8">
              <h2 className="text-xl font-bold text-white mb-6">Transactions Récentes</h2>
              
              <div className="space-y-3">
                {transactions.slice(0, 8).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-[#0A192F]/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' ? 'bg-green-400/20' : 'bg-red-400/20'
                      }`}>
                        {transaction.type === 'credit' ? 
                          <ArrowUpRight className="w-5 h-5 text-green-400" /> :
                          <ArrowDownRight className="w-5 h-5 text-red-400" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{formatDate(transaction.date)}</span>
                          <span className="text-xs px-2 py-0.5 bg-[#c5a572]/20 text-[#c5a572] rounded">
                            {transaction.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.type === 'credit' ? '+' : ''}{formatAmount(transaction.amount, hideAmounts)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {financialSummary && (
              <div className="bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Résumé Fiscal 2024</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Revenus annuels</span>
                    <span className="text-white font-medium">
                      {formatAmount(financialSummary.fiscal_summary.revenus_annuels, hideAmounts)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">TMI estimé</span>
                    <span className="text-white font-medium">{financialSummary.fiscal_summary.tmi_estime}%</span>
                  </div>
                  
                  <div className="pt-4 border-t border-[#c5a572]/20">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Impôt estimé</span>
                      <span className="text-red-400 font-semibold">
                        {formatAmount(financialSummary.fiscal_summary.impot_estime, hideAmounts)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Économies possibles</span>
                      <span className="text-green-400 font-semibold">
                        -{formatAmount(financialSummary.fiscal_summary.economies_possibles, hideAmounts)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/optimization')}
                  className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg font-medium"
                >
                  Optimiser mes impôts
                </button>
              </div>
            )}

            {/* Actions rapides */}
            <div className="bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Actions Rapides</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-[#0A192F]/30 rounded-lg"
                >
                  <MessageSquare className="w-5 h-5 text-[#c5a572]" />
                  <span className="text-white">Poser une question à Francis</span>
                </button>
                
                <button
                  onClick={() => navigate('/simulateur')}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-[#0A192F]/30 rounded-lg"
                >
                  <Calculator className="w-5 h-5 text-[#c5a572]" />
                  <span className="text-white">Simulateur fiscal</span>
                </button>
                
                <button
                  onClick={() => navigate('/documents-fiscaux')}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-[#0A192F]/30 rounded-lg"
                >
                  <FileText className="w-5 h-5 text-[#c5a572]" />
                  <span className="text-white">Mes documents fiscaux</span>
                </button>
                
                <button
                  onClick={() => navigate('/mon-profil')}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-[#0A192F]/30 rounded-lg"
                >
                  <User className="w-5 h-5 text-[#c5a572]" />
                  <span className="text-white">Mon Profil</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal connexion bancaire */}
      {showConnectBank && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2332] border border-[#c5a572]/20 rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Connecter une banque</h3>
              <button onClick={() => setShowConnectBank(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-400 mb-4">
              Sélectionnez votre banque pour synchroniser automatiquement vos comptes et transactions.
            </p>
            
            <div className="space-y-2 mb-6">
              {availableInstitutions.length === 0 ? (
                <button
                  onClick={loadAvailableInstitutions}
                  className="w-full p-3 border-2 border-dashed border-[#c5a572]/30 rounded-lg text-[#c5a572]"
                >
                  Charger les banques disponibles
                </button>
              ) : (
                availableInstitutions.map((institution) => (
                  <button
                    key={institution.id}
                    onClick={() => setSelectedInstitution(institution.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border ${
                      selectedInstitution === institution.id
                        ? 'border-[#c5a572] bg-[#c5a572]/10'
                        : 'border-[#c5a572]/20'
                    }`}
                  >
                    <span className="text-2xl">{institution.logo}</span>
                    <span className="text-white font-medium">{institution.name}</span>
                  </button>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConnectBank(false)}
                className="flex-1 px-4 py-2 border border-[#c5a572]/20 text-[#c5a572] rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleConnectBank}
                disabled={!selectedInstitution || isConnecting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg font-medium disabled:opacity-50"
              >
                {isConnecting ? 'Connexion...' : 'Connecter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

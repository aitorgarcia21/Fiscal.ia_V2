interface BankAccount {
  id: string;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'INSURANCE' | 'LOAN' | 'CREDIT_CARD' | 'PEA' | 'ASSURANCE_VIE';
  bank: string;
  balance: number;
  currency: 'EUR' | 'USD' | 'CHF' | 'GBP';
  iban?: string;
  lastUpdate: Date;
  connectionStatus: 'ACTIVE' | 'ERROR' | 'MAINTENANCE' | 'DISCONNECTED';
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  merchant?: string;
  type: 'DEBIT' | 'CREDIT';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  tags: string[];
  location?: {
    city: string;
    country: string;
  };
}

interface PatrimonialPosition {
  id: string;
  type: 'IMMOBILIER' | 'ASSURANCE_VIE' | 'PEA' | 'PER' | 'SCPI' | 'ACTIONS' | 'OBLIGATIONS' | 'FOND_EUROS' | 'CRYPTO' | 'ART_COLLECTION';
  provider: string;
  name: string;
  currentValue: number;
  acquisitionValue: number;
  acquisitionDate: Date;
  gainLoss: number;
  gainLossPercent: number;
  lastValuation: Date;
  performance: {
    ytd: number;
    oneYear: number;
    threeYears?: number;
    fiveYears?: number;
    inception?: number;
  };
  metadata?: {
    surface?: number; // m² pour immobilier
    location?: string; // pour immobilier
    isin?: string; // pour titres financiers
    shares?: number; // nombre de parts
    maturityDate?: Date; // pour obligations
    rentability?: number; // pour SCPI
  };
}

interface AggregationResult {
  success: boolean;
  provider: 'POWENS' | 'BUDGET_INSIGHT' | 'FINTECTURE' | 'TINK' | 'MANUAL';
  accounts: BankAccount[];
  positions: PatrimonialPosition[];
  totalAssets: number;
  lastSync: Date;
  errors?: string[];
  warnings?: string[];
  syncDuration: number;
}

interface WebhookEvent {
  id: string;
  type: 'ACCOUNT_SYNC' | 'TRANSACTION_NEW' | 'BALANCE_CHANGE' | 'CONNECTION_ERROR' | 'MAINTENANCE';
  provider: string;
  accountId?: string;
  timestamp: Date;
  data: any;
  processed: boolean;
}

class BankingAggregator {
  private apiKeys: {
    powens?: string;
    budgetInsight?: string;
    fintecture?: string;
    tink?: string;
  };

  private webhookQueue: WebhookEvent[] = [];
  private syncInProgress = new Set<string>();

  constructor() {
    this.apiKeys = {
      powens: process.env.REACT_APP_POWENS_API_KEY,
      budgetInsight: process.env.REACT_APP_BUDGET_INSIGHT_API_KEY,
      fintecture: process.env.REACT_APP_FINTECTURE_API_KEY,
      tink: process.env.REACT_APP_TINK_API_KEY
    };

    // Démarrage du worker de traitement des webhooks
    this.startWebhookProcessor();
  }

  // Connexion initiale client vers ses banques
  async connectClientBanks(clientId: string, provider: 'POWENS' | 'BUDGET_INSIGHT' = 'POWENS'): Promise<{
    redirectUrl: string;
    connectionId: string;
    expiresAt: Date;
  }> {
    const startTime = Date.now();

    try {
      let response;
      
      switch (provider) {
        case 'POWENS':
          response = await this.initiatePowensConnection(clientId);
          break;
        case 'BUDGET_INSIGHT':
          response = await this.initiateBudgetInsightConnection(clientId);
          break;
        default:
          throw new Error(`Provider ${provider} non supporté`);
      }

      // Stockage de la connexion en attente
      await this.storeConnectionAttempt(clientId, response.connectionId, provider);

      return response;

    } catch (error) {
      console.error(`Erreur connexion ${provider}:`, error);
      throw new Error(`Impossible de connecter ${provider}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // Synchronisation complète des comptes client
  async syncClientAccounts(clientId: string, force = false): Promise<AggregationResult> {
    const startTime = Date.now();

    // Vérification si sync déjà en cours
    if (this.syncInProgress.has(clientId) && !force) {
      throw new Error('Synchronisation déjà en cours pour ce client');
    }

    this.syncInProgress.add(clientId);

    try {
      // Récupération des connexions actives du client
      const connections = await this.getClientConnections(clientId);
      
      if (connections.length === 0) {
        throw new Error('Aucune connexion bancaire configurée');
      }

      // Synchronisation parallèle de tous les providers
      const syncPromises = connections.map(connection => 
        this.syncProvider(connection.provider, connection.connectionId, clientId)
      );

      const results = await Promise.allSettled(syncPromises);
      
      // Consolidation des résultats
      const aggregatedResult = this.consolidateResults(results, startTime);
      
      // Mise à jour cache client
      await this.updateClientCache(clientId, aggregatedResult);
      
      // Déclenchement des webhooks internes
      await this.triggerInternalWebhooks(clientId, aggregatedResult);

      return aggregatedResult;

    } finally {
      this.syncInProgress.delete(clientId);
    }
  }

  // Synchronisation Powens
  private async syncProvider(
    provider: 'POWENS' | 'BUDGET_INSIGHT',
    connectionId: string,
    clientId: string
  ): Promise<AggregationResult> {
    const startTime = Date.now();

    switch (provider) {
      case 'POWENS':
        return await this.syncPowens(connectionId, clientId, startTime);
      case 'BUDGET_INSIGHT':
        return await this.syncBudgetInsight(connectionId, clientId, startTime);
      default:
        throw new Error(`Provider ${provider} non supporté`);
    }
  }

  // Synchronisation Powens API
  private async syncPowens(connectionId: string, clientId: string, startTime: number): Promise<AggregationResult> {
    try {
      // Récupération des comptes
      const accountsResponse = await fetch(`/api/powens/accounts/${connectionId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKeys.powens}`,
          'Content-Type': 'application/json'
        }
      });

      if (!accountsResponse.ok) {
        throw new Error(`Powens accounts API error: ${accountsResponse.status}`);
      }

      const accountsData = await accountsResponse.json();
      
      // Transformation en format interne
      const accounts = this.transformPowensAccounts(accountsData.accounts || []);
      
      // Récupération des transactions pour chaque compte
      const transactionPromises = accounts.map(account => 
        this.fetchPowensTransactions(connectionId, account.id)
      );
      
      const transactionsResults = await Promise.all(transactionPromises);
      
      // Assignation des transactions aux comptes
      accounts.forEach((account, index) => {
        account.transactions = transactionsResults[index] || [];
      });

      // Récupération des positions patrimoniales (assurance-vie, PEA, etc.)
      const positions = await this.fetchPowensPositions(connectionId);

      return {
        success: true,
        provider: 'POWENS',
        accounts,
        positions,
        totalAssets: this.calculateTotalAssets(accounts, positions),
        lastSync: new Date(),
        syncDuration: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        provider: 'POWENS',
        accounts: [],
        positions: [],
        totalAssets: 0,
        lastSync: new Date(),
        errors: [error instanceof Error ? error.message : 'Erreur Powens inconnue'],
        syncDuration: Date.now() - startTime
      };
    }
  }

  // Synchronisation Budget Insight API
  private async syncBudgetInsight(connectionId: string, clientId: string, startTime: number): Promise<AggregationResult> {
    try {
      const response = await fetch(`/api/budget-insight/sync/${connectionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKeys.budgetInsight}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId,
          includeTransactions: true,
          includePositions: true,
          transactionsPeriod: 90 // 3 mois
        })
      });

      if (!response.ok) {
        throw new Error(`Budget Insight API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        provider: 'BUDGET_INSIGHT',
        accounts: this.transformBudgetInsightAccounts(data.accounts || []),
        positions: this.transformBudgetInsightPositions(data.positions || []),
        totalAssets: data.totalAssets || 0,
        lastSync: new Date(),
        syncDuration: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        provider: 'BUDGET_INSIGHT',
        accounts: [],
        positions: [],
        totalAssets: 0,
        lastSync: new Date(),
        errors: [error instanceof Error ? error.message : 'Erreur Budget Insight inconnue'],
        syncDuration: Date.now() - startTime
      };
    }
  }

  // Initiation connexion Powens
  private async initiatePowensConnection(clientId: string) {
    const response = await fetch('/api/powens/connect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.powens}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId,
        redirectUri: `${window.location.origin}/banking/callback`,
        country: 'FR',
        language: 'fr'
      })
    });

    if (!response.ok) {
      throw new Error(`Powens connection error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      redirectUrl: data.redirectUrl,
      connectionId: data.connectionId,
      expiresAt: new Date(data.expiresAt)
    };
  }

  // Initiation connexion Budget Insight
  private async initiateBudgetInsightConnection(clientId: string) {
    const response = await fetch('/api/budget-insight/connect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.budgetInsight}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId,
        callbackUrl: `${window.location.origin}/banking/callback`,
        locale: 'fr-FR'
      })
    });

    if (!response.ok) {
      throw new Error(`Budget Insight connection error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      redirectUrl: data.authUrl,
      connectionId: data.userId,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 min
    };
  }

  // Transformation comptes Powens vers format interne
  private transformPowensAccounts(powensAccounts: any[]): BankAccount[] {
    return powensAccounts.map(account => ({
      id: account.id,
      name: account.name || account.label,
      type: this.mapAccountType(account.type),
      bank: account.bank?.name || 'Inconnu',
      balance: account.balance || 0,
      currency: account.currency || 'EUR',
      iban: account.iban,
      lastUpdate: new Date(account.lastUpdate || Date.now()),
      connectionStatus: account.status === 'active' ? 'ACTIVE' : 'ERROR',
      transactions: []
    }));
  }

  // Transformation positions Budget Insight
  private transformBudgetInsightPositions(positions: any[]): PatrimonialPosition[] {
    return positions.map(position => ({
      id: position.id,
      type: this.mapPositionType(position.type),
      provider: position.provider || 'Budget Insight',
      name: position.name || position.label,
      currentValue: position.valuation || position.value || 0,
      acquisitionValue: position.unitprice * position.quantity || 0,
      acquisitionDate: new Date(position.vdate || Date.now()),
      gainLoss: (position.valuation || 0) - (position.unitprice * position.quantity || 0),
      gainLossPercent: position.diff_percent || 0,
      lastValuation: new Date(position.last_update || Date.now()),
      performance: {
        ytd: position.ytd || 0,
        oneYear: position.prev_diff || 0
      },
      metadata: {
        isin: position.code,
        shares: position.quantity
      }
    }));
  }

  // Récupération transactions Powens
  private async fetchPowensTransactions(connectionId: string, accountId: string): Promise<Transaction[]> {
    try {
      const response = await fetch(`/api/powens/transactions/${connectionId}/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKeys.powens}`
        }
      });

      if (!response.ok) return [];

      const data = await response.json();
      return this.transformPowensTransactions(data.transactions || []);

    } catch (error) {
      console.warn('Erreur récupération transactions Powens:', error);
      return [];
    }
  }

  // Transformation transactions Powens
  private transformPowensTransactions(powensTransactions: any[]): Transaction[] {
    return powensTransactions.map(tx => ({
      id: tx.id,
      date: new Date(tx.date),
      amount: tx.amount,
      description: tx.label || tx.raw || 'Transaction',
      category: tx.category?.name || 'Autres',
      subcategory: tx.category?.parent?.name,
      merchant: tx.merchant?.name,
      type: tx.amount >= 0 ? 'CREDIT' : 'DEBIT',
      status: tx.state === 'new' ? 'PENDING' : 'COMPLETED',
      tags: [],
      location: tx.merchant ? {
        city: tx.merchant.city || '',
        country: tx.merchant.country || 'FR'
      } : undefined
    }));
  }

  // Récupération positions patrimoniales Powens
  private async fetchPowensPositions(connectionId: string): Promise<PatrimonialPosition[]> {
    try {
      const response = await fetch(`/api/powens/positions/${connectionId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKeys.powens}`
        }
      });

      if (!response.ok) return [];

      const data = await response.json();
      return this.transformPowensPositions(data.positions || []);

    } catch (error) {
      console.warn('Erreur récupération positions Powens:', error);
      return [];
    }
  }

  // Transformation positions Powens
  private transformPowensPositions(powensPositions: any[]): PatrimonialPosition[] {
    return powensPositions.map(pos => ({
      id: pos.id,
      type: this.mapPositionType(pos.type),
      provider: 'Powens',
      name: pos.label || pos.name,
      currentValue: pos.valuation || 0,
      acquisitionValue: pos.unitprice * pos.quantity || 0,
      acquisitionDate: new Date(pos.vdate || Date.now()),
      gainLoss: pos.diff || 0,
      gainLossPercent: pos.diff_percent || 0,
      lastValuation: new Date(pos.last_update || Date.now()),
      performance: {
        ytd: pos.ytd || 0,
        oneYear: pos.prev_diff || 0
      },
      metadata: {
        isin: pos.code,
        shares: pos.quantity,
        maturityDate: pos.maturity_date ? new Date(pos.maturity_date) : undefined
      }
    }));
  }

  // Mapping types de comptes
  private mapAccountType(externalType: string): BankAccount['type'] {
    const typeMap: Record<string, BankAccount['type']> = {
      'checking': 'CHECKING',
      'savings': 'SAVINGS',
      'investment': 'INVESTMENT',
      'loan': 'LOAN',
      'credit_card': 'CREDIT_CARD',
      'pea': 'PEA',
      'life_insurance': 'ASSURANCE_VIE',
      'insurance': 'INSURANCE'
    };

    return typeMap[externalType.toLowerCase()] || 'CHECKING';
  }

  // Mapping types de positions
  private mapPositionType(externalType: string): PatrimonialPosition['type'] {
    const typeMap: Record<string, PatrimonialPosition['type']> = {
      'stock': 'ACTIONS',
      'bond': 'OBLIGATIONS',
      'fund': 'FOND_EUROS',
      'real_estate': 'IMMOBILIER',
      'scpi': 'SCPI',
      'life_insurance': 'ASSURANCE_VIE',
      'pea': 'PEA',
      'per': 'PER',
      'crypto': 'CRYPTO'
    };

    return typeMap[externalType.toLowerCase()] || 'ACTIONS';
  }

  // Calcul total des actifs
  private calculateTotalAssets(accounts: BankAccount[], positions: PatrimonialPosition[]): number {
    const accountsTotal = accounts.reduce((sum, account) => sum + Math.max(0, account.balance), 0);
    const positionsTotal = positions.reduce((sum, position) => sum + position.currentValue, 0);
    return accountsTotal + positionsTotal;
  }

  // Consolidation des résultats de sync
  private consolidateResults(results: PromiseSettledResult<AggregationResult>[], startTime: number): AggregationResult {
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success) as PromiseFulfilledResult<AggregationResult>[];
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));

    const allAccounts = successful.flatMap(r => r.value.accounts);
    const allPositions = successful.flatMap(r => r.value.positions);
    const allErrors = failed.flatMap(r => 
      r.status === 'rejected' 
        ? [r.reason?.message || 'Erreur inconnue']
        : r.value.errors || []
    );

    return {
      success: successful.length > 0,
      provider: 'POWENS', // Provider principal
      accounts: allAccounts,
      positions: allPositions,
      totalAssets: this.calculateTotalAssets(allAccounts, allPositions),
      lastSync: new Date(),
      errors: allErrors.length > 0 ? allErrors : undefined,
      syncDuration: Date.now() - startTime
    };
  }

  // Gestion des webhooks temps réel
  async handleWebhook(event: WebhookEvent): Promise<void> {
    this.webhookQueue.push(event);
    console.log(`Webhook reçu: ${event.type} pour ${event.provider}`);
  }

  // Processeur de webhooks en arrière-plan
  private startWebhookProcessor(): void {
    setInterval(async () => {
      if (this.webhookQueue.length === 0) return;

      const event = this.webhookQueue.shift();
      if (!event) return;

      try {
        await this.processWebhookEvent(event);
        event.processed = true;
      } catch (error) {
        console.error('Erreur traitement webhook:', error);
        // Remettre en queue si échec
        this.webhookQueue.push(event);
      }
    }, 5000); // Traitement toutes les 5 secondes
  }

  // Traitement d'un événement webhook
  private async processWebhookEvent(event: WebhookEvent): Promise<void> {
    switch (event.type) {
      case 'ACCOUNT_SYNC':
        await this.handleAccountSyncWebhook(event);
        break;
      case 'TRANSACTION_NEW':
        await this.handleNewTransactionWebhook(event);
        break;
      case 'BALANCE_CHANGE':
        await this.handleBalanceChangeWebhook(event);
        break;
      case 'CONNECTION_ERROR':
        await this.handleConnectionErrorWebhook(event);
        break;
    }
  }

  // Gestion webhook nouvelle transaction
  private async handleNewTransactionWebhook(event: WebhookEvent): Promise<void> {
    // Notification temps réel au client
    await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'NEW_TRANSACTION',
        accountId: event.accountId,
        data: event.data,
        timestamp: event.timestamp
      })
    });
  }

  // Cache et persistance
  private async updateClientCache(clientId: string, result: AggregationResult): Promise<void> {
    const cacheData = {
      clientId,
      ...result,
      cachedAt: new Date()
    };

    // Stockage en localStorage (côté client)
    localStorage.setItem(`banking_cache_${clientId}`, JSON.stringify(cacheData));

    // Stockage côté serveur
    await fetch('/api/banking/cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cacheData)
    });
  }

  // Récupération des connexions client
  private async getClientConnections(clientId: string): Promise<Array<{
    provider: 'POWENS' | 'BUDGET_INSIGHT';
    connectionId: string;
    status: string;
  }>> {
    const response = await fetch(`/api/banking/connections/${clientId}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.connections || [];
  }

  // Stockage tentative de connexion
  private async storeConnectionAttempt(clientId: string, connectionId: string, provider: string): Promise<void> {
    await fetch('/api/banking/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        connectionId,
        provider,
        status: 'PENDING',
        createdAt: new Date()
      })
    });
  }

  // Webhooks internes (vers autres modules Francis)
  private async triggerInternalWebhooks(clientId: string, result: AggregationResult): Promise<void> {
    // Notification au module fiscal pour recalcul
    if (result.success && result.totalAssets > 0) {
      await fetch('/api/fiscal/webhook/assets-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          totalAssets: result.totalAssets,
          lastSync: result.lastSync
        })
      });
    }

    // Notification au module reporting
    await fetch('/api/reporting/webhook/data-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        accounts: result.accounts.length,
        positions: result.positions.length,
        syncSuccess: result.success
      })
    });
  }

  // Gestion des webhooks spécifiques
  private async handleAccountSyncWebhook(event: WebhookEvent): Promise<void> {
    // Mettre à jour le cache si sync réussi
    if (event.data.success) {
      // Re-synchroniser automatiquement
      const clientId = event.data.clientId;
      if (clientId) {
        setTimeout(() => this.syncClientAccounts(clientId), 30000); // 30s de délai
      }
    }
  }

  private async handleBalanceChangeWebhook(event: WebhookEvent): Promise<void> {
    // Déclencher recalcul patrimoine si changement significatif
    const changePercent = Math.abs(event.data.changePercent || 0);
    if (changePercent > 5) { // Plus de 5% de variation
      await this.triggerPatrimonialRecalculation(event.data.clientId);
    }
  }

  private async handleConnectionErrorWebhook(event: WebhookEvent): Promise<void> {
    // Notifier le client d'une erreur de connexion
    await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'CONNECTION_ERROR',
        provider: event.provider,
        accountId: event.accountId,
        error: event.data.error,
        timestamp: event.timestamp
      })
    });
  }

  private async triggerPatrimonialRecalculation(clientId: string): Promise<void> {
    await fetch('/api/patrimoine/recalculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId })
    });
  }
}

export default new BankingAggregator();

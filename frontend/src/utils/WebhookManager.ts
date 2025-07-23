interface WebhookEvent {
  id: string;
  type: 'ACCOUNT_SYNC' | 'TRANSACTION_NEW' | 'BALANCE_CHANGE' | 'DOCUMENT_PROCESSED' | 'COMPLIANCE_UPDATE' | 'MARKET_DATA_UPDATE';
  source: 'POWENS' | 'BUDGET_INSIGHT' | 'INTERNAL' | 'MARKET_DATA' | 'COMPLIANCE';
  clientId: string;
  timestamp: Date;
  data: any;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  processed: boolean;
  retryCount: number;
  maxRetries: number;
  nextRetry?: Date;
}

interface WebhookSubscription {
  id: string;
  clientId: string;
  eventTypes: WebhookEvent['type'][];
  endpoint: string;
  secret: string;
  active: boolean;
  createdAt: Date;
  lastDelivery?: Date;
  failureCount: number;
}

interface ProcessingResult {
  success: boolean;
  processedEvents: number;
  failedEvents: number;
  errors: string[];
  processingTime: number;
}

class WebhookManager {
  private eventQueue: WebhookEvent[] = [];
  private subscriptions: Map<string, WebhookSubscription[]> = new Map();
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private maxConcurrentProcessing = 5;
  private retryDelays = [1000, 5000, 15000, 60000, 300000]; // 1s, 5s, 15s, 1m, 5m

  constructor() {
    this.startProcessing();
    this.setupEventListeners();
  }

  // Ajout d'un événement à la queue
  async enqueueEvent(event: Omit<WebhookEvent, 'id' | 'timestamp' | 'processed' | 'retryCount'>): Promise<string> {
    const webhookEvent: WebhookEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      processed: false,
      retryCount: 0,
      maxRetries: 3,
      ...event
    };

    this.eventQueue.push(webhookEvent);
    
    // Tri par priorité et timestamp
    this.eventQueue.sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      return priorityDiff !== 0 ? priorityDiff : a.timestamp.getTime() - b.timestamp.getTime();
    });

    console.log(`Événement ${webhookEvent.type} ajouté à la queue pour client ${webhookEvent.clientId}`);
    
    // Déclenchement immédiat pour les événements haute priorité
    if (event.priority === 'HIGH' && !this.isProcessing) {
      this.processNextBatch();
    }

    return webhookEvent.id;
  }

  // Traitement d'un événement bancaire
  async handleBankingEvent(clientId: string, eventType: 'ACCOUNT_SYNC' | 'TRANSACTION_NEW' | 'BALANCE_CHANGE', data: any): Promise<void> {
    await this.enqueueEvent({
      type: eventType,
      source: data.provider || 'INTERNAL',
      clientId,
      data,
      priority: eventType === 'TRANSACTION_NEW' ? 'HIGH' : 'MEDIUM',
      maxRetries: 5
    });

    // Actions spécifiques selon le type d'événement
    switch (eventType) {
      case 'ACCOUNT_SYNC':
        await this.handleAccountSync(clientId, data);
        break;
      case 'TRANSACTION_NEW':
        await this.handleNewTransaction(clientId, data);
        break;
      case 'BALANCE_CHANGE':
        await this.handleBalanceChange(clientId, data);
        break;
    }
  }

  // Traitement d'un événement de conformité
  async handleComplianceEvent(clientId: string, data: {
    type: 'KYC_UPDATE' | 'DOCUMENT_VERIFIED' | 'SANCTION_ALERT' | 'SCORE_CHANGE';
    details: any;
  }): Promise<void> {
    const priority = data.type === 'SANCTION_ALERT' ? 'HIGH' : 'MEDIUM';
    
    await this.enqueueEvent({
      type: 'COMPLIANCE_UPDATE',
      source: 'COMPLIANCE',
      clientId,
      data,
      priority,
      maxRetries: 3
    });

    // Notification immédiate pour les alertes critiques
    if (data.type === 'SANCTION_ALERT') {
      await this.sendImmediateAlert(clientId, data);
    }
  }

  // Traitement d'un document
  async handleDocumentEvent(clientId: string, documentData: {
    documentId: string;
    type: string;
    classification: any;
    extractedData: any;
  }): Promise<void> {
    await this.enqueueEvent({
      type: 'DOCUMENT_PROCESSED',
      source: 'INTERNAL',
      clientId,
      data: documentData,
      priority: 'MEDIUM',
      maxRetries: 3
    });

    // Mise à jour automatique du profil client
    await this.updateClientProfile(clientId, documentData);
  }

  // Gestion des mises à jour de marché
  async handleMarketDataEvent(data: {
    isin: string;
    price: number;
    change: number;
    affectedClients: string[];
  }): Promise<void> {
    // Création d'un événement pour chaque client affecté
    for (const clientId of data.affectedClients) {
      await this.enqueueEvent({
        type: 'MARKET_DATA_UPDATE',
        source: 'MARKET_DATA',
        clientId,
        data: {
          isin: data.isin,
          price: data.price,
          change: data.change
        },
        priority: Math.abs(data.change) > 5 ? 'HIGH' : 'LOW',
        maxRetries: 2
      });
    }
  }

  // Démarrage du processeur d'événements
  private startProcessing(): void {
    this.processingInterval = setInterval(() => {
      if (!this.isProcessing && this.eventQueue.length > 0) {
        this.processNextBatch();
      }
    }, 2000); // Vérification toutes les 2 secondes
  }

  // Traitement d'un lot d'événements
  private async processNextBatch(): Promise<ProcessingResult> {
    if (this.isProcessing) {
      return { success: false, processedEvents: 0, failedEvents: 0, errors: ['Processing already in progress'], processingTime: 0 };
    }

    this.isProcessing = true;
    const startTime = Date.now();
    let processedEvents = 0;
    let failedEvents = 0;
    const errors: string[] = [];

    try {
      // Sélection des événements à traiter
      const eventsToProcess = this.eventQueue
        .filter(event => !event.processed && (!event.nextRetry || event.nextRetry <= new Date()))
        .slice(0, this.maxConcurrentProcessing);

      if (eventsToProcess.length === 0) {
        return { success: true, processedEvents: 0, failedEvents: 0, errors: [], processingTime: Date.now() - startTime };
      }

      // Traitement parallèle
      const processingPromises = eventsToProcess.map(event => this.processEvent(event));
      const results = await Promise.allSettled(processingPromises);

      // Compilation des résultats
      results.forEach((result, index) => {
        const event = eventsToProcess[index];
        
        if (result.status === 'fulfilled' && result.value.success) {
          event.processed = true;
          processedEvents++;
          this.removeFromQueue(event.id);
        } else {
          failedEvents++;
          const error = result.status === 'rejected' ? result.reason : result.value.error;
          errors.push(`Event ${event.id}: ${error}`);
          
          // Gestion des tentatives
          this.handleRetry(event, error);
        }
      });

      return {
        success: errors.length === 0,
        processedEvents,
        failedEvents,
        errors,
        processingTime: Date.now() - startTime
      };

    } finally {
      this.isProcessing = false;
    }
  }

  // Traitement d'un événement individuel
  private async processEvent(event: WebhookEvent): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Traitement événement ${event.type} pour client ${event.clientId}`);

      switch (event.type) {
        case 'ACCOUNT_SYNC':
          await this.processAccountSync(event);
          break;
        case 'TRANSACTION_NEW':
          await this.processNewTransaction(event);
          break;
        case 'BALANCE_CHANGE':
          await this.processBalanceChange(event);
          break;
        case 'DOCUMENT_PROCESSED':
          await this.processDocumentProcessed(event);
          break;
        case 'COMPLIANCE_UPDATE':
          await this.processComplianceUpdate(event);
          break;
        case 'MARKET_DATA_UPDATE':
          await this.processMarketDataUpdate(event);
          break;
        default:
          throw new Error(`Type d'événement non supporté: ${event.type}`);
      }

      // Notification des souscripteurs
      await this.notifySubscribers(event);

      return { success: true };

    } catch (error) {
      console.error(`Erreur traitement événement ${event.id}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }

  // Handlers spécifiques par type d'événement
  private async processAccountSync(event: WebhookEvent): Promise<void> {
    const { clientId, data } = event;
    
    // Mise à jour du cache client
    await this.updateClientCache(clientId, 'accounts', data.accounts);
    
    // Recalcul du patrimoine
    await this.triggerPatrimonialRecalculation(clientId);
    
    // Notification push si changement significatif
    if (data.significantChange) {
      await this.sendPushNotification(clientId, {
        title: 'Comptes synchronisés',
        body: 'Vos comptes ont été mis à jour automatiquement',
        type: 'ACCOUNT_UPDATE'
      });
    }
  }

  private async processNewTransaction(event: WebhookEvent): Promise<void> {
    const { clientId, data } = event;
    
    // Catégorisation automatique de la transaction
    const category = await this.categorizeTransaction(data.transaction);
    
    // Mise à jour des statistiques client
    await this.updateTransactionStats(clientId, data.transaction, category);
    
    // Détection d'anomalies
    const anomaly = await this.detectTransactionAnomaly(clientId, data.transaction);
    if (anomaly.detected) {
      await this.sendSecurityAlert(clientId, anomaly);
    }
    
    // Notification push pour les transactions importantes
    if (Math.abs(data.transaction.amount) > 1000) {
      await this.sendPushNotification(clientId, {
        title: 'Nouvelle transaction',
        body: `${data.transaction.amount > 0 ? '+' : ''}${data.transaction.amount.toLocaleString()} € - ${data.transaction.description}`,
        type: 'TRANSACTION'
      });
    }
  }

  private async processBalanceChange(event: WebhookEvent): Promise<void> {
    const { clientId, data } = event;
    
    // Mise à jour des seuils d'alerte
    await this.checkBalanceThresholds(clientId, data);
    
    // Recalcul des métriques de liquidité
    await this.updateLiquidityMetrics(clientId);
    
    // Suggestion d'optimisation si solde élevé
    if (data.newBalance > 50000 && data.accountType === 'CHECKING') {
      await this.suggestInvestmentOpportunity(clientId, data.newBalance);
    }
  }

  private async processDocumentProcessed(event: WebhookEvent): Promise<void> {
    const { clientId, data } = event;
    
    // Mise à jour du score de complétude
    await this.updateComplianceScore(clientId, data);
    
    // Extraction automatique des données vers le profil client
    await this.updateClientFromDocument(clientId, data);
    
    // Notification de traitement terminé
    await this.sendPushNotification(clientId, {
      title: 'Document traité',
      body: `Votre ${data.type.toLowerCase()} a été analysé et intégré`,
      type: 'DOCUMENT_PROCESSED'
    });
  }

  private async processComplianceUpdate(event: WebhookEvent): Promise<void> {
    const { clientId, data } = event;
    
    switch (data.type) {
      case 'SANCTION_ALERT':
        await this.handleSanctionAlert(clientId, data.details);
        break;
      case 'DOCUMENT_VERIFIED':
        await this.handleDocumentVerification(clientId, data.details);
        break;
      case 'SCORE_CHANGE':
        await this.handleScoreChange(clientId, data.details);
        break;
    }
  }

  private async processMarketDataUpdate(event: WebhookEvent): Promise<void> {
    const { clientId, data } = event;
    
    // Mise à jour de la valorisation du portefeuille
    await this.updatePortfolioValuation(clientId, data);
    
    // Alertes de performance
    if (Math.abs(data.change) > 10) {
      await this.sendPushNotification(clientId, {
        title: 'Mouvement de marché important',
        body: `${data.isin}: ${data.change > 0 ? '+' : ''}${data.change.toFixed(2)}%`,
        type: 'MARKET_ALERT'
      });
    }
  }

  // Gestion des tentatives
  private handleRetry(event: WebhookEvent, error: string): void {
    event.retryCount++;
    
    if (event.retryCount <= event.maxRetries) {
      // Calcul du délai de retry avec backoff exponentiel
      const delayIndex = Math.min(event.retryCount - 1, this.retryDelays.length - 1);
      const delay = this.retryDelays[delayIndex];
      
      event.nextRetry = new Date(Date.now() + delay);
      
      console.log(`Événement ${event.id} sera retenté dans ${delay}ms (tentative ${event.retryCount}/${event.maxRetries})`);
    } else {
      // Échec définitif
      console.error(`Événement ${event.id} abandonné après ${event.maxRetries} tentatives: ${error}`);
      this.handleFailedEvent(event, error);
      this.removeFromQueue(event.id);
    }
  }

  // Gestion des échecs définitifs
  private async handleFailedEvent(event: WebhookEvent, error: string): Promise<void> {
    // Log de l'échec
    await this.logFailedEvent(event, error);
    
    // Notification des administrateurs pour les événements critiques
    if (event.priority === 'HIGH') {
      await this.notifyAdministrators({
        type: 'WEBHOOK_FAILURE',
        eventId: event.id,
        clientId: event.clientId,
        error,
        timestamp: new Date()
      });
    }
  }

  // Notification des souscripteurs
  private async notifySubscribers(event: WebhookEvent): Promise<void> {
    const clientSubscriptions = this.subscriptions.get(event.clientId) || [];
    
    const relevantSubscriptions = clientSubscriptions.filter(sub => 
      sub.active && sub.eventTypes.includes(event.type)
    );

    const notificationPromises = relevantSubscriptions.map(subscription => 
      this.deliverWebhook(subscription, event)
    );

    await Promise.allSettled(notificationPromises);
  }

  // Livraison d'un webhook
  private async deliverWebhook(subscription: WebhookSubscription, event: WebhookEvent): Promise<void> {
    try {
      const payload = {
        eventId: event.id,
        type: event.type,
        clientId: event.clientId,
        timestamp: event.timestamp.toISOString(),
        data: event.data
      };

      const signature = await this.generateWebhookSignature(payload, subscription.secret);

      const response = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Francis-Signature': signature,
          'X-Francis-Event-Type': event.type,
          'X-Francis-Event-Id': event.id
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      subscription.lastDelivery = new Date();
      subscription.failureCount = 0;

    } catch (error) {
      subscription.failureCount++;
      console.error(`Échec livraison webhook ${subscription.id}:`, error);
      
      // Désactivation automatique après trop d'échecs
      if (subscription.failureCount >= 10) {
        subscription.active = false;
        console.warn(`Souscription ${subscription.id} désactivée après trop d'échecs`);
      }
    }
  }

  // Utilitaires
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private removeFromQueue(eventId: string): void {
    this.eventQueue = this.eventQueue.filter(event => event.id !== eventId);
  }

  private async generateWebhookSignature(payload: any, secret: string): Promise<string> {
    const data = JSON.stringify(payload);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Méthodes d'intégration avec les autres modules
  private async updateClientCache(clientId: string, type: string, data: any): Promise<void> {
    await fetch('/api/cache/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, type, data, timestamp: new Date() })
    });
  }

  private async triggerPatrimonialRecalculation(clientId: string): Promise<void> {
    await fetch('/api/patrimoine/recalculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, trigger: 'webhook' })
    });
  }

  private async sendPushNotification(clientId: string, notification: {
    title: string;
    body: string;
    type: string;
  }): Promise<void> {
    await fetch('/api/notifications/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, ...notification })
    });
  }

  private async categorizeTransaction(transaction: any): Promise<string> {
    // Utilisation de l'IA Francis pour catégoriser
    const response = await fetch('/api/francis/categorize-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: transaction.description, amount: transaction.amount })
    });
    
    const result = await response.json();
    return result.category || 'AUTRES';
  }

  private async detectTransactionAnomaly(clientId: string, transaction: any): Promise<{ detected: boolean; reason?: string }> {
    // Détection d'anomalies basée sur l'historique
    const response = await fetch('/api/fraud/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, transaction })
    });
    
    return await response.json();
  }

  private setupEventListeners(): void {
    // Écoute des événements côté client (WebSocket, Server-Sent Events, etc.)
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (this.processingInterval) {
          clearInterval(this.processingInterval);
        }
      });
    }
  }

  // API publique pour la gestion des souscriptions
  async subscribe(subscription: Omit<WebhookSubscription, 'id' | 'createdAt' | 'failureCount'>): Promise<string> {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullSubscription: WebhookSubscription = {
      id,
      createdAt: new Date(),
      failureCount: 0,
      ...subscription
    };

    if (!this.subscriptions.has(subscription.clientId)) {
      this.subscriptions.set(subscription.clientId, []);
    }

    this.subscriptions.get(subscription.clientId)!.push(fullSubscription);
    return id;
  }

  async unsubscribe(subscriptionId: string, clientId: string): Promise<boolean> {
    const clientSubs = this.subscriptions.get(clientId);
    if (!clientSubs) return false;

    const index = clientSubs.findIndex(sub => sub.id === subscriptionId);
    if (index === -1) return false;

    clientSubs.splice(index, 1);
    return true;
  }

  // Méthodes utilitaires supplémentaires
  private async logFailedEvent(event: WebhookEvent, error: string): Promise<void> {
    console.error(`Failed event log: ${event.id}`, { event, error });
  }

  private async notifyAdministrators(alert: any): Promise<void> {
    console.warn('Admin notification:', alert);
  }

  private async updateTransactionStats(clientId: string, transaction: any, category: string): Promise<void> {
    // Mise à jour des statistiques de transaction
  }

  private async checkBalanceThresholds(clientId: string, data: any): Promise<void> {
    // Vérification des seuils de solde
  }

  private async updateLiquidityMetrics(clientId: string): Promise<void> {
    // Mise à jour des métriques de liquidité
  }

  private async suggestInvestmentOpportunity(clientId: string, balance: number): Promise<void> {
    // Suggestion d'opportunités d'investissement
  }

  private async updateComplianceScore(clientId: string, data: any): Promise<void> {
    // Mise à jour du score de conformité
  }

  private async updateClientFromDocument(clientId: string, data: any): Promise<void> {
    // Mise à jour du profil client à partir des documents
  }

  private async handleSanctionAlert(clientId: string, details: any): Promise<void> {
    // Gestion des alertes de sanctions
  }

  private async handleDocumentVerification(clientId: string, details: any): Promise<void> {
    // Gestion de la vérification de documents
  }

  private async handleScoreChange(clientId: string, details: any): Promise<void> {
    // Gestion des changements de score
  }

  private async updatePortfolioValuation(clientId: string, data: any): Promise<void> {
    // Mise à jour de la valorisation du portefeuille
  }

  private async sendSecurityAlert(clientId: string, anomaly: any): Promise<void> {
    // Envoi d'alertes de sécurité
  }

  private async sendImmediateAlert(clientId: string, data: any): Promise<void> {
    // Envoi d'alertes immédiates
  }

  private async updateClientProfile(clientId: string, documentData: any): Promise<void> {
    // Mise à jour du profil client
  }

  // Nettoyage et arrêt
  destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.eventQueue = [];
    this.subscriptions.clear();
  }

  // Statistiques et monitoring
  getQueueStats(): {
    totalEvents: number;
    pendingEvents: number;
    failedEvents: number;
    averageProcessingTime: number;
  } {
    const totalEvents = this.eventQueue.length;
    const pendingEvents = this.eventQueue.filter(e => !e.processed).length;
    const failedEvents = this.eventQueue.filter(e => e.retryCount >= e.maxRetries).length;

    return {
      totalEvents,
      pendingEvents,
      failedEvents,
      averageProcessingTime: 0 // TODO: Calculer la moyenne
    };
  }
}

export default new WebhookManager();

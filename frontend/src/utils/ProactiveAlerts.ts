interface AlertTrigger {
  id: string;
  name: string;
  type: 'CLIENT_BEHAVIOR' | 'MARKET_CHANGE' | 'FISCAL_UPDATE' | 'PORTFOLIO_RISK' | 'OPPORTUNITY' | 'COMPLIANCE';
  conditions: {
    field: string;
    operator: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'CHANGED' | 'THRESHOLD';
    value: any;
    timeframe?: string;
  }[];
  priority: 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'FAIBLE';
  active: boolean;
}

interface SmartAlert {
  id: string;
  triggerId: string;
  clientId: string;
  advisorId: string;
  
  title: string;
  message: string;
  category: 'FISCAL_OPPORTUNITY' | 'RISK_WARNING' | 'CLIENT_ACTION' | 'MARKET_INSIGHT' | 'COMPLIANCE_REMINDER' | 'BUSINESS_OPPORTUNITY';
  priority: 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'FAIBLE';
  
  createdAt: Date;
  expiresAt?: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  
  context: {
    clientData?: any;
    marketData?: any;
    portfolioData?: any;
    triggeredBy: string;
    dataSnapshot: any;
  };
  
  recommendedActions: Array<{
    type: 'CALL_CLIENT' | 'SEND_EMAIL' | 'SCHEDULE_MEETING' | 'UPDATE_PORTFOLIO' | 'REVIEW_STRATEGY' | 'COMPLIANCE_CHECK';
    description: string;
    urgency: 'IMMEDIATE' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';
    estimatedDuration: number;
    automatable: boolean;
  }>;
  
  francisInsights: {
    analysis: string;
    reasoning: string;
    confidence: number;
    similarCases: number;
    expectedImpact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    estimatedValue?: number;
  };
}

interface AlertChannel {
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'DASHBOARD' | 'SLACK' | 'TEAMS';
  enabled: boolean;
  config: {
    recipients?: string[];
    template?: string;
    conditions?: string[];
  };
}

class ProactiveAlerts {
  private triggers: Map<string, AlertTrigger> = new Map();
  private alerts: Map<string, SmartAlert> = new Map();
  private channels: Map<string, AlertChannel> = new Map();
  private francisApiUrl = process.env.REACT_APP_FRANCIS_API_URL || 'http://localhost:8000';
  
  constructor() {
    this.initializeDefaultTriggers();
    this.initializeDefaultChannels();
    this.startMonitoring();
  }

  private initializeDefaultTriggers() {
    const defaultTriggers: AlertTrigger[] = [
      {
        id: 'portfolio-drop',
        name: 'Chute importante du portefeuille',
        type: 'PORTFOLIO_RISK',
        conditions: [
          { field: 'portfolio.performance.daily', operator: 'LESS_THAN', value: -0.05 },
          { field: 'portfolio.value', operator: 'GREATER_THAN', value: 100000 }
        ],
        priority: 'CRITIQUE',
        active: true
      },
      {
        id: 'fiscal-opportunity',
        name: 'Opportunité fiscale détectée',
        type: 'OPPORTUNITY',
        conditions: [
          { field: 'client.revenus', operator: 'GREATER_THAN', value: 50000 },
          { field: 'client.optimisations.current', operator: 'LESS_THAN', value: 0.1 }
        ],
        priority: 'HAUTE',
        active: true
      },
      {
        id: 'inactivity-alert',
        name: 'Client inactif depuis longtemps',
        type: 'CLIENT_BEHAVIOR',
        conditions: [
          { field: 'client.lastContact', operator: 'GREATER_THAN', value: 90, timeframe: 'days' },
          { field: 'client.aum', operator: 'GREATER_THAN', value: 50000 }
        ],
        priority: 'MOYENNE',
        active: true
      },
      {
        id: 'compliance-deadline',
        name: 'Échéance compliance approche',
        type: 'COMPLIANCE',
        conditions: [
          { field: 'compliance.nextDeadline', operator: 'LESS_THAN', value: 7, timeframe: 'days' },
          { field: 'compliance.status', operator: 'EQUALS', value: 'PENDING' }
        ],
        priority: 'CRITIQUE',
        active: true
      }
    ];

    defaultTriggers.forEach(trigger => {
      this.triggers.set(trigger.id, trigger);
    });
  }

  private initializeDefaultChannels() {
    const defaultChannels: AlertChannel[] = [
      {
        type: 'DASHBOARD',
        enabled: true,
        config: { conditions: ['ALL'] }
      },
      {
        type: 'EMAIL',
        enabled: true,
        config: { 
          conditions: ['CRITIQUE', 'HAUTE'],
          template: 'fiscal_alert'
        }
      },
      {
        type: 'PUSH',
        enabled: true,
        config: { conditions: ['CRITIQUE'] }
      }
    ];

    defaultChannels.forEach(channel => {
      this.channels.set(channel.type, channel);
    });
  }

  private startMonitoring() {
    setInterval(() => {
      this.checkAllTriggers();
    }, 5 * 60 * 1000);

    setTimeout(() => {
      this.checkAllTriggers();
    }, 1000);
  }

  private async checkAllTriggers() {
    console.log('🔍 VÉRIFICATION TRIGGERS PROACTIFS');
    
    try {
      const activeTriggers = Array.from(this.triggers.values()).filter(t => t.active);
      const context = await this.gatherContext();
      
      for (const trigger of activeTriggers) {
        await this.evaluateTrigger(trigger, context);
      }
      
    } catch (error) {
      console.error('Erreur vérification triggers:', error);
    }
  }

  private async gatherContext() {
    try {
      const clientProfiles = this.getStoredClientProfiles();
      
      const marketConditions = {
        indices: { CAC40: 7500, SP500: 4500, NASDAQ: 15000 },
        rates: { EUR10Y: 0.025, FED: 0.05, ECB: 0.00 },
        volatility: { VIX: 18, VSTOXX: 22 },
        news: []
      };
      
      const fiscalEnvironment = {
        recentChanges: [],
        upcomingDeadlines: [
          { type: 'DECLARATION_IR', date: new Date('2024-05-31'), description: 'Déclaration IR 2024' }
        ],
        opportunities: []
      };
      
      const pastAlerts = Array.from(this.alerts.values())
        .filter(alert => alert.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      
      return {
        clientProfile: clientProfiles[0] || {},
        recentActivity: [],
        portfolioPerformance: {},
        marketConditions,
        fiscalEnvironment,
        pastAlerts,
        clientInteractions: []
      };
      
    } catch (error) {
      console.error('Erreur collecte contexte:', error);
      return {
        clientProfile: {},
        recentActivity: [],
        portfolioPerformance: {},
        marketConditions: { indices: {}, rates: {}, volatility: {}, news: [] },
        fiscalEnvironment: { recentChanges: [], upcomingDeadlines: [], opportunities: [] },
        pastAlerts: [],
        clientInteractions: []
      };
    }
  }

  private async evaluateTrigger(trigger: AlertTrigger, context: any) {
    try {
      const conditionsMet = await this.checkConditions(trigger.conditions, context);
      
      if (conditionsMet) {
        const recentAlert = this.findRecentAlert(trigger.id, context.clientProfile.id);
        if (recentAlert) {
          return;
        }
        
        const alert = await this.generateSmartAlert(trigger, context);
        await this.enrichWithFrancis(alert, context);
        
        this.alerts.set(alert.id, alert);
        await this.broadcastAlert(alert);
        
        console.log('🚨 ALERTE GÉNÉRÉE:', alert.title, 'pour', alert.clientId);
      }
      
    } catch (error) {
      console.error(`Erreur évaluation trigger ${trigger.id}:`, error);
    }
  }

  private async checkConditions(conditions: AlertTrigger['conditions'], context: any): Promise<boolean> {
    for (const condition of conditions) {
      const fieldValue = this.extractFieldValue(condition.field, context);
      const conditionMet = this.evaluateCondition(fieldValue, condition);
      
      if (!conditionMet) {
        return false;
      }
    }
    
    return true;
  }

  private extractFieldValue(fieldPath: string, context: any): any {
    const pathParts = fieldPath.split('.');
    let value: any = context;
    
    for (const part of pathParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private evaluateCondition(fieldValue: any, condition: AlertTrigger['conditions'][0]): boolean {
    switch (condition.operator) {
      case 'EQUALS':
        return fieldValue === condition.value;
      case 'GREATER_THAN':
        return typeof fieldValue === 'number' && fieldValue > condition.value;
      case 'LESS_THAN':
        return typeof fieldValue === 'number' && fieldValue < condition.value;
      case 'CONTAINS':
        return typeof fieldValue === 'string' && fieldValue.includes(condition.value);
      case 'CHANGED':
        return false;
      case 'THRESHOLD':
        return Math.abs(fieldValue - condition.value) < 0.01;
      default:
        return false;
    }
  }

  private findRecentAlert(triggerId: string, clientId: string): SmartAlert | undefined {
    const recentThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return Array.from(this.alerts.values()).find(alert => 
      alert.triggerId === triggerId &&
      alert.clientId === clientId &&
      alert.createdAt > recentThreshold
    );
  }

  private async generateSmartAlert(trigger: AlertTrigger, context: any): Promise<SmartAlert> {
    const alertId = `alert-${trigger.id}-${Date.now()}`;
    const clientId = context.clientProfile.id || 'unknown';
    
    const content = this.generateAlertContent(trigger, context);
    const recommendedActions = this.generateRecommendedActions(trigger, context);
    
    return {
      id: alertId,
      triggerId: trigger.id,
      clientId,
      advisorId: context.clientProfile.advisorId || 'francis',
      
      title: content.title,
      message: content.message,
      category: this.mapTriggerToCategory(trigger.type),
      priority: trigger.priority,
      
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      acknowledged: false,
      
      context: {
        clientData: context.clientProfile,
        marketData: context.marketConditions,
        portfolioData: context.portfolioPerformance,
        triggeredBy: trigger.name,
        dataSnapshot: { ...context }
      },
      
      recommendedActions,
      
      francisInsights: {
        analysis: '',
        reasoning: '',
        confidence: 0,
        similarCases: 0,
        expectedImpact: 'NEUTRAL'
      }
    };
  }

  private generateAlertContent(trigger: AlertTrigger, context: any): { title: string; message: string } {
    const clientName = context.clientProfile?.nom || 'Client';
    
    switch (trigger.id) {
      case 'portfolio-drop':
        return {
          title: '📉 Chute importante du portefeuille',
          message: `Le portefeuille de ${clientName} a subi une baisse significative. Une revue s'impose pour évaluer les actions correctives.`
        };
        
      case 'fiscal-opportunity':
        return {
          title: '💰 Opportunité fiscale détectée',
          message: `${clientName} pourrait bénéficier d'optimisations fiscales. Revenus élevés avec peu d'optimisations actuelles.`
        };
        
      case 'inactivity-alert':
        return {
          title: '⏰ Client inactif depuis longtemps',
          message: `Pas de contact avec ${clientName} depuis plus de 3 mois. Un suivi proactif est recommandé.`
        };
        
      case 'compliance-deadline':
        return {
          title: '⚠️ Échéance compliance critique',
          message: `Échéance compliance approche dans moins de 7 jours pour ${clientName}. Action immédiate requise.`
        };
        
      default:
        return {
          title: '🔔 Alerte Francis',
          message: `Alerte générée pour ${clientName} - ${trigger.name}`
        };
    }
  }

  private generateRecommendedActions(trigger: AlertTrigger, context: any): SmartAlert['recommendedActions'] {
    const actions: SmartAlert['recommendedActions'] = [];
    
    switch (trigger.id) {
      case 'portfolio-drop':
        actions.push(
          {
            type: 'CALL_CLIENT',
            description: 'Appeler le client pour le rassurer et expliquer la situation',
            urgency: 'TODAY',
            estimatedDuration: 30,
            automatable: false
          },
          {
            type: 'REVIEW_STRATEGY',
            description: 'Réviser la stratégie d\'investissement',
            urgency: 'THIS_WEEK',
            estimatedDuration: 60,
            automatable: false
          }
        );
        break;
        
      case 'fiscal-opportunity':
        actions.push(
          {
            type: 'SEND_EMAIL',
            description: 'Envoyer proposition d\'optimisation fiscale',
            urgency: 'THIS_WEEK',
            estimatedDuration: 45,
            automatable: true
          },
          {
            type: 'SCHEDULE_MEETING',
            description: 'Planifier rendez-vous conseil fiscal',
            urgency: 'THIS_WEEK',
            estimatedDuration: 15,
            automatable: true
          }
        );
        break;
        
      case 'inactivity-alert':
        actions.push(
          {
            type: 'SEND_EMAIL',
            description: 'Email de prise de nouvelles',
            urgency: 'THIS_WEEK',
            estimatedDuration: 20,
            automatable: true
          }
        );
        break;
        
      case 'compliance-deadline':
        actions.push(
          {
            type: 'COMPLIANCE_CHECK',
            description: 'Vérification urgente des documents',
            urgency: 'IMMEDIATE',
            estimatedDuration: 30,
            automatable: false
          }
        );
        break;
        
      default:
        actions.push({
          type: 'REVIEW_STRATEGY',
          description: 'Révision de la situation client',
          urgency: 'THIS_WEEK',
          estimatedDuration: 30,
          automatable: false
        });
    }
    
    return actions;
  }

  private async enrichWithFrancis(alert: SmartAlert, context: any) {
    try {
      const prompt = `
Tu es Francis, expert en conseil patrimonial. Analyse cette alerte et fournis tes insights.

ALERTE:
- Type: ${alert.category}
- Client: ${context.clientProfile?.nom || 'Inconnu'}
- Situation: ${alert.message}

CONTEXTE CLIENT:
- Revenus: ${context.clientProfile?.revenus || 'Non spécifié'}
- Patrimoine: ${context.clientProfile?.patrimoine || 'Non spécifié'}

ANALYSE DEMANDÉE:
1. Évaluation de la criticité (0-100)
2. Raisonnement détaillé
3. Impact attendu (POSITIF/NÉGATIF/NEUTRE)
4. Valeur estimée de l'action
5. Nombre de cas similaires

Sois précis et actionnable.
`;

      const response = await fetch(`${this.francisApiUrl}/analyze_alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert: {
            title: alert.title,
            message: alert.message,
            category: alert.category
          },
          context: {
            clientProfile: context.clientProfile,
            marketConditions: context.marketConditions
          },
          prompt
        })
      });

      if (response.ok) {
        const francisAnalysis = await response.json();
        
        alert.francisInsights = {
          analysis: francisAnalysis.analysis || 'Analyse Francis non disponible',
          reasoning: francisAnalysis.reasoning || '',
          confidence: francisAnalysis.confidence || 75,
          similarCases: francisAnalysis.similarCases || 0,
          expectedImpact: francisAnalysis.expectedImpact || 'NEUTRAL',
          estimatedValue: francisAnalysis.estimatedValue
        };
      }
      
    } catch (error) {
      console.warn('Erreur enrichissement Francis:', error);
    }
  }

  private async broadcastAlert(alert: SmartAlert) {
    console.log('📢 DIFFUSION ALERTE:', alert.title);
    
    try {
      await this.saveAlert(alert);
      
      for (const [channelType, channel] of Array.from(this.channels.entries())) {
        if (channel.enabled && this.shouldUseChannel(channel, alert)) {
          await this.sendToChannel(channelType, channel, alert);
        }
      }
      
    } catch (error) {
      console.error('Erreur diffusion alerte:', error);
    }
  }

  private shouldUseChannel(channel: AlertChannel, alert: SmartAlert): boolean {
    const conditions = channel.config.conditions || ['ALL'];
    
    return conditions.includes('ALL') || 
           conditions.includes(alert.priority) ||
           conditions.includes(alert.category);
  }

  private async sendToChannel(channelType: string, channel: AlertChannel, alert: SmartAlert) {
    switch (channelType) {
      case 'DASHBOARD':
        console.log('📊 Alerte ajoutée au dashboard');
        break;
        
      case 'EMAIL':
        await this.sendEmailAlert(alert, channel);
        break;
        
      case 'PUSH':
        await this.sendPushNotification(alert);
        break;
        
      default:
        console.log(`Canal ${channelType} non implémenté`);
    }
  }

  private async sendEmailAlert(alert: SmartAlert, channel: AlertChannel) {
    console.log('📧 Email simulé:', alert.title);
  }

  private async sendPushNotification(alert: SmartAlert) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(alert.title, {
          body: alert.message,
          icon: '/favicon.ico',
          tag: alert.id
        });
      }
      
      console.log('🔔 Push notification envoyée');
      
    } catch (error) {
      console.error('Erreur push notification:', error);
    }
  }

  private mapTriggerToCategory(triggerType: AlertTrigger['type']): SmartAlert['category'] {
    const mapping: Record<string, SmartAlert['category']> = {
      'CLIENT_BEHAVIOR': 'CLIENT_ACTION',
      'MARKET_CHANGE': 'MARKET_INSIGHT',
      'FISCAL_UPDATE': 'FISCAL_OPPORTUNITY',
      'PORTFOLIO_RISK': 'RISK_WARNING',
      'OPPORTUNITY': 'BUSINESS_OPPORTUNITY',
      'COMPLIANCE': 'COMPLIANCE_REMINDER'
    };
    
    return mapping[triggerType] || 'MARKET_INSIGHT';
  }

  private getStoredClientProfiles(): any[] {
    try {
      const stored = localStorage.getItem('fiscal_client_profiles');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async saveAlert(alert: SmartAlert) {
    try {
      const alertData = {
        ...alert,
        createdAt: alert.createdAt.toISOString(),
        expiresAt: alert.expiresAt?.toISOString(),
        acknowledgedAt: alert.acknowledgedAt?.toISOString()
      };
      
      const existingAlerts = JSON.parse(localStorage.getItem('francis_alerts') || '[]');
      existingAlerts.push(alertData);
      localStorage.setItem('francis_alerts', JSON.stringify(existingAlerts));
      
      if (process.env.REACT_APP_SAVE_ALERTS === 'true') {
        await fetch(`${this.francisApiUrl}/alerts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertData)
        });
      }
      
    } catch (error) {
      console.error('Erreur sauvegarde alerte:', error);
    }
  }

  // API publique
  async getActiveAlerts(advisorId?: string): Promise<SmartAlert[]> {
    const now = new Date();
    return Array.from(this.alerts.values())
      .filter(alert => 
        !alert.acknowledged &&
        (!alert.expiresAt || alert.expiresAt > now) &&
        (!advisorId || alert.advisorId === advisorId)
      )
      .sort((a, b) => {
        const priorityOrder = { 'CRITIQUE': 4, 'HAUTE': 3, 'MOYENNE': 2, 'FAIBLE': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date();
      
      this.alerts.set(alertId, alert);
      await this.saveAlert(alert);
    }
  }

  async createCustomTrigger(trigger: Omit<AlertTrigger, 'id'>): Promise<string> {
    const triggerId = `custom-${Date.now()}`;
    const customTrigger: AlertTrigger = {
      ...trigger,
      id: triggerId
    };
    
    this.triggers.set(triggerId, customTrigger);
    
    const customTriggers = Array.from(this.triggers.values()).filter(t => t.id.startsWith('custom-'));
    localStorage.setItem('francis_custom_triggers', JSON.stringify(customTriggers));
    
    return triggerId;
  }

  async getAlertHistory(clientId?: string, days: number = 30): Promise<SmartAlert[]> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return Array.from(this.alerts.values())
      .filter(alert => 
        alert.createdAt > cutoffDate &&
        (!clientId || alert.clientId === clientId)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async simulateMarketAlert(): Promise<void> {
    const mockContext = {
      clientProfile: { id: 'demo-client', nom: 'Client Demo', revenus: 80000 },
      marketConditions: { volatility: { VIX: 28 } },
      portfolioPerformance: { daily: -0.06 }
    };
    
    const portfolioTrigger = this.triggers.get('portfolio-drop');
    if (portfolioTrigger) {
      await this.evaluateTrigger(portfolioTrigger, mockContext);
    }
  }
}

export default new ProactiveAlerts();

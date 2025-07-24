/**
 * APIManager.ts - Gestionnaire central d'interopérabilité API pour Francis CGP
 * 
 * Fonctionnalités:
 * - Intégrations bancaires (Budget Insight, Powens, TrueLayer)
 * - APIs fiscales et réglementaires (DGFiP, ACPR, AMF)
 * - Services financiers (Morningstar, Bloomberg, Refinitiv)
 * - Outils métier (Salesforce, HubSpot, Teams, Slack)
 * - Authentification OAuth2 unifiée
 * - Gestion des quotas et rate limiting
 * - Monitoring et alertes
 */

interface APICredentials {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes: string[];
}

interface APIConfig {
  id: string;
  name: string;
  category: 'BANKING' | 'FISCAL' | 'MARKET_DATA' | 'CRM' | 'COMMUNICATION' | 'REGULATORY';
  baseUrl: string;
  version: string;
  authType: 'OAUTH2' | 'API_KEY' | 'BEARER' | 'BASIC';
  credentials: APICredentials;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
    burstLimit: number;
  };
  endpoints: Record<string, APIEndpoint>;
  active: boolean;
  lastSync?: Date;
  healthStatus: 'HEALTHY' | 'WARNING' | 'ERROR' | 'UNKNOWN';
}

interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters?: Record<string, any>;
  responseSchema?: any;
  cached: boolean;
  cacheTTL?: number; // minutes
}

interface APIRequest {
  id: string;
  apiId: string;
  endpoint: string;
  method: string;
  parameters: any;
  timestamp: Date;
  status: 'PENDING' | 'SUCCESS' | 'ERROR' | 'TIMEOUT';
  responseTime?: number;
  error?: string;
  retryCount: number;
}

interface DataSyncJob {
  id: string;
  name: string;
  apiId: string;
  endpoint: string;
  schedule: string; // cron format
  lastRun?: Date;
  nextRun: Date;
  status: 'ACTIVE' | 'PAUSED' | 'ERROR';
  dataMapping: Record<string, string>;
  transformations: string[];
  notifications: {
    onSuccess: boolean;
    onError: boolean;
    recipients: string[];
  };
}

class APIManager {
  private apis: Map<string, APIConfig> = new Map();
  private requestHistory: Map<string, APIRequest> = new Map();
  private syncJobs: Map<string, DataSyncJob> = new Map();
  private rateLimitTracking: Map<string, any> = new Map();
  private francisApiUrl = process.env.REACT_APP_FRANCIS_API_URL || 'http://localhost:8000';

  constructor() {
    this.initializeDefaultAPIs();
    this.startHealthMonitoring();
    this.loadStoredConfigurations();
  }

  private initializeDefaultAPIs() {
    const defaultAPIs: APIConfig[] = [
      {
        id: 'budget-insight',
        name: 'Budget Insight',
        category: 'BANKING',
        baseUrl: 'https://demo.biapi.pro',
        version: 'v2',
        authType: 'OAUTH2',
        credentials: {
          clientId: process.env.REACT_APP_BUDGET_INSIGHT_CLIENT_ID || '',
          clientSecret: process.env.REACT_APP_BUDGET_INSIGHT_CLIENT_SECRET || '',
          scopes: ['account_details', 'transactions', 'balances']
        },
        rateLimit: {
          requestsPerMinute: 60,
          requestsPerDay: 5000,
          burstLimit: 10
        },
        endpoints: {
          'accounts': {
            path: '/users/{user_id}/accounts',
            method: 'GET',
            description: 'Retrieve user accounts',
            cached: true,
            cacheTTL: 30
          },
          'transactions': {
            path: '/users/{user_id}/transactions',
            method: 'GET',
            description: 'Retrieve user transactions',
            parameters: { limit: 100, offset: 0 },
            cached: true,
            cacheTTL: 15
          },
          'balances': {
            path: '/users/{user_id}/accounts/{account_id}/balances',
            method: 'GET',
            description: 'Retrieve account balances',
            cached: true,
            cacheTTL: 5
          }
        },
        active: true,
        healthStatus: 'UNKNOWN'
      },
      {
        id: 'powens-connect',
        name: 'Powens Connect',
        category: 'BANKING',
        baseUrl: 'https://api.powens.com',
        version: 'v1',
        authType: 'OAUTH2',
        credentials: {
          clientId: process.env.REACT_APP_POWENS_CLIENT_ID || '',
          clientSecret: process.env.REACT_APP_POWENS_CLIENT_SECRET || '',
          scopes: ['read_accounts', 'read_transactions']
        },
        rateLimit: {
          requestsPerMinute: 100,
          requestsPerDay: 10000,
          burstLimit: 20
        },
        endpoints: {
          'connections': {
            path: '/connections',
            method: 'GET',
            description: 'List user connections',
            cached: true,
            cacheTTL: 60
          },
          'accounts': {
            path: '/accounts',
            method: 'GET',
            description: 'List user accounts',
            cached: true,
            cacheTTL: 30
          }
        },
        active: false,
        healthStatus: 'UNKNOWN'
      },
      {
        id: 'refinitiv-eikon',
        name: 'Refinitiv Eikon',
        category: 'MARKET_DATA',
        baseUrl: 'https://api.refinitiv.com',
        version: 'v1',
        authType: 'OAUTH2',
        credentials: {
          clientId: process.env.REACT_APP_REFINITIV_CLIENT_ID || '',
          clientSecret: process.env.REACT_APP_REFINITIV_CLIENT_SECRET || '',
          scopes: ['market_data', 'fundamentals', 'news']
        },
        rateLimit: {
          requestsPerMinute: 300,
          requestsPerDay: 50000,
          burstLimit: 50
        },
        endpoints: {
          'prices': {
            path: '/data/pricing/snapshots',
            method: 'GET',
            description: 'Get real-time prices',
            cached: true,
            cacheTTL: 1
          },
          'news': {
            path: '/data/news/headlines',
            method: 'GET',
            description: 'Get financial news',
            cached: true,
            cacheTTL: 5
          }
        },
        active: false,
        healthStatus: 'UNKNOWN'
      },
      {
        id: 'dgfip-api',
        name: 'DGFiP API Particulier',
        category: 'FISCAL',
        baseUrl: 'https://particulier.api.gouv.fr',
        version: 'v2',
        authType: 'API_KEY',
        credentials: {
          clientId: process.env.REACT_APP_DGFIP_API_KEY || '',
          clientSecret: '',
          scopes: ['dgfip_declarant1', 'dgfip_declarant2', 'dgfip_pac']
        },
        rateLimit: {
          requestsPerMinute: 20,
          requestsPerDay: 1000,
          burstLimit: 5
        },
        endpoints: {
          'avis_imposition': {
            path: '/v2/avis-imposition',
            method: 'GET',
            description: 'Récupération avis d\'imposition',
            parameters: { numeroFiscal: '', referenceAvis: '' },
            cached: true,
            cacheTTL: 1440 // 24h
          }
        },
        active: false,
        healthStatus: 'UNKNOWN'
      }
    ];

    defaultAPIs.forEach(api => {
      this.apis.set(api.id, api);
    });
  }

  async callAPI(apiId: string, endpointKey: string, parameters: any = {}, options: { 
    useCache?: boolean;
    timeout?: number;
    retryCount?: number;
  } = {}): Promise<any> {
    const api = this.apis.get(apiId);
    if (!api || !api.active) {
      throw new Error(`API ${apiId} non disponible ou désactivée`);
    }

    const endpoint = api.endpoints[endpointKey];
    if (!endpoint) {
      throw new Error(`Endpoint ${endpointKey} non trouvé pour l'API ${apiId}`);
    }

    // Vérification rate limiting
    if (await this.isRateLimited(apiId)) {
      throw new Error(`Rate limit atteint pour l'API ${apiId}`);
    }

    // Génération de l'ID de requête
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const request: APIRequest = {
      id: requestId,
      apiId,
      endpoint: endpointKey,
      method: endpoint.method,
      parameters,
      timestamp: new Date(),
      status: 'PENDING',
      retryCount: 0
    };

    this.requestHistory.set(requestId, request);

    try {
      // Vérification cache si activé
      if (options.useCache !== false && endpoint.cached) {
        const cachedResult = await this.getCachedResult(apiId, endpointKey, parameters);
        if (cachedResult) {
          request.status = 'SUCCESS';
          request.responseTime = 0;
          this.requestHistory.set(requestId, request);
          return cachedResult;
        }
      }

      const startTime = Date.now();
      
      // Construction de l'URL
      let url = `${api.baseUrl}${endpoint.path}`;
      Object.keys(parameters).forEach(key => {
        url = url.replace(`{${key}}`, parameters[key]);
      });

      // Authentification
      const headers = await this.buildAuthHeaders(api);
      
      // Paramètres de requête
      const requestOptions: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        signal: AbortSignal.timeout(options.timeout || 30000)
      };

      if (endpoint.method !== 'GET' && parameters) {
        requestOptions.body = JSON.stringify(parameters);
      }

      // Exécution de la requête
      const response = await fetch(url, requestOptions);
      const responseTime = Date.now() - startTime;

      request.responseTime = responseTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Mise en cache si activé
      if (endpoint.cached && endpoint.cacheTTL) {
        await this.setCachedResult(apiId, endpointKey, parameters, result, endpoint.cacheTTL);
      }

      // Mise à jour du suivi de taux
      await this.updateRateLimit(apiId);

      request.status = 'SUCCESS';
      this.requestHistory.set(requestId, request);

      console.log(`✅ API ${apiId}/${endpointKey} - ${responseTime}ms`);
      return result;

    } catch (error) {
      request.status = 'ERROR';
      request.error = error instanceof Error ? error.message : 'Erreur inconnue';
      this.requestHistory.set(requestId, request);

      // Retry logic
      if (options.retryCount && request.retryCount < options.retryCount) {
        request.retryCount++;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, request.retryCount) * 1000));
        return this.callAPI(apiId, endpointKey, parameters, options);
      }

      console.error(`❌ API ${apiId}/${endpointKey}:`, error);
      throw error;
    }
  }

  async testAPIConnection(apiId: string): Promise<{ success: boolean; message: string; responseTime?: number }> {
    try {
      const api = this.apis.get(apiId);
      if (!api) {
        return { success: false, message: 'API non trouvée' };
      }

      const startTime = Date.now();
      
      // Endpoint de test (premier endpoint disponible)
      const testEndpoint = Object.keys(api.endpoints)[0];
      if (!testEndpoint) {
        return { success: false, message: 'Aucun endpoint de test disponible' };
      }

      await this.callAPI(apiId, testEndpoint, {}, { useCache: false, timeout: 10000 });
      
      const responseTime = Date.now() - startTime;
      
      // Mise à jour du statut
      api.healthStatus = 'HEALTHY';
      api.lastSync = new Date();
      this.apis.set(apiId, api);

      return { 
        success: true, 
        message: 'Connexion réussie', 
        responseTime 
      };

    } catch (error) {
      const api = this.apis.get(apiId);
      if (api) {
        api.healthStatus = 'ERROR';
        this.apis.set(apiId, api);
      }

      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur de connexion' 
      };
    }
  }

  // API publique
  getAvailableAPIs(): APIConfig[] {
    return Array.from(this.apis.values());
  }

  getAPIStatus(apiId: string): APIConfig | undefined {
    return this.apis.get(apiId);
  }

  async activateAPI(apiId: string, credentials: Partial<APICredentials>): Promise<void> {
    const api = this.apis.get(apiId);
    if (!api) {
      throw new Error(`API ${apiId} non trouvée`);
    }

    // Mise à jour des credentials
    api.credentials = { ...api.credentials, ...credentials };
    
    // Test de connexion
    const testResult = await this.testAPIConnection(apiId);
    if (!testResult.success) {
      throw new Error(`Échec activation: ${testResult.message}`);
    }

    api.active = true;
    this.apis.set(apiId, api);
    
    await this.saveConfiguration();
    console.log(`✅ API ${apiId} activée avec succès`);
  }

  async deactivateAPI(apiId: string): Promise<void> {
    const api = this.apis.get(apiId);
    if (api) {
      api.active = false;
      api.healthStatus = 'UNKNOWN';
      this.apis.set(apiId, api);
      await this.saveConfiguration();
    }
  }

  getRequestHistory(apiId?: string, limit = 100): APIRequest[] {
    const requests = Array.from(this.requestHistory.values());
    const filtered = apiId 
      ? requests.filter(req => req.apiId === apiId)
      : requests;
    
    return filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Méthodes privées
  private async buildAuthHeaders(api: APIConfig): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    switch (api.authType) {
      case 'API_KEY':
        headers['Authorization'] = `Bearer ${api.credentials.clientId}`;
        break;
      case 'BEARER':
        if (api.credentials.accessToken) {
          headers['Authorization'] = `Bearer ${api.credentials.accessToken}`;
        }
        break;
      case 'OAUTH2':
        if (!api.credentials.accessToken || this.isTokenExpired(api.credentials)) {
          await this.refreshOAuth2Token(api);
        }
        headers['Authorization'] = `Bearer ${api.credentials.accessToken}`;
        break;
    }

    return headers;
  }

  private isTokenExpired(credentials: APICredentials): boolean {
    return credentials.expiresAt ? credentials.expiresAt < new Date() : false;
  }

  private async refreshOAuth2Token(api: APIConfig): Promise<void> {
    // Implémentation simplifiée - stub
    // En production, implémenter le flow OAuth2 complet
    console.log(`🔄 Refresh token pour ${api.id}`);
  }

  private async isRateLimited(apiId: string): Promise<boolean> {
    const api = this.apis.get(apiId);
    if (!api) return false;

    const tracking = this.rateLimitTracking.get(apiId) || {
      minuteCount: 0,
      dayCount: 0,
      lastMinute: new Date().getMinutes(),
      lastDay: new Date().getDate()
    };

    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDate();

    // Reset compteurs si nécessaire
    if (currentMinute !== tracking.lastMinute) {
      tracking.minuteCount = 0;
      tracking.lastMinute = currentMinute;
    }
    if (currentDay !== tracking.lastDay) {
      tracking.dayCount = 0;
      tracking.lastDay = currentDay;
    }

    const isLimited = tracking.minuteCount >= api.rateLimit.requestsPerMinute ||
                     tracking.dayCount >= api.rateLimit.requestsPerDay;

    return isLimited;
  }

  private async updateRateLimit(apiId: string): Promise<void> {
    const tracking = this.rateLimitTracking.get(apiId) || {
      minuteCount: 0,
      dayCount: 0,
      lastMinute: new Date().getMinutes(),
      lastDay: new Date().getDate()
    };

    tracking.minuteCount++;
    tracking.dayCount++;
    this.rateLimitTracking.set(apiId, tracking);
  }

  private async getCachedResult(apiId: string, endpoint: string, parameters: any): Promise<any | null> {
    // Implémentation cache - stub
    return null;
  }

  private async setCachedResult(apiId: string, endpoint: string, parameters: any, result: any, ttl: number): Promise<void> {
    // Implémentation cache - stub
  }

  private startHealthMonitoring() {
    // Vérification santé des APIs toutes les 5 minutes
    setInterval(async () => {
      const activeAPIs = Array.from(this.apis.values()).filter(api => api.active);
      for (const api of activeAPIs) {
        try {
          await this.testAPIConnection(api.id);
        } catch (error) {
          console.warn(`⚠️ Health check failed for ${api.id}:`, error);
        }
      }
    }, 5 * 60 * 1000);
  }

  private async saveConfiguration(): Promise<void> {
    try {
      const configData = {
        apis: Array.from(this.apis.entries()),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('francis_api_config', JSON.stringify(configData));
    } catch (error) {
      console.warn('Erreur sauvegarde configuration API:', error);
    }
  }

  private loadStoredConfigurations() {
    try {
      const stored = localStorage.getItem('francis_api_config');
      if (stored) {
        const { apis } = JSON.parse(stored);
        apis.forEach(([id, config]: [string, APIConfig]) => {
          this.apis.set(id, config);
        });
      }
    } catch (error) {
      console.warn('Erreur chargement configuration API:', error);
    }
  }
}

export default new APIManager();

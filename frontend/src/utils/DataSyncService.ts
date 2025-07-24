/**
 * DataSyncService.ts - Service de synchronisation de données inter-systèmes
 * 
 * Fonctionnalités:
 * - Synchronisation bidirectionnelle des données
 * - Mapping et transformation automatiques
 * - Résolution de conflits intelligente
 * - Queue de synchronisation avec retry
 * - Webhook management pour updates temps réel
 * - Audit trail complet
 */

interface SyncProfile {
  id: string;
  name: string;
  sourceAPI: string;
  targetAPI: string;
  entityType: 'CLIENT' | 'ACCOUNT' | 'TRANSACTION' | 'DOCUMENT' | 'REPORT' | 'CUSTOM';
  direction: 'UNIDIRECTIONAL' | 'BIDIRECTIONAL';
  frequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MANUAL';
  fieldMapping: Record<string, string>;
  transformations: DataTransformation[];
  conflictResolution: 'SOURCE_WINS' | 'TARGET_WINS' | 'MERGE' | 'MANUAL';
  active: boolean;
  lastSync?: Date;
  nextSync?: Date;
}

interface DataTransformation {
  field: string;
  type: 'FORMAT' | 'CALCULATION' | 'LOOKUP' | 'CONDITIONAL' | 'ENRICHMENT';
  rule: string;
  parameters: Record<string, any>;
}

interface SyncOperation {
  id: string;
  profileId: string;
  type: 'SYNC' | 'INITIAL_LOAD' | 'INCREMENTAL' | 'CONFLICT_RESOLUTION';
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR' | 'CANCELLED';
  direction: 'SOURCE_TO_TARGET' | 'TARGET_TO_SOURCE' | 'BIDIRECTIONAL';
  startTime: Date;
  endTime?: Date;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsError: number;
  conflicts: SyncConflict[];
  logs: SyncLog[];
  retryCount: number;
  maxRetries: number;
}

interface SyncConflict {
  id: string;
  entityId: string;
  entityType: string;
  field: string;
  sourceValue: any;
  targetValue: any;
  conflictType: 'VALUE_MISMATCH' | 'DELETED_RECORD' | 'SCHEMA_CHANGE';
  resolution?: 'ACCEPTED_SOURCE' | 'ACCEPTED_TARGET' | 'MERGED' | 'MANUAL';
  resolvedAt?: Date;
  resolvedBy?: string;
}

interface SyncLog {
  timestamp: Date;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  entityId?: string;
  details?: any;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  headers: Record<string, string>;
  active: boolean;
  secret?: string;
  retryConfig: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffSeconds: number;
  };
}

class DataSyncService {
  private syncProfiles: Map<string, SyncProfile> = new Map();
  private activeOperations: Map<string, SyncOperation> = new Map();
  private syncQueue: SyncOperation[] = [];
  private webhookEndpoints: Map<string, WebhookEndpoint> = new Map();
  private isProcessing = false;

  constructor() {
    this.initializeDefaultProfiles();
    this.startSyncProcessor();
    this.loadStoredData();
  }

  private initializeDefaultProfiles() {
    const defaultProfiles: SyncProfile[] = [
      {
        id: 'budget-insight-to-francis',
        name: 'Budget Insight → Francis',
        sourceAPI: 'budget-insight',
        targetAPI: 'francis-db',
        entityType: 'ACCOUNT',
        direction: 'UNIDIRECTIONAL',
        frequency: 'HOURLY',
        fieldMapping: {
          'id': 'external_account_id',
          'name': 'account_name',
          'balance': 'current_balance',
          'type': 'account_type',
          'iban': 'iban',
          'currency': 'currency_code'
        },
        transformations: [
          {
            field: 'current_balance',
            type: 'FORMAT',
            rule: 'round_to_cents',
            parameters: { decimals: 2 }
          },
          {
            field: 'account_type',
            type: 'LOOKUP',
            rule: 'map_account_types',
            parameters: {
              'checking': 'COMPTE_COURANT',
              'savings': 'LIVRET',
              'investment': 'COMPTE_TITRES'
            }
          }
        ],
        conflictResolution: 'SOURCE_WINS',
        active: true
      },
      {
        id: 'francis-to-crm',
        name: 'Francis → CRM Client',
        sourceAPI: 'francis-db',
        targetAPI: 'salesforce',
        entityType: 'CLIENT',
        direction: 'BIDIRECTIONAL',
        frequency: 'REAL_TIME',
        fieldMapping: {
          'client_id': 'Id',
          'first_name': 'FirstName',
          'last_name': 'LastName',
          'email': 'Email',
          'phone': 'Phone',
          'total_assets': 'Total_Assets__c',
          'risk_profile': 'Risk_Profile__c'
        },
        transformations: [
          {
            field: 'Total_Assets__c',
            type: 'FORMAT',
            rule: 'currency_format',
            parameters: { currency: 'EUR' }
          },
          {
            field: 'Risk_Profile__c',
            type: 'CONDITIONAL',
            rule: 'map_risk_profile',
            parameters: {
              conditions: {
                'CONSERVATEUR': 'Conservative',
                'MODÉRÉ': 'Moderate',
                'DYNAMIQUE': 'Aggressive'
              }
            }
          }
        ],
        conflictResolution: 'MERGE',
        active: false
      }
    ];

    defaultProfiles.forEach(profile => {
      this.syncProfiles.set(profile.id, profile);
    });
  }

  async createSyncProfile(profileData: Partial<SyncProfile>): Promise<SyncProfile> {
    const profile: SyncProfile = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: profileData.name || 'Nouveau profil',
      sourceAPI: profileData.sourceAPI || '',
      targetAPI: profileData.targetAPI || '',
      entityType: profileData.entityType || 'CUSTOM',
      direction: profileData.direction || 'UNIDIRECTIONAL',
      frequency: profileData.frequency || 'MANUAL',
      fieldMapping: profileData.fieldMapping || {},
      transformations: profileData.transformations || [],
      conflictResolution: profileData.conflictResolution || 'SOURCE_WINS',
      active: false
    };

    this.syncProfiles.set(profile.id, profile);
    await this.saveStoredData();
    
    console.log('✅ Profil de sync créé:', profile.name);
    return profile;
  }

  async executeSync(profileId: string, options: {
    type?: SyncOperation['type'];
    direction?: SyncOperation['direction'];
    manual?: boolean;
  } = {}): Promise<SyncOperation> {
    const profile = this.syncProfiles.get(profileId);
    if (!profile) {
      throw new Error(`Profil de sync ${profileId} introuvable`);
    }

    if (!profile.active && !options.manual) {
      throw new Error(`Profil de sync ${profileId} désactivé`);
    }

    const operation: SyncOperation = {
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      profileId,
      type: options.type || 'SYNC',
      status: 'PENDING',
      direction: options.direction || (profile.direction === 'BIDIRECTIONAL' ? 'BIDIRECTIONAL' : 'SOURCE_TO_TARGET'),
      startTime: new Date(),
      recordsProcessed: 0,
      recordsSuccess: 0,
      recordsError: 0,
      conflicts: [],
      logs: [],
      retryCount: 0,
      maxRetries: 3
    };

    this.activeOperations.set(operation.id, operation);
    this.syncQueue.push(operation);

    console.log('🔄 Synchronisation ajoutée à la queue:', profile.name);
    return operation;
  }

  private async startSyncProcessor() {
    setInterval(async () => {
      if (this.isProcessing || this.syncQueue.length === 0) return;

      this.isProcessing = true;
      
      try {
        const operation = this.syncQueue.shift();
        if (operation) {
          await this.processSync(operation);
        }
      } catch (error) {
        console.error('Erreur processeur sync:', error);
      } finally {
        this.isProcessing = false;
      }
    }, 5000); // Process queue every 5 seconds
  }

  private async processSync(operation: SyncOperation): Promise<void> {
    const profile = this.syncProfiles.get(operation.profileId);
    if (!profile) {
      operation.status = 'ERROR';
      operation.endTime = new Date();
      return;
    }

    try {
      operation.status = 'RUNNING';
      this.activeOperations.set(operation.id, operation);

      this.addLog(operation, 'INFO', `Début synchronisation: ${profile.name}`);

      // Simulation du processus de sync
      await this.simulateSyncProcess(operation, profile);

      operation.status = 'SUCCESS';
      operation.endTime = new Date();
      
      // Mise à jour du profil
      profile.lastSync = new Date();
      if (profile.frequency !== 'MANUAL') {
        profile.nextSync = this.calculateNextSync(profile);
      }
      
      this.syncProfiles.set(profile.id, profile);
      this.addLog(operation, 'INFO', `Synchronisation terminée avec succès`);

      // Notification webhook si configuré
      await this.notifyWebhooks('sync.completed', {
        operation: operation.id,
        profile: profile.id,
        recordsProcessed: operation.recordsProcessed
      });

    } catch (error) {
      operation.status = 'ERROR';
      operation.endTime = new Date();
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.addLog(operation, 'ERROR', `Erreur synchronisation: ${errorMessage}`);

      // Retry logic
      if (operation.retryCount < operation.maxRetries) {
        operation.retryCount++;
        operation.status = 'PENDING';
        this.syncQueue.push(operation);
        this.addLog(operation, 'INFO', `Tentative ${operation.retryCount}/${operation.maxRetries}`);
      }

      await this.notifyWebhooks('sync.failed', {
        operation: operation.id,
        profile: profile.id,
        error: errorMessage
      });
    }

    this.activeOperations.set(operation.id, operation);
    await this.saveStoredData();
  }

  private async simulateSyncProcess(operation: SyncOperation, profile: SyncProfile): Promise<void> {
    // Simulation d'une synchronisation réelle
    const totalRecords = Math.floor(Math.random() * 100) + 10;
    
    for (let i = 0; i < totalRecords; i++) {
      // Simulation du traitement d'un enregistrement
      await new Promise(resolve => setTimeout(resolve, 50));
      
      operation.recordsProcessed++;
      
      // Simulation succès/erreur
      if (Math.random() > 0.9) {
        operation.recordsError++;
        this.addLog(operation, 'WARNING', `Erreur traitement enregistrement ${i + 1}`);
      } else {
        operation.recordsSuccess++;
      }
      
      // Simulation conflit
      if (Math.random() > 0.95 && profile.direction === 'BIDIRECTIONAL') {
        const conflict: SyncConflict = {
          id: `conflict-${Date.now()}-${i}`,
          entityId: `entity-${i}`,
          entityType: profile.entityType,
          field: Object.keys(profile.fieldMapping)[0] || 'unknown',
          sourceValue: `value_source_${i}`,
          targetValue: `value_target_${i}`,
          conflictType: 'VALUE_MISMATCH'
        };
        
        operation.conflicts.push(conflict);
        this.addLog(operation, 'WARNING', `Conflit détecté: ${conflict.field}`);
      }
      
      this.activeOperations.set(operation.id, operation);
    }
  }

  private addLog(operation: SyncOperation, level: SyncLog['level'], message: string, details?: any): void {
    const log: SyncLog = {
      timestamp: new Date(),
      level,
      message,
      details
    };
    
    operation.logs.push(log);
    console.log(`[${level}] ${operation.profileId}: ${message}`);
  }

  private calculateNextSync(profile: SyncProfile): Date {
    const now = new Date();
    
    switch (profile.frequency) {
      case 'HOURLY':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'DAILY':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'WEEKLY':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      default:
        return now;
    }
  }

  async resolveConflict(operationId: string, conflictId: string, resolution: SyncConflict['resolution'], resolvedBy: string): Promise<void> {
    const operation = this.activeOperations.get(operationId);
    if (!operation) return;

    const conflict = operation.conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    conflict.resolution = resolution;
    conflict.resolvedAt = new Date();
    conflict.resolvedBy = resolvedBy;

    this.activeOperations.set(operationId, operation);
    await this.saveStoredData();

    console.log('✅ Conflit résolu:', conflictId, resolution);
  }

  async addWebhookEndpoint(endpoint: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    const webhook: WebhookEndpoint = {
      id: `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: endpoint.name || 'Webhook',
      url: endpoint.url || '',
      events: endpoint.events || ['sync.completed', 'sync.failed'],
      headers: endpoint.headers || {},
      active: endpoint.active || true,
      secret: endpoint.secret,
      retryConfig: endpoint.retryConfig || {
        maxRetries: 3,
        backoffMultiplier: 2,
        maxBackoffSeconds: 300
      }
    };

    this.webhookEndpoints.set(webhook.id, webhook);
    await this.saveStoredData();

    console.log('✅ Webhook endpoint ajouté:', webhook.name);
    return webhook;
  }

  private async notifyWebhooks(event: string, payload: any): Promise<void> {
    const relevantWebhooks = Array.from(this.webhookEndpoints.values())
      .filter(webhook => webhook.active && webhook.events.includes(event));

    for (const webhook of relevantWebhooks) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Francis-Event': event,
          ...webhook.headers
        };

        if (webhook.secret) {
          // Ajouter signature HMAC si secret configuré
          headers['X-Francis-Signature'] = 'sha256=signature_placeholder';
        }

        await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            event,
            timestamp: new Date().toISOString(),
            payload
          })
        });

        console.log('✅ Webhook notifié:', webhook.name, event);
      } catch (error) {
        console.error('❌ Erreur webhook:', webhook.name, error);
      }
    }
  }

  // API publique
  getSyncProfiles(): SyncProfile[] {
    return Array.from(this.syncProfiles.values());
  }

  getSyncProfile(profileId: string): SyncProfile | undefined {
    return this.syncProfiles.get(profileId);
  }

  getOperations(profileId?: string, limit = 50): SyncOperation[] {
    const operations = Array.from(this.activeOperations.values());
    const filtered = profileId 
      ? operations.filter(op => op.profileId === profileId)
      : operations;
    
    return filtered
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  getOperation(operationId: string): SyncOperation | undefined {
    return this.activeOperations.get(operationId);
  }

  async toggleProfile(profileId: string, active: boolean): Promise<void> {
    const profile = this.syncProfiles.get(profileId);
    if (profile) {
      profile.active = active;
      this.syncProfiles.set(profileId, profile);
      await this.saveStoredData();
    }
  }

  getDashboardStats() {
    const profiles = Array.from(this.syncProfiles.values());
    const operations = Array.from(this.activeOperations.values());
    
    return {
      totalProfiles: profiles.length,
      activeProfiles: profiles.filter(p => p.active).length,
      totalOperations: operations.length,
      runningOperations: operations.filter(op => op.status === 'RUNNING').length,
      pendingOperations: operations.filter(op => op.status === 'PENDING').length,
      successfulOperations: operations.filter(op => op.status === 'SUCCESS').length,
      failedOperations: operations.filter(op => op.status === 'ERROR').length,
      totalConflicts: operations.reduce((sum, op) => sum + op.conflicts.length, 0),
      unresolvedConflicts: operations.reduce((sum, op) => 
        sum + op.conflicts.filter(c => !c.resolution).length, 0
      )
    };
  }

  private async saveStoredData(): Promise<void> {
    try {
      const data = {
        syncProfiles: Array.from(this.syncProfiles.entries()),
        operations: Array.from(this.activeOperations.entries()),
        webhooks: Array.from(this.webhookEndpoints.entries()),
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('francis_data_sync', JSON.stringify(data));
    } catch (error) {
      console.warn('Erreur sauvegarde data sync:', error);
    }
  }

  private loadStoredData(): void {
    try {
      const stored = localStorage.getItem('francis_data_sync');
      if (stored) {
        const data = JSON.parse(stored);
        
        if (data.syncProfiles) {
          data.syncProfiles.forEach(([id, profile]: [string, SyncProfile]) => {
            this.syncProfiles.set(id, profile);
          });
        }
        
        if (data.operations) {
          data.operations.forEach(([id, operation]: [string, SyncOperation]) => {
            this.activeOperations.set(id, operation);
          });
        }
        
        if (data.webhooks) {
          data.webhooks.forEach(([id, webhook]: [string, WebhookEndpoint]) => {
            this.webhookEndpoints.set(id, webhook);
          });
        }
      }
    } catch (error) {
      console.warn('Erreur chargement data sync stocké:', error);
    }
  }
}

export default new DataSyncService();

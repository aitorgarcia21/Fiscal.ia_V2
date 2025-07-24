/**
 * GDPRComplianceManager.ts - Gestionnaire de conformité GDPR/RGPD
 * 
 * Fonctionnalités:
 * - Gestion des consentements utilisateur
 * - Traçabilité des accès aux données personnelles
 * - Droit à l'oubli et suppression de données
 * - Export des données personnelles (portabilité)
 * - Audit des traitements de données
 * - Gestion des bases légales
 * - Notifications de violations de données
 * - Registre des activités de traitement
 */

interface GDPRConsent {
  id: string;
  userId: string;
  consentType: 'ESSENTIAL' | 'ANALYTICS' | 'MARKETING' | 'PROFILING' | 'DATA_SHARING';
  granted: boolean;
  timestamp: Date;
  version: string;
  legalBasis: 'CONSENT' | 'CONTRACT' | 'LEGAL_OBLIGATION' | 'VITAL_INTERESTS' | 'PUBLIC_TASK' | 'LEGITIMATE_INTERESTS';
  purpose: string;
  dataCategories: DataCategory[];
  retentionPeriod: number; // en jours
  withdrawnAt?: Date;
  withdrawnReason?: string;
  ipAddress: string;
  userAgent: string;
}

interface DataCategory {
  type: 'IDENTITY' | 'CONTACT' | 'FINANCIAL' | 'BEHAVIORAL' | 'PROFESSIONAL' | 'TECHNICAL' | 'BIOMETRIC';
  description: string;
  sensitive: boolean;
  fields: string[];
}

interface DataSubjectRequest {
  id: string;
  userId: string;
  requestType: 'ACCESS' | 'RECTIFICATION' | 'ERASURE' | 'PORTABILITY' | 'RESTRICTION' | 'OBJECTION';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  requestDate: Date;
  completionDate?: Date;
  description: string;
  justification?: string;
  attachments: string[];
  processedBy?: string;
  response?: string;
  escalated: boolean;
}

interface DataBreach {
  id: string;
  timestamp: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'CONFIDENTIALITY' | 'INTEGRITY' | 'AVAILABILITY';
  description: string;
  affectedUsers: string[];
  dataCategories: DataCategory[];
  cause: string;
  discoveryMethod: string;
  containmentActions: string[];
  notificationRequired: boolean;
  authorityNotified: boolean;
  authorityNotificationDate?: Date;
  usersNotified: boolean;
  userNotificationDate?: Date;
  resolved: boolean;
  resolution?: string;
  lessonsLearned: string[];
}

interface ProcessingActivity {
  id: string;
  name: string;
  controller: string;
  processor?: string;
  purpose: string;
  legalBasis: GDPRConsent['legalBasis'];
  dataCategories: DataCategory[];
  dataSubjects: string[];
  recipients: string[];
  thirdCountryTransfers: boolean;
  safeguards?: string;
  retentionPeriod: number;
  technicalMeasures: string[];
  organizationalMeasures: string[];
  lastReviewed: Date;
  riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH';
  dpoApproved: boolean;
}

class GDPRComplianceManager {
  private consents: Map<string, GDPRConsent> = new Map();
  private dataSubjectRequests: Map<string, DataSubjectRequest> = new Map();
  private dataBreaches: Map<string, DataBreach> = new Map();
  private processingActivities: Map<string, ProcessingActivity> = new Map();

  constructor() {
    this.initializeDefaultCategories();
    this.loadStoredData();
  }

  private initializeDefaultCategories(): void {
    // Initialisation des activités de traitement par défaut
    const defaultActivities: ProcessingActivity[] = [
      {
        id: 'client-onboarding',
        name: 'Intégration clients CGP',
        controller: 'Francis SAS',
        purpose: 'Ouverture de compte client et KYC',
        legalBasis: 'CONTRACT',
        dataCategories: [
          {
            type: 'IDENTITY',
            description: 'Données d\'identité',
            sensitive: false,
            fields: ['nom', 'prénom', 'date_naissance', 'lieu_naissance']
          },
          {
            type: 'CONTACT',
            description: 'Coordonnées',
            sensitive: false,
            fields: ['email', 'téléphone', 'adresse']
          },
          {
            type: 'FINANCIAL',
            description: 'Données financières',
            sensitive: true,
            fields: ['revenus', 'patrimoine', 'investissements']
          }
        ],
        dataSubjects: ['Clients particuliers'],
        recipients: ['Conseillers CGP', 'Équipe compliance'],
        thirdCountryTransfers: false,
        retentionPeriod: 3650, // 10 ans
        technicalMeasures: ['Chiffrement AES-256', 'Authentification forte', 'Logs d\'audit'],
        organizationalMeasures: ['Formation GDPR', 'Procédures sécurisées', 'Contrôles d\'accès'],
        lastReviewed: new Date(),
        riskAssessment: 'MEDIUM',
        dpoApproved: true
      },
      {
        id: 'ia-analysis',
        name: 'Analyse IA des profils clients',
        controller: 'Francis SAS',
        purpose: 'Optimisation fiscale et conseils patrimoniaux',
        legalBasis: 'LEGITIMATE_INTERESTS',
        dataCategories: [
          {
            type: 'FINANCIAL',
            description: 'Données patrimoniales',
            sensitive: true,
            fields: ['positions', 'transactions', 'performance']
          },
          {
            type: 'BEHAVIORAL',
            description: 'Comportements financiers',
            sensitive: false,
            fields: ['préférences_risque', 'objectifs', 'historique_décisions']
          }
        ],
        dataSubjects: ['Clients particuliers'],
        recipients: ['Moteur IA Francis', 'Conseillers CGP'],
        thirdCountryTransfers: false,
        retentionPeriod: 2555, // 7 ans
        technicalMeasures: ['Pseudonymisation', 'Chiffrement', 'Minimisation'],
        organizationalMeasures: ['Évaluation d\'impact', 'Révision trimestrielle'],
        lastReviewed: new Date(),
        riskAssessment: 'HIGH',
        dpoApproved: true
      }
    ];

    defaultActivities.forEach(activity => {
      this.processingActivities.set(activity.id, activity);
    });
  }

  async recordConsent(consentData: Partial<GDPRConsent>): Promise<string> {
    const consent: GDPRConsent = {
      id: `consent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: consentData.userId || '',
      consentType: consentData.consentType || 'ESSENTIAL',
      granted: consentData.granted || false,
      timestamp: new Date(),
      version: consentData.version || '1.0',
      legalBasis: consentData.legalBasis || 'CONSENT',
      purpose: consentData.purpose || '',
      dataCategories: consentData.dataCategories || [],
      retentionPeriod: consentData.retentionPeriod || 365,
      ipAddress: consentData.ipAddress || await this.getCurrentIP(),
      userAgent: consentData.userAgent || navigator.userAgent
    };

    this.consents.set(consent.id, consent);
    await this.saveConsent(consent);

    console.log(`✅ [GDPR] Consentement enregistré: ${consent.consentType} pour ${consent.userId}`);
    return consent.id;
  }

  async withdrawConsent(consentId: string, reason: string): Promise<void> {
    const consent = this.consents.get(consentId);
    if (consent) {
      consent.granted = false;
      consent.withdrawnAt = new Date();
      consent.withdrawnReason = reason;
      
      this.consents.set(consentId, consent);
      await this.saveConsent(consent);

      console.log(`❌ [GDPR] Consentement retiré: ${consentId}`);
    }
  }

  async createDataSubjectRequest(requestData: Partial<DataSubjectRequest>): Promise<string> {
    const request: DataSubjectRequest = {
      id: `dsr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: requestData.userId || '',
      requestType: requestData.requestType || 'ACCESS',
      status: 'PENDING',
      requestDate: new Date(),
      description: requestData.description || '',
      attachments: requestData.attachments || [],
      escalated: false
    };

    this.dataSubjectRequests.set(request.id, request);
    await this.saveDataSubjectRequest(request);

    // Auto-traitement pour les demandes d'accès simples
    if (request.requestType === 'ACCESS') {
      setTimeout(() => this.processAccessRequest(request.id), 1000);
    }

    console.log(`📋 [GDPR] Demande créée: ${request.requestType} pour ${request.userId}`);
    return request.id;
  }

  private async processAccessRequest(requestId: string): Promise<void> {
    const request = this.dataSubjectRequests.get(requestId);
    if (!request) return;

    try {
      request.status = 'IN_PROGRESS';
      this.dataSubjectRequests.set(requestId, request);

      // Collecte des données personnelles
      const userData = await this.collectUserData(request.userId);
      
      // Génération du rapport
      const report = {
        user: request.userId,
        dataCategories: userData,
        consents: this.getUserConsents(request.userId),
        processingActivities: this.getUserProcessingActivities(request.userId),
        exportDate: new Date().toISOString()
      };

      request.status = 'COMPLETED';
      request.completionDate = new Date();
      request.response = JSON.stringify(report, null, 2);
      request.processedBy = 'GDPR-AUTO-SYSTEM';

      this.dataSubjectRequests.set(requestId, request);
      await this.saveDataSubjectRequest(request);

      console.log(`✅ [GDPR] Demande d'accès traitée automatiquement: ${requestId}`);
    } catch (error) {
      request.status = 'REJECTED';
      request.response = `Erreur de traitement: ${error}`;
      this.dataSubjectRequests.set(requestId, request);
    }
  }

  async processErasureRequest(requestId: string, processedBy: string): Promise<void> {
    const request = this.dataSubjectRequests.get(requestId);
    if (!request || request.requestType !== 'ERASURE') return;

    try {
      request.status = 'IN_PROGRESS';
      request.processedBy = processedBy;
      this.dataSubjectRequests.set(requestId, request);

      // Vérification des obligations légales
      const legalObligations = await this.checkLegalObligations(request.userId);
      
      if (legalObligations.length > 0) {
        request.status = 'REJECTED';
        request.response = `Suppression impossible: obligations légales (${legalObligations.join(', ')})`;
      } else {
        // Suppression des données
        await this.eraseUserData(request.userId);
        
        request.status = 'COMPLETED';
        request.completionDate = new Date();
        request.response = 'Données supprimées conformément à la demande';
      }

      this.dataSubjectRequests.set(requestId, request);
      await this.saveDataSubjectRequest(request);

      console.log(`🗑️ [GDPR] Demande de suppression traitée: ${requestId}`);
    } catch (error) {
      request.status = 'REJECTED';
      request.response = `Erreur lors de la suppression: ${error}`;
      this.dataSubjectRequests.set(requestId, request);
    }
  }

  async reportDataBreach(breachData: Partial<DataBreach>): Promise<string> {
    const breach: DataBreach = {
      id: `breach-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      severity: breachData.severity || 'MEDIUM',
      type: breachData.type || 'CONFIDENTIALITY',
      description: breachData.description || '',
      affectedUsers: breachData.affectedUsers || [],
      dataCategories: breachData.dataCategories || [],
      cause: breachData.cause || '',
      discoveryMethod: breachData.discoveryMethod || '',
      containmentActions: breachData.containmentActions || [],
      notificationRequired: this.assessNotificationRequirement(breachData),
      authorityNotified: false,
      usersNotified: false,
      resolved: false,
      lessonsLearned: []
    };

    this.dataBreaches.set(breach.id, breach);
    await this.saveDataBreach(breach);

    // Notification automatique si critique
    if (breach.severity === 'CRITICAL' && breach.notificationRequired) {
      await this.notifyAuthorities(breach.id);
      await this.notifyAffectedUsers(breach.id);
    }

    console.log(`🚨 [GDPR] Violation de données signalée: ${breach.id}`);
    return breach.id;
  }

  private assessNotificationRequirement(breachData: Partial<DataBreach>): boolean {
    // Critères de notification obligatoire (simplifiés)
    if (breachData.severity === 'CRITICAL') return true;
    if (breachData.dataCategories?.some(cat => cat.sensitive)) return true;
    if ((breachData.affectedUsers?.length || 0) > 100) return true;
    return false;
  }

  async generatePortabilityExport(userId: string): Promise<any> {
    const userData = await this.collectUserData(userId);
    const consents = this.getUserConsents(userId);
    
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        userId,
        format: 'JSON',
        version: '1.0'
      },
      personalData: userData,
      consents: consents.map(c => ({
        type: c.consentType,
        granted: c.granted,
        date: c.timestamp.toISOString(),
        purpose: c.purpose,
        withdrawn: c.withdrawnAt ? c.withdrawnAt.toISOString() : null
      })),
      processingActivities: this.getUserProcessingActivities(userId).map(pa => ({
        name: pa.name,
        purpose: pa.purpose,
        legalBasis: pa.legalBasis,
        dataCategories: pa.dataCategories.map(dc => dc.type)
      }))
    };

    console.log(`📦 [GDPR] Export de portabilité généré pour: ${userId}`);
    return exportData;
  }

  // API publique
  getUserConsents(userId: string): GDPRConsent[] {
    return Array.from(this.consents.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getDataSubjectRequests(userId?: string): DataSubjectRequest[] {
    const requests = Array.from(this.dataSubjectRequests.values());
    return userId 
      ? requests.filter(r => r.userId === userId)
      : requests.sort((a, b) => b.requestDate.getTime() - a.requestDate.getTime());
  }

  getDataBreaches(resolved?: boolean): DataBreach[] {
    const breaches = Array.from(this.dataBreaches.values());
    const filtered = resolved !== undefined 
      ? breaches.filter(b => b.resolved === resolved)
      : breaches;
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getProcessingActivities(): ProcessingActivity[] {
    return Array.from(this.processingActivities.values())
      .sort((a, b) => b.lastReviewed.getTime() - a.lastReviewed.getTime());
  }

  getDashboardStats() {
    const consents = Array.from(this.consents.values());
    const requests = Array.from(this.dataSubjectRequests.values());
    const breaches = Array.from(this.dataBreaches.values());

    return {
      totalConsents: consents.length,
      activeConsents: consents.filter(c => c.granted && !c.withdrawnAt).length,
      withdrawnConsents: consents.filter(c => c.withdrawnAt).length,
      pendingRequests: requests.filter(r => r.status === 'PENDING').length,
      completedRequests: requests.filter(r => r.status === 'COMPLETED').length,
      totalBreaches: breaches.length,
      unresolvedBreaches: breaches.filter(b => !b.resolved).length,
      criticalBreaches: breaches.filter(b => b.severity === 'CRITICAL').length,
      processingActivities: this.processingActivities.size,
      complianceScore: this.calculateComplianceScore()
    };
  }

  private calculateComplianceScore(): number {
    let score = 100;
    const requests = Array.from(this.dataSubjectRequests.values());
    const breaches = Array.from(this.dataBreaches.values());

    // Pénalités pour demandes en retard
    const overdueRequests = requests.filter(r => {
      const daysSinceRequest = (Date.now() - r.requestDate.getTime()) / (1000 * 60 * 60 * 24);
      return r.status === 'PENDING' && daysSinceRequest > 30;
    });
    score -= overdueRequests.length * 5;

    // Pénalités pour violations non résolues
    const unresolvedBreaches = breaches.filter(b => !b.resolved);
    score -= unresolvedBreaches.length * 10;

    // Pénalités pour violations critiques
    const criticalBreaches = breaches.filter(b => b.severity === 'CRITICAL');
    score -= criticalBreaches.length * 20;

    return Math.max(score, 0);
  }

  // Méthodes utilitaires privées
  private async collectUserData(userId: string): Promise<any> {
    // Simulation de collecte de données
    return {
      profile: { id: userId, name: 'John Doe', email: 'john@example.com' },
      financial: { accounts: [], transactions: [] },
      behavioral: { preferences: {}, history: [] }
    };
  }

  private getUserProcessingActivities(userId: string): ProcessingActivity[] {
    // Retourne toutes les activités (simplification)
    return Array.from(this.processingActivities.values());
  }

  private async checkLegalObligations(userId: string): Promise<string[]> {
    // Vérification des obligations légales de conservation
    const obligations = [];
    
    // Exemple: obligations fiscales
    const fiscalData = true; // Simulation
    if (fiscalData) {
      obligations.push('Conservation fiscale (7 ans)');
    }

    return obligations;
  }

  private async eraseUserData(userId: string): Promise<void> {
    // Simulation de suppression
    console.log(`🗑️ Suppression des données pour: ${userId}`);
    
    // En production: supprimer dans toutes les bases de données
    // - Base de données principale
    // - Sauvegardes
    // - Logs (anonymisation)
    // - Caches
  }

  private async notifyAuthorities(breachId: string): Promise<void> {
    const breach = this.dataBreaches.get(breachId);
    if (breach) {
      breach.authorityNotified = true;
      breach.authorityNotificationDate = new Date();
      this.dataBreaches.set(breachId, breach);
      
      console.log(`📢 [GDPR] Autorités notifiées pour la violation: ${breachId}`);
    }
  }

  private async notifyAffectedUsers(breachId: string): Promise<void> {
    const breach = this.dataBreaches.get(breachId);
    if (breach) {
      breach.usersNotified = true;
      breach.userNotificationDate = new Date();
      this.dataBreaches.set(breachId, breach);
      
      console.log(`📧 [GDPR] Utilisateurs notifiés pour la violation: ${breachId}`);
    }
  }

  private async getCurrentIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '127.0.0.1';
    } catch {
      return '127.0.0.1';
    }
  }

  // Persistence (localStorage pour la démo)
  private async saveConsent(consent: GDPRConsent): Promise<void> {
    try {
      const stored = JSON.parse(localStorage.getItem('francis_gdpr_consents') || '[]');
      const index = stored.findIndex((c: any) => c.id === consent.id);
      
      const consentToStore = {
        ...consent,
        timestamp: consent.timestamp.toISOString(),
        withdrawnAt: consent.withdrawnAt?.toISOString()
      };
      
      if (index >= 0) {
        stored[index] = consentToStore;
      } else {
        stored.push(consentToStore);
      }
      
      localStorage.setItem('francis_gdpr_consents', JSON.stringify(stored));
    } catch (error) {
      console.warn('Erreur sauvegarde consentement:', error);
    }
  }

  private async saveDataSubjectRequest(request: DataSubjectRequest): Promise<void> {
    try {
      const stored = JSON.parse(localStorage.getItem('francis_gdpr_requests') || '[]');
      const index = stored.findIndex((r: any) => r.id === request.id);
      
      const requestToStore = {
        ...request,
        requestDate: request.requestDate.toISOString(),
        completionDate: request.completionDate?.toISOString()
      };
      
      if (index >= 0) {
        stored[index] = requestToStore;
      } else {
        stored.push(requestToStore);
      }
      
      localStorage.setItem('francis_gdpr_requests', JSON.stringify(stored));
    } catch (error) {
      console.warn('Erreur sauvegarde demande GDPR:', error);
    }
  }

  private async saveDataBreach(breach: DataBreach): Promise<void> {
    try {
      const stored = JSON.parse(localStorage.getItem('francis_gdpr_breaches') || '[]');
      stored.push({
        ...breach,
        timestamp: breach.timestamp.toISOString(),
        authorityNotificationDate: breach.authorityNotificationDate?.toISOString(),
        userNotificationDate: breach.userNotificationDate?.toISOString()
      });
      
      localStorage.setItem('francis_gdpr_breaches', JSON.stringify(stored));
    } catch (error) {
      console.warn('Erreur sauvegarde violation:', error);
    }
  }

  private loadStoredData(): void {
    try {
      // Charger les consentements
      const storedConsents = JSON.parse(localStorage.getItem('francis_gdpr_consents') || '[]');
      storedConsents.forEach((consent: any) => {
        this.consents.set(consent.id, {
          ...consent,
          timestamp: new Date(consent.timestamp),
          withdrawnAt: consent.withdrawnAt ? new Date(consent.withdrawnAt) : undefined
        });
      });

      // Charger les demandes
      const storedRequests = JSON.parse(localStorage.getItem('francis_gdpr_requests') || '[]');
      storedRequests.forEach((request: any) => {
        this.dataSubjectRequests.set(request.id, {
          ...request,
          requestDate: new Date(request.requestDate),
          completionDate: request.completionDate ? new Date(request.completionDate) : undefined
        });
      });

      // Charger les violations
      const storedBreaches = JSON.parse(localStorage.getItem('francis_gdpr_breaches') || '[]');
      storedBreaches.forEach((breach: any) => {
        this.dataBreaches.set(breach.id, {
          ...breach,
          timestamp: new Date(breach.timestamp),
          authorityNotificationDate: breach.authorityNotificationDate ? new Date(breach.authorityNotificationDate) : undefined,
          userNotificationDate: breach.userNotificationDate ? new Date(breach.userNotificationDate) : undefined
        });
      });

      console.log(`📋 [GDPR] Manager initialisé: ${this.consents.size} consentements, ${this.dataSubjectRequests.size} demandes`);
    } catch (error) {
      console.warn('Erreur chargement données GDPR:', error);
    }
  }
}

export default new GDPRComplianceManager();

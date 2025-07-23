interface ComplianceField {
  name: string;
  category: 'KYC' | 'AML' | 'MIFID' | 'ESG' | 'DOCUMENTATION';
  required: boolean;
  weight: number; // Poids dans le calcul du score (1-10)
  validationRules: {
    format?: RegExp;
    minLength?: number;
    maxLength?: number;
    allowedValues?: string[];
    customValidator?: (value: any) => { valid: boolean; message?: string };
  };
  reminderSchedule?: {
    initialDelay: number; // jours
    reminderInterval: number; // jours
    maxReminders: number;
  };
}

interface ComplianceScore {
  overall: number; // 0-100
  byCategory: {
    KYC: number;
    AML: number;
    MIFID: number;
    ESG: number;
    DOCUMENTATION: number;
  };
  breakdown: {
    completed: number;
    missing: number;
    total: number;
    weightedCompleted: number;
    weightedTotal: number;
  };
  criticalMissing: string[];
  lowPriority: string[];
  recommendations: string[];
  nextActions: Array<{
    action: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    deadline?: Date;
    automated: boolean;
  }>;
}

interface ReminderAlert {
  id: string;
  clientId: string;
  fieldName: string;
  category: ComplianceField['category'];
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  createdAt: Date;
  scheduledFor: Date;
  attemptNumber: number;
  maxAttempts: number;
  status: 'PENDING' | 'SENT' | 'ACKNOWLEDGED' | 'EXPIRED';
  channels: Array<'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP'>;
}

class ComplianceScoring {
  private complianceFields: ComplianceField[] = [
    // KYC - Identification
    {
      name: 'nom_client',
      category: 'KYC',
      required: true,
      weight: 10,
      validationRules: {
        minLength: 2,
        format: /^[A-ZÀ-Ÿ\s-']+$/i
      },
      reminderSchedule: { initialDelay: 1, reminderInterval: 2, maxReminders: 5 }
    },
    {
      name: 'prenom_client',
      category: 'KYC',
      required: true,
      weight: 10,
      validationRules: {
        minLength: 2,
        format: /^[A-ZÀ-Ÿ\s-']+$/i
      },
      reminderSchedule: { initialDelay: 1, reminderInterval: 2, maxReminders: 5 }
    },
    {
      name: 'date_naissance_client',
      category: 'KYC',
      required: true,
      weight: 10,
      validationRules: {
        format: /^\d{2}\/\d{2}\/\d{4}$/,
        customValidator: (value) => {
          const date = new Date(value);
          const now = new Date();
          const age = now.getFullYear() - date.getFullYear();
          return {
            valid: age >= 18 && age <= 120,
            message: age < 18 ? 'Client mineur' : age > 120 ? 'Date invalide' : undefined
          };
        }
      },
      reminderSchedule: { initialDelay: 1, reminderInterval: 1, maxReminders: 10 }
    },
    {
      name: 'numero_fiscal_client',
      category: 'KYC',
      required: true,
      weight: 9,
      validationRules: {
        format: /^\d{13}$/,
        minLength: 13,
        maxLength: 13
      },
      reminderSchedule: { initialDelay: 2, reminderInterval: 3, maxReminders: 3 }
    },
    {
      name: 'adresse_postale_client',
      category: 'KYC',
      required: true,
      weight: 8,
      validationRules: {
        minLength: 10
      },
      reminderSchedule: { initialDelay: 1, reminderInterval: 2, maxReminders: 5 }
    },

    // AML - Anti-Money Laundering
    {
      name: 'origine_patrimoine',
      category: 'AML',
      required: true,
      weight: 10,
      validationRules: {
        allowedValues: ['salaire', 'heritage', 'vente_immobilier', 'cession_entreprise', 'gains_boursiers', 'autres'],
        minLength: 3
      },
      reminderSchedule: { initialDelay: 3, reminderInterval: 5, maxReminders: 3 }
    },
    {
      name: 'pep_status',
      category: 'AML',
      required: true,
      weight: 10,
      validationRules: {
        allowedValues: ['oui', 'non', 'famille']
      },
      reminderSchedule: { initialDelay: 1, reminderInterval: 1, maxReminders: 10 }
    },
    {
      name: 'sanctions_economiques',
      category: 'AML',
      required: true,
      weight: 10,
      validationRules: {
        allowedValues: ['oui', 'non']
      },
      reminderSchedule: { initialDelay: 1, reminderInterval: 1, maxReminders: 10 }
    },

    // MiFID II - Connaissance client investisseur
    {
      name: 'connaissances_financieres',
      category: 'MIFID',
      required: true,
      weight: 9,
      validationRules: {
        allowedValues: ['debutant', 'intermediaire', 'expert']
      },
      reminderSchedule: { initialDelay: 2, reminderInterval: 3, maxReminders: 4 }
    },
    {
      name: 'tolerance_risque',
      category: 'MIFID',
      required: true,
      weight: 9,
      validationRules: {
        allowedValues: ['faible', 'moyenne', 'elevee']
      },
      reminderSchedule: { initialDelay: 2, reminderInterval: 3, maxReminders: 4 }
    },
    {
      name: 'objectifs_investissement',
      category: 'MIFID',
      required: true,
      weight: 8,
      validationRules: {
        minLength: 5
      }
    },
    {
      name: 'horizon_investissement',
      category: 'MIFID',
      required: true,
      weight: 8,
      validationRules: {
        allowedValues: ['court_terme', 'moyen_terme', 'long_terme']
      }
    },

    // ESG - Critères de durabilité
    {
      name: 'preferences_esg',
      category: 'ESG',
      required: false,
      weight: 5,
      validationRules: {
        allowedValues: ['oui', 'non', 'indifferent']
      }
    },
    {
      name: 'criteres_esg_prioritaires',
      category: 'ESG',
      required: false,
      weight: 4,
      validationRules: {
        allowedValues: ['environnement', 'social', 'gouvernance', 'tous', 'aucun']
      }
    },

    // Documentation
    {
      name: 'piece_identite',
      category: 'DOCUMENTATION',
      required: true,
      weight: 10,
      validationRules: {
        allowedValues: ['cni', 'passeport', 'titre_sejour']
      },
      reminderSchedule: { initialDelay: 1, reminderInterval: 1, maxReminders: 10 }
    },
    {
      name: 'justificatif_domicile',
      category: 'DOCUMENTATION',
      required: true,
      weight: 8,
      validationRules: {
        customValidator: (value) => ({
          valid: value && value.length > 0,
          message: 'Document requis (facture < 3 mois)'
        })
      },
      reminderSchedule: { initialDelay: 2, reminderInterval: 3, maxReminders: 5 }
    },
    {
      name: 'rib_client',
      category: 'DOCUMENTATION',
      required: true,
      weight: 9,
      validationRules: {
        format: /^[A-Z]{2}\d{2}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{2}$/
      },
      reminderSchedule: { initialDelay: 3, reminderInterval: 5, maxReminders: 3 }
    },
    {
      name: 'avis_imposition',
      category: 'DOCUMENTATION',
      required: true,
      weight: 7,
      validationRules: {
        customValidator: (value) => ({
          valid: value && value.includes('2023') || value.includes('2024'),
          message: 'Avis d\'imposition récent requis'
        })
      },
      reminderSchedule: { initialDelay: 7, reminderInterval: 7, maxReminders: 2 }
    }
  ];

  // Calcul du score de complétude
  calculateComplianceScore(clientData: Record<string, any>): ComplianceScore {
    const scores = {
      KYC: this.calculateCategoryScore(clientData, 'KYC'),
      AML: this.calculateCategoryScore(clientData, 'AML'),
      MIFID: this.calculateCategoryScore(clientData, 'MIFID'),
      ESG: this.calculateCategoryScore(clientData, 'ESG'),
      DOCUMENTATION: this.calculateCategoryScore(clientData, 'DOCUMENTATION')
    };

    const totalWeightedScore = Object.values(scores).reduce((sum, score) => sum + score.weighted, 0);
    const totalMaxWeight = Object.values(scores).reduce((sum, score) => sum + score.maxWeight, 0);
    
    const overall = Math.round((totalWeightedScore / totalMaxWeight) * 100);

    const breakdown = {
      completed: Object.values(scores).reduce((sum, score) => sum + score.completed, 0),
      missing: Object.values(scores).reduce((sum, score) => sum + score.missing, 0),
      total: this.complianceFields.length,
      weightedCompleted: totalWeightedScore,
      weightedTotal: totalMaxWeight
    };

    const criticalMissing = this.getCriticalMissingFields(clientData);
    const lowPriority = this.getLowPriorityFields(clientData);
    const recommendations = this.generateRecommendations(scores, criticalMissing);
    const nextActions = this.generateNextActions(clientData, criticalMissing);

    return {
      overall,
      byCategory: {
        KYC: Math.round(scores.KYC.percentage),
        AML: Math.round(scores.AML.percentage),
        MIFID: Math.round(scores.MIFID.percentage),
        ESG: Math.round(scores.ESG.percentage),
        DOCUMENTATION: Math.round(scores.DOCUMENTATION.percentage)
      },
      breakdown,
      criticalMissing,
      lowPriority,
      recommendations,
      nextActions
    };
  }

  // Calcul du score par catégorie
  private calculateCategoryScore(clientData: Record<string, any>, category: ComplianceField['category']) {
    const categoryFields = this.complianceFields.filter(f => f.category === category);
    
    let completed = 0;
    let missing = 0;
    let weightedScore = 0;
    let maxWeight = 0;

    categoryFields.forEach(field => {
      const value = clientData[field.name];
      const isValid = this.validateField(field, value);
      
      maxWeight += field.weight;
      
      if (isValid.valid && value !== undefined && value !== null && value !== '') {
        completed++;
        weightedScore += field.weight;
      } else {
        missing++;
      }
    });

    return {
      completed,
      missing,
      weighted: weightedScore,
      maxWeight,
      percentage: maxWeight > 0 ? (weightedScore / maxWeight) * 100 : 0
    };
  }

  // Validation d'un champ selon ses règles
  private validateField(field: ComplianceField, value: any): { valid: boolean; message?: string } {
    if (!value && field.required) {
      return { valid: false, message: 'Champ requis' };
    }

    if (!value) {
      return { valid: true }; // Champ optionnel non rempli
    }

    const rules = field.validationRules;

    // Validation format
    if (rules.format && !rules.format.test(String(value))) {
      return { valid: false, message: 'Format invalide' };
    }

    // Validation longueur
    if (rules.minLength && String(value).length < rules.minLength) {
      return { valid: false, message: `Minimum ${rules.minLength} caractères` };
    }

    if (rules.maxLength && String(value).length > rules.maxLength) {
      return { valid: false, message: `Maximum ${rules.maxLength} caractères` };
    }

    // Validation valeurs autorisées
    if (rules.allowedValues && !rules.allowedValues.includes(String(value).toLowerCase())) {
      return { valid: false, message: `Valeurs autorisées: ${rules.allowedValues.join(', ')}` };
    }

    // Validation personnalisée
    if (rules.customValidator) {
      return rules.customValidator(value);
    }

    return { valid: true };
  }

  // Champs critiques manquants
  private getCriticalMissingFields(clientData: Record<string, any>): string[] {
    return this.complianceFields
      .filter(field => {
        const value = clientData[field.name];
        const isValid = this.validateField(field, value);
        return field.required && field.weight >= 9 && (!isValid.valid || !value);
      })
      .map(field => field.name);
  }

  // Champs peu prioritaires manquants
  private getLowPriorityFields(clientData: Record<string, any>): string[] {
    return this.complianceFields
      .filter(field => {
        const value = clientData[field.name];
        const isValid = this.validateField(field, value);
        return !field.required && field.weight <= 5 && (!isValid.valid || !value);
      })
      .map(field => field.name);
  }

  // Génération des recommandations
  private generateRecommendations(scores: any, criticalMissing: string[]): string[] {
    const recommendations: string[] = [];

    if (criticalMissing.length > 0) {
      recommendations.push(`🚨 ${criticalMissing.length} champ(s) critique(s) manquant(s) - Action immédiate requise`);
    }

    Object.entries(scores).forEach(([category, score]: [string, any]) => {
      if (score.percentage < 70) {
        recommendations.push(`⚠️ ${category}: ${Math.round(score.percentage)}% complété - Collecte prioritaire`);
      } else if (score.percentage < 90) {
        recommendations.push(`📋 ${category}: ${Math.round(score.percentage)}% complété - Quelques éléments manquants`);
      }
    });

    if (scores.AML.percentage < 100) {
      recommendations.push('🔍 Vérification AML/LCB-FT incomplète - Risque de non-conformité');
    }

    if (scores.MIFID.percentage < 80) {
      recommendations.push('📊 Profil d\'investisseur MiFID incomplet - Conseil limité possible');
    }

    return recommendations;
  }

  // Génération des actions suivantes
  private generateNextActions(clientData: Record<string, any>, criticalMissing: string[]): ComplianceScore['nextActions'] {
    const actions: ComplianceScore['nextActions'] = [];

    // Actions critiques
    criticalMissing.forEach(fieldName => {
      const field = this.complianceFields.find(f => f.name === fieldName);
      if (field) {
        actions.push({
          action: `Collecter: ${this.getFieldDisplayName(fieldName)}`,
          priority: 'HIGH',
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
          automated: false
        });
      }
    });

    // Actions automatisées
    if (!clientData.screening_sanctions) {
      actions.push({
        action: 'Lancer screening sanctions/PEP automatique',
        priority: 'HIGH',
        automated: true
      });
    }

    if (!clientData.questionnaire_mifid_complete) {
      actions.push({
        action: 'Programmer questionnaire MiFID interactif',
        priority: 'MEDIUM',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7j
        automated: true
      });
    }

    // Relances email/SMS
    const missingFields = this.complianceFields.filter(field => {
      const value = clientData[field.name];
      return field.required && (!value || value === '');
    });

    if (missingFields.length > 0) {
      actions.push({
        action: `Programmer relances automatiques (${missingFields.length} champs)`,
        priority: 'MEDIUM',
        automated: true
      });
    }

    return actions.sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Génération d'alertes et relances automatiques
  async generateReminders(clientId: string, clientData: Record<string, any>): Promise<ReminderAlert[]> {
    const alerts: ReminderAlert[] = [];
    const now = new Date();

    this.complianceFields.forEach(field => {
      const value = clientData[field.name];
      const isValid = this.validateField(field, value);
      
      if (field.required && (!isValid.valid || !value) && field.reminderSchedule) {
        const schedule = field.reminderSchedule;
        const priority = this.getFieldPriority(field);
        
        // Première relance
        const firstReminder: ReminderAlert = {
          id: `${clientId}_${field.name}_1`,
          clientId,
          fieldName: field.name,
          category: field.category,
          priority,
          message: this.generateReminderMessage(field, 1),
          createdAt: now,
          scheduledFor: new Date(now.getTime() + schedule.initialDelay * 24 * 60 * 60 * 1000),
          attemptNumber: 1,
          maxAttempts: schedule.maxReminders,
          status: 'PENDING',
          channels: this.getOptimalChannels(priority)
        };
        
        alerts.push(firstReminder);

        // Relances suivantes
        for (let i = 2; i <= schedule.maxReminders; i++) {
          const followUpReminder: ReminderAlert = {
            id: `${clientId}_${field.name}_${i}`,
            clientId,
            fieldName: field.name,
            category: field.category,
            priority,
            message: this.generateReminderMessage(field, i),
            createdAt: now,
            scheduledFor: new Date(now.getTime() + (schedule.initialDelay + (i-1) * schedule.reminderInterval) * 24 * 60 * 60 * 1000),
            attemptNumber: i,
            maxAttempts: schedule.maxReminders,
            status: 'PENDING',
            channels: this.getOptimalChannels(priority)
          };
          
          alerts.push(followUpReminder);
        }
      }
    });

    return alerts;
  }

  // Priorité d'un champ
  private getFieldPriority(field: ComplianceField): ReminderAlert['priority'] {
    if (field.weight >= 10) return 'CRITICAL';
    if (field.weight >= 8) return 'HIGH';
    if (field.weight >= 6) return 'MEDIUM';
    return 'LOW';
  }

  // Canaux optimaux selon la priorité
  private getOptimalChannels(priority: ReminderAlert['priority']): ReminderAlert['channels'] {
    switch (priority) {
      case 'CRITICAL':
        return ['EMAIL', 'SMS', 'PUSH', 'IN_APP'];
      case 'HIGH':
        return ['EMAIL', 'SMS', 'IN_APP'];
      case 'MEDIUM':
        return ['EMAIL', 'IN_APP'];
      default:
        return ['IN_APP'];
    }
  }

  // Message de relance personnalisé
  private generateReminderMessage(field: ComplianceField, attemptNumber: number): string {
    const fieldDisplayName = this.getFieldDisplayName(field.name);
    const urgencyLevel = attemptNumber > 3 ? 'URGENT - ' : attemptNumber > 1 ? 'Rappel - ' : '';
    
    const messages = {
      1: `${fieldDisplayName} manquant pour finaliser votre dossier. Pourriez-vous nous le transmettre ?`,
      2: `Rappel: ${fieldDisplayName} requis pour la suite de votre dossier.`,
      3: `IMPORTANT: ${fieldDisplayName} toujours manquant. Merci de nous contacter.`,
      4: `URGENT: ${fieldDisplayName} indispensable. Votre dossier est en attente.`,
      5: `DERNIÈRE RELANCE: ${fieldDisplayName} requis. Contact téléphonique programmé.`
    };
    
    return urgencyLevel + (messages[attemptNumber as keyof typeof messages] || messages[5]);
  }

  // Nom d'affichage d'un champ
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      nom_client: 'Nom',
      prenom_client: 'Prénom',
      date_naissance_client: 'Date de naissance',
      numero_fiscal_client: 'Numéro fiscal',
      adresse_postale_client: 'Adresse',
      origine_patrimoine: 'Origine du patrimoine',
      pep_status: 'Statut PEP',
      sanctions_economiques: 'Sanctions économiques',
      connaissances_financieres: 'Connaissances financières',
      tolerance_risque: 'Tolérance au risque',
      objectifs_investissement: 'Objectifs d\'investissement',
      horizon_investissement: 'Horizon d\'investissement',
      preferences_esg: 'Préférences ESG',
      criteres_esg_prioritaires: 'Critères ESG prioritaires',
      piece_identite: 'Pièce d\'identité',
      justificatif_domicile: 'Justificatif de domicile',
      rib_client: 'RIB',
      avis_imposition: 'Avis d\'imposition'
    };
    
    return displayNames[fieldName] || fieldName.replace(/_/g, ' ');
  }

  // Export du rapport de complétude pour audit
  exportComplianceReport(clientId: string, score: ComplianceScore): string {
    const report = {
      metadata: {
        clientId,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      },
      summary: {
        overallScore: score.overall,
        status: score.overall >= 90 ? 'COMPLIANT' : score.overall >= 70 ? 'PARTIAL' : 'NON_COMPLIANT',
        criticalIssues: score.criticalMissing.length
      },
      scores: score.byCategory,
      breakdown: score.breakdown,
      issues: {
        critical: score.criticalMissing,
        lowPriority: score.lowPriority
      },
      recommendations: score.recommendations,
      nextActions: score.nextActions
    };

    return JSON.stringify(report, null, 2);
  }
}

export default new ComplianceScoring();

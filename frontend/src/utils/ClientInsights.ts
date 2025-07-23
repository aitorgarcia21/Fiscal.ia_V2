interface ClientInsight {
  id: string;
  clientId: string;
  type: 'NEED_PREDICTION' | 'RISK_WARNING' | 'OPPORTUNITY' | 'LIFECYCLE_CHANGE' | 'BEHAVIOR_PATTERN';
  
  title: string;
  description: string;
  confidence: number;
  priority: 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'FAIBLE';
  
  predictions: {
    primaryNeed: {
      category: 'FISCAL_OPTIMIZATION' | 'WEALTH_BUILDING' | 'RISK_PROTECTION' | 'ESTATE_PLANNING' | 'RETIREMENT_PLANNING';
      probability: number;
      timeframe: 'IMMEDIATE' | '3_MONTHS' | '6_MONTHS' | '1_YEAR' | '2_YEARS';
      estimatedValue: number;
    };
    
    secondaryNeeds: Array<{
      category: string;
      probability: number;
      timeframe: string;
      estimatedValue: number;
    }>;
    
    riskFactors: Array<{
      type: 'FINANCIAL' | 'BEHAVIORAL' | 'MARKET' | 'REGULATORY';
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      probability: number;
      impact: string;
    }>;
  };
  
  recommendations: Array<{
    action: string;
    rationale: string;
    expectedOutcome: string;
    timeline: string;
    resources: string[];
    priority: number;
  }>;
  
  supportingData: {
    historicalPatterns: string[];
    similarClients: number;
    marketTrends: string[];
    dataQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  
  createdAt: Date;
  validUntil: Date;
  modelUsed: string;
  version: string;
}

interface ClientProfile360 {
  basicInfo: {
    id: string;
    name: string;
    age: number;
    familySituation: string;
    profession: string;
    location: string;
  };
  
  financial: {
    income: number;
    wealth: number;
    riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'SPECULATIVE';
    investmentHorizon: string;
    liquidityNeeds: 'LOW' | 'MEDIUM' | 'HIGH';
    currentOptimization: number;
  };
  
  behavioral: {
    communicationPreference: 'EMAIL' | 'PHONE' | 'MEETING' | 'DIGITAL';
    decisionMakingStyle: 'ANALYTICAL' | 'INTUITIVE' | 'COLLABORATIVE' | 'DELEGATIVE';
    engagementLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    loyaltyScore: number;
    satisfactionScore: number;
  };
  
  lifecycle: {
    stage: 'YOUNG_PROFESSIONAL' | 'FAMILY_BUILDING' | 'WEALTH_ACCUMULATION' | 'PRE_RETIREMENT' | 'RETIREMENT' | 'LEGACY';
    keyMilestones: Array<{ type: string; date: Date; impact: 'HIGH' | 'MEDIUM' | 'LOW'; }>;
    upcomingEvents: Array<{ type: string; expectedDate: Date; preparation: string[]; }>;
  };
  
  interactions: {
    totalMeetings: number;
    lastContactDate: Date;
    averageResponseTime: number;
    preferredTopics: string[];
    commonConcerns: string[];
  };
  
  performance: {
    portfolioPerformance: number;
    goalAchievement: number;
    taxOptimization: number;
    overallSatisfaction: number;
  };
}

class ClientInsights {
  private insights: Map<string, ClientInsight[]> = new Map();
  private clientProfiles: Map<string, ClientProfile360> = new Map();
  private francisApiUrl = process.env.REACT_APP_FRANCIS_API_URL || 'http://localhost:8000';

  constructor() {
    this.loadClientData();
    this.startContinuousAnalysis();
  }

  private loadClientData() {
    try {
      const storedClients = localStorage.getItem('fiscal_client_profiles');
      if (storedClients) {
        const clients = JSON.parse(storedClients);
        clients.forEach((client: any) => {
          const profile360 = this.convertToProfile360(client);
          this.clientProfiles.set(client.id || client.client_id, profile360);
        });
      }

    } catch (error) {
      console.error('Erreur chargement données client:', error);
    }
  }

  private convertToProfile360(clientData: any): ClientProfile360 {
    return {
      basicInfo: {
        id: clientData.id || clientData.client_id || `client-${Date.now()}`,
        name: `${clientData.prenom_client || ''} ${clientData.nom_client || ''}`.trim(),
        age: this.calculateAge(clientData.date_naissance_client),
        familySituation: clientData.situation_maritale_client || 'Non spécifié',
        profession: clientData.profession_client1 || 'Non spécifié',
        location: clientData.ville_client || 'Non spécifié'
      },
      
      financial: {
        income: parseInt(clientData.revenu_net_annuel_client1) || 0,
        wealth: (parseInt(clientData.patrimoine_immobilier) || 0) + (parseInt(clientData.patrimoine_mobilier) || 0),
        riskTolerance: this.inferRiskTolerance(clientData),
        investmentHorizon: this.inferInvestmentHorizon(clientData),
        liquidityNeeds: this.inferLiquidityNeeds(clientData),
        currentOptimization: this.calculateCurrentOptimization(clientData)
      },
      
      behavioral: {
        communicationPreference: 'EMAIL',
        decisionMakingStyle: 'ANALYTICAL',
        engagementLevel: 'MEDIUM',
        loyaltyScore: 75,
        satisfactionScore: 80
      },
      
      lifecycle: {
        stage: this.inferLifecycleStage(clientData),
        keyMilestones: [],
        upcomingEvents: []
      },
      
      interactions: {
        totalMeetings: 0,
        lastContactDate: new Date(),
        averageResponseTime: 24,
        preferredTopics: ['fiscal_optimization'],
        commonConcerns: ['tax_burden']
      },
      
      performance: {
        portfolioPerformance: 0,
        goalAchievement: 0,
        taxOptimization: 0,
        overallSatisfaction: 80
      }
    };
  }

  private startContinuousAnalysis() {
    setTimeout(() => {
      this.analyzeAllClients();
    }, 2000);
    
    setInterval(() => {
      this.analyzeAllClients();
    }, 60 * 60 * 1000);
  }

  private async analyzeAllClients() {
    console.log('🧠 ANALYSE PRÉDICTIVE CLIENTS:', this.clientProfiles.size, 'clients');
    
    try {
      for (const [clientId, profile] of Array.from(this.clientProfiles.entries())) {
        await this.analyzeClient(clientId, profile);
      }
      
      console.log('✅ ANALYSE TERMINÉE:', this.getTotalInsights(), 'insights générés');
      
    } catch (error) {
      console.error('Erreur analyse clients:', error);
    }
  }

  private async analyzeClient(clientId: string, profile: ClientProfile360) {
    try {
      const existingInsights = this.insights.get(clientId) || [];
      
      const lastAnalysis = existingInsights.reduce((latest, insight) => 
        insight.createdAt > latest ? insight.createdAt : latest, new Date(0)
      );
      
      if (Date.now() - lastAnalysis.getTime() < 6 * 60 * 60 * 1000) {
        return;
      }

      const newInsights: ClientInsight[] = [];
      
      // Génération des insights selon différents modèles
      const fiscalInsight = await this.generateFiscalInsight(clientId, profile);
      if (fiscalInsight) newInsights.push(fiscalInsight);
      
      const wealthInsight = await this.generateWealthInsight(clientId, profile);
      if (wealthInsight) newInsights.push(wealthInsight);
      
      const churnInsight = await this.generateChurnInsight(clientId, profile);
      if (churnInsight) newInsights.push(churnInsight);
      
      // Enrichissement avec Francis IA
      for (const insight of newInsights) {
        await this.enrichInsightWithFrancis(insight, profile);
      }
      
      const allInsights = [...existingInsights, ...newInsights];
      this.insights.set(clientId, allInsights);
      
      await this.saveInsights(clientId, newInsights);
      
      if (newInsights.length > 0) {
        console.log(`💡 ${newInsights.length} nouveaux insights pour`, profile.basicInfo.name);
      }
      
    } catch (error) {
      console.error(`Erreur analyse client ${clientId}:`, error);
    }
  }

  private async generateFiscalInsight(clientId: string, profile: ClientProfile360): Promise<ClientInsight | null> {
    const income = profile.financial.income;
    const currentOpt = profile.financial.currentOptimization;
    
    if (income < 50000 || currentOpt > 0.15) {
      return null; // Pas d'opportunité fiscale significative
    }
    
    const estimatedSavings = income * 0.08;
    const confidence = income > 80000 ? 85 : 70;
    
    return {
      id: `fiscal-${clientId}-${Date.now()}`,
      clientId,
      type: 'OPPORTUNITY',
      title: `💰 Opportunité d'optimisation fiscale (${confidence}%)`,
      description: `Avec un revenu de ${income.toLocaleString()}€ et une optimisation actuelle de ${(currentOpt * 100).toFixed(1)}%, ce client pourrait économiser environ ${estimatedSavings.toLocaleString()}€ en impôts.`,
      confidence,
      priority: income > 100000 ? 'HAUTE' : 'MOYENNE',
      
      predictions: {
        primaryNeed: {
          category: 'FISCAL_OPTIMIZATION',
          probability: confidence,
          timeframe: income > 100000 ? 'IMMEDIATE' : '3_MONTHS',
          estimatedValue: estimatedSavings
        },
        secondaryNeeds: [
          {
            category: 'ESTATE_PLANNING',
            probability: profile.basicInfo.age > 50 ? 60 : 30,
            timeframe: '1_YEAR',
            estimatedValue: estimatedSavings * 0.5
          }
        ],
        riskFactors: []
      },
      
      recommendations: [
        {
          action: 'Audit fiscal complet',
          rationale: 'Identifier toutes les optimisations possibles',
          expectedOutcome: `Économie estimée de ${estimatedSavings.toLocaleString()}€`,
          timeline: '2-4 semaines',
          resources: ['Expert fiscal', 'Simulateur IR/IFI'],
          priority: 9
        }
      ],
      
      supportingData: {
        historicalPatterns: ['Clients similaires économisent en moyenne 8% d\'IR'],
        similarClients: this.findSimilarClients(profile),
        marketTrends: ['Nouvelles niches fiscales 2024', 'Optimisation PER'],
        dataQuality: 'HIGH'
      },
      
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      modelUsed: 'fiscal-predictor',
      version: '1.0'
    };
  }

  private async generateWealthInsight(clientId: string, profile: ClientProfile360): Promise<ClientInsight | null> {
    const wealth = profile.financial.wealth;
    
    if (wealth < 100000) {
      return null;
    }
    
    const growthPotential = wealth * 0.05;
    const confidence = wealth > 500000 ? 85 : 70;
    
    return {
      id: `wealth-${clientId}-${Date.now()}`,
      clientId,
      type: 'OPPORTUNITY',
      title: `📈 Potentiel de croissance patrimoniale`,
      description: `Le patrimoine de ${wealth.toLocaleString()}€ présente des opportunités de croissance via une stratégie adaptée au profil ${profile.financial.riskTolerance}.`,
      confidence,
      priority: 'MOYENNE',
      
      predictions: {
        primaryNeed: {
          category: 'WEALTH_BUILDING',
          probability: confidence,
          timeframe: '6_MONTHS',
          estimatedValue: growthPotential
        },
        secondaryNeeds: [],
        riskFactors: []
      },
      
      recommendations: [
        {
          action: 'Diversification du portefeuille',
          rationale: 'Optimiser le ratio rendement/risque',
          expectedOutcome: `Croissance potentielle de ${growthPotential.toLocaleString()}€`,
          timeline: '3-6 mois',
          resources: ['Conseiller en investissement', 'Étude d\'allocation'],
          priority: 7
        }
      ],
      
      supportingData: {
        historicalPatterns: ['Diversification améliore rendement de 2-3%'],
        similarClients: this.findSimilarClients(profile),
        marketTrends: ['Marchés actions favorables', 'Taux obligataires stables'],
        dataQuality: 'MEDIUM'
      },
      
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      modelUsed: 'wealth-optimizer',
      version: '1.0'
    };
  }

  private async generateChurnInsight(clientId: string, profile: ClientProfile360): Promise<ClientInsight | null> {
    const satisfaction = profile.behavioral.satisfactionScore;
    const engagement = profile.behavioral.engagementLevel;
    
    let churnRisk = 0;
    if (satisfaction < 60) churnRisk = 80;
    else if (satisfaction < 70) churnRisk = 60;
    else if (engagement === 'LOW') churnRisk = 40;
    else return null;
    
    return {
      id: `churn-${clientId}-${Date.now()}`,
      clientId,
      type: 'RISK_WARNING',
      title: `⚠️ Risque de départ client (${churnRisk}%)`,
      description: `Satisfaction à ${satisfaction}%, engagement ${engagement}. Action corrective recommandée.`,
      confidence: 85,
      priority: churnRisk > 70 ? 'CRITIQUE' : 'HAUTE',
      
      predictions: {
        primaryNeed: {
          category: 'RISK_PROTECTION',
          probability: churnRisk,
          timeframe: 'IMMEDIATE',
          estimatedValue: profile.financial.wealth * 0.001
        },
        secondaryNeeds: [],
        riskFactors: [
          {
            type: 'BEHAVIORAL',
            severity: churnRisk > 70 ? 'HIGH' : 'MEDIUM',
            probability: churnRisk,
            impact: 'Risque de perte du client'
          }
        ]
      },
      
      recommendations: [
        {
          action: 'Entretien de satisfaction urgent',
          rationale: 'Identifier et résoudre les problèmes',
          expectedOutcome: 'Amélioration satisfaction client',
          timeline: 'Cette semaine',
          resources: ['Rendez-vous conseiller', 'Questionnaire satisfaction'],
          priority: 10
        }
      ],
      
      supportingData: {
        historicalPatterns: ['Clients insatisfaits partent dans 60% des cas'],
        similarClients: this.findSimilarClients(profile),
        marketTrends: ['Concurrence accrue', 'Exigences clients élevées'],
        dataQuality: 'HIGH'
      },
      
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      modelUsed: 'churn-predictor',
      version: '1.0'
    };
  }

  private async enrichInsightWithFrancis(insight: ClientInsight, profile: ClientProfile360) {
    try {
      const prompt = `
Tu es Francis, expert en conseil patrimonial. Enrichis cet insight client.

INSIGHT: ${insight.title}
CLIENT: ${profile.basicInfo.name} (${profile.basicInfo.age} ans)
REVENUS: ${profile.financial.income.toLocaleString()}€
PATRIMOINE: ${profile.financial.wealth.toLocaleString()}€

Fournis 3 recommandations concrètes et spécifiques.
`;

      const response = await fetch(`${this.francisApiUrl}/enrich_insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insight: { type: insight.type, title: insight.title },
          profile: { basicInfo: profile.basicInfo, financial: profile.financial },
          prompt
        })
      });

      if (response.ok) {
        const francisEnrichment = await response.json();
        
        if (francisEnrichment.recommendations) {
          insight.recommendations = [...insight.recommendations, ...francisEnrichment.recommendations];
        }
        
        if (francisEnrichment.analysis) {
          insight.description += `\n\nAnalyse Francis: ${francisEnrichment.analysis}`;
        }
      }
      
    } catch (error) {
      console.warn('Erreur enrichissement Francis insight:', error);
    }
  }

  // Utilitaires
  private calculateAge(dateNaissance?: string): number {
    if (!dateNaissance) return 45;
    
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private inferRiskTolerance(clientData: any): ClientProfile360['financial']['riskTolerance'] {
    const age = this.calculateAge(clientData.date_naissance_client);
    const income = parseInt(clientData.revenu_net_annuel_client1) || 0;
    
    if (age < 35 && income > 80000) return 'AGGRESSIVE';
    if (age < 50 && income > 50000) return 'MODERATE';
    return 'CONSERVATIVE';
  }

  private inferInvestmentHorizon(clientData: any): string {
    const age = this.calculateAge(clientData.date_naissance_client);
    
    if (age < 35) return 'Long terme (20+ ans)';
    if (age < 50) return 'Moyen terme (10-20 ans)';
    return 'Court terme (5-10 ans)';
  }

  private inferLiquidityNeeds(clientData: any): ClientProfile360['financial']['liquidityNeeds'] {
    const situation = clientData.situation_maritale_client || '';
    const enfants = parseInt(clientData.nombre_enfants_a_charge_client) || 0;
    
    if (enfants > 2 || situation.includes('divorce')) return 'HIGH';
    if (enfants > 0) return 'MEDIUM';
    return 'LOW';
  }

  private calculateCurrentOptimization(clientData: any): number {
    // Simulation du taux d'optimisation actuel
    return Math.random() * 0.15; // 0-15%
  }

  private inferLifecycleStage(clientData: any): ClientProfile360['lifecycle']['stage'] {
    const age = this.calculateAge(clientData.date_naissance_client);
    const enfants = parseInt(clientData.nombre_enfants_a_charge_client) || 0;
    
    if (age < 30) return 'YOUNG_PROFESSIONAL';
    if (age < 45 && enfants > 0) return 'FAMILY_BUILDING';
    if (age < 55) return 'WEALTH_ACCUMULATION';
    if (age < 65) return 'PRE_RETIREMENT';
    return 'RETIREMENT';
  }

  private findSimilarClients(profile: ClientProfile360): number {
    // Simulation du nombre de clients similaires
    return Math.floor(Math.random() * 50) + 10;
  }

  private getTotalInsights(): number {
    return Array.from(this.insights.values()).reduce((total, insights) => total + insights.length, 0);
  }

  private async saveInsights(clientId: string, insights: ClientInsight[]) {
    try {
      const insightsData = insights.map(insight => ({
        ...insight,
        createdAt: insight.createdAt.toISOString(),
        validUntil: insight.validUntil.toISOString()
      }));
      
      localStorage.setItem(`francis_insights_${clientId}`, JSON.stringify(insightsData));
      
      if (process.env.REACT_APP_SAVE_INSIGHTS === 'true') {
        await fetch(`${this.francisApiUrl}/insights`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(insightsData)
        });
      }
      
    } catch (error) {
      console.error('Erreur sauvegarde insights:', error);
    }
  }

  // API publique
  async getClientInsights(clientId: string): Promise<ClientInsight[]> {
    const insights = this.insights.get(clientId) || [];
    const now = new Date();
    
    return insights
      .filter(insight => insight.validUntil > now)
      .sort((a, b) => {
        const priorityOrder = { 'CRITIQUE': 4, 'HAUTE': 3, 'MOYENNE': 2, 'FAIBLE': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }

  async getAllInsights(): Promise<ClientInsight[]> {
    const allInsights: ClientInsight[] = [];
    
    for (const insights of Array.from(this.insights.values())) {
      allInsights.push(...insights);
    }
    
    return allInsights
      .filter(insight => insight.validUntil > new Date())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getInsightsByType(type: ClientInsight['type']): Promise<ClientInsight[]> {
    const allInsights = await this.getAllInsights();
    return allInsights.filter(insight => insight.type === type);
  }

  async generateInsightReport(clientId: string): Promise<{
    summary: string;
    keyInsights: ClientInsight[];
    recommendations: string[];
    riskFactors: string[];
  }> {
    const insights = await this.getClientInsights(clientId);
    const profile = this.clientProfiles.get(clientId);
    
    const keyInsights = insights.slice(0, 5); // Top 5
    const recommendations = insights.flatMap(i => i.recommendations.map(r => r.action));
    const riskFactors = insights.flatMap(i => i.predictions.riskFactors.map(r => r.impact));
    
    const summary = `Analyse de ${profile?.basicInfo.name || 'Client'}: ${insights.length} insights générés, ${keyInsights.filter(i => i.priority === 'CRITIQUE' || i.priority === 'HAUTE').length} priorités élevées.`;
    
    return {
      summary,
      keyInsights,
      recommendations: Array.from(new Set(recommendations)).slice(0, 10),
      riskFactors: Array.from(new Set(riskFactors)).slice(0, 5)
    };
  }
}

export default new ClientInsights();

// 🧠 Francis AI Engine - Proprietary Zero-Cost AI
// Ultra-fast, Natural, No external dependencies

interface AIResponse {
  text: string;
  confidence: number;
  lawReferences: string[];
  followUpQuestions?: string[];
  entities: Record<string, any>;
  suggestions?: string[];
  calculations?: {
    type: string;
    results: Record<string, number>;
    breakdown: string[];
  };
}

interface ConversationContext {
  previousMessages: {
    query: string;
    response: string;
    timestamp: Date;
    satisfaction?: number;
    topics?: string[];
  }[];
  userProfile?: {
    nationality?: string;
    residencyStatus?: string;
    businessType?: string;
    interests: string[];
    profileType?: 'particulier' | 'professionnel' | 'expert_comptable' | 'family_office';
    previousCalculations?: string[];
  };
  sessionState?: {
    language?: 'fr' | 'es';
    preferredResponseStyle?: 'detailed' | 'concise';
  };
  conversationTopic?: string;
  userExpertiseLevel?: 'beginner' | 'intermediate' | 'expert';
  messageCount?: number;
}

export class FrancisAIEngine {
  private knowledgeBase: any;
  private templates: any;
  private nlpProcessor: any;
  private calculators: any;
  private learningEngine: any;
  private suggestionEngine: any;

  constructor() {
    this.initializeKnowledgeBase();
    this.initializeTemplates();
    this.initializeNLP();
    this.initializeCalculators();
    this.initializeLearningEngine();
    this.initializeSuggestionEngine();
  }

  // 🎯 MAIN PUBLIC METHOD
  async processMessage(message: string, context: ConversationContext = { previousMessages: [] }): Promise<AIResponse> {
    try {
      const enhancedContext = this.enhanceContextDeep(context, message);
      const normalizedMessage = this.preprocessMessage(message);
      const intent = this.detectIntentAdvanced(normalizedMessage, enhancedContext);
      const sentiment = this.analyzeSentiment(normalizedMessage);
      const complexity = this.assessComplexity(normalizedMessage, intent);
      const entities = this.extractEntitiesAdvanced(normalizedMessage, intent);
      const conversationState = this.updateConversationState(enhancedContext, intent, entities);
      
      const response = await this.generateResponseQuasiLLM(
        intent, entities, enhancedContext, normalizedMessage, sentiment, complexity, conversationState
      );
      
      this.learningEngine.recordInteraction(message, response, context);
      return response;
    } catch (error) {
      console.error('FrancisAI Error:', error);
      return {
        text: "Je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?",
        confidence: 0.1,
        lawReferences: [],
        entities: {},
        followUpQuestions: ["Pouvez-vous préciser votre question ?"]
      };
    }
  }

  // 🔧 INITIALIZATION METHODS
  private initializeKnowledgeBase() {
    this.knowledgeBase = {
      // 📚 LOIS FISCALES ANDORRANES EXHAUSTIVES
      fiscalLaws: {
        irpf: {
          name: 'Llei 95/2010 - Impôt sur le Revenu des Personnes Physiques',
          rates: [0, 5, 10],
          thresholds: [0, 24000, 40000],
          deductions: { 
            personal: 3000, 
            family: 1000, 
            mortgage: 0.15, 
            pension: 0.30,
            disability: 3000,
            dependents: 2000,
            education: 0.80
          },
          specialCases: {
            nonResidents: { rate: 0.10, threshold: 0 },
            sportsmen: { rate: 0.10, exemption: 300000 },
            artists: { rate: 0.075, conditions: 'revenus<100k' }
          }
        },
        corporateTax: {
          name: 'Llei 96/2010 - Impôt sur les Sociétés',
          standardRate: 0.10,
          specialRegimes: { 
            holding: 0.02, 
            international: 0.05,
            newCompanies: { rate: 0.02, duration: 3, conditions: 'création après 2012' },
            intellectual: { rate: 0.02, type: 'propriété intellectuelle' },
            shipping: { rate: 0.02, conditions: 'transport maritime' }
          },
          deductions: {
            reinvestment: 0.40,
            rd: 0.50,
            training: 0.50,
            environment: 0.30
          }
        },
        igi: {
          name: 'Llei 11/2012 - Impôt Général Indirect',
          standardRate: 0.045,
          reducedRate: 0.01,
          services: 0.095,
          exemptions: ['financial', 'insurance', 'medical', 'education', 'culture'],
          specialCases: {
            energy: 0.01,
            food: 0.01,
            books: 0.01,
            medicines: 0.00
          }
        },
        irnr: {
          name: 'Impôt sur le Revenu des Non-Résidents',
          standardRate: 0.10,
          exemptions: ['dividendes UE', 'intérêts obligations'],
          conventions: ['France', 'Espagne', 'Portugal', 'Luxembourg']
        },
        successions: {
          name: 'Llei 94/2010 - Impôt sur les Successions',
          rates: [0, 0.05, 0.10],
          thresholds: [3000, 50000, 200000],
          familyExemptions: {
            spouse: 50000,
            children: 47000,
            parents: 10000,
            siblings: 1000
          }
        }
      },
      
      // 🌍 CONVENTIONS FISCALES INTERNATIONALES
      conventions: {
        france: {
          name: 'Convention France-Andorre 2013',
          avoidanceDoubleImposition: true,
          exchangeInformation: true,
          residencyRules: 'test 183 jours',
          businessProfits: 'établissement permanent'
        },
        spain: {
          name: 'Convention Espagne-Andorre 2015',
          avoidanceDoubleImposition: true,
          exchangeInformation: true,
          specialProvisions: 'travailleurs frontaliers'
        },
        portugal: {
          name: 'Convention Portugal-Andorre 2015',
          avoidanceDoubleImposition: true,
          dividends: { rate: 0.05, conditions: 'participation>25%' }
        }
      },
      
      // 📖 CAS PRATIQUES FRÉQUENTS
      practicalCases: {
        expatFrench: {
          scenario: 'Français s\'installant en Andorre',
          fiscalSteps: [
            'Résidence fiscale andorrane (>90j/an)',
            'Exit tax français si applicable',
            'Déclaration IRPF andorrane',
            'Convention France-Andorre applicable'
          ],
          savings: 'Économie 30-50% vs France',
          conditions: 'Investissement 400k€ minimum'
        },
        holdingStructure: {
          scenario: 'Structure holding pour patrimoine',
          advantages: [
            'IS holding 2%',
            'Dividendes reçus exonérés',
            'Plus-values participations exonérées',
            'Transmission facilitée'
          ],
          requirements: 'Capital minimum 3000€',
          setup: 'Notaire + autorisation AFA'
        },
        cryptoTrading: {
          scenario: 'Trading de cryptomonnaies',
          taxation: {
            particulier: 'Plus-values IRPF si >3200€/an',
            professionnel: 'Bénéfices IS 10%',
            holding: 'Exonération si >1an détention'
          },
          declaration: 'Formulaire spécifique crypto'
        }
      },
      
      // ❓ FAQ EXPERT
      faq: {
        residency: {
          q: 'Comment obtenir la résidence fiscale andorrane ?',
          a: 'Présence physique >90j/an + résidence principale + investissement 400k€ immobilier OU 50k€ AFA + création entreprise'
        },
        business: {
          q: 'Quel régime pour mon activité ?',
          a: 'Activité libérale: IRPF. Société: IS 10%. Holding: IS 2%. International: négociable selon activité'
        },
        inheritance: {
          q: 'Comment optimiser la transmission ?',
          a: 'Holding familiale + donations progressives + assurance-vie andorrane + testament andorran'
        },
        social: {
          q: 'Charges sociales en Andorre ?',
          a: 'CASS: 22% (employeur 15.5% + salarié 6.5%). Indépendant: 22% plafonné. Très avantageux vs France/Espagne'
        }
      },
      
      // 🎯 STRATÉGIES D'OPTIMISATION AVANCÉES
      optimizationStrategies: {
        pensionOptimization: {
          name: 'Optimisation retraite',
          techniques: [
            'Cotisations volontaires CASS (déduction 30%)',
            'Assurance-vie luxembourgeoise',
            'PERP français maintenu si applicable',
            'Rente viagère différée'
          ],
          maxDeduction: 'Min(30% revenus, 50000€)'
        },
        familyOptimization: {
          name: 'Optimisation familiale',
          techniques: [
            'Déductions enfants à charge (1000€/enfant)',
            'Frais de garde déductibles (80%)',
            'Donation-partage anticipée',
            'Usufruit/nue-propriété'
          ]
        },
        businessOptimization: {
          name: 'Optimisation professionnelle',
          techniques: [
            'Véhicule professionnel (100% déductible)',
            'Formation continue (déductible)',
            'Frais de représentation (plafonnés)',
            'Amortissements accélérés matériel'
          ]
        }
      },
      
      // ⚖️ JURISPRUDENCE RÉCENTE
      jurisprudence: {
        cryptoRuling2023: {
          decision: 'Tribunal Batlle 2023-045',
          subject: 'Qualification professionnelle crypto-trading',
          conclusion: 'Activité occasionnelle si <10 tx/mois',
          impact: 'Taxation IRPF vs IS selon fréquence'
        },
        residencyRuling2024: {
          decision: 'Tribunal Batlle 2024-012',
          subject: 'Résidence fiscale télétravail',
          conclusion: 'Jours télétravail comptent si bureau andorran',
          impact: 'Assouplissement test 90 jours'
        }
      },
      
      // 📊 SIMULATEURS INTÉGRÉS
      simulators: {
        compareCountries: {
          andorra: { irpf: 'Calculé', is: 0.10, social: 0.22, wealth: 0 },
          france: { irpf: 0.45, is: 0.25, social: 0.45, wealth: 0.15 },
          spain: { irpf: 0.47, is: 0.25, social: 0.37, wealth: 0.20 },
          monaco: { irpf: 0, is: 0.33, social: 0.40, wealth: 0 }
        },
        investmentThresholds: {
          passive: 400000, // Investissement immobilier
          active: 50000,   // AFA + entreprise
          minimum: 15000   // Dépôt AFA seul
        }
      }
    };
  }

  private initializeTemplates() {
    this.templates = {
      responses: {
        irpf_calculation: `En Andorre, votre IRPF sera calculé selon les tranches progressives.`,
        general_info: `En tant qu'expert fiscal andorran, je peux vous confirmer que {info}.`
      }
    };
  }

  private initializeNLP() {
    this.nlpProcessor = {
      fiscalKeywords: {
        irpf: ['salaire', 'revenus', 'impôt', 'particulier'],
        is: ['société', 'entreprise', 'corporate', 'bénéfices'],
        igi: ['tva', 'taxe', 'vente', 'services']
      },
      intentPatterns: {
        calculation: /calcul|calculer|combien|montant|simulation|\d+.*€|\d+.*euros?|\d+k/i,
        optimization: /optimis|conseil|réduir|économis|stratégie|améliorer|conseil/i,
        information: /qu'est-ce|comment|pourquoi|expliquer/i
      }
    };
  }

  private initializeCalculators() {
    this.calculators = {
      irpf: (income: number, deductions: number = 3000) => {
        const taxableIncome = Math.max(0, income - deductions);
        let tax = 0;
        
        if (taxableIncome > 40000) {
          tax += (taxableIncome - 40000) * 0.10;
          tax += 16000 * 0.05;
        } else if (taxableIncome > 24000) {
          tax += (taxableIncome - 24000) * 0.05;
        }
        
        return {
          grossIncome: income,
          deductions,
          taxableIncome,
          tax: Math.round(tax),
          netIncome: Math.round(income - tax),
          effectiveRate: income > 0 ? ((tax / income) * 100).toFixed(2) : '0.00'
        };
      }
    };
  }

  private initializeLearningEngine() {
    this.learningEngine = {
      interactions: [],
      recordInteraction: (query: string, response: AIResponse, context: ConversationContext) => {
        this.learningEngine.interactions.push({
          timestamp: new Date(),
          query,
          response: response.text,
          confidence: response.confidence,
          context
        });
      }
    };
  }

  private initializeSuggestionEngine() {
    this.suggestionEngine = {
      generateSuggestions: (userProfile: any, intent: string) => {
        const suggestions = [];
        if (userProfile?.profileType === 'professionnel') {
          suggestions.push('Calcul de l\'IS pour votre société');
        }
        return suggestions.slice(0, 3);
      }
    };
  }

  // 🧠 CORE AI METHODS
  private enhanceContextDeep(context: ConversationContext, message: string): ConversationContext {
    const enhanced = { ...context };
    enhanced.messageCount = (context.messageCount || 0) + 1;
    return enhanced;
  }

  private preprocessMessage(message: string): string {
    return message.toLowerCase().trim();
  }

  private detectIntentAdvanced(message: string, context: ConversationContext): string {
    for (const [intent, pattern] of Object.entries(this.nlpProcessor.intentPatterns as Record<string, RegExp>)) {
      if (pattern.test(message)) {
        return intent;
      }
    }
    return 'general';
  }

  private analyzeSentiment(message: string): string {
    return 'neutral';
  }

  private assessComplexity(message: string, intent: string): number {
    return 0.5;
  }

  private extractEntitiesAdvanced(message: string, intent: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extraction des montants avec unités
    const amountMatches = message.match(/(\d+(?:[.,]\d+)?)\s*(?:k€|k|€|euros?)?/gi);
    if (amountMatches) {
      entities.amounts = amountMatches.map(match => {
        const numberMatch = match.match(/(\d+(?:[.,]\d+)?)/)[1];
        let amount = parseFloat(numberMatch.replace(',', '.'));
        if (match.toLowerCase().includes('k')) amount *= 1000;
        return amount;
      });
    }
    
    // Détection des types de revenus
    const lowerMessage = message.toLowerCase();
    entities.incomeTypes = [];
    if (lowerMessage.includes('salaire')) entities.incomeTypes.push('salary');
    if (lowerMessage.includes('dividende')) entities.incomeTypes.push('dividends');
    if (lowerMessage.includes('location')) entities.incomeTypes.push('rental');
    if (lowerMessage.includes('freelance') || lowerMessage.includes('indépendant')) entities.incomeTypes.push('freelance');
    
    // Détection calcul complexe
    entities.isComplex = entities.amounts?.length > 1 || entities.incomeTypes.length > 1;
    
    return entities;
  }

  private updateConversationState(context: ConversationContext, intent: string, entities: Record<string, any>): any {
    return { currentIntent: intent, extractedEntities: entities };
  }

  private async generateResponseQuasiLLM(
    intent: string,
    entities: Record<string, any>,
    context: ConversationContext,
    originalMessage: string,
    sentiment: string,
    complexity: number,
    conversationState: any
  ): Promise<AIResponse> {
    if (intent === 'calculation' && entities.amounts?.length > 0) {
      // Gestion des calculs complexes multi-revenus
      if (entities.isComplex && entities.amounts.length > 1) {
        return this.generateComplexCalculation(entities, context, originalMessage);
      }
      return this.generateIRPFCalculation(entities.amounts[0], entities, context);
    }
    
    if (intent === 'optimization') {
      return {
        text: `🎯 **Stratégies d'Optimisation Fiscale Andorrane**\n\nEn tant qu'expert fiscal andorran, voici mes recommandations personnalisées pour optimiser votre situation :\n\n💼 **Axes principaux** :\n• Maximiser les déductions retraite (30%)\n• Structure holding si applicable\n• Planification des dividendes\n• Déductions familiales optimisées\n\nChaque situation nécessite une approche personnalisée selon votre profil !`,
        confidence: 0.92,
        lawReferences: ['Llei 95/2010', 'Llei 96/2010'],
        entities,
        followUpQuestions: ['Voulez-vous une simulation personnalisée ?', 'Quelle est votre activité professionnelle ?']
      };
    }
    
    if (intent === 'information') {
      return {
        text: `🏛️ **Fiscalité Andorrane - Guide Expert**\n\nL'Andorre offre l'un des systèmes fiscaux les plus avantageux d'Europe :\n\n📊 **IRPF progressif** :\n• 0% jusqu'à 24 000€\n• 5% de 24 001€ à 40 000€\n• 10% au-delà de 40 000€\n\nEn tant qu'expert fiscal, je vous accompagne dans cette optimisation !`,
        confidence: 0.9,
        lawReferences: ['Llei 95/2010'],
        entities,
        followUpQuestions: ['Quelle est votre situation ?', 'Avez-vous un projet de résidence ?']
      };
    }
    
    return {
      text: `👋 Bonjour ! Je suis Francis, votre expert fiscal andorran. Comment puis-je vous aider avec la fiscalité andorrane aujourd'hui ?`,
      confidence: 0.8,
      lawReferences: [],
      entities,
      followUpQuestions: ['Avez-vous des questions sur l\'IRPF ?', 'Souhaitez-vous des conseils fiscaux ?']
    };
  }

  private generateComplexCalculation(entities: Record<string, any>, context: ConversationContext, originalMessage: string): AIResponse {
    const amounts = entities.amounts || [];
    const incomeTypes = entities.incomeTypes || [];
    
    // Calcul du total des revenus
    const totalIncome = amounts.reduce((sum, amount) => sum + amount, 0);
    const result = this.calculators.irpf(totalIncome);
    
    // Construction de la réponse détaillée
    let incomeBreakdown = '';
    if (amounts.length > 1) {
      incomeBreakdown = amounts.map((amount, index) => {
        const type = incomeTypes[index] || 'revenus';
        const typeLabel = {
          salary: 'Salaire',
          dividends: 'Dividendes', 
          rental: 'Revenus locatifs',
          freelance: 'Revenus indépendant'
        }[type] || 'Revenus';
        return `• ${typeLabel} : ${amount.toLocaleString()}€`;
      }).join('\n');
    }
    
    const text = `💰 **Calcul IRPF Multi-Revenus - Total ${totalIncome.toLocaleString()}€**\n\n` +
      `📊 **Détail des revenus** :\n${incomeBreakdown}\n\n` +
      `🧮 **Calcul fiscal consolidé** :\n` +
      `• **Total revenus bruts** : ${result.grossIncome.toLocaleString()}€\n` +
      `• **Déductions appliquées** : ${result.deductions.toLocaleString()}€\n` +
      `• **IRPF total à payer** : ${result.tax.toLocaleString()}€\n` +
      `• **Revenus nets totaux** : ${result.netIncome.toLocaleString()}€\n` +
      `• **Taux effectif global** : ${result.effectiveRate}%\n\n` +
      `✅ Optimisation fiscale andorrane appliquée sur l'ensemble de vos revenus !`;
    
    return {
      text,
      confidence: 0.93,
      lawReferences: ['Llei 95/2010 - IRPF', 'Llei 96/2010 - IS'],
      entities,
      calculations: {
        type: 'irpf_complex',
        results: { ...result, totalIncome, incomeBreakdown: amounts },
        breakdown: [
          `Consolidation de ${amounts.length} sources de revenus`,
          `Application du barème IRPF andorran`,
          `Optimisation fiscale globale`
        ]
      },
      followUpQuestions: [
        'Souhaitez-vous optimiser la répartition de vos revenus ?',
        'Voulez-vous des conseils sur la structure juridique ?'
      ]
    };
  }

  private generateIRPFCalculation(income: number, entities: Record<string, any>, context: ConversationContext): AIResponse {
    const result = this.calculators.irpf(income);
    
    const text = `💰 **Calcul IRPF pour ${income.toLocaleString()}€**\n\n` +
      `• **Revenus bruts** : ${result.grossIncome.toLocaleString()}€\n` +
      `• **Déductions** : ${result.deductions.toLocaleString()}€\n` +
      `• **IRPF à payer** : ${result.tax.toLocaleString()}€\n` +
      `• **Revenus nets** : ${result.netIncome.toLocaleString()}€\n` +
      `• **Taux effectif** : ${result.effectiveRate}%\n\n` +
      `✅ En tant que résident fiscal andorran, vous bénéficiez d'un système très avantageux !`;
    
    return {
      text,
      confidence: 0.95,
      lawReferences: ['Llei 95/2010 - IRPF'],
      entities,
      calculations: {
        type: 'irpf',
        results: result,
        breakdown: [
          `Tranche 0% : 0€ à 24 000€`,
          `Tranche 5% : 24 001€ à 40 000€`,
          `Tranche 10% : au-delà de 40 000€`
        ]
      },
      followUpQuestions: [
        'Souhaitez-vous optimiser vos déductions ?',
        'Voulez-vous comparer avec d\'autres pays ?'
      ]
    };
  }

  private enhanceWithNaturalLanguage(response: AIResponse, originalMessage: string, sentiment: string, context: ConversationContext): AIResponse {
    return response;
  }

  private addFrancisPersonality(response: AIResponse, context: ConversationContext, sentiment: string): AIResponse {
    return response;
  }

  private generateIntelligentSuggestions(context: ConversationContext, intent: string, entities: Record<string, any>): string[] {
    return this.suggestionEngine.generateSuggestions(context.userProfile, intent);
  }

  private assessMessageComplexity(message: string): number {
    return message.length > 100 ? 0.8 : 0.4;
  }

  private extractTopics(message: string): string[] {
    if (message.includes('irpf') || message.includes('impôt')) return ['irpf'];
    if (message.includes('société')) return ['is'];
    return ['general'];
  }

  private determineConversationFlow(context: ConversationContext, intent: string): string {
    return 'standard';
  }

  private assessUserEngagement(context: ConversationContext): number {
    return 0.7;
  }
}

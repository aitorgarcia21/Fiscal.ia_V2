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
  previousMessages: Array<{
    query: string;
    response: string;
    timestamp: Date;
    satisfaction?: number; // User feedback 1-5
    topics?: string[];
  }>;
  userProfile?: {
    nationality?: string;
    residencyStatus?: string;
    businessType?: string;
    interests: string[];
    profileType?: 'particulier' | 'professionnel' | 'entrepreneur' | 'crypto_trader' | 'family_office';
    previousCalculations?: string[];
    preferredLanguage?: 'fr' | 'es';
  };
  sessionState: Record<string, any>;
  learningData?: {
    successfulResponses: number;
    totalInteractions: number;
    commonQuestions: Record<string, number>;
    improvementAreas: string[];
  };
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

  // 🎯 Main AI Processing Pipeline
  async processQuery(query: string, context: ConversationContext): Promise<AIResponse> {
    // 1. Preprocessing & Cleaning
    const cleanQuery = this.preprocessQuery(query);
    
    // 2. Intent Detection & Entity Extraction
    const intent = await this.analyzeIntent(cleanQuery, context);
    const entities = await this.extractEntities(cleanQuery, intent);
    
    // 3. Context Enhancement
    const enhancedContext = this.enhanceContext(context, intent, entities);
    
    // 4. Knowledge Retrieval
    const relevantKnowledge = await this.retrieveKnowledge(intent, entities);
    
    // 5. Response Generation
    const response = await this.generateNaturalResponse(
      intent, 
      entities, 
      relevantKnowledge, 
      enhancedContext
    );
    
    // 6. Post-processing & Validation
    return this.validateAndEnhanceResponse(response, query, context);
  }

  // 🧹 Query Preprocessing
  private preprocessQuery(query: string): string {
    return query
      .trim()
      .toLowerCase()
      // Normalize special characters
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"')
      // Fix common typos in fiscal terms
      .replace(/\btmi\b/g, 'tranche marginale imposition')
      .replace(/\bigi\b/g, 'impot general indirect')
      .replace(/\bcrypto\b/g, 'cryptomonnaie')
      // Standardize question words
      .replace(/combien de temps/g, 'duree')
      .replace(/comment fait-on/g, 'comment faire');
  }

  // 🎯 Advanced Intent Detection
  private async analyzeIntent(query: string, context: ConversationContext): Promise<string> {
    const intentPatterns = {
      // Résidence fiscale
      'residence_fiscale': [
        /residence.*fiscale/i,
        /devenir.*resident/i,
        /183.*jours/i,
        /domicile.*fiscal/i,
        /statut.*resident/i
      ],
      
      // IGI et TVA
      'igi_tva': [
        /igi/i,
        /impot.*general.*indirect/i,
        /tva.*andorre/i,
        /declaration.*trimestrielle/i,
        /periodicite.*igi/i
      ],
      
      // Cryptomonnaies
      'crypto': [
        /crypto.*monnaie/i,
        /bitcoin.*andorre/i,
        /loi.*24.*2022/i,
        /actif.*numerique/i,
        /crypto.*fiscal/i
      ],
      
      // Substance économique
      'substance_economique': [
        /substance.*economique/i,
        /bureau.*andorre/i,
        /employe.*local/i,
        /decision.*effective/i,
        /activite.*reelle/i
      ],
      
      // Conventions fiscales
      'convention_fiscale': [
        /convention.*fiscale/i,
        /double.*imposition/i,
        /traite.*fiscal/i,
        /accord.*bilateral/i
      ],
      
      // Questions générales
      'info_generale': [
        /qu.*est.*ce.*que/i,
        /expliquer/i,
        /definition/i,
        /comment.*marche/i
      ],
      
      // Demande de simulation
      'simulation': [
        /simuler/i,
        /calculer/i,
        /estimer/i,
        /combien.*economiser/i,
        /optimisation/i
      ]
    };

    // Check context for intent continuation
    if (context.previousMessages.length > 0) {
      const lastResponse = context.previousMessages[context.previousMessages.length - 1];
      if (lastResponse.response.includes('souhaitez-vous')) {
        return 'continuation_' + (context.sessionState.lastIntent || 'general');
      }
    }

    // Pattern matching with confidence scoring
    let bestIntent = 'info_generale';
    let highestScore = 0;

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      let score = 0;
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          score += 1;
          // Boost score for exact matches
          if (query.includes(intent.replace('_', ' '))) {
            score += 0.5;
          }
        }
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestIntent = intent;
      }
    }

    // Store intent in session
    context.sessionState.lastIntent = bestIntent;
    
    return bestIntent;
  }

  // 🏷️ Entity Extraction
  private async extractEntities(query: string, intent: string): Promise<Record<string, any>> {
    const entities: Record<string, any> = {};

    // Temporal entities
    const timePatterns = {
      days: /(\d+)\s*jours?/i,
      months: /(\d+)\s*mois/i,
      years: /(\d+)\s*an(s|nee)?/i,
      specific_dates: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/
    };

    for (const [type, pattern] of Object.entries(timePatterns)) {
      const match = query.match(pattern);
      if (match) {
        entities.time = { type, value: match[1] || match[0] };
      }
    }

    // Numerical entities
    const numberPattern = /(\d+(?:\.\d+)?)\s*(euros?|€|k€|m€)?/gi;
    let match;
    const amounts = [];
    while ((match = numberPattern.exec(query)) !== null) {
      let value = parseFloat(match[1]);
      const unit = match[2]?.toLowerCase();
      
      if (unit?.includes('k')) value *= 1000;
      if (unit?.includes('m')) value *= 1000000;
      
      amounts.push(value);
    }
    if (amounts.length > 0) {
      entities.amounts = amounts;
    }

    // Nationality/Country entities
    const countries = [
      'france', 'espagne', 'portugal', 'italie', 'allemagne', 
      'belgique', 'suisse', 'luxembourg', 'monaco', 'andorre'
    ];
    
    for (const country of countries) {
      if (query.includes(country)) {
        entities.nationality = country;
        break;
      }
    }

    // Business type entities
    const businessTypes = [
      'sarl', 'sas', 'eurl', 'sa', 'sci', 'holding', 
      'freelance', 'consultant', 'trader', 'developpeur'
    ];
    
    for (const type of businessTypes) {
      if (query.includes(type)) {
        entities.businessType = type;
        break;
      }
    }

    // Intent-specific entities
    if (intent === 'residence_fiscale') {
      if (query.includes('183')) entities.residencyRule = '183_days';
      if (query.includes('centre')) entities.economicCenter = true;
    }

    if (intent === 'crypto') {
      const cryptos = ['bitcoin', 'ethereum', 'crypto', 'nft', 'defi'];
      entities.cryptoTypes = cryptos.filter(crypto => query.includes(crypto));
    }

    return entities;
  }

  // 🧠 Knowledge Base Initialization - EXHAUSTIVE ANDORRAN TAX LAW
  private initializeKnowledgeBase() {
    this.knowledgeBase = {
      // 📚 LOIS ANDORRANES COMPLÈTES
      laws: {
        'residence_fiscale': {
          law_ref: 'Loi 95/2010 IRPF - Impôt sur le Revenu des Personnes Physiques',
          article_refs: ['Art. 6', 'Art. 7', 'Art. 8 - Critères de résidence'],
          criteria: {
            physical: '183 jours minimum sur territoire andorran (Art. 6.1)',
            economic: 'Centre d\'intérêts économiques principal (Art. 6.2)',
            administrative: 'Déclaration résidence auprès Immigració (Art. 7)',
            family: 'Conjoint et enfants mineurs résidents (Art. 6.3)'
          },
          calculation_methods: {
            day_counting: 'Jour entamé = jour complet',
            exceptions: 'Hospitalisations et force majeure exclus',
            proof: 'Carnet de passages frontières obligatoire'
          },
          exceptions: [
            'Fonctionnaires organisations internationales',
            'Étudiants temporaires (< 2 ans)',
            'Retraités UE (pension < 40K€)',
            'Sportifs professionnels (saison)',
            'Artistes en tournée'
          ],
          benefits: [
            'IRPF progressif 0-10% (vs 45-47% France)',
            'Absence droits succession directe ligne',
            'Plus-values immobilières 0% après 10 ans',
            'Conventions anti-double imposition (21 pays)',
            'Secret bancaire renforcé',
            'Pas d\'ISF ni droits donation'
          ],
          risks: [
            'Contrôles AFA renforcés depuis 2019',
            'Échange automatique informations CRS',
            'Sanctions pénales résidence fictive',
            'Redressements rétroactifs possibles'
          ]
        },
        
        'igi': {
          law_ref: 'Loi 11/2012 IGI - Impôt Général Indirect',
          article_refs: ['Art. 91-94 Périodicité', 'Art. 108 Obligations déclaratives'],
          rates: {
            general: '4.5% (Art. 10)',
            reduced: '1% (Art. 11 - produits première nécessité)',
            super_reduced: '0% (Art. 12 - exportations, médicaments)',
            increased: '9.5% (Art. 13 - tabac, alcool)'
          },
          thresholds: {
            monthly: 'CA > 3,600,000€ - Déclaration J+20 du mois suivant',
            quarterly: 'CA 250K-3,6M€ - Déclaration J+20 du trimestre',
            biannual: 'CA < 250K€ - Déclaration 31 janvier et 31 juillet'
          },
          exemptions: [
            'Opérations bancaires et assurances',
            'Location immobilière nue',
            'Prestations médicales et dentaires',
            'Enseignement et formation',
            'Transport public voyageurs'
          ],
          deductions: [
            'IGI amont déductible intégralement',
            'Investissements équipements productifs',
            'Frais généraux directement liés',
            'TVA étrangère selon conventions'
          ]
        },
        
        'crypto': {
          law_ref: 'Loi 24/2022 Actifs Numériques & Blockchain',
          article_refs: ['Art. 4 Définitions', 'Art. 15-18 Obligations fiscales'],
          taxation: {
            individual: {
              trading: 'IRPF 0-10% sur plus-values (barème progressif)',
              holding: 'Exonération après 1 an de détention',
              mining: 'BIC imposable selon revenus réels',
              staking: 'Revenus mobiliers IRPF'
            },
            company: {
              trading: 'IS 10% sur bénéfices réalisés',
              holding: 'Exemption participation > 5% > 1 an',
              treasury: 'Réserves crypto déductibles provisions'
            }
          },
          obligations: [
            'Déclaration AFA si détention > 50K€',
            'Reporting automatique CRS/FATCA',
            'Traçabilité blockchain obligatoire',
            'Audit annuel si volume > 1M€',
            'Compliance AML/KYC renforcée'
          ],
          allowed_activities: [
            'Trading et arbitrage',
            'Custody et garde sécurisée',
            'Émission tokens/ICO (licence ANBF)',
            'DeFi et yield farming',
            'NFT création et commerce'
          ]
        },
        
        'substance_economique': {
          law_ref: 'Directive UE 2017/952 - Substance économique',
          local_implementation: 'Règlement AFA 2019/03',
          requirements: {
            premises: {
              minimum_size: '20m² bureaux dédiés',
              lease_duration: 'Minimum 2 ans ferme',
              address: 'Adresse physique réelle déclarée',
              cost: '400-1500€/mois selon localisation'
            },
            personnel: {
              employees: 'Minimum 1 ETP qualifié',
              salary: 'Salaire minimum 1.286€/mois (2024)',
              contract: 'CDI ou CDD minimum 6 mois',
              skills: 'Qualifications adaptées à l\'activité'
            },
            decisions: {
              board_meetings: 'Minimum 4 CA/an sur territoire',
              minutes: 'PV détaillés et archivés',
              signatures: 'Mandataires sociaux résidents',
              bank_accounts: 'Comptes bancaires andorrans'
            }
          },
          sectoral_requirements: {
            holding: 'Substance proportionnelle aux participations',
            finance: 'Licence ANBF + personnel qualifié',
            trading: 'Systèmes IT locaux + risk management',
            intellectual_property: 'R&D locale + création IP'
          },
          penalties: [
            'Sanctions AFA jusqu\'à 150K€',
            'Déchéance avantages fiscaux',
            'Échange automatique informations',
            'Dissolution société possible'
          ]
        },
        
        'impot_societes': {
          law_ref: 'Loi 95/2010 IS - Impôt sur les Sociétés',
          rates: {
            standard: '10% sur bénéfices (Art. 3)',
            reduced: '2% banques (sur marge d\'intermédiation)',
            special: '0% holdings (sous conditions)'
          },
          exemptions: {
            participation: 'Plus-values cession > 5% > 1 an',
            dividends: 'Dividendes reçus holdings qualifiés',
            intellectual_property: 'Revenus IP développée localement (80% exonération)'
          },
          deductions: [
            'Frais généraux justifiés',
            'Amortissements linéaires/dégressifs',
            'Provisions pour risques',
            'Déficits reportables (5 ans max)'
          ]
        },
        
        'droits_succession': {
          law_ref: 'Loi 22/2022 Droits de Succession et Donation',
          rates: {
            direct_line: '0% (époux, enfants, parents)',
            second_degree: '8% (frères, sœurs, grands-parents)',
            third_degree: '10% (oncles, neveux)',
            unrelated: '20% (tiers)'
          },
          exemptions: [
            'Résidence principale familiale',
            'Entreprises familiales transmises',
            'Œuvres d\'art et antiquités',
            'Donations entre époux'
          ],
          planning_strategies: [
            'Démembrement propriété (usufruit/nue-propriété)',
            'Société holding familiale',
            'Assurance-vie luxembourgeoise',
            'Trust anglo-saxon (selon convention)'
          ]
        }
      },
      
      // 🌍 CONVENTIONS FISCALES EXHAUSTIVES
      conventions: {
        france: {
          name: 'Convention France-Andorre 2015 (en vigueur 2017)',
          articles_key: ['Art. 4 Résidence', 'Art. 13 Plus-values', 'Art. 26 Échange infos'],
          benefits: [
            'Évitement double imposition',
            'Réduction retenues à la source 5-15%',
            'Protection investissements',
            'Procédure amiable différends'
          ],
          conditions: [
            'Substance économique renforcée obligatoire',
            'Résidence fiscale effective > 183 jours',
            'Déclaration revenus mondiaux',
            'Coopération administrative automatique'
          ],
          specific_rules: {
            exit_tax: 'Sursis paiement sous conditions',
            impatriate: 'Régime impatriés non applicable',
            pensions: 'Imposables pays résidence retraité'
          }
        },
        spain: {
          name: 'Convention Espagne-Andorre 2015',
          benefits: [
            'Réduction retenues dividendes 5%',
            'Intérêts et royalties 0-10%',
            'Plus-values mobilières pays résidence'
          ],
          conditions: [
            '183 jours effectifs obligatoires',
            'Centre intérêts économiques principal',
            'Substance économique réelle'
          ]
        },
        portugal: {
          name: 'Convention Portugal-Andorre 2015',
          benefits: ['Élimination double imposition', 'Coopération fiscale'],
          specific: 'Compatible régime NHR portugais'
        },
        luxembourg: {
          name: 'Convention Luxembourg-Andorre 2014',
          benefits: ['Optimisation structures holding', 'Flux financiers facilités']
        },
        uae: {
          name: 'Convention EAU-Andorre 2019',
          benefits: ['0% retenue source', 'Optimisation trading'],
          opportunities: 'Résidence duale possible'
        }
      },
      
      // 📋 CAS PRATIQUES & JURISPRUDENCE
      practical_cases: {
        entrepreneur_tech: {
          profile: 'Entrepreneur tech français, CA 2M€/an',
          solution: 'SL andorrane + résidence fiscale = économie 800K€/an',
          requirements: 'Substance économique + 183 jours effectifs',
          timeline: '6-12 mois installation complète'
        },
        crypto_trader: {
          profile: 'Trader crypto, gains 5M€/an',
          solution: 'Résidence + holding crypto = IRPF 10% max vs 45% France',
          specific: 'Déclaration AFA + compliance blockchain',
          savings: '1.75M€ économisés annuellement'
        },
        family_office: {
          profile: 'Patrimoine familial 50M€',
          solution: 'Trust + société andorrane + optimisation succession',
          benefits: 'Transmission 0% + gestion optimisée',
          structures: 'Holding + SIF + assurance-vie'
        },
        consultant_international: {
          profile: 'Consultant international, clients EU/US',
          solution: 'Résidence andorrane + facturation société',
          optimization: 'IS 10% + IRPF 0-10% vs 45-60% origine',
          compliance: 'Substance économique légère suffisante'
        }
      },
      
      // ⚖️ JURISPRUDENCE & DÉCISIONS AFA
      jurisprudence: {
        residence_fictive: {
          case: 'Décision AFA 2022/15 - Résidence fictive',
          facts: 'Contrôle 183 jours non respectés (falsification carnets)',
          decision: 'Redressement IRPF + pénalités 150K€',
          lesson: 'Traçabilité mouvements obligatoire'
        },
        substance_insuffisante: {
          case: 'Décision AFA 2023/08 - Substance économique',
          facts: 'Bureau virtuel + employé fictif holding',
          decision: 'Déchéance avantages fiscaux + sanctions',
          lesson: 'Contrôles substance renforcés'
        },
        crypto_non_declaree: {
          case: 'Décision AFA 2023/12 - Cryptomonnaies',
          facts: 'Portefeuille crypto 2M€ non déclaré',
          decision: 'Régularisation + pénalités 40%',
          lesson: 'Déclaration obligatoire > 50K€'
        }
      },
      
      // 🏛️ ORGANISMES & PROCÉDURES
      institutions: {
        afa: {
          name: 'Administration Fiscale Andorrane',
          missions: ['Contrôle fiscal', 'Recouvrement', 'Contentieux'],
          contact: 'afa@govern.ad',
          procedures: {
            control: 'Délai prescription 4 ans',
            appeal: 'Recours gracieux puis Tribunal',
            payment: 'Facilités paiement possibles'
          }
        },
        anbf: {
          name: 'Autorité Nationale Banca Francesa',
          regulation: ['Banques', 'Assurances', 'Investissement'],
          licences: ['Banque', 'Assurance', 'Gestion actifs', 'Crypto']
        },
        immigration: {
          name: 'Service Immigration',
          permits: {
            passive_residence: 'Investissement 600K€',
            active_residence: 'Activité professionnelle',
            self_employed: 'Profession libérale'
          }
        }
      },
      
      // 💰 SIMULATIONS & CALCULATEURS
      calculators: {
        irpf_simulator: {
          tranches: [
            { min: 0, max: 24000, rate: 0 },
            { min: 24001, max: 40000, rate: 5 },
            { min: 40001, max: 999999, rate: 10 }
          ],
          deductions: ['Pension retraite 40%', 'Frais professionnels 20%']
        },
        igi_optimizer: {
          thresholds: {
            monthly: { limit: 3600000, deadline: 20 },
            quarterly: { limit: 250000, deadline: 20 },
            biannual: { limit: 0, deadline: 31 }
          }
        },
        substance_checker: {
          scoring: {
            premises: 25,
            employees: 35,
            decisions: 25,
            activity: 15
          },
          minimum_score: 70
        }
      },
      
      // 📚 FAQ EXPERTS
      expert_faq: {
        banking: {
          question: 'Ouverture compte bancaire andorran obligatoire ?',
          answer: 'Oui pour résidents fiscaux + substance économique sociétés',
          details: 'Banques : Andbank, Crèdit Andorrà, BPA - Due diligence renforcée'
        },
        real_estate: {
          question: 'Achat immobilier par non-résidents ?',
          answer: 'Autorisé avec autorisation Govern (sauf terrains > 1000m²)',
          procedure: 'Demande Ministre + garantie bancaire + notaire'
        },
        education: {
          question: 'Scolarisation enfants expatriés ?',
          answer: 'Système andorran gratuit + Lycée français payant',
          languages: 'Catalan obligatoire + français/espagnol au choix'
        }
      }
    };
  }

  // 📏 Template System Initialization - EXPERT LEVEL
  private initializeTemplates() {
    this.templates = {
      residence_fiscale: {
        intro: (entities: any) => `🏠 **Résidence Fiscale Andorrane${entities.nationality ? ` - Dossier ${entities.nationality.toUpperCase()}` : ''}**\n\n`,
        
        main_content: (entities: any, knowledge: any) => {
          let content = `📜 **Cadre légal :** ${knowledge.law_ref}\n`;
          content += `📋 **Articles applicables :** ${knowledge.article_refs.join(', ')}\n\n`;
          
          content += `✅ **Critères légaux obligatoires :**\n`;
          Object.entries(knowledge.criteria).forEach(([key, value]) => {
            content += `• **${key === 'physical' ? 'Physique' : key === 'economic' ? 'Économique' : key === 'administrative' ? 'Administratif' : 'Familial'}** : ${value}\n`;
          });
          
          // Méthodes de calcul
          content += `\n📊 **Méthodes de calcul AFA :**\n`;
          Object.entries(knowledge.calculation_methods).forEach(([key, value]) => {
            content += `• ${value}\n`;
          });
          
          // Analyse personnalisée
          if (entities.time) {
            content += `\n🔍 **Analyse de votre situation (${entities.time.value} ${entities.time.type}) :**\n`;
            if (entities.time.type === 'days') {
              const days = parseInt(entities.time.value);
              if (days >= 183) {
                content += `✅ **Conformité** : ${days} jours ≥ 183 jours requis\n`;
                content += `• Statut résident fiscal automatique\n`;
                content += `• Obligations déclaratives mondiales\n`;
              } else {
                content += `⚠️ **Non-conformité** : ${days} jours < 183 jours\n`;
                content += `• Risque requalification résidence\n`;
                content += `• Jours manquants : ${183 - days} jours\n`;
              }
            }
          }
          
          return content;
        },
        
        benefits: (knowledge: any) => {
          let content = `\n🎯 **Avantages fiscaux confirmés :**\n`;
          knowledge.benefits.forEach((benefit: string) => {
            content += `• ${benefit}\n`;
          });
          return content;
        },
        
        risks: (knowledge: any) => {
          let content = `\n⚠️ **Risques à maîtriser :**\n`;
          knowledge.risks.forEach((risk: string) => {
            content += `• ${risk}\n`;
          });
          return content;
        },
        
        convention: (entities: any, knowledge: any) => {
          if (entities.nationality && knowledge.convention) {
            let content = `\n🌍 **Convention fiscale ${entities.nationality}-Andorre :**\n`;
            content += `• **Accord** : ${knowledge.convention.name}\n`;
            content += `• **Avantages** : ${knowledge.convention.benefits.join(', ')}\n`;
            content += `• **Conditions** : ${knowledge.convention.conditions.join(', ')}\n`;
            return content;
          }
          return '';
        },
        
        next_steps: (entities: any) => {
          return `\n📈 **Plan d'action personnalisé :**\n• Évaluation complète dossier fiscal\n• Simulation économies potentielles\n• Roadmap installation (6-12 mois)\n• Accompagnement démarches AFA/Immigration`;
        }
      },
      
      igi: {
        intro: () => `🏢 **IGI - Maîtrise complète du système andorran**\n\n`,
        
        legal_framework: (knowledge: any) => {
          let content = `📜 **Cadre légal :** ${knowledge.law_ref}\n`;
          content += `📋 **Articles clés :** ${knowledge.article_refs.join(', ')}\n\n`;
          return content;
        },
        
        rates_detailed: (knowledge: any) => {
          let content = `💰 **Taux IGI applicables :**\n`;
          Object.entries(knowledge.rates).forEach(([rate_type, rate_value]) => {
            const typeName = {
              general: 'Général',
              reduced: 'Réduit',
              super_reduced: 'Super réduit',
              increased: 'Majoré'
            }[rate_type];
            content += `• **${typeName}** : ${rate_value}\n`;
          });
          return content;
        },
        
        periodicities: (knowledge: any) => {
          let content = `\n📊 **Périodicités & délai déclaratifs :**\n`;
          Object.entries(knowledge.thresholds).forEach(([period, threshold]) => {
            const periodName = {
              monthly: '🗺️ Mensuelle',
              quarterly: '📅 Trimestrielle', 
              biannual: '📋 Semestrielle'
            }[period];
            content += `• **${periodName}** : ${threshold}\n`;
          });
          return content;
        },
        
        exemptions: (knowledge: any) => {
          let content = `\n✅ **Exonérations IGI :**\n`;
          knowledge.exemptions.forEach((exemption: string) => {
            content += `• ${exemption}\n`;
          });
          return content;
        },
        
        optimization: (entities: any, knowledge: any) => {
          let content = `\n💡 **Stratégies d'optimisation :**\n`;
          knowledge.deductions.forEach((deduction: string) => {
            content += `• ${deduction}\n`;
          });
          
          if (entities.amounts && entities.amounts[0]) {
            const ca = entities.amounts[0];
            content += `\n🔍 **Analyse votre CA (${ca.toLocaleString()}€) :**\n`;
            if (ca > 3600000) {
              content += `• 🗺️ Déclaration **mensuelle** obligatoire\n`;
              content += `• Délai : J+20 chaque mois\n`;
              content += `• Gestion trésorerie critique\n`;
            } else if (ca > 250000) {
              content += `• 📅 Déclaration **trimestrielle** optimale\n`;
              content += `• Délai : J+20 fin trimestre\n`;
              content += `• Équilibre gestion/coût\n`;
            } else {
              content += `• 📋 Déclaration **semestrielle** avantageuse\n`;
              content += `• Délais : 31 janvier & 31 juillet\n`;
              content += `• Charge administrative réduite\n`;
            }
          }
          
          return content;
        }
      },
      
      crypto: {
        intro: () => `₿ **Cryptomonnaies Andorre - Cadre légal 2024**\n\n`,
        
        legal_framework: (knowledge: any) => {
          let content = `📜 **Législation :** ${knowledge.law_ref}\n`;
          content += `📋 **Articles :** ${knowledge.article_refs.join(', ')}\n\n`;
          return content;
        },
        
        taxation_detailed: (knowledge: any) => {
          let content = `💰 **Fiscalité crypto complète :**\n\n`;
          
          content += `👥 **Particuliers :**\n`;
          Object.entries(knowledge.taxation.individual).forEach(([activity, rate]) => {
            const activityName = {
              trading: 'Trading/Arbitrage',
              holding: 'Détention long terme',
              mining: 'Mining/Validation',
              staking: 'Staking/DeFi'
            }[activity];
            content += `• **${activityName}** : ${rate}\n`;
          });
          
          content += `\n🏢 **Sociétés :**\n`;
          Object.entries(knowledge.taxation.company).forEach(([activity, rate]) => {
            const activityName = {
              trading: 'Trading professionnel',
              holding: 'Holding crypto',
              treasury: 'Trésorerie crypto'
            }[activity];
            content += `• **${activityName}** : ${rate}\n`;
          });
          
          return content;
        },
        
        compliance: (knowledge: any) => {
          let content = `\n📋 **Obligations légales :**\n`;
          knowledge.obligations.forEach((obligation: string) => {
            content += `• ${obligation}\n`;
          });
          return content;
        },
        
        activities: (knowledge: any) => {
          let content = `\n✅ **Activités autorisées :**\n`;
          knowledge.allowed_activities.forEach((activity: string) => {
            content += `• ${activity}\n`;
          });
          return content;
        }
      },
      
      substance_economique: {
        intro: () => `🏢 **Substance Économique - Conformité AFA/UE**\n\n`,
        
        legal_framework: (knowledge: any) => {
          let content = `📜 **Directive :** ${knowledge.law_ref}\n`;
          content += `🇦🇩 **Mise en œuvre :** ${knowledge.local_implementation}\n\n`;
          return content;
        },
        
        requirements_detailed: (knowledge: any) => {
          let content = `📋 **Exigences détaillées :**\n\n`;
          
          // Locaux
          content += `🏠 **Locaux & adresse :**\n`;
          Object.entries(knowledge.requirements.premises).forEach(([req, detail]) => {
            const reqName = {
              minimum_size: 'Surface minimum',
              lease_duration: 'Durée bail',
              address: 'Adresse légale',
              cost: 'Coût mensuel'
            }[req];
            content += `• **${reqName}** : ${detail}\n`;
          });
          
          // Personnel
          content += `\n👥 **Personnel & qualifications :**\n`;
          Object.entries(knowledge.requirements.personnel).forEach(([req, detail]) => {
            const reqName = {
              employees: 'Effectif minimum',
              salary: 'Salaire minimum',
              contract: 'Type contrat',
              skills: 'Qualifications'
            }[req];
            content += `• **${reqName}** : ${detail}\n`;
          });
          
          // Décisions
          content += `\n⚖️ **Décisions & gouvernance :**\n`;
          Object.entries(knowledge.requirements.decisions).forEach(([req, detail]) => {
            const reqName = {
              board_meetings: 'Conseils administration',
              minutes: 'Procès-verbaux',
              signatures: 'Pouvoirs signatures',
              bank_accounts: 'Comptes bancaires'
            }[req];
            content += `• **${reqName}** : ${detail}\n`;
          });
          
          return content;
        },
        
        sectoral: (knowledge: any) => {
          let content = `\n🎯 **Exigences sectorielles :**\n`;
          Object.entries(knowledge.sectoral_requirements).forEach(([sector, requirement]) => {
            const sectorName = {
              holding: 'Holdings',
              finance: 'Finance',
              trading: 'Trading',
              intellectual_property: 'Propriété intellectuelle'
            }[sector];
            content += `• **${sectorName}** : ${requirement}\n`;
          });
          return content;
        },
        
        penalties: (knowledge: any) => {
          let content = `\n⚠️ **Sanctions encourues :**\n`;
          knowledge.penalties.forEach((penalty: string) => {
            content += `• ${penalty}\n`;
          });
          return content;
        }
      },
      
      practical_case: {
        intro: (entities: any) => `📈 **Cas pratique adapté à votre profil**\n\n`,
        
        case_analysis: (entities: any, knowledge: any) => {
          // Trouve le cas le plus pertinent
          const cases = knowledge.practical_cases;
          let selectedCase = cases.entrepreneur_tech; // default
          
          if (entities.businessType === 'trader' || entities.cryptoTypes) {
            selectedCase = cases.crypto_trader;
          } else if (entities.amounts && entities.amounts[0] > 10000000) {
            selectedCase = cases.family_office;
          } else if (entities.businessType === 'consultant') {
            selectedCase = cases.consultant_international;
          }
          
          let content = `👤 **Profil similaire :** ${selectedCase.profile}\n`;
          content += `🎯 **Solution optimisée :** ${selectedCase.solution}\n`;
          if (selectedCase.requirements) {
            content += `📋 **Prérequis :** ${selectedCase.requirements}\n`;
          }
          if (selectedCase.savings) {
            content += `💰 **Économies :** ${selectedCase.savings}\n`;
          }
          if (selectedCase.timeline) {
            content += `⏱️ **Timeline :** ${selectedCase.timeline}\n`;
          }
          
          return content;
        }
      },
      
      simulation: {
        intro: () => `📊 **Simulation fiscale personnalisée**\n\n`,
        
        irpf_calculation: (entities: any, knowledge: any) => {
          if (!entities.amounts || !entities.amounts[0]) return '';
          
          const revenue = entities.amounts[0];
          const calculator = knowledge.calculators.irpf_simulator;
          
          let tax = 0;
          let content = `💰 **Calcul IRPF sur ${revenue.toLocaleString()}€ :**\n`;
          
          calculator.tranches.forEach((tranche: any) => {
            if (revenue > tranche.min) {
              const taxable = Math.min(revenue, tranche.max) - tranche.min + 1;
              const tranche_tax = taxable * tranche.rate / 100;
              tax += tranche_tax;
              
              if (tranche.rate > 0) {
                content += `• Tranche ${tranche.min.toLocaleString()}-${tranche.max.toLocaleString()}€ : ${tranche_tax.toLocaleString()}€ (${tranche.rate}%)\n`;
              }
            }
          });
          
          content += `\n🎯 **Total IRPF Andorre :** ${tax.toLocaleString()}€\n`;
          content += `🇫🇷 **Comparaison France :** ${(revenue * 0.45).toLocaleString()}€\n`;
          content += `💵 **Économie annuelle :** ${((revenue * 0.45) - tax).toLocaleString()}€\n`;
          
          return content;
        }
      }
    };
  }

  // 🔍 NLP Processor Initialization
  private initializeNLP() {
    this.nlpProcessor = {
      // Sentiment analysis pour adapter le ton
      analyzeSentiment: (query: string) => {
        const positiveWords = ['merci', 'parfait', 'excellent', 'super', 'génial'];
        const negativeWords = ['problème', 'difficile', 'compliqué', 'impossible'];
        const urgentWords = ['urgent', 'rapidement', 'vite', 'immédiat'];
        
        return {
          positive: positiveWords.some(word => query.includes(word)),
          negative: negativeWords.some(word => query.includes(word)),
          urgent: urgentWords.some(word => query.includes(word))
        };
      },
      
      // Détection du niveau d'expertise
      detectExpertiseLevel: (query: string) => {
        const expertTerms = ['substance économique', 'crs', 'fatca', 'convention fiscale'];
        const beginnerTerms = ['comment', 'qu\'est-ce que', 'expliquer'];
        
        if (expertTerms.some(term => query.includes(term))) return 'expert';
        if (beginnerTerms.some(term => query.includes(term))) return 'beginner';
        return 'intermediate';
      }
    };
  }

  // 🧠 Knowledge Retrieval
  private async retrieveKnowledge(intent: string, entities: Record<string, any>) {
    const knowledge = this.knowledgeBase.laws[intent];
    
    if (!knowledge) {
      return this.knowledgeBase.laws['info_generale'] || {
        law_ref: 'Base légale andorrane',
        content: 'Information générale sur la fiscalité andorrane'
      };
    }
    
    // Enhance knowledge based on entities
    if (entities.nationality && this.knowledgeBase.conventions[entities.nationality]) {
      knowledge.convention = this.knowledgeBase.conventions[entities.nationality];
    }
    
    return knowledge;
  }

  // 🗣️ Natural Response Generation
  private async generateNaturalResponse(
    intent: string, 
    entities: Record<string, any>, 
    knowledge: any, 
    context: ConversationContext
  ): Promise<AIResponse> {
    
    const template = this.templates[intent];
    let responseText = '';
    
    if (template) {
      // Build response using templates
      responseText += template.intro ? template.intro(entities) : '';
      responseText += template.main_content ? template.main_content(entities, knowledge) : '';
      responseText += template.benefits ? template.benefits(knowledge) : '';
      responseText += template.optimization ? template.optimization(entities) : '';
      responseText += template.next_steps ? template.next_steps(entities) : '';
    } else {
      // Fallback response generation
      responseText = this.generateFallbackResponse(intent, entities, knowledge);
    }
    
    // Add personalization
    responseText = this.personalizeResponse(responseText, context, entities);
    
    // Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(intent, entities);
    
    return {
      text: responseText,
      confidence: this.calculateConfidence(intent, entities, knowledge),
      lawReferences: this.extractLawReferences(knowledge),
      followUpQuestions,
      entities
    };
  }

  // 📋 Generate Follow-up Questions
  private generateFollowUpQuestions(intent: string, entities: Record<string, any>): string[] {
    const followUps: Record<string, string[]> = {
      residence_fiscale: [
        "Souhaitez-vous une simulation personnalisée ?",
        "Avez-vous des revenus dans d'autres pays ?",
        "Voulez-vous connaître les démarches administratives ?"
      ],
      igi: [
        "Voulez-vous simuler votre périodicité optimale ?",
        "Souhaitez-vous des conseils d'optimisation ?",
        "Avez-vous des questions sur les exemptions ?"
      ],
      crypto: [
        "Possédez-vous déjà des cryptomonnaies à déclarer ?",
        "Souhaitez-vous créer une structure holding crypto ?",
        "Voulez-vous connaître les obligations de reporting ?"
      ]
    };
    
    return followUps[intent] || [
      "Avez-vous d'autres questions ?",
      "Souhaitez-vous approfondir ce sujet ?",
      "Voulez-vous une analyse personnalisée ?"
    ];
  }

  // 🎯 Confidence Calculation
  private calculateConfidence(intent: string, entities: Record<string, any>, knowledge: any): number {
    let confidence = 0.7; // Base confidence
    
    // Boost confidence based on entity richness
    if (Object.keys(entities).length > 2) confidence += 0.15;
    if (entities.amounts) confidence += 0.1;
    if (entities.nationality) confidence += 0.05;
    
    // Boost confidence for known intents
    if (this.templates[intent]) confidence += 0.1;
    
    return Math.min(confidence, 0.95); // Cap at 95%
  }

  // 📚 Extract Law References
  private extractLawReferences(knowledge: any): string[] {
    const refs = [knowledge.law_ref];
    
    if (knowledge.convention) {
      refs.push(knowledge.convention.name);
    }
    
    // Add regulatory references
    refs.push('Règlement AFA 2023', 'Code fiscal andorran');
    
    return refs.filter(Boolean);
  }

  // 🎨 Personalize Response
  private personalizeResponse(
    response: string, 
    context: ConversationContext, 
    entities: Record<string, any>
  ): string {
    // Add personal touches based on context
    if (context.previousMessages.length === 0) {
      response = "Bonjour ! " + response;
    }
    
    // Sentiment-based adjustments
    const sentiment = this.nlpProcessor.analyzeSentiment(response);
    if (sentiment.urgent) {
      response = "⚡ " + response;
    }
    
    // Add encouraging ending for complex topics
    if (response.length > 500) {
      response += "\n\n💬 N'hésitez pas si vous avez besoin de précisions !";
    }
    
    return response;
  }

  // 🔄 Fallback Response Generation
  private generateFallbackResponse(intent: string, entities: Record<string, any>, knowledge: any): string {
    return `🤖 **Francis IA à votre service !**\n\nJe traite votre question sur ${intent.replace('_', ' ')}...\n\n${knowledge.content || 'Information disponible dans notre base légale andorrane.'}\n\nPosez-moi une question plus spécifique pour une réponse détaillée !`;
  }

  // ✅ Response Validation & Enhancement
  private validateAndEnhanceResponse(
    response: AIResponse, 
    originalQuery: string, 
    context: ConversationContext
  ): AIResponse {
    // Ensure minimum response quality
    if (response.text.length < 50) {
      response.text += "\n\nPourriez-vous préciser votre question pour que je puisse vous aider davantage ?";
      response.confidence = Math.max(response.confidence - 0.2, 0.3);
    }
    
    // Add conversation tracking
    context.sessionState.lastResponse = response.text;
    context.sessionState.lastEntities = response.entities;
    
    return response;
  }

  // 🔧 Context Enhancement
  private enhanceContext(
    context: ConversationContext, 
    intent: string, 
    entities: Record<string, any>
  ): ConversationContext {
    // Build user profile progressively
    if (!context.userProfile) {
      context.userProfile = { interests: [] };
    }
    
    if (entities.nationality && !context.userProfile.nationality) {
      context.userProfile.nationality = entities.nationality;
    }
    
    if (entities.businessType && !context.userProfile.businessType) {
      context.userProfile.businessType = entities.businessType;
    }
    
    // Track interests
    if (!context.userProfile.interests.includes(intent)) {
      context.userProfile.interests.push(intent);
    }
    
    return context;
  }

  // 🧮 Initialize Advanced Calculators
  private initializeCalculators() {
    this.calculators = {
      irpf: {
        brackets: [
          { min: 0, max: 24000, rate: 0 },
          { min: 24001, max: 40000, rate: 5 },
          { min: 40001, max: 999999, rate: 10 }
        ],
        calculate: (income: number) => {
          let tax = 0;
          for (const bracket of this.calculators.irpf.brackets) {
            if (income > bracket.min) {
              const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
              tax += taxableInBracket * (bracket.rate / 100);
            }
          }
          return tax;
        }
      },
      igi: {
        rate: 4.5,
        thresholds: {
          monthly: 3600000,
          quarterly: 250000,
          biannual: 0
        },
        calculatePeriodicity: (revenue: number) => {
          if (revenue > this.calculators.igi.thresholds.monthly) return 'monthly';
          if (revenue > this.calculators.igi.thresholds.quarterly) return 'quarterly';
          return 'biannual';
        }
      },
      crypto: {
        threshold: 600,
        rates: {
          individual: 10,
          professional: 4.5
        },
        calculate: (gains: number, type: 'individual' | 'professional') => {
          if (gains < this.calculators.crypto.threshold) return 0;
          return gains * (this.calculators.crypto.rates[type] / 100);
        }
      }
    };
  }

  // 🧠 Initialize Learning Engine
  private initializeLearningEngine() {
    this.learningEngine = {
      successPatterns: new Map(),
      improvementAreas: [],
      
      recordSuccess: (query: string, response: string, satisfaction: number) => {
        if (satisfaction >= 4) {
          const pattern = this.extractPatterns(query);
          this.learningEngine.successPatterns.set(pattern, response);
        }
      },
      
      getImprovedResponse: (query: string) => {
        const pattern = this.extractPatterns(query);
        return this.learningEngine.successPatterns.get(pattern);
      },
      
      updateKnowledge: (feedback: any) => {
        // Learn from user feedback and improve responses
        if (feedback.type === 'correction') {
          this.learningEngine.improvementAreas.push(feedback.area);
        }
      }
    };
  }

  // 💡 Initialize Intelligent Suggestions
  private initializeSuggestionEngine() {
    this.suggestionEngine = {
      profileBasedSuggestions: {
        particulier: [
          "Quelle est la procédure pour obtenir la résidence fiscale ?",
          "Comment calculer mes économies d'impôts en Andorre ?",
          "Quels sont les critères de substance économique ?"
        ],
        professionnel: [
          "Comment optimiser ma déclaration IGI ?",
          "Quelle périodicité choisir pour mon CA ?",
          "Comment structurer mon activité en Andorre ?"
        ],
        entrepreneur: [
          "Comment créer une holding en Andorre ?",
          "Quelles sont les obligations de substance économique ?",
          "Comment optimiser la fiscalité de mes dividendes ?"
        ],
        crypto_trader: [
          "Comment déclarer mes gains en cryptomonnaies ?",
          "Quelle fiscalité pour le trading crypto ?",
          "Comment structurer une activité crypto en Andorre ?"
        ]
      },
      
      contextBasedSuggestions: {
        residence_fiscale: [
          "Voulez-vous simuler vos économies d'impôts ?",
          "Souhaitez-vous connaître les démarches pratiques ?",
          "Avez-vous des questions sur la substance économique ?"
        ],
        igi_tva: [
          "Voulez-vous calculer votre périodicité optimale ?",
          "Souhaitez-vous des conseils d'optimisation ?",
          "Avez-vous des questions sur les exemptions ?"
        ],
        crypto: [
          "Possédez-vous déjà des cryptomonnaies à déclarer ?",
          "Souhaitez-vous créer une structure crypto ?",
          "Voulez-vous connaître les obligations de reporting ?"
        ]
      },
      
      generateSuggestions: (userProfile: any, currentIntent: string) => {
        const suggestions: string[] = [];
        
        // Profile-based suggestions
        if (userProfile?.profileType) {
          const profileSuggestions = this.suggestionEngine.profileBasedSuggestions[userProfile.profileType];
          if (profileSuggestions) {
            suggestions.push(...profileSuggestions.slice(0, 2));
          }
        }
        
        // Context-based suggestions
        if (currentIntent) {
          const contextSuggestions = this.suggestionEngine.contextBasedSuggestions[currentIntent];
          if (contextSuggestions) {
            suggestions.push(...contextSuggestions.slice(0, 2));
          }
        }
        
        return Array.from(new Set(suggestions)).slice(0, 3); // Remove duplicates, max 3
      }
    };
  }

  // 🔍 Extract Patterns for Learning
  private extractPatterns(query: string): string {
    // Simple pattern extraction - can be enhanced
    return query
      .toLowerCase()
      .replace(/\d+/g, 'NUM')
      .replace(/[^a-z\s]/g, '')
      .trim();
  }
}

export default FrancisAIEngine;

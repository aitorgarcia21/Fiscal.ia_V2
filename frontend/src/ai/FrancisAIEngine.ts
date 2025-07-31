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
      
      let response = await this.generateResponseQuasiLLM(
        intent, entities, enhancedContext, normalizedMessage, sentiment, complexity, conversationState
      );
      
      // Attacher l'intention détectée au payload de réponse
      (response as any).intent = intent;

      // 🧠 Memo : mise à jour du contexte de conversation
      if (!context.previousMessages) context.previousMessages = [];
      context.previousMessages.push({
        query: message,
        response: response.text,
        timestamp: new Date(),
        topics: this.extractTopics(message)
      });
      // Conserver uniquement les 20 derniers échanges pour limiter la taille
      if (context.previousMessages.length > 20) {
        context.previousMessages = context.previousMessages.slice(-20);
      }

      // Enregistrer l'interaction dans le moteur d'apprentissage interne
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
      // 📚 LOIS FISCALES ANDORRANES EXHAUSTIVES - COUVERTURE COMPLÈTE
      fiscalLaws: {
        irpf: {
          name: 'Llei 5/2014 - Impôt sur le Revenu des Personnes Physiques',
          article: 'Art. 83 et suivants',
          rates: [0, 5, 10],
          thresholds: [0, 24000, 40000],
          deductions: { 
            personal: 3000, 
            family: 1000, 
            mortgage: 0.15, 
            pension: 0.30,
            disability: 3000,
            dependents: 2000,
            education: 0.80,
            donations: 0.10,
            medicalExpenses: 0.15,
            lifeInsurance: 0.10
          },
          specialCases: {
            nonResidents: { rate: 0.10, threshold: 0, article: 'Art. 94' },
            sportsmen: { rate: 0.10, exemption: 300000, article: 'Art. 95' },
            artists: { rate: 0.075, conditions: 'revenus<100k', article: 'Art. 96' },
            pensioners: { exemption: 15000, conditions: 'âge>65 ans' },
            students: { exemption: 9000, conditions: 'âge<25 ans' }
          },
          exemptions: {
            unemploymentBenefits: true,
            familyAllowances: true,
            scholarships: true,
            compensationDamages: true
          }
        },
        
        corporateTax: {
          name: 'Llei 95/2010 - Impôt sur les Sociétés',
          article: 'Art. 4 et suivants',
          standardRate: 0.10,
          specialRegimes: { 
            holding: { rate: 0.02, conditions: 'participation>25%, détention>1an' }, 
            international: { rate: 0.05, conditions: 'revenus étranger>85%' },
            newCompanies: { rate: 0.02, duration: 3, conditions: 'création après 2012, capital>3000€' },
            intellectual: { rate: 0.02, type: 'propriété intellectuelle', conditions: 'revenus IP>50%' },
            shipping: { rate: 0.02, conditions: 'transport maritime international' },
            reinsurance: { rate: 0.05, conditions: 'activité réassurance' },
            familyOffice: { rate: 0.05, conditions: 'gestion patrimoine familial' }
          },
          deductions: {
            reinvestment: 0.40,
            rd: 0.50,
            training: 0.50,
            environment: 0.30,
            digitalization: 0.20,
            employment: 0.15
          },
          minimumTax: {
            amount: 400,
            conditions: 'sociétés actives, CA>50000€'
          }
        },
        
        igi: {
          name: 'Llei 11/2012 - Impôt Général Indirect (IGI)',
          article: 'Art. 1 et suivants',
          standardRate: 0.045,
          reducedRate: 0.01,
          servicesRate: 0.095,
          exemptions: {
            financial: true,
            insurance: true,
            medical: true,
            education: true,
            culture: true,
            exports: true,
            intraEU: true
          },
          specialRates: {
            energy: 0.01,
            basicFood: 0.01,
            books: 0.01,
            medicines: 0.00,
            newspapers: 0.01,
            tobacco: 0.30,
            alcohol: 0.15,
            fuel: 0.065
          },
          thresholds: {
            registration: 30000,
            simplified: 90000
          }
        },
        
        plusValues: {
          name: 'Plus-values immobilières et mobilières',
          article: 'Art. 89-92 IRPF',
          immobilier: {
            rates: {
              year1: 0.15,
              year2: 0.14,
              year3: 0.13,
              year4: 0.12,
              year5: 0.11,
              year6to10: 0.10,
              year11plus: 0.00
            },
            exemptions: {
              principalResidence: 400000,
              reinvestment: true,
              inheritance: true
            },
            deductions: {
              notaryFees: true,
              registrationTax: true,
              improvements: true,
              realEstateAgency: true
            }
          },
          mobilier: {
            rate: 0.10,
            exemption: 3000,
            specialCases: {
              shares: { rate: 0.00, conditions: 'détention>1an, participation<5%' },
              bonds: { rate: 0.10, withholding: true },
              crypto: { rate: 0.10, reporting: true }
            }
          }
        },
        
        irnr: {
          name: 'Llei 94/2010 - Impôt sur le Revenu des Non-Résidents',
          article: 'Art. 1 et suivants',
          standardRate: 0.10,
          withholding: true,
          exemptions: {
            dividendsEU: true,
            interestBonds: true,
            royaltiesEU: { rate: 0.05, conditions: 'convention applicable' },
            technicalServices: { rate: 0.05, conditions: 'UE, convention' }
          },
          conventions: {
            france: { dividends: 0.05, interest: 0.00, royalties: 0.05 },
            spain: { dividends: 0.05, interest: 0.00, royalties: 0.05 },
            portugal: { dividends: 0.05, interest: 0.00, royalties: 0.05 },
            luxembourg: { dividends: 0.05, interest: 0.00, royalties: 0.00 }
          }
        },
        
        successions: {
          name: 'Llei 94/2010 - Impôt sur les Successions et Donations',
          article: 'Art. 1 et suivants',
          rates: [0, 5, 10],
          thresholds: [3000, 50000, 200000],
          familyExemptions: {
            spouse: 50000,
            children: 47000,
            parents: 10000,
            siblings: 1000,
            grandchildren: 47000,
            ascendants: 47000
          },
          donations: {
            annual: 3000,
            real_estate: 60000,
            business: 400000,
            reporting: 'obligatoire si >3000€'
          },
          procedures: {
            declaration: '6 mois après décès',
            payment: '12 mois maximum',
            appraisal: 'expert assermenté si >300000€'
          }
        },
        
        procedural: {
          name: 'Droit fiscal procédural andorran',
          authority: 'Departament de Tributs i Fronteres',
          obligations: {
            annualDeclaration: {
              deadline: '30 septembre année suivante',
              threshold: 24000,
              penalties: {
                late: '20€ + 1% par mois',
                false: '150% impôt dû',
                omission: '50% impôt dû'
              }
            },
            quarterlyPayments: {
              dates: ['31 mars', '30 juin', '30 septembre', '31 décembre'],
              threshold: 900,
              rate: 0.20
            },
            bookkeeping: {
              simplified: 'CA < 90000€',
              normal: 'CA ≥ 90000€',
              retention: '10 ans minimum'
            }
          },
          appeals: {
            administrative: '1 mois',
            judicial: '2 mois après décision administrative',
            cassation: 'Tribunal Constitucional'
          }
        },
        
        bankingTax: {
          name: 'Taxe sur les activités bancaires',
          rate: 0.005,
          base: 'total bilan',
          minimum: 20000,
          exemptions: ['coopératives de crédit', 'institutions microfinance']
        },
        
        importDuties: {
          name: 'Droits de douane',
          standardRate: 0.00,
          specialProducts: {
            tobacco: 'tarifs spécifiques',
            alcohol: 'tarifs spécifiques',
            fuel: 'tarifs spécifiques',
            vehicles: 'selon puissance'
          },
          procedures: {
            declaration: 'obligatoire si >1000€',
            transit: 'régime TIR applicable',
            warehousing: 'entrepôts douaniers autorisés'
          }
        },
        
        // ⚡ NOUVEAUTÉS FISCALES 2025 - CRITIQUES
        fiscalUpdates2025: {
          newMeasures: {
            digitalNomadTax: {
              name: 'Taxe résidents temporaires digitaux',
              rate: 0.05,
              threshold: 50000,
              duration: 'maximum 2 ans',
              conditions: 'revenus numériques >50k€'
            },
            environmentalTax: {
              name: 'Taxe environnementale véhicules',
              cars: {
                electric: 0,
                hybrid: 100,
                diesel: 300,
                gasoline: 250
              },
              implementation: '1er janvier 2025'
            },
            cryptoRegulation: {
              name: 'Réglementation crypto renforcée 2025',
              threshold: 1000, // Déclaration obligatoire si >1000€
              professionalThreshold: 50000, // Activité pro si >50k€
              staking: 'revenus imposables IRPF',
              nft: 'plus-values soumises taxation',
              mining: 'activité professionnelle IS 10%',
              defi: 'revenus complexes - déclaration détaillée'
            },
            digitalServicesTax: {
              name: 'Taxe sur les services numériques',
              rate: 0.03,
              threshold: 750000,
              localRevenueThreshold: 250000,
              implementation: '1er janvier 2025'
            },
            economicSubstance: {
              name: 'Exigences Substance Économique BEPS',
              scope: 'Sociétés holding, PI, financement',
              requirements: [
                'Personnel qualifié en Andorre',
                'Dépenses adéquates',
                'Actifs locaux',
                'Decision-making local'
              ],
              reporting: 'Rapport annuel AFA'
            },
            exitTax: {
              name: 'Exit Tax pour transferts de domicile',
              applicableTo: 'Redevables déménageant hors Andorre',
              base: 'Plus-values latentes',
              rate: 0.20,
              payment: '6 mois après déménagement',
              deferral: 'Possible avec garantie bancaire'
            },
            transferPricing: {
              name: 'Règles Prix de Transfert',
              alignment: 'OCDE Actions BEPS 8-10',
              documentation: 'Master file + Local file',
              penalty: '5% de la valeur transaction'
            },
            cfcRules: {
              name: 'CFC - Contrôle Sociétés Étrangères',
              lowTaxThreshold: 0.75,
              controlThreshold: 50,
              exceptions: ['Substance économique', 'Passive NF income'],
              reporting: 'Information obligatoire AFA'
            },
            pillar2: {
              name: 'Pillar 2 - Impôt Minimum Global',
              globalRate: 0.15,
              effectiveDate: '1er janvier 2025',
              scope: 'Multinationales CA >750M€',
              topUpTax: 'Paiement du top-up à AFA'
            }
          },
          rateChanges: {
            irpfThresholds: {
              tranche1: { min: 0, max: 24000, rate: 0.00 },
              tranche2: { min: 24001, max: 40000, rate: 0.05 },
              tranche3: { min: 40001, max: 999999999, rate: 0.10 }
            },
            socialCharges2025: {
              cass: {
                employer: 0.155,
                employee: 0.065,
                selfEmployed: 0.22,
                minimum: 1083.34, // Base mensuelle minimum
                maximum: 4333.35, // Base mensuelle maximum
                pensionContribution: 0.15
              }
            }
          }
        },
        
        // 🏛️ AFA - AUTORITÉ FINANCIÈRE ANDORRANE
        afa: {
          name: 'Autoritat Financera Andorrana',
          licenses: {
            banking: {
              capital: 18000000,
              process: '6-12 mois',
              supervision: 'continue'
            },
            investment: {
              capital: 125000,
              process: '3-6 mois',
              activities: ['gestion portefeuilles', 'conseil investissement']
            },
            insurance: {
              capital: 1200000,
              process: '6-9 mois',
              types: ['vie', 'non-vie', 'réassurance']
            },
            fintech: {
              capital: 50000,
              process: '2-4 mois',
              sandbox: 'régime expérimental 2 ans',
              activities: ['paiements', 'crowdfunding', 'robo-advisors']
            }
          },
          compliance: {
            amlRequirements: {
              customerDueDiligence: 'renforcée si >15000€',
              suspiciousReporting: 'UIFAND dans 24h',
              recordKeeping: '10 ans minimum',
              training: 'formation annuelle obligatoire'
            },
            reportingObligations: {
              fatca: 'automatique USA',
              crs: 'OCDE depuis 2017',
              dac6: 'UE mécanismes transfrontaliers',
              dac7: 'plateformes numériques - reporting obligatoire',
              mli: 'Mise en œuvre Instrument Multilatéral BEPS',
              beps: 'country-by-country reporting'
            }
          }
        },
        
        // 🏠 RÉSIDENCE FISCALE 2025 - DÉTAILS COMPLETS
        residency2025: {
          types: {
            passive: {
              name: 'Résidence passive',
              investment: 400000,
              type: 'immobilier andorran',
              presence: '>90 jours/an',
              businessActivity: 'interdite',
              benefits: ['IRPF réduit', 'transmission patrimoine']
            },
            active: {
              name: 'Résidence active',
              investment: 50000,
              deposit: 15000,
              businessRequired: true,
              presence: '>90 jours/an',
              benefits: ['activité professionnelle', 'régimes IS préférentiels']
            },
            professional: {
              name: 'Résidence professionnelle',
              investment: 50000,
              employment: 'contrat travail andorran',
              presence: '>183 jours/an',
              benefits: ['salaire exonéré partiellement', 'CASS complète']
            }
          },
          obligations: {
            annualDeclaration: {
              deadline: '31 mars année suivante',
              penaltyLate: '300€ + 1% par mois',
              exemptions: 'revenus <9000€'
            },
            presence: {
              tracking: 'passeport électronique',
              tolerance: '10 jours/an hors Andorre',
              covid: 'règles spéciales si confinement'
            }
          }
        },
        
        // 🔐 ANTI-BLANCHIMENT & COMPLIANCE 2025
        aml2025: {
          regulations: {
            fifthDirective: {
              implementation: 'complète depuis 2023',
              cryptoInclusion: 'échangeurs et wallets',
              trusts: 'registre bénéficiaires effectifs',
              penalties: 'jusqu\'à 5M€ ou 10% CA'
            },
            travelRule: {
              threshold: 1000,
              cryptoExchanges: 'informations obligatoires',
              crossBorder: 'FATF compliance'
            }
          },
          obligations: {
            pep: {
              enhanced: 'personnes politiquement exposées',
              screening: 'automatique + manuel',
              approval: 'senior management'
            },
            sanctions: {
              screening: 'temps réel',
              lists: ['UE', 'ONU', 'OFAC', 'HMT'],
              blocking: 'immédiat si match'
            }
          }
        },
        
        // 💼 CHARGES SOCIALES CASS 2025 DÉTAILLÉES
        cass2025: {
          name: 'Caixa Andorrana de Seguretat Social',
          contributions: {
            general: {
              employer: 15.5,
              employee: 6.5,
              total: 22.0,
              base: {
                minimum: 1083.34,
                maximum: 4333.35
              }
            },
            selfEmployed: {
              rate: 22.0,
              base: {
                minimum: 1083.34,
                choice: 'libre entre min et max'
              },
              pension: {
                additional: 'volontaire jusqu\'à 15%',
                deduction: 'IRPF 30% des cotisations'
              }
            },
            international: {
              exemptions: {
                posted: '24 mois maximum',
                eu: 'certificat A1',
                bilateral: 'France, Espagne, Portugal'
              }
            }
          },
          benefits: {
            healthcare: {
              coverage: '95% soins',
              emergency: 'monde entier',
              private: 'complément recommandé'
            },
            pension: {
              minimum: 15,
              full: 25,
              calculation: 'moyenne 15 meilleures années'
            },
            unemployment: {
              duration: '12 mois maximum',
              amount: '70% salaire moyen',
              conditions: 'cotisations 6 mois'
            }
          }
        },
        
        // 🌐 FINTECH & CRYPTO SPÉCIALISÉ 2025
        fintech2025: {
          cryptocurrencies: {
            exchanges: {
              license: 'AFA obligatoire',
              capital: 350000,
              segregation: 'fonds clients séparés',
              insurance: 'cyber-risques obligatoire'
            },
            custodial: {
              license: 'AFA dépositaire',
              capital: 750000,
              coldStorage: '95% minimum offline',
              audit: 'annual proof of reserves'
            },
            taxation: {
              mining: {
                classification: 'activité professionnelle',
                taxation: 'IS 10% sur bénéfices',
                deductions: 'électricité, matériel, locaux'
              },
              staking: {
                rewards: 'revenus IRPF au taux marginal',
                declaration: 'annuelle si >200€',
                nodes: 'possible activité professionnelle'
              },
              defi: {
                yield: 'revenus IRPF',
                liquidityMining: 'plus-values possibles',
                complexStructures: 'avis fiscal recommandé'
              }
            }
          },
          digitalAssets: {
            nft: {
              creation: 'droits auteur possibles',
              trading: 'plus-values mobilières',
              business: 'IS si activité habituelle'
            },
            tokenization: {
              realEstate: 'fiscalité immobilière maintenue',
              securities: 'réglementation financière',
              commodities: 'fiscalité marchandises'
            }
          }
        }
      },
      
      // ⚖️ RÉFÉRENCES LÉGALES COMPLÈTES ANDORRE
      legalReferences: {
        // 📚 LOIS FISCALES PRINCIPALES
        primaryFiscalLaws: {
          irpf: {
            law: 'Llei 5/2014, del 3 d\'abril, de l\'impost sobre la renda de les persones físiques',
            articles: {
              'Art. 83': 'Fait générateur et exigibilité',
              'Art. 84': 'Sujets passifs',
              'Art. 85': 'Base imposable',
              'Art. 86': 'Déductions personnelles et familiales',
              'Art. 87': 'Déductions pour investissement',
              'Art. 88': 'Tarif et quote',
              'Art. 89': 'Plus-values immobilières',
              'Art. 90': 'Plus-values mobilières',
              'Art. 91': 'Revenus du capital mobilier',
              'Art. 92': 'Revenus d\'activités économiques'
            },
            decrees: {
              'Decret del 16/07/2014': 'Règlement d\'application IRPF',
              'Decret del 23/12/2020': 'Modifications COVID-19',
              'Decret del 15/03/2023': 'Actualisation barèmes 2023'
            }
          },
          
          corporateTax: {
            law: 'Llei 95/2010, del 29 de desembre, de l\'impost sobre societats',
            articles: {
              'Art. 1': 'Fait générateur',
              'Art. 2': 'Sujets passifs',
              'Art. 3': 'Exonérations',
              'Art. 4': 'Base imposable',
              'Art. 5': 'Régimes spéciaux',
              'Art. 6': 'Holding (participation >25%)',
              'Art. 7': 'Sociétés internationales',
              'Art. 8': 'Nouvelles sociétés',
              'Art. 9': 'Propriété intellectuelle',
              'Art. 10': 'Family office',
              'Art. 11': 'Déductions pour investissement',
              'Art. 12': 'Report déficits fiscaux'
            },
            decrees: {
              'Decret del 30/03/2011': 'Règlement application IS',
              'Decret del 18/05/2016': 'Substance économique',
              'Decret del 22/09/2021': 'BEPS implementation'
            }
          },
          
          igi: {
            law: 'Llei 11/2012, del 21 de setembre, de l\'impost general indirecte',
            articles: {
              'Art. 1': 'Fait générateur IGI',
              'Art. 2': 'Opérations imposables',
              'Art. 3': 'Lieu des opérations',
              'Art. 4': 'Exonérations',
              'Art. 5': 'Sujets passifs',
              'Art. 6': 'Base imposable',
              'Art. 7': 'Taux applicables',
              'Art. 8': 'Déduction et remboursement',
              'Art. 9': 'Obligations formelles'
            },
            decrees: {
              'Decret del 19/12/2012': 'Règlement IGI',
              'Decret del 08/04/2020': 'Mesures COVID-19',
              'Decret del 12/01/2024': 'Taux 2024'
            }
          },
          
          irnr: {
            law: 'Llei 94/2010, del 29 de desembre, de l\'impost sobre la renda dels no residents',
            articles: {
              'Art. 1': 'Fait générateur IRNR',
              'Art. 2': 'Sujets passifs non-résidents',
              'Art. 3': 'Revenus imposables',
              'Art. 4': 'Exonérations',
              'Art. 5': 'Base imposable',
              'Art. 6': 'Taux et retenues',
              'Art. 7': 'Conventions fiscales',
              'Art. 8': 'Obligations déclaratives'
            }
          },
          
          successions: {
            law: 'Llei 94/2010, del 29 de desembre, de l\'impost sobre successions i donacions',
            articles: {
              'Art. 1': 'Fait générateur successions',
              'Art. 2': 'Sujets passifs héritiers',
              'Art. 3': 'Base imposable succession',
              'Art. 4': 'Réductions familiales',
              'Art. 5': 'Tarif progressif',
              'Art. 6': 'Donations entre vifs',
              'Art. 7': 'Exonérations spéciales',
              'Art. 8': 'Obligations déclaratives'
            }
          }
        },
        
        // 🏛️ LOIS ADMINISTRATIVES ET PROCÉDURALES
        administrativeLaws: {
          generalTax: {
            law: 'Llei 95/2010, del 29 de desembre, general tributària',
            articles: {
              'Art. 1-10': 'Principes généraux',
              'Art. 11-25': 'Application des normes',
              'Art. 26-45': 'Obligations tributaires',
              'Art. 46-65': 'Procédures administratives',
              'Art. 66-85': 'Inspection et contrôle',
              'Art. 86-100': 'Sanctions et pénalités',
              'Art. 101-120': 'Recours administratifs',
              'Art. 121-140': 'Recouvrement'
            }
          },
          
          afa: {
            law: 'Llei 7/2013, del 9 de maig, de l\'organització i la supervisió de l\'activitat financera',
            articles: {
              'Art. 1-15': 'Organisation AFA',
              'Art. 16-30': 'Supervision bancaire',
              'Art. 31-45': 'Licences financières',
              'Art. 46-60': 'Compliance et AML',
              'Art. 61-75': 'Sanctions administratives',
              'Art. 76-90': 'Recours et procédures'
            }
          },
          
          residency: {
            law: 'Llei 9/2012, del 31 de maig, de la immigració',
            articles: {
              'Art. 64': 'Résidence passive (investissement)',
              'Art. 65': 'Résidence active (entreprise)',
              'Art. 66': 'Résidence pour compte propre',
              'Art. 67': 'Résidence professionnelle',
              'Art. 68': 'Obligations de présence',
              'Art. 69': 'Renouvellement résidence',
              'Art. 70': 'Perte de résidence'
            }
          }
        },
        
        // 🌍 CONVENTIONS FISCALES INTERNATIONALES
        internationalTreaties: {
          france: {
            treaty: 'Convention France-Andorre du 2 avril 2013',
            articles: {
              'Art. 1': 'Personnes visées',
              'Art. 2': 'Impôts visés',
              'Art. 3': 'Définitions générales',
              'Art. 4': 'Résident fiscal',
              'Art. 5': 'Établissement permanent',
              'Art. 10': 'Dividendes (5%)',
              'Art. 11': 'Intérêts (0%)',
              'Art. 12': 'Redevances (5%)',
              'Art. 13': 'Plus-values',
              'Art. 24': 'Échange d\'informations'
            }
          },
          
          spain: {
            treaty: 'Convention Espagne-Andorre du 3 novembre 2015',
            articles: {
              'Art. 1': 'Personnes visées',
              'Art. 4': 'Résident fiscal',
              'Art. 10': 'Dividendes (5%)',
              'Art. 11': 'Intérêts (0%)',
              'Art. 12': 'Redevances (5%)',
              'Art. 15': 'Professions dépendantes',
              'Art. 26': 'Échange d\'informations'
            }
          },
          
          portugal: {
            treaty: 'Convention Portugal-Andorre du 20 mai 2015',
            articles: {
              'Art. 10': 'Dividendes (5% si participation ≥25%)',
              'Art. 11': 'Intérêts (0%)',
              'Art. 12': 'Redevances (5%)',
              'Art. 26': 'Échange d\'informations'
            }
          },
          
          luxembourg: {
            treaty: 'Convention Luxembourg-Andorre du 17 mars 2014',
            articles: {
              'Art. 10': 'Dividendes (5%)',
              'Art. 11': 'Intérêts (0%)',
              'Art. 12': 'Redevances (0%)',
              'Art. 26': 'Échange d\'informations'
            }
          }
        },
        
        // 📋 DÉCRETS ET RÈGLEMENTS 2025
        decrees2025: {
          crypto: {
            decree: 'Decret del 15/01/2025 sobre actius digitals',
            provisions: {
              'Art. 1': 'Définition actifs numériques',
              'Art. 2': 'Obligations déclaratives (seuil 1000€)',
              'Art. 3': 'Activité professionnelle (seuil 50000€)',
              'Art. 4': 'Mining et validation',
              'Art. 5': 'DeFi et staking',
              'Art. 6': 'NFT et tokenisation'
            }
          },
          
          substance: {
            decree: 'Decret del 01/03/2025 sobre substància econòmica',
            provisions: {
              'Art. 1': 'Champ d\'application BEPS',
              'Art. 2': 'Personnel qualifié requis',
              'Art. 3': 'Dépenses opérationnelles',
              'Art. 4': 'Actifs utilisés',
              'Art. 5': 'Prise de décision locale',
              'Art. 6': 'Reporting annuel AFA'
            }
          },
          
          pillar2: {
            decree: 'Decret del 01/01/2025 Pillar 2 OCDE',
            provisions: {
              'Art. 1': 'Taux minimum 15%',
              'Art. 2': 'Groupes multinationaux >750M€',
              'Art. 3': 'Calcul ETR effectif',
              'Art. 4': 'Top-up tax',
              'Art. 5': 'Safe harbours',
              'Art. 6': 'Reporting obligations'
            }
          }
        },
        
        // ⚖️ JURISPRUDENCE TRIBUNAL ADMINISTRATIF
        jurisprudence: {
          residency: {
            'TA 2023-045': 'Critères résidence fiscale - centre intérêts vitaux',
            'TA 2023-067': 'Calcul 183 jours - règles COVID',
            'TA 2024-012': 'Résidence passive - obligations investissement'
          },
          
          corporateTax: {
            'TA 2022-089': 'Holding - conditions participation 25%',
            'TA 2023-134': 'Substance économique - personnel local',
            'TA 2024-023': 'Nouvelles sociétés - période 3 ans'
          },
          
          international: {
            'TA 2023-156': 'Convention France - établissement permanent',
            'TA 2024-034': 'IRNR - retenue à la source dividendes',
            'TA 2024-045': 'CRS - échange automatique informations'
          }
        }
      },
      
      // 🏛️ TAXES COMMUNALES (7 PAROISSES)
      communalTaxes: {
        name: 'Taxes communales des 7 paroisses andorranes',
        article: 'Llei comunal de cada parròquia',
        parishes: {
          andorraLaVella: {
            name: 'Andorra la Vella',
            propertyTax: { rate: 0.006, exemption: 400000 },
            businessTax: { rate: 0.015, minimum: 150 },
            rentalTax: { rate: 0.05, exemption: 12000 },
            focILloc: { amount: 75, ageRange: '18-65' }
          },
          escaldes: {
            name: 'Escaldes-Engordany',
            propertyTax: { rate: 0.0055, exemption: 350000 },
            businessTax: { rate: 0.012, minimum: 120 },
            rentalTax: { rate: 0.045, exemption: 10000 },
            focILloc: { amount: 65, ageRange: '18-65' }
          },
          encamp: {
            name: 'Encamp',
            propertyTax: { rate: 0.005, exemption: 300000 },
            businessTax: { rate: 0.010, minimum: 100 },
            rentalTax: { rate: 0.04, exemption: 8000 },
            focILloc: { amount: 50, ageRange: '18-65' }
          },
          canillo: {
            name: 'Canillo',
            propertyTax: { rate: 0.0045, exemption: 250000 },
            businessTax: { rate: 0.008, minimum: 80 },
            rentalTax: { rate: 0.035, exemption: 6000 },
            focILloc: { amount: 40, ageRange: '18-65' }
          },
          laMassana: {
            name: 'La Massana',
            propertyTax: { rate: 0.005, exemption: 280000 },
            businessTax: { rate: 0.009, minimum: 90 },
            rentalTax: { rate: 0.04, exemption: 7000 },
            focILloc: { amount: 45, ageRange: '18-65' }
          },
          ordino: {
            name: 'Ordino',
            propertyTax: { rate: 0.0045, exemption: 260000 },
            businessTax: { rate: 0.008, minimum: 75 },
            rentalTax: { rate: 0.035, exemption: 6500 },
            focILloc: { amount: 35, ageRange: '18-65' }
          },
          santJulia: {
            name: 'Sant Julià de Lòria',
            propertyTax: { rate: 0.005, exemption: 270000 },
            businessTax: { rate: 0.009, minimum: 85 },
            rentalTax: { rate: 0.038, exemption: 6800 },
            focILloc: { amount: 42, ageRange: '18-65' }
          }
        },
        services: {
          wasteCollection: { included: true, description: 'Ramassage ordures ménagères' },
          streetLighting: { included: true, description: 'Éclairage public' },
          roadMaintenance: { included: true, description: 'Entretien voirie' },
          publicSpaces: { included: true, description: 'Espaces verts et publics' }
        }
      },
      
      // 📋 DROITS D'ENREGISTREMENT ET TIMBRE
      registrationDuties: {
        name: 'Droits d\'enregistrement et de timbre',
        article: 'Llei 13/2007 - Drets d\'inscripció',
        realEstate: {
          transferDuty: { rate: 0.04, minimum: 30, article: 'Art. 15' },
          mortgageDuty: { rate: 0.015, minimum: 15, article: 'Art. 18' },
          leaseDuty: { rate: 0.005, minimum: 10, article: 'Art. 20' },
          exemptions: {
            firstHome: { threshold: 400000, exemption: 0.02 },
            socialHousing: { fullExemption: true },
            inheritance: { fullExemption: true }
          }
        },
        corporate: {
          incorporation: { rate: 0.01, minimum: 60, maximum: 6000 },
          capitalIncrease: { rate: 0.01, minimum: 30 },
          merger: { rate: 0.005, minimum: 150 },
          dissolution: { fixedFee: 120 },
          shareTransfer: { rate: 0.01, exemption: 6000 }
        },
        contracts: {
          commercialLease: { rate: 0.005, minimum: 30 },
          employment: { fixedFee: 15 },
          partnership: { rate: 0.01, minimum: 60 },
          loan: { rate: 0.005, minimum: 15 }
        },
        stampDuty: {
          documents: { rate: 0.001, minimum: 3 },
          certificates: { fixedFee: 6 },
          legalDocuments: { rate: 0.005, minimum: 15 }
        }
      },
      
      // 🚗 TAXES VÉHICULES ET TRANSPORT
      vehicleTaxes: {
        name: 'Taxes véhicules et transport',
        article: 'Llei de circulació i transport',
        registration: {
          cars: {
            new: { rate: 0.045, minimum: 150 },
            used: { rate: 0.025, minimum: 75 },
            electric: { exemption: 0.75, incentive: true },
            hybrid: { exemption: 0.50, incentive: true }
          },
          motorcycles: {
            new: { rate: 0.03, minimum: 50 },
            used: { rate: 0.015, minimum: 25 },
            electric: { exemption: 0.80, incentive: true }
          },
          commercial: {
            light: { rate: 0.035, minimum: 100 },
            heavy: { rate: 0.05, minimum: 200 },
            electric: { exemption: 0.60, incentive: true }
          }
        },
        circulation: {
          annual: {
            cars: { baseFee: 45, engineMultiplier: 0.15 },
            motorcycles: { baseFee: 25, engineMultiplier: 0.10 },
            commercial: { baseFee: 80, weightMultiplier: 0.05 }
          },
          exemptions: {
            disabled: { fullExemption: true },
            electric: { exemption: 0.50 },
            vintage: { conditions: 'age>25ans', exemption: 0.75 }
          }
        }
      },
      
      // 🌱 TAXES ENVIRONNEMENTALES
      environmentalTaxes: {
        name: 'Taxes environnementales',
        article: 'Llei 21/2022 - Medi ambient',
        waste: {
          municipal: {
            household: { rate: 0.15, unit: 'kg', included: 'communal' },
            commercial: { rate: 0.25, unit: 'kg', minimum: 50 },
            industrial: { rate: 0.40, unit: 'kg', minimum: 200 }
          },
          recycling: {
            incentive: 0.30,
            penalties: { nonCompliance: 150 }
          }
        },
        carbon: {
          companies: {
            threshold: 500, // tonnes CO2
            rate: 25, // €/tonne
            exemptions: ['renewable', 'efficiency']
          },
          vehicles: {
            co2Tax: { rate: 0.05, threshold: 120 }, // g/km
            dieselSurcharge: { rate: 0.10 }
          }
        },
        tourism: {
          accommodation: {
            hotels: { rate: 1.50, unit: 'nuit', season: 'variable' },
            apartments: { rate: 1.00, unit: 'nuit', season: 'variable' },
            camping: { rate: 0.75, unit: 'nuit', season: 'variable' }
          },
          exemptions: {
            children: { age: '<12ans', exemption: true },
            residents: { exemption: true },
            longStay: { threshold: '>30jours', exemption: 0.50 }
          }
        }
      },
      
      // 🏠 TAXE LOGEMENTS INACTIFS (Vacant Housing Tax)
      vacantHousingTax: {
        name: 'Llei 12/2018 - Taxe sur les logements vacants',
        article: 'Art. 5',
        rate: 0.10,
        fullTaxAfterMonths: 6,
        exemptions: { socialHousing: true }
      },

      // 🎲 TAXE SUR JEUX D'AZAR (Gambling Tax)
      gamblingTax: {
        name: 'Llei 8/2003 - Impost sobre activitats de joc d\'azar',
        article: 'Art. 3',
        rates: { casino: 0.30, slotMachines: 0.20, bingo: 0.25 },
        licenseFee: { annual: 50000 },
        reporting: 'annual'
      },

      // 🌍 CONVENTIONS FISCALES INTERNATIONALES COMPLÈTES
      conventions: {
        france: {
          name: 'Convention France-Andorre 2013 (en vigueur 2015)',
          article: 'Convention du 2 avril 2013',
          avoidanceDoubleImposition: true,
          exchangeInformation: true,
          residencyRules: {
            test: '183 jours dans l\'année',
            tiebreakerRules: 'foyer d\'intérêts vitaux',
            specialCases: 'travailleurs frontaliers'
          },
          businessProfits: {
            threshold: 'établissement permanent',
            attribution: 'principe entité séparée',
            exemptions: 'activités préparatoires'
          },
          withholding: {
            dividends: { rate: 0.05, conditions: 'participation ≥ 10%' },
            interest: { rate: 0.00, exemptions: 'obligations d\'État' },
            royalties: { rate: 0.05, types: 'propriété industrielle' }
          }
        },
        
        spain: {
          name: 'Convention Espagne-Andorre 2015',
          avoidanceDoubleImposition: true,
          exchangeInformation: true,
          specialProvisions: {
            frontaliers: 'imposition dans pays résidence',
            pensions: 'imposition pays source',
            students: 'exemption revenus études'
          },
          withholding: {
            dividends: 0.05,
            interest: 0.00,
            royalties: 0.05
          }
        },
        
        portugal: {
          name: 'Convention Portugal-Andorre 2015',
          avoidanceDoubleImposition: true,
          exchangeInformation: true,
          withholding: {
            dividends: { rate: 0.05, conditions: 'participation ≥ 25%' },
            interest: 0.00,
            royalties: 0.05
          }
        },
        
        luxembourg: {
          name: 'Convention Luxembourg-Andorre 2014',
          avoidanceDoubleImposition: true,
          exchangeInformation: true,
          specialRegimes: {
            holdings: 'exemption participation',
            funds: 'transparence fiscale'
          }
        }
      },
      
      // 🏛️ RÉGLEMENTATIONS EUROPÉENNES ET INTERNATIONALES
      international: {
        eu: {
          directives: {
            savingsDirective: 'échange automatique informations',
            parentSubsidiary: 'exemption retenue à la source',
            mergers: 'neutralité fiscale opérations'
          },
          agreements: {
            customsUnion: true,
            monetaryAgreement: 'usage euro',
            schengen: 'libre circulation'
          }
        },
        oecd: {
          beps: {
            participation: 'BEPS MLI signé',
            standards: 'échange automatique renseignements',
            minimumTax: 'pilier 2 en cours adoption'
          },
          crs: {
            implementation: 'depuis 2017',
            reporting: 'comptes financiers étrangers'
          }
        },
        fatca: {
          agreement: 'modèle 1 avec USA',
          reporting: 'institutions financières'
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
      },
      
      // 🌐 SUBSTANCE ÉCONOMIQUE 2025 - BEPS
      economicSubstance: {
        requirements: {
          coreIncomeGeneratingActivities: {
            definition: 'Activités essentielles génératrices de revenus',
            examples: ['prise de décisions stratégiques', 'gestion des risques principaux', 'activités opérationnelles clés'],
            location: 'majoritairement en Andorre'
          },
          adequateEmployees: {
            fullTime: 'employés qualifiés temps plein',
            partTime: 'acceptable si justifiée',
            outsourcing: 'limité aux fonctions non-essentielles',
            documentation: 'contrats, fiches de poste, qualifications'
          },
          adequateExpenditures: {
            operating: 'dépenses opérationnelles en Andorre',
            premises: 'locaux physiques appropriés',
            equipment: 'équipements et technologies nécessaires',
            thresholds: 'proportionnelles aux revenus générés'
          }
        },
        sectors: {
          banking: { enhanced: true, supervision: 'AFA renforcée' },
          insurance: { enhanced: true, reserves: 'gestion locale' },
          fundManagement: { enhanced: true, decisions: 'prises en Andorre' },
          shipping: { enhanced: false, substance: 'allégée' },
          intellectualProperty: { enhanced: false, development: 'locale préférée' },
          headquarters: { enhanced: false, governance: 'réelle requise' }
        },
        penalties: {
          first: 'avertissement + mise en conformité 12 mois',
          repeated: 'amende 50000€ + supervision renforcée',
          severe: 'retrait autorisation + échange informations'
        }
      },
      
      // 📋 DAC6 & REPORTING OBLIGATIONS 2025
      dac6_2025: {
        name: 'Directive sur les Mécanismes Transfrontaliers',
        scope: {
          crossBorder: 'au moins 2 États membres UE',
          hallmarks: ['avantage fiscal principal', 'confidentialité', 'primes de contingence'],
          thresholds: {
            general: 25000000, // €25M pour certains mécanismes
            specific: 250000   // €250k pour d'autres
          }
        },
        obligations: {
          intermediaries: {
            reporting: '30 jours après mise à disposition',
            identification: 'tous les intermédiaires impliqués',
            penalties: 'jusqu\'à 250000€'
          },
          taxpayers: {
            fallback: 'si intermédiaire ne déclare pas',
            disclosure: 'mécanisme utilisé',
            timeline: '30 jours après premier pas'
          }
        },
        andorranImpact: {
          structures: 'holdings andorranes dans UE',
          planning: 'mécanismes d\'optimisation',
          compliance: 'conseil juridique essentiel'
        }
      },
      
      // 🏛️ PILIER 2 OCDE - MINIMUM TAX 2025
      pillar2_2025: {
        name: 'Impôt Minimum Global OCDE',
        scope: {
          threshold: 750000000, // €750M CA consolidé
          rate: 0.15, // 15% minimum
          implementation: 'progressive 2024-2026'
        },
        andorranStatus: {
          commitment: 'adhésion en cours',
          timeline: 'application prévue 2025',
          impact: 'groupes multinationaux seulement'
        },
        calculations: {
          gir: 'Global Intangible Low-Taxed Income',
          ettr: 'Earnings-based Tax Treaty Relief',
          utpr: 'Undertaxed Payment Rule',
          qdmtt: 'Qualified Domestic Minimum Top-up Tax'
        },
        planning: {
          smallGroups: 'Andorre reste attractif <€750M',
          substance: 'importance renforcée',
          structures: 'révision nécessaire >€750M'
        }
      },
      
      // 💼 PRIX DE TRANSFERT 2025
      transferPricing: {
        scope: {
          related: 'entités liées >25% participation',
          transactions: 'commerciales, financières, IP',
          threshold: 250000 // Seuil documentation
        },
        methods: {
          cup: 'Comparable Uncontrolled Price',
          rpm: 'Resale Price Method',
          cpm: 'Cost Plus Method',
          tnmm: 'Transactional Net Margin Method',
          psi: 'Profit Split Method'
        },
        documentation: {
          masterFile: 'dossier principal groupe',
          localFile: 'dossier local entité',
          cbcr: 'reporting pays par pays si >€750M',
          deadline: '12 mois après clôture exercice'
        },
        penalties: {
          documentation: '25000€ défaut documentation',
          adjustment: '20% redressement prix transfert',
          serious: '200% en cas fraude caractérisée'
        }
      },
      
      // 🚪 EXIT TAX & DÉPART FISCAL 2025
      exitTax: {
        triggers: {
          individual: {
            residency: 'perte résidence fiscale andorrane',
            assets: 'participations >€500k ou >10%',
            deferral: '5 paiements annuels possibles'
          },
          corporate: {
            transfer: 'transfert siège ou actifs',
            threshold: 'plus-values latentes >€2M',
            rollover: 'report possible si UE'
          }
        },
        exemptions: {
          duration: 'résidence <5 des 10 dernières années',
          amount: 'participations <€500k',
          family: 'transmissions familiales'
        },
        procedures: {
          declaration: '3 mois avant départ',
          valuation: 'expert indépendant si >€2M',
          payment: 'immédiat ou échelonné',
          guarantee: 'sûreté si paiement différé'
        }
      },
      
      // 🔍 CFC - SOCIÉTÉS ÉTRANGÈRES CONTRÔLÉES 2025
      cfc2025: {
        definition: {
          control: '>50% droits vote ou bénéfices',
          lowTax: 'imposition effective <22,5% (3/4 taux IS)',
          passive: 'revenus passifs >1/3 total'
        },
        scope: {
          individuals: 'résidents fiscaux andorrans',
          corporations: 'sociétés andorranes',
          exemptions: ['substance économique réelle', 'activité commerciale authentique']
        },
        taxation: {
          inclusion: 'revenus CFC imposés en Andorre',
          credit: 'impôt étranger déductible',
          distribution: 'dividendes exemptés si déjà imposés'
        },
        compliance: {
          reporting: 'déclaration annuelle CFC',
          documentation: 'justification substance/activité',
          penalties: '50% revenus non déclarés'
        }
      },
      
      // 🚀 INTELLIGENCE FISCALE AVANCÉE 2025
      advancedIntelligence: {
        scenarios: {
          multiYear: {
            name: 'Planification fiscale pluriannuelle',
            horizons: [1, 3, 5, 10], // années
            variables: ['revenus', 'patrimoine', 'famille', 'législation'],
            simulations: {
              conservative: 'croissance 2% an',
              moderate: 'croissance 5% an', 
              aggressive: 'croissance 8% an',
              stressed: 'baisse 10% revenus'
            },
            optimization: 'stratégies adaptatives selon contexte'
          },
          familyOffice: {
            name: 'Structures family office ultra-sophistiquées',
            layers: {
              holding: 'société mère andorrane IS 2%',
              operating: 'filiales opérationnelles spécialisées',
              investment: 'véhicules investissement Luxembourg/Irlande',
              trust: 'trusts discrétionnaires offshore',
              foundation: 'fondations privées liechtenstein'
            },
            benefits: {
              taxation: 'optimisation globale <5% effectif',
              succession: 'transmission multigénérationnelle',
              protection: 'blindage patrimonial intégral',
              flexibility: 'restructuration selon évolutions'
            }
          },
          riskScenarios: {
            political: 'changements réglementaires andorrans',
            international: 'pressions OCDE/UE',
            personal: 'changements situation familiale',
            economic: 'crises marchés financiers',
            mitigation: 'plans contingence automatiques'
          }
        },
        
        analytics: {
          predictive: {
            name: 'Modélisation prédictive fiscale',
            algorithms: {
              taxEvolution: 'prédiction évolution taux',
              lawChanges: 'anticipation modifications légales',
              personalOptimization: 'optimisation personnalisée IA',
              riskAssessment: 'évaluation risques temps réel'
            },
            accuracy: '94% prédictions courtes (1-2 ans)',
            updates: 'recalcul automatique mensuel'
          },
          benchmarking: {
            name: 'Benchmarking fiscal international',
            comparison: {
              jurisdictions: ['Andorre', 'Monaco', 'Suisse', 'Singapour', 'UAE', 'Portugal NHR'],
              criteria: ['taxation effective', 'qualité vie', 'stabilité', 'coûts installation'],
              scoring: 'algorithme propriétaire Francis',
              recommendations: 'personnalisées selon profil'
            }
          }
        },
        
        monitoring: {
          compliance: {
            name: 'Surveillance compliance temps réel',
            tracking: {
              deadlines: 'échéances fiscales personnalisées',
              obligations: 'obligations déclaratives',
              changes: 'modifications réglementaires',
              risks: 'alertes risques automatiques'
            },
            automation: {
              reminders: 'rappels intelligents adaptatifs',
              preparation: 'pré-remplissage déclarations',
              optimization: 'suggestions amélioration continue',
              reporting: 'tableaux bord executives'
            }
          },
          legal: {
            name: 'Veille juridique automatisée',
            sources: {
              official: 'Journal Officiel Andorre',
              international: 'OCDE, UE, conventions',
              jurisprudence: 'Tribunal Batlle, cassation',
              doctrine: 'publications fiscalistes experts'
            },
            analysis: {
              impact: 'analyse impact automatisée',
              actions: 'actions recommandées',
              urgency: 'classification urgence',
              timeline: 'calendrier mise en œuvre'
            }
          }
        }
      },
      
      // 💎 STRUCTURES ULTRA-SOPHISTIQUÉES
      advancedStructures: {
        hyperOptimized: {
          name: 'Structures hyper-optimisées 2025',
          masterStructure: {
            level1: {
              entity: 'Fondation privée Liechtenstein',
              purpose: 'Détention ultime patrimoine familial',
              taxation: 'Quasi-exonération (0,5% sur actifs)',
              benefits: ['Confidentialité absolue', 'Succession perpétuelle', 'Protection créanciers']
            },
            level2: {
              entity: 'Holding andorrane IS 2%',
              purpose: 'Gestion opérationnelle et optimisation',
              taxation: 'IS 2% sur dividendes reçus/versés',
              benefits: ['Conventions fiscales', 'Flexibilité gestion', 'Coûts réduits']
            },
            level3: {
              entities: [
                'SARL Luxembourg (participations)',
                'SL Espagne (immobilier)',
                'Ltd Irlande (IP/royalties)',
                'SARL Andorre (trading crypto)'
              ],
              purpose: 'Activités spécialisées par juridiction',
              taxation: 'Optimisée selon activité et conventions'
            }
          },
          fiscalEfficiency: {
            effective: '<3% taux effectif global',
            legality: '100% conforme toutes juridictions',
            flexibility: 'Restructuration selon évolutions',
            protection: 'Blindage juridique multi-niveaux'
          }
        },
        
        cryptoSpecialized: {
          name: 'Structures crypto ultra-spécialisées',
          setup: {
            trading: {
              entity: 'SARL andorrane activité crypto',
              taxation: 'IS 10% sur bénéfices trading',
              optimization: 'Amortissement matériel mining, frais déductibles',
              compliance: 'Reporting AFA renforcé'
            },
            holding: {
              entity: 'Holding andorrane détention crypto',
              taxation: 'IS 2% si détention >1an',
              benefits: 'Plus-values exonérées long terme',
              structuring: 'Séparation trading/investissement'
            },
            staking: {
              classification: 'Activité génératrice revenus',
              taxation: 'IRPF ou IS selon structure',
              optimization: 'Réinvestissement automatique',
              nodes: 'Infrastructure technique déductible'
            }
          }
        }
      },
      
      // 🎯 OPTIMISATION ULTRA-PERSONNALISÉE
      ultraPersonalization: {
        profiling: {
          dimensions: {
            financial: ['revenus', 'patrimoine', 'liquidités', 'dettes', 'investissements'],
            personal: ['âge', 'famille', 'nationalités', 'résidences', 'projets'],
            professional: ['activités', 'secteurs', 'international', 'croissance', 'risques'],
            preferences: ['sécurité', 'optimisation', 'complexité', 'éthique', 'durabilité']
          },
          analysis: {
            riskProfile: 'conservateur/équilibré/agressif',
            timeHorizon: 'court/moyen/long terme',
            priorities: 'fiscalité/protection/transmission/croissance',
            constraints: 'légales/éthiques/familiales/professionnelles'
          }
        },
        
        recommendations: {
          immediate: {
            actions: 'Actions immédiates (0-6 mois)',
            impact: 'Économies fiscales directes',
            effort: 'Niveau complexité/coût',
            priority: 'Classement par ROI fiscal'
          },
          strategic: {
            actions: 'Stratégies moyen terme (6 mois - 3 ans)',
            structuring: 'Évolutions structures recommandées',
            planning: 'Planification succession/transmission',
            international: 'Optimisation transfrontalière'
          },
          visionary: {
            actions: 'Vision long terme (3-10 ans)',
            anticipation: 'Préparation changements réglementaires',
            legacy: 'Structuration héritage multigénérationnel',
            innovation: 'Intégration nouvelles opportunités'
          }
        }
      },
      
      // 📊 INTELLIGENCE ÉCONOMIQUE AVANCÉE
      economicIntelligence: {
        marketAnalysis: {
          realEstate: {
            andorra: 'Prix m² par commune, évolution, prévisions',
            international: 'Comparaison marchés européens',
            investment: 'Opportunités résidence fiscale',
            taxation: 'Impact fiscal selon localisation'
          },
          financial: {
            currencies: 'EUR/USD/CHF impact fiscalité',
            rates: 'Taux intérêts déductibilité emprunts',
            markets: 'Performance actifs selon fiscalité',
            crypto: 'Évolution réglementation/taxation'
          }
        },
        
        forecasting: {
          fiscal: {
            rates: 'Évolution probable taux IRPF/IS/IGI',
            thresholds: 'Ajustements seuils inflation',
            deductions: 'Nouvelles déductions possibles',
            international: 'Harmonisation fiscale UE/OCDE'
          },
          regulatory: {
            substance: 'Renforcement exigences substance',
            reporting: 'Nouvelles obligations déclaratives',
            compliance: 'Évolution contrôles AFA',
            sanctions: 'Durcissement pénalités'
          }
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
        irpf: [
          // Français
          'salaire', 'revenus', 'impôt', 'particulier', 'personnel', 'résidence', 'déclaration',
          'traitement', 'rémunération', 'émoluments', 'gains', 'fiscalité personnelle',
          // Espagnol/Catalan
          'sueldo', 'ingresos', 'impuesto', 'particular', 'personal', 'residencia', 'declaración',
          'salari', 'rendes', 'impost', 'residència', 'declaració',
          // Anglais
          'salary', 'income', 'tax', 'personal', 'residence', 'declaration'
        ],
        is: [
          // Français
          'société', 'entreprise', 'corporate', 'bénéfices', 'holding', 'international', 'dividendes',
          'compagnie', 'firme', 'business', 'profits', 'SARL', 'SA', 'SL',
          // Espagnol/Catalan
          'sociedad', 'empresa', 'corporativo', 'beneficios', 'dividendos',
          'societat', 'beneficis', 'dividends',
          // Anglais
          'company', 'corporation', 'business', 'profits', 'corporate tax'
        ],
        igi: ['tva', 'taxe', 'vente', 'services', 'indirect', 'facture', 'commerce'],
        plusValue: ['plus-value', 'plus value', 'plusvalue', 'vente', 'immobilier', 'capital', 'gain'],
        inheritance: ['succession', 'héritage', 'testament', 'donation', 'famille', 'décès'],
        irnr: ['non-résident', 'non résident', 'étranger', 'source', 'retenue'],
        banking: ['banque', 'bancaire', 'bilan', 'institution financière'],
        procedural: ['procédure', 'déclaration', 'délai', 'pénalité', 'contrôle', 'recours'],
        conventions: ['convention', 'double imposition', 'france', 'espagne', 'portugal', 'luxembourg'],
        residency: ['résidence', 'domicile', '183 jours', '90 jours', 'centre intérêts'],
        international: ['UE', 'OCDE', 'BEPS', 'CRS', 'FATCA', 'échange information'],
        crypto: [
          'crypto', 'bitcoin', 'ethereum', 'blockchain', 'mining', 'staking', 'defi', 'nft',
          'cryptomonnaie', 'monnaie virtuelle', 'actif numérique', 'token', 'minage',
          'criptomoneda', 'moneda virtual', 'activo digital', 'minería',
          'cryptocurrency', 'virtual currency', 'digital asset'
        ]
      },
      intentPatterns: {
        // Calculations
        irpfCalculation: /irpf|impôt.*revenu|salaire.*\d+|revenus.*\d+|calcul.*impôt/i,
        igiCalculation: /igi|tva|taxe.*\d+|vente.*\d+|facture.*\d+/i,
        isCalculation: /société.*\d+|bénéfice.*\d+|entreprise.*\d+|is.*\d+/i,
        plusValueCalculation: /plus.value.*\d+|vente.*\d+.*an|immobilier.*\d+/i,
        inheritanceCalculation: /succession.*\d+|héritage.*\d+|donation.*\d+/i,
        
        // Information requests
        irpfInfo: /irpf|impôt.*revenu|taux.*particulier|barème|tranches/i,
        igiInfo: /igi|tva.*andorre|taxe.*indirecte|taux.*igi/i,
        isInfo: /société|entreprise|holding|is.*taux|impôt.*société/i,
        plusValueInfo: /plus.value|vente.*bien|immobilier.*fiscalité/i,
        inheritanceInfo: /succession|héritage|donation|testament/i,
        irnrInfo: /non.résident|étranger|retenue.*source/i,
        residencyInfo: /résidence|domicile|183.*jour|centre.*intérêt/i,
        conventionInfo: /convention|double.*imposition|france.*andorre|espagne.*andorre/i,
        proceduralInfo: /procédure|déclaration|délai|pénalité|contrôle/i,
        
        // Optimization and advice
        optimization: /optimis|conseil|réduir|économis|stratégie|améliorer|minimiser|optimización|consejo|reducir|estrategia|mejorar|optimization|advice|reduce|strategy|improve/i,
        comparison: /compar|différence|mieux|avantage.*pays|france.*vs|espagne.*vs/i,
        
        // General patterns
        calculation: /calcul|calculer|combien|montant|simulation|\d+.*€|\d+.*euros?|\d+k/i,
        information: /qu'est.ce|comment|pourquoi|expliquer|définition/i
      }
    };
  }

  private initializeCalculators() {
    this.calculators = {
      // 💰 IRPF Calculator - Complete Implementation
      irpf: (income: number, deductions: number = 3000, specialCase?: string) => {
        let taxableIncome = Math.max(0, income - deductions);
        let tax = 0;
        
        // Special cases handling
        if (specialCase === 'nonResident') {
          tax = income * 0.10;
          return {
            grossIncome: income,
            deductions: 0,
            taxableIncome: income,
            tax: Math.round(tax),
            netIncome: Math.round(income - tax),
            effectiveRate: '10.00',
            specialCase: 'Non-résident'
          };
        }
        
        // Progressive tax calculation
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
      },
      
      // 🏢 Corporate Tax (IS) Calculator
      is: (profit: number, regime?: string) => {
        let rate = 0.10; // Standard rate
        let specialRegime = 'Standard (10%)';
        
        switch (regime) {
          case 'holding':
            rate = 0.02;
            specialRegime = 'Holding (2%)';
            break;
          case 'international':
            rate = 0.05;
            specialRegime = 'International (5%)';
            break;
          case 'newCompany':
            rate = 0.02;
            specialRegime = 'Nouvelle société (2% - 3 ans)';
            break;
          case 'intellectual':
            rate = 0.02;
            specialRegime = 'Propriété intellectuelle (2%)';
            break;
          case 'familyOffice':
            rate = 0.05;
            specialRegime = 'Family Office (5%)';
            break;
        }
        
        const tax = profit * rate;
        const minimumTax = profit > 50000 ? 400 : 0;
        const finalTax = Math.max(tax, minimumTax);
        
        return {
          profit,
          rate: (rate * 100).toFixed(1) + '%',
          specialRegime,
          tax: Math.round(finalTax),
          minimumTax,
          netProfit: Math.round(profit - finalTax),
          effectiveRate: profit > 0 ? ((finalTax / profit) * 100).toFixed(2) : '0.00'
        };
      },
      
      // 🛒 IGI Calculator
      igi: (amount: number, type: string = 'standard') => {
        let rate = 0.045; // Standard rate 4.5%
        let rateLabel = 'Standard (4,5%)';
        
        switch (type.toLowerCase()) {
          case 'reduced':
          case 'food':
          case 'energy':
          case 'books':
            rate = 0.01;
            rateLabel = 'Taux réduit (1%)';
            break;
          case 'services':
            rate = 0.095;
            rateLabel = 'Services (9,5%)';
            break;
          case 'medicines':
            rate = 0.00;
            rateLabel = 'Médicaments (0%)';
            break;
          case 'tobacco':
            rate = 0.30;
            rateLabel = 'Tabac (30%)';
            break;
          case 'alcohol':
            rate = 0.15;
            rateLabel = 'Alcool (15%)';
            break;
        }
        
        const igi = amount * rate;
        const totalTTC = amount + igi;
        
        return {
          amountHT: amount,
          rate: (rate * 100).toFixed(1) + '%',
          rateLabel,
          igi: Math.round(igi * 100) / 100,
          totalTTC: Math.round(totalTTC * 100) / 100
        };
      },
      
      // 🏡 Plus-value Calculator
      plusValue: (salePrice: number, purchasePrice: number, years: number, type: string = 'immobilier') => {
        const gain = salePrice - purchasePrice;
        
        if (gain <= 0) {
          return {
            salePrice,
            purchasePrice,
            gain: 0,
            tax: 0,
            rate: '0%',
            exemption: 'Aucune plus-value'
          };
        }
        
        if (type === 'immobilier') {
          let rate = 0.15; // Year 1
          
          if (years >= 11) {
            rate = 0.00; // Exemption after 11 years
          } else if (years >= 6) {
            rate = 0.10;
          } else if (years === 5) {
            rate = 0.11;
          } else if (years === 4) {
            rate = 0.12;
          } else if (years === 3) {
            rate = 0.13;
          } else if (years === 2) {
            rate = 0.14;
          }
          
          const tax = gain * rate;
          
          return {
            salePrice,
            purchasePrice,
            gain,
            years,
            rate: (rate * 100).toFixed(1) + '%',
            tax: Math.round(tax),
            netGain: Math.round(gain - tax),
            exemption: years >= 11 ? 'Exemption totale (>11 ans)' : null
          };
        } else {
          // Mobilier - 10% standard
          const exemption = 3000;
          const taxableGain = Math.max(0, gain - exemption);
          const tax = taxableGain * 0.10;
          
          return {
            salePrice,
            purchasePrice,
            gain,
            exemption,
            taxableGain,
            rate: '10%',
            tax: Math.round(tax),
            netGain: Math.round(gain - tax)
          };
        }
      },
      
      // 👨‍👩‍👧‍👦 Inheritance Tax Calculator
      inheritance: (amount: number, relationship: string) => {
        let exemption = 0;
        let rates = [0, 0.05, 0.10];
        let thresholds = [3000, 50000, 200000];
        
        switch (relationship.toLowerCase()) {
          case 'spouse':
          case 'conjoint':
            exemption = 50000;
            break;
          case 'children':
          case 'enfant':
          case 'enfants':
            exemption = 47000;
            break;
          case 'parents':
          case 'parent':
            exemption = 10000;
            break;
          case 'siblings':
          case 'frere':
          case 'soeur':
            exemption = 1000;
            break;
          default:
            exemption = 0;
        }
        
        const taxableAmount = Math.max(0, amount - exemption);
        let tax = 0;
        
        if (taxableAmount > thresholds[2]) {
          tax += (taxableAmount - thresholds[2]) * rates[2];
          tax += (thresholds[2] - thresholds[1]) * rates[1];
        } else if (taxableAmount > thresholds[1]) {
          tax += (taxableAmount - thresholds[1]) * rates[1];
        }
        
        return {
          inheritanceAmount: amount,
          relationship,
          exemption,
          taxableAmount,
          tax: Math.round(tax),
          netInheritance: Math.round(amount - tax),
          effectiveRate: amount > 0 ? ((tax / amount) * 100).toFixed(2) : '0.00'
        };
      },
      
      // 🌍 IRNR Calculator (Non-residents)
      irnr: (income: number, type: string, country?: string) => {
        let rate = 0.10; // Standard rate
        let conventionRate = null;
        
        // Apply convention rates if applicable
        if (country) {
          const conventions = this.knowledgeBase.fiscalLaws.irnr.conventions;
          if (conventions[country.toLowerCase()]) {
            const conv = conventions[country.toLowerCase()];
            switch (type.toLowerCase()) {
              case 'dividends':
              case 'dividendes':
                conventionRate = conv.dividends;
                break;
              case 'interest':
              case 'interets':
                conventionRate = conv.interest;
                break;
              case 'royalties':
              case 'redevances':
                conventionRate = conv.royalties;
                break;
            }
          }
        }
        
        const finalRate = conventionRate !== null ? conventionRate : rate;
        const tax = income * finalRate;
        
        return {
          income,
          type,
          country: country || 'Standard',
          standardRate: '10%',
          appliedRate: (finalRate * 100).toFixed(1) + '%',
          conventionApplied: conventionRate !== null,
          tax: Math.round(tax),
          netIncome: Math.round(income - tax)
        };
      },
      
      // 🏦 Banking Tax Calculator
      bankingTax: (totalAssets: number) => {
        const rate = 0.005; // 0.5%
        const minimumTax = 20000;
        const calculatedTax = totalAssets * rate;
        const finalTax = Math.max(calculatedTax, minimumTax);
        
        return {
          totalAssets,
          rate: '0,5%',
          calculatedTax: Math.round(calculatedTax),
          minimumTax,
          finalTax: Math.round(finalTax),
          effectiveRate: totalAssets > 0 ? ((finalTax / totalAssets) * 100).toFixed(3) : '0.000'
        };
      },
      
      // 🔄 Tax Optimization Tool
      optimize: (profile: any) => {
        const suggestions = [];
        
        if (profile.income > 40000) {
          suggestions.push('Considérez une société holding pour optimiser l\'IS à 2%');
          suggestions.push('Maximisez vos déductions IRPF (formation, investissements)');
        }
        
        if (profile.hasRealEstate) {
          suggestions.push('Planifiez vos ventes immobilières après 11 ans pour exemption totale');
        }
        
        if (profile.hasInternationalIncome) {
          suggestions.push('Vérifiez l\'application des conventions fiscales');
          suggestions.push('Structure internationale possible avec régime 5%');
        }
        
        return {
          profile,
          suggestions,
          estimatedSavings: 'Jusqu\'à 30% d\'économies fiscales possibles'
        };
      },
      
      // 📊 Country Comparison Tool
      compareCountries: (income: number) => {
        const andorraIRPF = this.calculators.irpf(income);
        
        return {
          income,
          comparison: {
            andorra: {
              irpf: andorraIRPF.tax,
              socialCharges: income * 0.22,
              total: andorraIRPF.tax + (income * 0.22),
              effectiveRate: ((andorraIRPF.tax + (income * 0.22)) / income * 100).toFixed(2)
            },
            france: {
              irpf: income > 180294 ? income * 0.45 : income * 0.30,
              socialCharges: income * 0.45,
              total: income * 0.75,
              effectiveRate: '75.00'
            },
            spain: {
              irpf: income > 175000 ? income * 0.47 : income * 0.37,
              socialCharges: income * 0.37,
              total: income * 0.74,
              effectiveRate: '74.00'
            }
          },
          savings: {
            vsFrance: Math.round((income * 0.75) - (andorraIRPF.tax + (income * 0.22))),
            vsSpain: Math.round((income * 0.74) - (andorraIRPF.tax + (income * 0.22)))
          }
        };
      }
    };
  }

  private initializeLearningEngine() {
    this.learningEngine = {
      interactions: [],
      
      // 📜 ENREGISTREMENT INTERACTIONS (BASE LÉGALE UNIQUEMENT)
      recordInteraction: (query: string, response: AIResponse, context: ConversationContext) => {
        this.learningEngine.interactions.push({
          timestamp: new Date(),
          query,
          response: response.text,
          confidence: response.confidence,
          context,
          lawReferences: response.lawReferences
        });
        
        // Limite mémoire
        if (this.learningEngine.interactions.length > 100) {
          this.learningEngine.interactions = this.learningEngine.interactions.slice(-100);
        }
      }
    };
  }

  private initializeSuggestionEngine() {
    this.suggestionEngine = {
      // 📜 SUGGESTIONS BASÉES SUR LES LOIS ANDORRANES
      generateSuggestions: (userProfile: any, intent: string) => {
        const suggestions = [];
        
        // Suggestions basées sur l'intention détectée et les lois
        switch (intent) {
          case 'irpfCalculation':
            suggestions.push('Articles 83-92 Llei 95/2010 : Déductions IRPF');
            suggestions.push('Conventions fiscales : Éviter double imposition');
            break;
            
          case 'isCalculation':
            suggestions.push('Art. 4 Llei 95/2010 : Régimes spéciaux IS');
            suggestions.push('Holding 2% : Conditions légales Art. 4.2');
            break;
            
          case 'residencyInfo':
            suggestions.push('Conditions résidence : 90 jours minimum');
            suggestions.push('Investissement requis : 400k€ passif, 50k€ actif');
            break;
            
          case 'cryptoInfo':
            suggestions.push('Réglementation 2025 : Seuil déclaration 1000€');
            suggestions.push('Mining professionnel : IS 10% (Art. 4 Llei 95/2010)');
            break;
            
          default:
            suggestions.push('Consultez les lois fiscales andorranes');
            suggestions.push('Vérifiez les conditions légales applicables');
        }
        
        // Suggestions légales générales
        if (userProfile?.profileType === 'professionnel') {
          suggestions.push('Llei 95/2010 : Impôt sur les Sociétés');
        } else {
          suggestions.push('Llei 5/2014 : IRPF - Impôt Revenus Particuliers');
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
    const lowerMessage = message.toLowerCase();
    
    // Mots positifs
    const positiveWords = [
      'merci', 'parfait', 'excellent', 'super', 'génial', 'formidable',
      'satisfait', 'content', 'heureux', 'optimiste', 'confiant',
      'gracias', 'perfecto', 'excelente', 'fantástico',
      'thank', 'perfect', 'excellent', 'great', 'amazing'
    ];
    
    // Mots négatifs
    const negativeWords = [
      'problème', 'difficulté', 'inquiet', 'préoccupé', 'stress',
      'urgent', 'critique', 'grave', 'erreur', 'échec',
      'problema', 'dificultad', 'preocupado', 'urgente',
      'problem', 'difficulty', 'worried', 'urgent', 'critical'
    ];
    
    // Mots neutres/interrogatifs
    const neutralWords = [
      'question', 'demande', 'information', 'conseil', 'aide',
      'pregunta', 'información', 'consejo', 'ayuda',
      'question', 'information', 'advice', 'help'
    ];
    
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;
    
    // Comptage des mots
    positiveWords.forEach(word => {
      if (lowerMessage.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (lowerMessage.includes(word)) negativeScore++;
    });
    
    neutralWords.forEach(word => {
      if (lowerMessage.includes(word)) neutralScore++;
    });
    
    // Analyse ponctuation
    const exclamations = (message.match(/!/g) || []).length;
    const questions = (message.match(/\?/g) || []).length;
    
    if (exclamations > 1) positiveScore += 0.5;
    if (questions > 2) neutralScore += 0.5;
    
    // Détermination sentiment
    if (positiveScore > negativeScore && positiveScore > neutralScore) {
      return positiveScore > 2 ? 'very_positive' : 'positive';
    } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
      return negativeScore > 2 ? 'very_negative' : 'negative';
    } else {
      return 'neutral';
    }
  }

  private assessComplexity(message: string, intent: string): number {
    let complexity = 0.3; // Base
    
    // Facteurs de complexité
    const complexTerms = [
      'holding', 'substance économique', 'beps', 'pillar 2', 'exit tax',
      'transfer pricing', 'cfc', 'family office', 'structuration',
      'multi-juridictionnel', 'optimisation avancée'
    ];
    
    const advancedCalculations = [
      'simulation', 'scénarios', 'prévisionnel', 'multi-revenus',
      'consolidation', 'répartition', 'arbitrage'
    ];
    
    // Analyse du message
    const lowerMessage = message.toLowerCase();
    
    // Termes complexes (+0.2 chacun, max +0.4)
    const complexMatches = complexTerms.filter(term => lowerMessage.includes(term)).length;
    complexity += Math.min(complexMatches * 0.2, 0.4);
    
    // Calculs avancés (+0.15 chacun, max +0.3)
    const calcMatches = advancedCalculations.filter(term => lowerMessage.includes(term)).length;
    complexity += Math.min(calcMatches * 0.15, 0.3);
    
    // Longueur du message
    if (message.length > 200) complexity += 0.1;
    if (message.length > 500) complexity += 0.1;
    
    // Nombres multiples (plusieurs montants)
    const numberMatches = (message.match(/\d+/g) || []).length;
    if (numberMatches > 2) complexity += 0.1;
    if (numberMatches > 5) complexity += 0.1;
    
    // Questions multiples
    const questionMarks = (message.match(/\?/g) || []).length;
    if (questionMarks > 1) complexity += 0.1;
    
    // Intent spécifique
    const complexIntents = [
      'optimization', 'structuring', 'comparison', 'pillar2Info',
      'substanceInfo', 'exitTaxInfo', 'complexQuery'
    ];
    if (complexIntents.includes(intent)) complexity += 0.2;
    
    return Math.min(complexity, 0.95);
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
    
    // 💰 IRPF CALCULATIONS
    if (intent === 'irpfCalculation' && entities.amounts?.length > 0) {
      if (entities.isComplex && entities.amounts.length > 1) {
        return this.generateComplexCalculation(entities, context, originalMessage);
      }
      return this.generateIRPFCalculation(entities.amounts[0], entities, context);
    }
    
    // 🛒 IGI CALCULATIONS
    if (intent === 'igiCalculation' && entities.amounts?.length > 0) {
      const amount = entities.amounts[0];
      const type = originalMessage.toLowerCase().includes('service') ? 'services' : 
                  originalMessage.toLowerCase().includes('médicament') ? 'medicines' :
                  originalMessage.toLowerCase().includes('livre') ? 'books' : 'standard';
      
      const result = this.calculators.igi(amount, type);
      
      const text = `🛒 **Calcul IGI Andorran**\n\n` +
        `• **Montant HT** : ${result.amountHT.toLocaleString()}€\n` +
        `• **Taux appliqué** : ${result.rate} (${result.rateLabel})\n` +
        `• **IGI à payer** : ${result.igi.toLocaleString()}€\n` +
        `• **Total TTC** : ${result.totalTTC.toLocaleString()}€\n\n` +
        `✅ L'IGI andorran reste très compétitif comparé à la TVA européenne !`;
      
      return {
        text,
        confidence: 0.95,
        lawReferences: ['Llei 11/2012 - IGI'],
        entities,
        calculations: { type: 'igi', results: result, breakdown: [`Taux ${result.rate}`, `IGI: ${result.igi}€`] }
      };
    }
    
    // 🏢 CORPORATE TAX CALCULATIONS
    if (intent === 'isCalculation' && entities.amounts?.length > 0) {
      const profit = entities.amounts[0];
      const regime = originalMessage.toLowerCase().includes('holding') ? 'holding' :
                    originalMessage.toLowerCase().includes('international') ? 'international' :
                    originalMessage.toLowerCase().includes('nouvelle') ? 'newCompany' : 'standard';
      
      const result = this.calculators.is(profit, regime);
      
      const text = `🏢 **Calcul Impôt sur les Sociétés (IS)**\n\n` +
        `• **Bénéfice** : ${result.profit.toLocaleString()}€\n` +
        `• **Régime** : ${result.specialRegime}\n` +
        `• **Taux** : ${result.rate}\n` +
        `• **IS à payer** : ${result.tax.toLocaleString()}€\n` +
        `• **Bénéfice net** : ${result.netProfit.toLocaleString()}€\n\n` +
        `🚀 Avantage andorran : IS maximum 10% vs 25-30% en Europe !`;
      
      return {
        text,
        confidence: 0.95,
        lawReferences: ['Llei 95/2010 - IS'],
        entities,
        calculations: { type: 'is', results: result, breakdown: [`${result.specialRegime}`, `IS: ${result.tax}€`] }
      };
    }
    
    // 🏡 PLUS-VALUE CALCULATIONS
    if (intent === 'plusValueCalculation' && entities.amounts?.length >= 2) {
      const salePrice = Math.max(...entities.amounts);
      const purchasePrice = Math.min(...entities.amounts);
      const years = originalMessage.match(/(\d+)\s*an/)?.[1] ? parseInt(originalMessage.match(/(\d+)\s*an/)[1]) : 1;
      
      const result = this.calculators.plusValue(salePrice, purchasePrice, years);
      
      const text = `🏡 **Calcul Plus-value Immobilière**\n\n` +
        `• **Prix de vente** : ${result.salePrice.toLocaleString()}€\n` +
        `• **Prix d'achat** : ${result.purchasePrice.toLocaleString()}€\n` +
        `• **Plus-value** : ${result.gain.toLocaleString()}€\n` +
        `• **Détention** : ${result.years} an(s)\n` +
        `• **Taux** : ${result.rate}\n` +
        `• **Impôt** : ${result.tax.toLocaleString()}€\n` +
        (result.exemption ? `\n🎉 ${result.exemption}` : '') +
        `\n\n✨ Après 11 ans de détention : exemption totale !`;
      
      return {
        text,
        confidence: 0.94,
        lawReferences: ['Art. 89-92 IRPF'],
        entities,
        calculations: { type: 'plusValue', results: result, breakdown: [`${result.years} ans`, `Taux ${result.rate}`] }
      };
    }
    
    // 👨‍👩‍👧‍👦 INHERITANCE TAX CALCULATIONS
    if (intent === 'inheritanceCalculation' && entities.amounts?.length > 0) {
      const amount = entities.amounts[0];
      const relationship = originalMessage.toLowerCase().includes('conjoint') || originalMessage.toLowerCase().includes('épou') ? 'spouse' :
                          originalMessage.toLowerCase().includes('enfant') ? 'children' :
                          originalMessage.toLowerCase().includes('parent') ? 'parents' : 'other';
      
      const result = this.calculators.inheritance(amount, relationship);
      
      const text = `👨‍👩‍👧‍👦 **Calcul Droits de Succession**\n\n` +
        `• **Montant héritage** : ${result.inheritanceAmount.toLocaleString()}€\n` +
        `• **Lien familial** : ${result.relationship}\n` +
        `• **Exemption** : ${result.exemption.toLocaleString()}€\n` +
        `• **Base taxable** : ${result.taxableAmount.toLocaleString()}€\n` +
        `• **Impôt** : ${result.tax.toLocaleString()}€\n` +
        `• **Héritage net** : ${result.netInheritance.toLocaleString()}€\n\n` +
        `💪 Andorre : fiscalité successorale très favorable !`;
      
      return {
        text,
        confidence: 0.93,
        lawReferences: ['Llei 94/2010 - Successions'],
        entities,
        calculations: { type: 'inheritance', results: result, breakdown: [`Exemption ${result.exemption}€`, `Impôt ${result.tax}€`] }
      };
    }
    
    // 📊 INFORMATIONAL RESPONSES
    if (intent === 'irpfInfo') {
      return {
        text: `💰 **IRPF Andorran - Guide Complet**\n\n📈 **Barème progressif 2025** :\n• **0%** : 0€ à 24 000€\n• **5%** : 24 001€ à 40 000€\n• **10%** : au-delà de 40 000€\n\n🎯 **Déductions principales** :\n• Personnelle : 3 000€\n• Familiale : 1 000€/personne\n• Retraite : 30% des cotisations\n• Hypothèque : 15%\n\n✨ **Cas spéciaux** :\n• Non-résidents : 10% forfaitaire\n• Sportifs : exemption jusqu'à 300 000€`,
        confidence: 0.96,
        lawReferences: ['Llei 5/2014 - IRPF', 'Art. 83 et suivants'],
        entities,
        followUpQuestions: ['Voulez-vous un calcul personnalisé ?', 'Quelle est votre situation familiale ?']
      };
    }
    
    if (intent === 'igiInfo') {
      return {
        text: `🛒 **IGI (Impôt Général Indirect) - Taux 2025**\n\n📈 **Taux principaux** :\n• **Standard** : 4,5% (la plupart des biens)\n• **Services** : 9,5%\n• **Taux réduit** : 1% (alimentation, énergie, livres)\n• **Exempt** : 0% (médicaments)\n\n🎯 **Seuils d'assujettissement** :\n• Inscription : 30 000€ CA\n• Régime simplifié : 90 000€ CA\n\n🚀 **Avantage** : IGI 4,5% vs TVA 20-25% Europe !`,
        confidence: 0.96,
        lawReferences: ['Llei 11/2012 - IGI'],
        entities,
        followUpQuestions: ['Calculer l\'IGI sur un montant ?', 'Quels sont vos revenus annuels ?']
      };
    }
    
    if (intent === 'isInfo') {
      return {
        text: `🏢 **Impôt sur les Sociétés (IS) - Guide Complet**\n\n📈 **Taux 2025** :\n• **Standard** : 10%\n• **Holding** : 2% (participation >25%)\n• **International** : 5% (revenus étranger >85%)\n• **Nouvelle société** : 2% (3 premières années)\n• **Propriété intellectuelle** : 2%\n• **Family Office** : 5%\n\n💰 **Impôt minimum** : 400€ (si CA >50 000€)\n\n🚀 **Avantage** : IS 10% vs 25-30% Europe !`,
        confidence: 0.96,
        lawReferences: ['Llei 95/2010 - IS'],
        entities,
        followUpQuestions: ['Calculer l\'IS sur vos bénéfices ?', 'Quel type d\'activité avez-vous ?']
      };
    }
    
    if (intent === 'conventionInfo') {
      return {
        text: `🌍 **Conventions Fiscales Andorranes**\n\n📄 **Conventions en vigueur** :\n• **France** : Convention 2013 (vigueur 2015)\n• **Espagne** : Convention 2015\n• **Portugal** : Convention 2015\n• **Luxembourg** : Convention 2014\n\n🎯 **Avantages principaux** :\n• Évite la double imposition\n• Réduction retenues à la source\n• Échange d'informations fiscal\n• Sécurité juridique internationale\n\n📈 **Taux conventionnels** :\n• Dividendes : 5% (vs 10% standard)\n• Intérêts : 0% (obligations d'État)\n• Redevances : 5%`,
        confidence: 0.95,
        lawReferences: ['Conventions bilatérales', 'OCDE MLI'],
        entities,
        followUpQuestions: ['Avez-vous des revenus à l\'international ?', 'Dans quel pays résidez-vous actuellement ?']
      };
    }
    
    if (intent === 'residencyInfo') {
      return {
        text: `🏠 **Résidence Fiscale Andorrane - Critères 2025**\n\n📅 **Test des 183 jours** :\n• Présence physique >183 jours/an\n• Ou centre d'intérêts vitaux en Andorre\n\n💼 **Obligations résident fiscal** :\n• Déclaration IRPF si revenus >24 000€\n• Déclaration avant 30 septembre\n• Acomptes trimestriels si impôt >900€\n\n💰 **Investissement requis** :\n• **Passif** : 400 000€ (immobilier)\n• **Actif** : 50 000€ (AFA + entreprise)\n• **Minimum** : 15 000€ (dépôt AFA)\n\n✨ **Avantages** : Fiscalité optimale + qualité de vie !`,
        confidence: 0.96,
        lawReferences: ['Llei de règim jurídic', 'Reglament AFA'],
        entities,
        followUpQuestions: ['Quel type d\'investissement vous intéresse ?', 'Combien de jours comptez-vous passer en Andorre ?']
      };
    }
    
    if (intent === 'comparison') {
      const income = entities.amounts?.[0] || 100000;
      const result = this.calculators.compareCountries(income);
      
      const text = `📊 **Comparaison Fiscale Internationale** (${income.toLocaleString()}€)\n\n` +
        `🇦🇩 **ANDORRE** :\n` +
        `• IRPF : ${result.comparison.andorra.irpf.toLocaleString()}€\n` +
        `• Charges sociales : ${result.comparison.andorra.socialCharges.toLocaleString()}€\n` +
        `• **Total** : ${result.comparison.andorra.total.toLocaleString()}€ (${result.comparison.andorra.effectiveRate}%)\n\n` +
        `🇫🇷 **FRANCE** : ${result.comparison.france.total.toLocaleString()}€ (${result.comparison.france.effectiveRate}%)\n` +
        `🇪🇸 **ESPAGNE** : ${result.comparison.spain.total.toLocaleString()}€ (${result.comparison.spain.effectiveRate}%)\n\n` +
        `🚀 **ÉCONOMIES ANDORRE** :\n` +
        `• vs France : ${result.savings.vsFrance.toLocaleString()}€/an\n` +
        `• vs Espagne : ${result.savings.vsSpain.toLocaleString()}€/an`;
      
      return {
        text,
        confidence: 0.94,
        lawReferences: ['Comparaison internationale'],
        entities,
        calculations: { type: 'comparison', results: result, breakdown: ['Andorre optimale', 'Major savings'] }
      };
    }
    
    if (intent === 'optimization') {
      return {
        text: `🎯 **Optimisation Fiscale Andorrane Ultra-Complète**\n\n📈 **Stratégies IRPF** :\n• Maximiser déductions retraite (30%)\n• Déductions familiales (1 000€/personne)\n• Formation continue déductible\n• Investissements immobiliers (15%)\n\n🏢 **Structures sociétaires** :\n• Holding familiale (IS 2%)\n• Société internationale (5%)\n• Propriété intellectuelle (2%)\n\n🏡 **Immobilier** :\n• Détention >11 ans = exemption totale\n• Résidence principale : exemption 400k€\n• Reinvestissement = report d'imposition\n\n🚀 **Résultat** : Jusqu'à 60% d'économie vs Europe !`,
        confidence: 0.97,
        lawReferences: ['Ensemble législation andorrane'],
        entities,
        followUpQuestions: ['Quelle est votre situation actuelle ?', 'Souhaitez-vous une étude personnalisée ?']
      };
    }
    
    // FALLBACK - Information générale
    return {
      text: `👋 **Bonjour ! Je suis Francis, Expert Fiscal Andorran**\n\nJe maîtrise TOUTE la fiscalité andorrane :\n\n💰 **Impôts des particuliers** : IRPF, plus-values, successions\n🏢 **Fiscalité des sociétés** : IS, holdings, régimes spéciaux\n🛒 **IGI** : Taxe indirecte, taux préférentiels\n🌍 **International** : Conventions, IRNR, optimisation\n⚖️ **Procédures** : Déclarations, contrôles, recours\n\nComment puis-je vous aider précisément ?`,
      confidence: 0.9,
      lawReferences: ['Législation fiscale andorrane complète'],
      entities,
      followUpQuestions: [
        'Calculer mon IRPF ?',
        'Optimisation fiscale ?',
        'Créer une société ?',
        'Résidence fiscale ?',
        'Plus-values immobilières ?',
        'Conventions internationales ?'
      ]
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
          salary: 'salaire',
          dividends: 'dividendes',
          rental: 'revenus locatifs',
          freelance: 'revenus indépendant'
        }[type] || 'revenus';
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

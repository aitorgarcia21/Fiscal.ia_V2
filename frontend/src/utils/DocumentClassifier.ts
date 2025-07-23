interface DocumentClassification {
  type: 'RELEVE_COMPTE' | 'ASSURANCE_VIE' | 'PEA' | 'PER' | 'SCPI' | 'BULLETIN_SALAIRE' | 'AVIS_IMPOSITION' | 'FACTURE' | 'CONTRAT' | 'AUTRE';
  subtype?: string;
  confidence: number;
  provider?: string;
  period?: {
    start: Date;
    end: Date;
  };
  extractedData: Record<string, any>;
  metadata: {
    pageCount: number;
    language: 'fr' | 'en' | 'de' | 'es';
    quality: 'HIGH' | 'MEDIUM' | 'LOW';
    encrypted: boolean;
    fileSize: number;
  };
}

interface ClassificationRule {
  type: DocumentClassification['type'];
  patterns: {
    keywords: string[];
    regex: RegExp[];
    layout: {
      hasTable: boolean;
      hasHeader: boolean;
      hasFooter: boolean;
      columnCount?: number;
    };
    financial: {
      hasCurrency: boolean;
      hasIBAN: boolean;
      hasBalance: boolean;
      hasTransactions: boolean;
    };
  };
  weight: number;
  requiredMatches: number;
}

interface ExtractionTemplate {
  type: DocumentClassification['type'];
  fields: Array<{
    name: string;
    patterns: RegExp[];
    required: boolean;
    dataType: 'string' | 'number' | 'date' | 'currency' | 'percentage';
    validator?: (value: any) => { valid: boolean; normalized?: any };
  }>;
}

class DocumentClassifier {
  private classificationRules: ClassificationRule[] = [
    // Relevé de compte bancaire
    {
      type: 'RELEVE_COMPTE',
      patterns: {
        keywords: ['relevé', 'compte', 'solde', 'opérations', 'crédit agricole', 'bnp paribas', 'société générale', 'lcl', 'banque populaire'],
        regex: [
          /relevé\s+de\s+compte/i,
          /solde\s+au\s+\d{2}\/\d{2}\/\d{4}/i,
          /IBAN\s*:\s*[A-Z]{2}\d{2}/i,
          /opérations\s+du\s+\d{2}\/\d{2}/i
        ],
        layout: { hasTable: true, hasHeader: true, hasFooter: true },
        financial: { hasCurrency: true, hasIBAN: true, hasBalance: true, hasTransactions: true }
      },
      weight: 10,
      requiredMatches: 3
    },

    // Contrat d'assurance-vie
    {
      type: 'ASSURANCE_VIE',
      patterns: {
        keywords: ['assurance vie', 'contrat', 'bénéficiaire', 'valeur rachat', 'fonds euros', 'unités compte'],
        regex: [
          /assurance[\s-]vie/i,
          /contrat\s+n°?\s*[\d\w]+/i,
          /valeur\s+de\s+rachat/i,
          /fonds?\s+en\s+euros/i,
          /unités?\s+de\s+compte/i
        ],
        layout: { hasTable: false, hasHeader: true, hasFooter: true },
        financial: { hasCurrency: true, hasIBAN: false, hasBalance: true, hasTransactions: false }
      },
      weight: 9,
      requiredMatches: 2
    },

    // Relevé PEA
    {
      type: 'PEA',
      patterns: {
        keywords: ['pea', 'plan épargne actions', 'valorisation', 'plus-values', 'titres'],
        regex: [
          /P\.?E\.?A\.?/i,
          /plan\s+d?['\']?épargne\s+actions/i,
          /valorisation\s+au\s+\d{2}\/\d{2}/i,
          /plus[\s-]values?\s+(latentes?|réalisées?)/i
        ],
        layout: { hasTable: true, hasHeader: true, hasFooter: false },
        financial: { hasCurrency: true, hasIBAN: false, hasBalance: true, hasTransactions: true }
      },
      weight: 9,
      requiredMatches: 2
    },

    // PER (Plan Épargne Retraite)
    {
      type: 'PER',
      patterns: {
        keywords: ['per', 'plan épargne retraite', 'retraite', 'versements', 'rentes'],
        regex: [
          /P\.?E\.?R\.?/i,
          /plan\s+d?['\']?épargne\s+retraite/i,
          /versements?\s+déductibles?/i,
          /rente\s+viagère/i
        ],
        layout: { hasTable: true, hasHeader: true, hasFooter: true },
        financial: { hasCurrency: true, hasIBAN: false, hasBalance: true, hasTransactions: true }
      },
      weight: 8,
      requiredMatches: 2
    },

    // SCPI
    {
      type: 'SCPI',
      patterns: {
        keywords: ['scpi', 'immobilière', 'parts', 'distribution', 'rendement'],
        regex: [
          /s\.?c\.?p\.?i\.?/i,
          /société\s+civile.*immobilière/i,
          /parts?\s+(acquises?|détenues?)/i,
          /distribution\s+\d{4}/i,
          /rendement\s+\d+[,\.]\d+\s*%/i
        ],
        layout: { hasTable: true, hasHeader: true, hasFooter: false },
        financial: { hasCurrency: true, hasIBAN: false, hasBalance: true, hasTransactions: true }
      },
      weight: 8,
      requiredMatches: 2
    },

    // Bulletin de salaire
    {
      type: 'BULLETIN_SALAIRE',
      patterns: {
        keywords: ['bulletin', 'salaire', 'paie', 'cotisations', 'net à payer', 'employeur'],
        regex: [
          /bulletin\s+de\s+(paie|salaire)/i,
          /net\s+à\s+payer/i,
          /cotisations?\s+sociales?/i,
          /période\s+du\s+\d{2}\/\d{2}/i
        ],
        layout: { hasTable: true, hasHeader: true, hasFooter: true },
        financial: { hasCurrency: true, hasIBAN: false, hasBalance: false, hasTransactions: false }
      },
      weight: 9,
      requiredMatches: 2
    },

    // Avis d'imposition
    {
      type: 'AVIS_IMPOSITION',
      patterns: {
        keywords: ['avis', 'imposition', 'revenus', 'impôt', 'foyer fiscal', 'parts'],
        regex: [
          /avis\s+d?['\']?imposition/i,
          /revenus?\s+déclarés?/i,
          /impôt\s+sur\s+le\s+revenu/i,
          /foyer\s+fiscal/i,
          /numéro\s+fiscal/i
        ],
        layout: { hasTable: true, hasHeader: true, hasFooter: true },
        financial: { hasCurrency: true, hasIBAN: false, hasBalance: false, hasTransactions: false }
      },
      weight: 10,
      requiredMatches: 2
    }
  ];

  private extractionTemplates: ExtractionTemplate[] = [
    // Template relevé de compte
    {
      type: 'RELEVE_COMPTE',
      fields: [
        {
          name: 'iban',
          patterns: [/IBAN\s*:\s*([A-Z]{2}\d{2}\s*(?:\d{4}\s*){5}\d{2})/i],
          required: true,
          dataType: 'string',
          validator: (value) => ({
            valid: /^[A-Z]{2}\d{2}/.test(value.replace(/\s/g, '')),
            normalized: value.replace(/\s/g, '')
          })
        },
        {
          name: 'solde_initial',
          patterns: [/solde\s+précédent\s*:\s*([\d\s,.-]+)\s*€?/i],
          required: false,
          dataType: 'currency'
        },
        {
          name: 'solde_final',
          patterns: [/nouveau\s+solde\s*:\s*([\d\s,.-]+)\s*€?/i],
          required: true,
          dataType: 'currency'
        },
        {
          name: 'periode_debut',
          patterns: [/période\s+du\s+(\d{2}\/\d{2}\/\d{4})/i],
          required: true,
          dataType: 'date'
        },
        {
          name: 'periode_fin',
          patterns: [/au\s+(\d{2}\/\d{2}\/\d{4})/i],
          required: true,
          dataType: 'date'
        }
      ]
    },

    // Template assurance-vie
    {
      type: 'ASSURANCE_VIE',
      fields: [
        {
          name: 'numero_contrat',
          patterns: [/contrat\s+n°?\s*([\d\w-]+)/i],
          required: true,
          dataType: 'string'
        },
        {
          name: 'valeur_rachat',
          patterns: [/valeur\s+de\s+rachat\s*:\s*([\d\s,.-]+)\s*€?/i],
          required: true,
          dataType: 'currency'
        },
        {
          name: 'fonds_euros',
          patterns: [/fonds?\s+en?\s+euros?\s*:\s*([\d\s,.-]+)\s*€?/i],
          required: false,
          dataType: 'currency'
        },
        {
          name: 'unites_compte',
          patterns: [/unités?\s+de\s+compte\s*:\s*([\d\s,.-]+)\s*€?/i],
          required: false,
          dataType: 'currency'
        },
        {
          name: 'date_valeur',
          patterns: [/au\s+(\d{2}\/\d{2}\/\d{4})/i],
          required: true,
          dataType: 'date'
        }
      ]
    },

    // Template PEA
    {
      type: 'PEA',
      fields: [
        {
          name: 'valorisation',
          patterns: [/valorisation\s*:\s*([\d\s,.-]+)\s*€?/i],
          required: true,
          dataType: 'currency'
        },
        {
          name: 'plus_values_latentes',
          patterns: [/plus[\s-]values?\s+latentes?\s*:\s*([\d\s,.-]+)\s*€?/i],
          required: false,
          dataType: 'currency'
        },
        {
          name: 'liquidites',
          patterns: [/liquidités?\s*:\s*([\d\s,.-]+)\s*€?/i],
          required: false,
          dataType: 'currency'
        },
        {
          name: 'date_ouverture',
          patterns: [/ouvert\s+le\s+(\d{2}\/\d{2}\/\d{4})/i],
          required: false,
          dataType: 'date'
        }
      ]
    },

    // Template bulletin de salaire
    {
      type: 'BULLETIN_SALAIRE',
      fields: [
        {
          name: 'salaire_brut',
          patterns: [/salaire\s+brut\s*:\s*([\d\s,.-]+)\s*€?/i],
          required: true,
          dataType: 'currency'
        },
        {
          name: 'net_a_payer',
          patterns: [/net\s+à\s+payer\s*:\s*([\d\s,.-]+)\s*€?/i],
          required: true,
          dataType: 'currency'
        },
        {
          name: 'cotisations',
          patterns: [/total\s+cotisations?\s*:\s*([\d\s,.-]+)\s*€?/i],
          required: false,
          dataType: 'currency'
        },
        {
          name: 'periode',
          patterns: [/période\s+(?:du\s+)?(\d{2}\/\d{4})/i],
          required: true,
          dataType: 'string'
        }
      ]
    }
  ];

  // Classification principale du document
  async classifyDocument(file: File, extractedText: string): Promise<DocumentClassification> {
    const startTime = Date.now();

    try {
      // Analyse de la qualité du document
      const metadata = await this.analyzeDocumentMetadata(file, extractedText);
      
      // Classification basée sur les règles
      const classification = this.performRuleBasedClassification(extractedText);
      
      // Classification IA (en complément)
      const aiClassification = await this.performAIClassification(extractedText, classification.type);
      
      // Extraction des données selon le type détecté
      const extractedData = await this.extractDocumentData(classification.type, extractedText);
      
      // Détection de la période couverte
      const period = this.extractPeriod(extractedText);
      
      // Détection du provider
      const provider = this.detectProvider(extractedText, classification.type);

      return {
        type: classification.type,
        subtype: aiClassification.subtype,
        confidence: Math.min(classification.confidence, aiClassification.confidence),
        provider,
        period,
        extractedData,
        metadata
      };

    } catch (error) {
      console.error('Erreur classification document:', error);
      
      return {
        type: 'AUTRE',
        confidence: 0,
        extractedData: { error: error instanceof Error ? error.message : 'Erreur inconnue' },
        metadata: {
          pageCount: 1,
          language: 'fr',
          quality: 'LOW',
          encrypted: false,
          fileSize: file.size
        }
      };
    }
  }

  // Classification basée sur les règles prédéfinies
  private performRuleBasedClassification(text: string): { type: DocumentClassification['type']; confidence: number } {
    const lowerText = text.toLowerCase();
    const scores: Array<{ type: DocumentClassification['type']; score: number }> = [];

    this.classificationRules.forEach(rule => {
      let score = 0;
      let matches = 0;

      // Score des mots-clés
      rule.patterns.keywords.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
          score += 2;
          matches++;
        }
      });

      // Score des regex
      rule.patterns.regex.forEach(regex => {
        if (regex.test(text)) {
          score += 3;
          matches++;
        }
      });

      // Score des patterns financiers
      if (rule.patterns.financial.hasCurrency && /\d+[,.]?\d*\s*€/.test(text)) {
        score += 1;
        matches++;
      }
      if (rule.patterns.financial.hasIBAN && /[A-Z]{2}\d{2}/.test(text)) {
        score += 2;
        matches++;
      }

      // Score pondéré
      if (matches >= rule.requiredMatches) {
        scores.push({
          type: rule.type,
          score: (score * rule.weight) / 10
        });
      }
    });

    // Sélection du type avec le meilleur score
    if (scores.length === 0) {
      return { type: 'AUTRE', confidence: 0 };
    }

    const best = scores.reduce((prev, current) => 
      current.score > prev.score ? current : prev
    );

    return {
      type: best.type,
      confidence: Math.min(best.score / 10, 1) // Normalisation 0-1
    };
  }

  // Classification IA complémentaire
  private async performAIClassification(text: string, baseType: DocumentClassification['type']): Promise<{
    subtype?: string;
    confidence: number;
  }> {
    try {
      const response = await fetch('/api/ai/classify-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.substring(0, 2000), // Limiter la taille pour l'API
          baseType,
          language: 'fr'
        })
      });

      if (!response.ok) {
        return { confidence: 0.5 }; // Score par défaut si IA indisponible
      }

      const result = await response.json();
      
      return {
        subtype: result.subtype,
        confidence: result.confidence || 0.5
      };

    } catch (error) {
      console.warn('Classification IA indisponible:', error);
      return { confidence: 0.5 };
    }
  }

  // Extraction des données selon le template
  private async extractDocumentData(type: DocumentClassification['type'], text: string): Promise<Record<string, any>> {
    const template = this.extractionTemplates.find(t => t.type === type);
    if (!template) return {};

    const extractedData: Record<string, any> = {};

    template.fields.forEach(field => {
      let value: any = null;

      // Test de chaque pattern
      for (const pattern of field.patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          value = match[1].trim();
          break;
        }
      }

      if (value) {
        // Normalisation selon le type de données
        switch (field.dataType) {
          case 'currency':
            value = this.parseCurrency(value);
            break;
          case 'date':
            value = this.parseDate(value);
            break;
          case 'number':
            value = this.parseNumber(value);
            break;
          case 'percentage':
            value = this.parsePercentage(value);
            break;
        }

        // Validation personnalisée
        if (field.validator) {
          const validation = field.validator(value);
          if (validation.valid) {
            value = validation.normalized || value;
          } else if (field.required) {
            console.warn(`Invalid ${field.name}:`, value);
          }
        }

        extractedData[field.name] = value;
      } else if (field.required) {
        console.warn(`Required field ${field.name} not found`);
      }
    });

    return extractedData;
  }

  // Analyse des métadonnées
  private async analyzeDocumentMetadata(file: File, text: string): Promise<DocumentClassification['metadata']> {
    // Détection de la langue
    const language = this.detectLanguage(text);
    
    // Évaluation de la qualité OCR
    const quality = this.assessOCRQuality(text);
    
    // Comptage approximatif des pages (basé sur la longueur du texte)
    const pageCount = Math.max(1, Math.ceil(text.length / 3000));

    return {
      pageCount,
      language,
      quality,
      encrypted: false, // TODO: Détection de documents chiffrés
      fileSize: file.size
    };
  }

  // Détection de la langue
  private detectLanguage(text: string): 'fr' | 'en' | 'de' | 'es' {
    const sample = text.substring(0, 500).toLowerCase();
    
    const indicators = {
      fr: ['le', 'la', 'de', 'et', 'à', 'un', 'il', 'être', 'avoir', 'que', 'compte', 'banque', 'solde'],
      en: ['the', 'and', 'of', 'to', 'a', 'in', 'is', 'it', 'you', 'that', 'account', 'bank', 'balance'],
      de: ['der', 'die', 'das', 'und', 'in', 'den', 'von', 'zu', 'mit', 'ist', 'konto', 'bank', 'saldo'],
      es: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'cuenta', 'banco', 'saldo']
    };

    const scores = Object.entries(indicators).map(([lang, words]) => ({
      lang: lang as 'fr' | 'en' | 'de' | 'es',
      score: words.filter(word => sample.includes(word)).length
    }));

    const bestMatch = scores.reduce((prev, current) => 
      current.score > prev.score ? current : prev
    );

    return bestMatch.score > 0 ? bestMatch.lang : 'fr';
  }

  // Évaluation qualité OCR
  private assessOCRQuality(text: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    // Ratio de caractères spéciaux/illisibles
    const specialChars = text.match(/[^\w\s\-.,;:!?()€%]/g) || [];
    const specialRatio = specialChars.length / text.length;

    // Ratio de mots courts (potentiellement mal OCRés)
    const words = text.split(/\s+/);
    const shortWords = words.filter(word => word.length <= 2 && !/\d/.test(word));
    const shortWordsRatio = shortWords.length / words.length;

    if (specialRatio < 0.02 && shortWordsRatio < 0.1) {
      return 'HIGH';
    } else if (specialRatio < 0.05 && shortWordsRatio < 0.2) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  // Extraction de la période couverte
  private extractPeriod(text: string): DocumentClassification['period'] | undefined {
    const patterns = [
      /période\s+du\s+(\d{2}\/\d{2}\/\d{4})\s+au\s+(\d{2}\/\d{2}\/\d{4})/i,
      /du\s+(\d{2}\/\d{2}\/\d{4})\s+au\s+(\d{2}\/\d{2}\/\d{4})/i,
      /(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const start = this.parseDate(match[1]);
        const end = this.parseDate(match[2]);
        
        if (start && end) {
          return { start, end };
        }
      }
    }

    return undefined;
  }

  // Détection du provider/émetteur
  private detectProvider(text: string, type: DocumentClassification['type']): string | undefined {
    const lowerText = text.toLowerCase();

    const providers = {
      banks: ['crédit agricole', 'bnp paribas', 'société générale', 'lcl', 'banque populaire', 'caisse d\'épargne', 'crédit mutuel', 'la banque postale'],
      insurance: ['axa', 'generali', 'allianz', 'cardif', 'swiss life', 'aviva', 'maif', 'macif'],
      investment: ['amundi', 'lyxor', 'blackrock', 'vanguard', 'bnp am', 'natixis am']
    };

    const allProviders = [...providers.banks, ...providers.insurance, ...providers.investment];
    
    for (const provider of allProviders) {
      if (lowerText.includes(provider)) {
        return provider.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
    }

    return undefined;
  }

  // Utilitaires de parsing
  private parseCurrency(value: string): number {
    const cleaned = value.replace(/[\s€$£]/g, '').replace(/,/g, '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  private parseDate(value: string): Date | null {
    const patterns = [
      /(\d{2})\/(\d{2})\/(\d{4})/,
      /(\d{4})-(\d{2})-(\d{2})/,
      /(\d{2})-(\d{2})-(\d{4})/
    ];

    for (const pattern of patterns) {
      const match = value.match(pattern);
      if (match) {
        const [, part1, part2, part3] = match;
        
        // Déterminer l'ordre jour/mois/année
        if (part3.length === 4) { // Format DD/MM/YYYY ou MM/DD/YYYY
          const day = parseInt(part1);
          const month = parseInt(part2);
          const year = parseInt(part3);
          
          if (day <= 12 && month <= 12) {
            // Ambiguïté - on assume DD/MM/YYYY (format français)
            return new Date(year, month - 1, day);
          } else if (day > 12) {
            return new Date(year, month - 1, day);
          } else {
            return new Date(year, day - 1, month);
          }
        } else if (part1.length === 4) { // Format YYYY-MM-DD
          return new Date(parseInt(part1), parseInt(part2) - 1, parseInt(part3));
        }
      }
    }

    return null;
  }

  private parseNumber(value: string): number {
    const cleaned = value.replace(/[\s]/g, '').replace(/,/g, '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  private parsePercentage(value: string): number {
    const cleaned = value.replace(/[%\s]/g, '').replace(/,/g, '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed / 100;
  }

  // Classification en lots pour traitement massif
  async classifyBatch(files: Array<{ file: File; text: string }>): Promise<DocumentClassification[]> {
    const classifications = await Promise.all(
      files.map(({ file, text }) => this.classifyDocument(file, text))
    );

    return classifications;
  }

  // Export des résultats pour audit
  exportClassificationReport(classifications: DocumentClassification[]): string {
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        documentsCount: classifications.length,
        version: '1.0'
      },
      summary: {
        types: this.getTypesDistribution(classifications),
        avgConfidence: this.getAverageConfidence(classifications),
        qualityDistribution: this.getQualityDistribution(classifications)
      },
      details: classifications.map(c => ({
        type: c.type,
        subtype: c.subtype,
        confidence: c.confidence,
        provider: c.provider,
        quality: c.metadata.quality
      }))
    };

    return JSON.stringify(report, null, 2);
  }

  private getTypesDistribution(classifications: DocumentClassification[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    classifications.forEach(c => {
      distribution[c.type] = (distribution[c.type] || 0) + 1;
    });

    return distribution;
  }

  private getAverageConfidence(classifications: DocumentClassification[]): number {
    if (classifications.length === 0) return 0;
    
    const sum = classifications.reduce((acc, c) => acc + c.confidence, 0);
    return Math.round((sum / classifications.length) * 100) / 100;
  }

  private getQualityDistribution(classifications: DocumentClassification[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    classifications.forEach(c => {
      const quality = c.metadata.quality;
      distribution[quality] = (distribution[quality] || 0) + 1;
    });

    return distribution;
  }
}

export default new DocumentClassifier();

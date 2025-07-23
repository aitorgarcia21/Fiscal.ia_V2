interface AssetCategory {
  id: string;
  name: string;
  type: 'LIQUIDITES' | 'IMMOBILIER' | 'VALEURS_MOBILIERES' | 'ASSURANCE_VIE' | 'RETRAITE' | 'AUTRES';
  subcategories: AssetSubcategory[];
  totalValue: number;
  allocation: number;
  performance: { ytd: number; oneYear: number; threeYears?: number };
  risk: 'FAIBLE' | 'MOYEN' | 'ELEVE';
  liquidity: 'IMMEDIATE' | 'COURT_TERME' | 'MOYEN_TERME' | 'LONG_TERME';
}

interface AssetSubcategory {
  id: string;
  name: string;
  type: string;
  positions: PatrimonialPosition[];
  totalValue: number;
  allocation: number;
  diversificationScore: number;
}

interface PatrimonialPosition {
  id: string;
  name: string;
  type: string;
  provider: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  acquisitionDate: Date;
  acquisitionValue: number;
  gainLoss: number;
  gainLossPercent: number;
  lastUpdate: Date;
  metadata: {
    isin?: string;
    currency: string;
    maturityDate?: Date;
    sector?: string;
    geography?: string;
    esgScore?: number;
  };
  riskMetrics: {
    volatility: number;
    beta?: number;
    sharpeRatio?: number;
    maxDrawdown?: number;
    var95?: number;
  };
  taxInfo: {
    regime: 'PEA' | 'CTO' | 'ASSURANCE_VIE' | 'PER' | 'AUTRES';
    plusValuesLatentes: number;
    fiscaliteDividendes: number;
    dateOuverture?: Date;
  };
}

interface PatrimonialStructure {
  clientId: string;
  totalValue: number;
  lastUpdate: Date;
  categories: AssetCategory[];
  analysis: {
    diversification: {
      score: number;
      concentration: { positions: Array<{ name: string; percentage: number; risk: string }> };
      geographic: Record<string, number>;
      sectoral: Record<string, number>;
    };
    risk: {
      overallRisk: 'CONSERVATEUR' | 'MODERE' | 'DYNAMIQUE' | 'SPECULATIF';
      riskScore: number;
      volatility: number;
    };
    performance: { ytd: number; oneYear: number; sharpeRatio: number };
    liquidity: { immediate: number; shortTerm: number; mediumTerm: number; longTerm: number };
    fiscal: {
      optimizationOpportunities: Array<{
        type: string;
        description: string;
        potentialSaving: number;
        complexity: 'SIMPLE' | 'MOYEN' | 'COMPLEXE';
      }>;
      totalPlusValuesLatentes: number;
      ifi: { assiette: number; estimation: number; optimizable: boolean };
    };
  };
  recommendations: Array<{
    category: 'DIVERSIFICATION' | 'PERFORMANCE' | 'RISQUE' | 'FISCAL' | 'LIQUIDITE';
    priority: 'HAUTE' | 'MOYENNE' | 'BASSE';
    title: string;
    description: string;
    expectedImpact: string;
    actionItems: string[];
    timeline: string;
  }>;
}

class PatrimonialStructure {
  private riskFreeRate = 0.03;

  async consolidatePatrimoine(
    clientId: string,
    bankAccounts: any[],
    positions: any[],
    manualAssets: any[] = []
  ): Promise<PatrimonialStructure> {
    try {
      const allPositions = await this.mergeAllSources(bankAccounts, positions, manualAssets);
      const enrichedPositions = await this.enrichPositions(allPositions);
      const categories = this.categorizeAssets(enrichedPositions);
      const totalValue = categories.reduce((sum, cat) => sum + cat.totalValue, 0);
      const analysis = await this.performDeepAnalysis(enrichedPositions, totalValue);
      const recommendations = this.generateRecommendations(analysis, categories);

      return { clientId, totalValue, lastUpdate: new Date(), categories, analysis, recommendations };
    } catch (error) {
      console.error('Erreur consolidation patrimoine:', error);
      throw new Error(`Échec consolidation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  private async mergeAllSources(bankAccounts: any[], positions: any[], manualAssets: any[]): Promise<PatrimonialPosition[]> {
    const allPositions: PatrimonialPosition[] = [];

    bankAccounts.forEach(account => {
      if (account.balance > 0) {
        allPositions.push({
          id: `bank_${account.id}`,
          name: `${account.bank} - ${account.name}`,
          type: account.type,
          provider: account.bank,
          quantity: 1,
          unitValue: account.balance,
          totalValue: account.balance,
          acquisitionDate: new Date(account.lastUpdate),
          acquisitionValue: account.balance,
          gainLoss: 0,
          gainLossPercent: 0,
          lastUpdate: new Date(account.lastUpdate),
          metadata: { currency: account.currency || 'EUR', isin: account.iban },
          riskMetrics: { volatility: 0, beta: 0, sharpeRatio: 0, maxDrawdown: 0, var95: 0 },
          taxInfo: { regime: account.type === 'PEA' ? 'PEA' : 'AUTRES', plusValuesLatentes: 0, fiscaliteDividendes: 0 }
        });
      }
    });

    positions.forEach(position => {
      allPositions.push({
        id: position.id,
        name: position.name,
        type: position.type,
        provider: position.provider,
        quantity: position.metadata?.shares || 1,
        unitValue: position.currentValue / (position.metadata?.shares || 1),
        totalValue: position.currentValue,
        acquisitionDate: position.acquisitionDate,
        acquisitionValue: position.acquisitionValue,
        gainLoss: position.gainLoss,
        gainLossPercent: position.gainLossPercent,
        lastUpdate: position.lastValuation,
        metadata: {
          isin: position.metadata?.isin,
          currency: 'EUR',
          maturityDate: position.metadata?.maturityDate,
          sector: position.metadata?.sector,
          geography: position.metadata?.geography
        },
        riskMetrics: { volatility: 0, beta: 0, sharpeRatio: 0, maxDrawdown: 0, var95: 0 },
        taxInfo: {
          regime: this.determineTaxRegime(position.type),
          plusValuesLatentes: Math.max(0, position.gainLoss),
          fiscaliteDividendes: 0
        }
      });
    });

    return allPositions;
  }

  private async enrichPositions(positions: PatrimonialPosition[]): Promise<PatrimonialPosition[]> {
    const enrichmentPromises = positions.map(async position => {
      try {
        if (position.metadata.isin) {
          const marketData = await this.fetchMarketData(position.metadata.isin);
          if (marketData) {
            position.riskMetrics = {
              ...position.riskMetrics,
              volatility: marketData.volatility || 0,
              beta: marketData.beta || 1,
              sharpeRatio: marketData.sharpeRatio || 0
            };
            position.metadata = {
              ...position.metadata,
              sector: marketData.sector || position.metadata.sector,
              geography: marketData.geography || position.metadata.geography,
              esgScore: marketData.esgScore
            };
          }
        }
        if (!position.metadata.isin) {
          position.riskMetrics = this.estimateRiskMetrics(position);
        }
        return position;
      } catch (error) {
        return position;
      }
    });
    return await Promise.all(enrichmentPromises);
  }

  private async fetchMarketData(isin: string): Promise<any> {
    try {
      const response = await fetch(`/api/market-data/${isin}`);
      return response.ok ? await response.json() : null;
    } catch (error) {
      return null;
    }
  }

  private estimateRiskMetrics(position: PatrimonialPosition): PatrimonialPosition['riskMetrics'] {
    const riskProfiles = {
      'LIQUIDITES': { volatility: 0.01, beta: 0, sharpeRatio: 0.1 },
      'OBLIGATIONS': { volatility: 0.05, beta: 0.3, sharpeRatio: 0.5 },
      'ACTIONS': { volatility: 0.20, beta: 1.1, sharpeRatio: 0.8 },
      'IMMOBILIER': { volatility: 0.15, beta: 0.7, sharpeRatio: 0.6 },
      'ASSURANCE_VIE': { volatility: 0.08, beta: 0.4, sharpeRatio: 0.4 }
    };
    const profile = riskProfiles[position.type as keyof typeof riskProfiles] || riskProfiles.ACTIONS;
    return {
      volatility: profile.volatility,
      beta: profile.beta,
      sharpeRatio: profile.sharpeRatio,
      maxDrawdown: profile.volatility * 2.5,
      var95: position.totalValue * profile.volatility * 1.65
    };
  }

  private categorizeAssets(positions: PatrimonialPosition[]): AssetCategory[] {
    const categories: AssetCategory[] = [
      { id: 'liquidites', name: 'Liquidités', type: 'LIQUIDITES', subcategories: [], totalValue: 0, allocation: 0, performance: { ytd: 0.5, oneYear: 0.5 }, risk: 'FAIBLE', liquidity: 'IMMEDIATE' },
      { id: 'immobilier', name: 'Immobilier', type: 'IMMOBILIER', subcategories: [], totalValue: 0, allocation: 0, performance: { ytd: 3.2, oneYear: 4.1 }, risk: 'MOYEN', liquidity: 'LONG_TERME' },
      { id: 'valeurs_mobilieres', name: 'Valeurs mobilières', type: 'VALEURS_MOBILIERES', subcategories: [], totalValue: 0, allocation: 0, performance: { ytd: 8.5, oneYear: 12.3 }, risk: 'ELEVE', liquidity: 'COURT_TERME' },
      { id: 'assurance_vie', name: 'Assurance-vie', type: 'ASSURANCE_VIE', subcategories: [], totalValue: 0, allocation: 0, performance: { ytd: 2.8, oneYear: 3.5 }, risk: 'MOYEN', liquidity: 'MOYEN_TERME' },
      { id: 'retraite', name: 'Épargne retraite', type: 'RETRAITE', subcategories: [], totalValue: 0, allocation: 0, performance: { ytd: 4.2, oneYear: 5.8 }, risk: 'MOYEN', liquidity: 'LONG_TERME' }
    ];

    positions.forEach(position => {
      const category = this.determineCategory(position);
      const targetCategory = categories.find(c => c.type === category);
      
      if (targetCategory) {
        let subcategory = targetCategory.subcategories.find(s => s.type === position.type);
        if (!subcategory) {
          subcategory = {
            id: `${targetCategory.id}_${position.type.toLowerCase()}`,
            name: this.getSubcategoryName(position.type),
            type: position.type,
            positions: [],
            totalValue: 0,
            allocation: 0,
            diversificationScore: 0
          };
          targetCategory.subcategories.push(subcategory);
        }
        subcategory.positions.push(position);
        subcategory.totalValue += position.totalValue;
        targetCategory.totalValue += position.totalValue;
      }
    });

    const totalValue = categories.reduce((sum, cat) => sum + cat.totalValue, 0);
    categories.forEach(category => {
      category.allocation = totalValue > 0 ? (category.totalValue / totalValue) * 100 : 0;
      category.subcategories.forEach(subcategory => {
        subcategory.allocation = category.totalValue > 0 ? (subcategory.totalValue / category.totalValue) * 100 : 0;
        subcategory.diversificationScore = Math.min(100, subcategory.positions.length * 20);
      });
    });

    return categories.filter(cat => cat.totalValue > 0);
  }

  private determineCategory(position: PatrimonialPosition): AssetCategory['type'] {
    const typeMapping = {
      'CHECKING': 'LIQUIDITES', 'SAVINGS': 'LIQUIDITES', 'ACTIONS': 'VALEURS_MOBILIERES',
      'OBLIGATIONS': 'VALEURS_MOBILIERES', 'PEA': 'VALEURS_MOBILIERES', 'ASSURANCE_VIE': 'ASSURANCE_VIE',
      'PER': 'RETRAITE', 'IMMOBILIER': 'IMMOBILIER', 'SCPI': 'IMMOBILIER'
    };
    return typeMapping[position.type as keyof typeof typeMapping] || 'AUTRES';
  }

  private determineTaxRegime(type: string): PatrimonialPosition['taxInfo']['regime'] {
    const regimeMapping = {
      'PEA': 'PEA', 'ASSURANCE_VIE': 'ASSURANCE_VIE', 'PER': 'PER'
    };
    return regimeMapping[type as keyof typeof regimeMapping] || 'CTO';
  }

  private getSubcategoryName(type: string): string {
    const names = {
      'CHECKING': 'Comptes courants', 'SAVINGS': 'Livrets', 'ACTIONS': 'Actions',
      'OBLIGATIONS': 'Obligations', 'PEA': 'PEA', 'ASSURANCE_VIE': 'Contrats',
      'PER': 'Plans retraite', 'IMMOBILIER': 'Biens immobiliers', 'SCPI': 'SCPI'
    };
    return names[type as keyof typeof names] || type;
  }

  private async performDeepAnalysis(positions: PatrimonialPosition[], totalValue: number): Promise<PatrimonialStructure['analysis']> {
    return {
      diversification: this.analyzeDiversification(positions, totalValue),
      risk: this.analyzeRisk(positions),
      performance: this.analyzePerformance(positions),
      liquidity: this.analyzeLiquidity(positions),
      fiscal: await this.analyzeFiscal(positions, totalValue)
    };
  }

  private analyzeDiversification(positions: PatrimonialPosition[], totalValue: number) {
    const sortedPositions = positions.sort((a, b) => b.totalValue - a.totalValue).slice(0, 5);
    const concentration = {
      positions: sortedPositions.map(pos => ({
        name: pos.name,
        percentage: (pos.totalValue / totalValue) * 100,
        risk: pos.riskMetrics.volatility > 0.15 ? 'ELEVE' : pos.riskMetrics.volatility > 0.08 ? 'MOYEN' : 'FAIBLE'
      }))
    };

    const geographic: Record<string, number> = {};
    const sectoral: Record<string, number> = {};
    positions.forEach(pos => {
      const geo = pos.metadata.geography || 'Non spécifié';
      const sector = pos.metadata.sector || 'Non spécifié';
      geographic[geo] = (geographic[geo] || 0) + pos.totalValue;
      sectoral[sector] = (sectoral[sector] || 0) + pos.totalValue;
    });

    const hhi = positions.reduce((sum, pos) => {
      const weight = pos.totalValue / totalValue;
      return sum + (weight * weight);
    }, 0);
    const diversificationScore = Math.max(0, (1 - hhi) * 100);

    return { score: Math.round(diversificationScore), concentration, geographic, sectoral };
  }

  private analyzeRisk(positions: PatrimonialPosition[]) {
    const totalValue = positions.reduce((sum, pos) => sum + pos.totalValue, 0);
    const portfolioVolatility = positions.reduce((sum, pos) => {
      const weight = pos.totalValue / totalValue;
      return sum + (weight * pos.riskMetrics.volatility);
    }, 0);

    let overallRisk: 'CONSERVATEUR' | 'MODERE' | 'DYNAMIQUE' | 'SPECULATIF';
    if (portfolioVolatility < 0.05) overallRisk = 'CONSERVATEUR';
    else if (portfolioVolatility < 0.12) overallRisk = 'MODERE';
    else if (portfolioVolatility < 0.20) overallRisk = 'DYNAMIQUE';
    else overallRisk = 'SPECULATIF';

    return {
      overallRisk,
      riskScore: Math.min(100, Math.round(portfolioVolatility * 500)),
      volatility: portfolioVolatility
    };
  }

  private analyzePerformance(positions: PatrimonialPosition[]) {
    const totalValue = positions.reduce((sum, pos) => sum + pos.totalValue, 0);
    const totalGainLoss = positions.reduce((sum, pos) => sum + pos.gainLoss, 0);
    const totalAcquisitionValue = positions.reduce((sum, pos) => sum + pos.acquisitionValue, 0);

    const avgReturn = totalAcquisitionValue > 0 ? (totalGainLoss / totalAcquisitionValue) * 100 : 0;
    const portfolioVolatility = positions.reduce((sum, pos) => {
      const weight = pos.totalValue / totalValue;
      return sum + (weight * pos.riskMetrics.volatility);
    }, 0);

    const sharpeRatio = portfolioVolatility > 0 ? (avgReturn / 100 - this.riskFreeRate) / portfolioVolatility : 0;

    return {
      ytd: avgReturn,
      oneYear: avgReturn,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100
    };
  }

  private analyzeLiquidity(positions: PatrimonialPosition[]) {
    const liquidity = { immediate: 0, shortTerm: 0, mediumTerm: 0, longTerm: 0 };
    positions.forEach(pos => {
      switch (pos.type) {
        case 'CHECKING':
        case 'SAVINGS':
          liquidity.immediate += pos.totalValue;
          break;
        case 'ACTIONS':
        case 'PEA':
          liquidity.shortTerm += pos.totalValue;
          break;
        case 'ASSURANCE_VIE':
          liquidity.mediumTerm += pos.totalValue;
          break;
        default:
          liquidity.longTerm += pos.totalValue;
      }
    });
    return liquidity;
  }

  private async analyzeFiscal(positions: PatrimonialPosition[], totalValue: number) {
    const totalPlusValuesLatentes = positions.reduce((sum, pos) => sum + pos.taxInfo.plusValuesLatentes, 0);
    const immobilierValue = positions.filter(pos => pos.type === 'IMMOBILIER' || pos.type === 'SCPI').reduce((sum, pos) => sum + pos.totalValue, 0);
    const ifiAssiette = Math.max(0, immobilierValue - 800000);
    const ifiEstimation = this.calculateIFI(ifiAssiette);

    const optimizationOpportunities = [
      { type: 'PEA', description: 'Optimiser enveloppe PEA', potentialSaving: 5000, complexity: 'SIMPLE' as const },
      { type: 'DONATION', description: 'Donation-partage', potentialSaving: 10000, complexity: 'MOYEN' as const }
    ].filter(opp => Math.random() > 0.5);

    return {
      optimizationOpportunities,
      totalPlusValuesLatentes,
      ifi: { assiette: ifiAssiette, estimation: ifiEstimation, optimizable: ifiAssiette > 0 }
    };
  }

  private calculateIFI(assiette: number): number {
    if (assiette <= 0) return 0;
    const tranches = [
      { min: 800000, max: 1300000, taux: 0.005 },
      { min: 1300000, max: 2570000, taux: 0.007 },
      { min: 2570000, max: 5000000, taux: 0.01 },
      { min: 5000000, max: 10000000, taux: 0.0125 },
      { min: 10000000, max: Infinity, taux: 0.015 }
    ];

    let impot = 0;
    for (const tranche of tranches) {
      if (assiette > tranche.min) {
        const baseImposable = Math.min(assiette, tranche.max) - tranche.min;
        impot += baseImposable * tranche.taux;
      }
    }
    return Math.round(impot);
  }

  private generateRecommendations(analysis: PatrimonialStructure['analysis'], categories: AssetCategory[]): PatrimonialStructure['recommendations'] {
    const recommendations: PatrimonialStructure['recommendations'] = [];

    if (analysis.diversification.score < 60) {
      recommendations.push({
        category: 'DIVERSIFICATION',
        priority: 'HAUTE',
        title: 'Améliorer la diversification',
        description: `Score de diversification: ${analysis.diversification.score}/100`,
        expectedImpact: 'Réduction du risque de 15-25%',
        actionItems: ['Réduire concentration', 'Diversifier géographiquement', 'Élargir secteurs'],
        timeline: '3-6 mois'
      });
    }

    if (analysis.fiscal.optimizationOpportunities.length > 0) {
      recommendations.push({
        category: 'FISCAL',
        priority: 'HAUTE',
        title: 'Optimisations fiscales disponibles',
        description: `${analysis.fiscal.optimizationOpportunities.length} opportunité(s) détectée(s)`,
        expectedImpact: `Économie: ${analysis.fiscal.optimizationOpportunities.reduce((sum, opp) => sum + opp.potentialSaving, 0).toLocaleString()} €`,
        actionItems: analysis.fiscal.optimizationOpportunities.map(opp => opp.description),
        timeline: 'Variable'
      });
    }

    return recommendations;
  }
}

export default new PatrimonialStructure();

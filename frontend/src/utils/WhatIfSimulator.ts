interface TaxScenario {
  id: string;
  name: string;
  description: string;
  parameters: {
    // Revenus
    revenus: {
      salaires: number;
      bnc: number;
      bic: number;
      foncier: number;
      capitauxMobiliers: number;
      plusValues: number;
    };
    
    // Situation familiale
    situation: {
      statut: 'celibataire' | 'marie' | 'pacs' | 'divorce' | 'veuf';
      nombreParts: number;
      enfantsACharge: number;
      personnesACharge: number;
    };
    
    // Patrimoine
    patrimoine: {
      immobilier: number;
      mobilier: number;
      professionnels: number;
      dettes: number;
    };
    
    // Investissements/Optimisations
    optimisations: {
      pinel: { montant: number; duree: 6 | 9 | 12; zone: 'A' | 'Abis' | 'B1' | 'B2' };
      malraux: { montant: number; secteurSauvegarde: boolean };
      girardin: { montant: number; type: 'industriel' | 'logement' };
      per: { versements: number };
      sofica: { montant: number };
      fcpi: { montant: number };
      denormandie: { montant: number; travaux: number };
      monumentsHistoriques: { deficits: number };
      lmnp: { recettes: number; amortissements: number };
    };
    
    // Donations/Successions
    transmissions: {
      donations: Array<{
        montant: number;
        beneficiaire: 'enfant' | 'petit_enfant' | 'conjoint' | 'tiers';
        type: 'argent' | 'immobilier' | 'titres';
        demembrement: boolean;
      }>;
    };
  };
}

interface TaxCalculationResult {
  scenarioId: string;
  calculations: {
    // Impôt sur le Revenu
    ir: {
      revenuImposable: number;
      revenuNet: number;
      quotientFamilial: number;
      impotBrut: number;
      reductions: {
        pinel: number;
        malraux: number;
        girardin: number;
        sofica: number;
        fcpi: number;
        denormandie: number;
        total: number;
      };
      credits: {
        emploiDomicile: number;
        garde: number;
        total: number;
      };
      impotNet: number;
      prelevement: number;
      taux: number;
    };
    
    // IFI (Impôt sur la Fortune Immobilière)
    ifi: {
      assiette: number;
      abattements: {
        residencePrincipale: number;
        dettes: number;
        total: number;
      };
      baseImposable: number;
      impot: number;
      plafonnement: number;
      impotDefinitif: number;
    };
    
    // Prélèvements sociaux
    prelevements: {
      revenus: number;
      plusValues: number;
      total: number;
    };
    
    // Droits de succession/donation
    transmissions: {
      droits: number;
      abattements: number;
      montantTaxable: number;
    };
  };
  
  // Analyse comparative
  analysis: {
    economieVsBase: number;
    optimisationRate: number;
    efficaciteMarginal: number;
    recommendations: string[];
    warnings: string[];
  };
}

interface SimulationComparison {
  baseScenario: TaxCalculationResult;
  alternativeScenarios: TaxCalculationResult[];
  bestScenario: {
    scenarioId: string;
    totalEconomy: number;
    optimizations: string[];
  };
  summary: {
    totalSavings: number;
    percentageGain: number;
    implementationComplexity: 'SIMPLE' | 'MOYEN' | 'COMPLEXE';
    timeline: string;
    requiredActions: string[];
  };
}

class WhatIfSimulator {
  private currentYear = 2024;
  private taxBrackets2024 = [
    { min: 0, max: 11497, rate: 0 },
    { min: 11497, max: 29315, rate: 0.11 },
    { min: 29315, max: 83823, rate: 0.30 },
    { min: 83823, max: 180294, rate: 0.41 },
    { min: 180294, max: Infinity, rate: 0.45 }
  ];

  private ifiBrackets2024 = [
    { min: 800000, max: 1300000, rate: 0.005 },
    { min: 1300000, max: 2570000, rate: 0.007 },
    { min: 2570000, max: 5000000, rate: 0.01 },
    { min: 5000000, max: 10000000, rate: 0.0125 },
    { min: 10000000, max: Infinity, rate: 0.015 }
  ];

  // Simulation principale multi-scénarios
  async runSimulation(scenarios: TaxScenario[]): Promise<SimulationComparison> {
    try {
      // Calcul parallèle de tous les scénarios
      const calculationPromises = scenarios.map(scenario => 
        this.calculateScenario(scenario)
      );
      
      const results = await Promise.all(calculationPromises);
      
      // Identification du scénario de base et des alternatives
      const baseScenario = results[0]; // Premier scénario = référence
      const alternativeScenarios = results.slice(1);
      
      // Détermination du meilleur scénario
      const bestScenario = this.findBestScenario(results, baseScenario);
      
      // Génération du résumé
      const summary = this.generateSummary(baseScenario, alternativeScenarios, bestScenario);

      return {
        baseScenario,
        alternativeScenarios,
        bestScenario,
        summary
      };

    } catch (error) {
      console.error('Erreur simulation fiscale:', error);
      throw new Error(`Échec simulation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // Calcul d'un scénario individuel
  private async calculateScenario(scenario: TaxScenario): Promise<TaxCalculationResult> {
    const { parameters } = scenario;
    
    // Calcul IR
    const ir = this.calculateIR(parameters);
    
    // Calcul IFI
    const ifi = this.calculateIFI(parameters);
    
    // Calcul prélèvements sociaux
    const prelevements = this.calculatePrelevements(parameters);
    
    // Calcul droits de transmission
    const transmissions = this.calculateTransmissions(parameters);
    
    // Analyse comparative (sera complétée avec scénario de base)
    const analysis = this.analyzeScenario(scenario, {
      totalTax: ir.impotNet + ifi.impotDefinitif + prelevements.total,
      totalOptimizations: ir.reductions.total
    });

    return {
      scenarioId: scenario.id,
      calculations: {
        ir,
        ifi,
        prelevements,
        transmissions
      },
      analysis
    };
  }

  // Calcul Impôt sur le Revenu
  private calculateIR(params: TaxScenario['parameters']) {
    // Calcul du revenu imposable
    const revenuBrut = params.revenus.salaires + params.revenus.bnc + 
                       params.revenus.bic + params.revenus.foncier + 
                       params.revenus.capitauxMobiliers;
    
    // Abattements standards
    const abattementSalaire = Math.min(params.revenus.salaires * 0.1, 13522);
    const revenuNet = revenuBrut - abattementSalaire;
    
    // Déductions PER
    const deductionPER = Math.min(params.optimisations.per.versements, 
                                  Math.min(revenuNet * 0.1, 35194));
    
    const revenuImposable = Math.max(0, revenuNet - deductionPER);
    
    // Calcul quotient familial
    const quotientFamilial = revenuImposable / params.situation.nombreParts;
    
    // Calcul impôt brut par part
    let impotParPart = 0;
    for (const bracket of this.taxBrackets2024) {
      if (quotientFamilial > bracket.min) {
        const baseImposable = Math.min(quotientFamilial, bracket.max) - bracket.min;
        impotParPart += baseImposable * bracket.rate;
      }
    }
    
    const impotBrut = impotParPart * params.situation.nombreParts;
    
    // Calcul des réductions d'impôt
    const reductions = this.calculateReductions(params, revenuImposable);
    
    // Calcul des crédits d'impôt
    const credits = this.calculateCredits(params);
    
    // Impôt net
    const impotNet = Math.max(0, impotBrut - reductions.total - credits.total);
    
    // Prélèvement à la source
    const prelevement = impotNet * 0.9; // Approximation
    
    return {
      revenuImposable,
      revenuNet,
      quotientFamilial,
      impotBrut,
      reductions,
      credits,
      impotNet,
      prelevement,
      taux: revenuImposable > 0 ? (impotNet / revenuImposable) * 100 : 0
    };
  }

  // Calcul des réductions d'impôt
  private calculateReductions(params: TaxScenario['parameters'], revenuImposable: number) {
    const reductions = {
      pinel: 0,
      malraux: 0,
      girardin: 0,
      sofica: 0,
      fcpi: 0,
      denormandie: 0,
      total: 0
    };

    // Pinel
    if (params.optimisations.pinel.montant > 0) {
      const tauxPinel = params.optimisations.pinel.duree === 6 ? 0.12 : 
                        params.optimisations.pinel.duree === 9 ? 0.18 : 0.21;
      reductions.pinel = Math.min(
        params.optimisations.pinel.montant * tauxPinel,
        revenuImposable * 0.1, // Plafond 10% du revenu
        300000 * tauxPinel // Plafond investissement
      );
    }

    // Malraux
    if (params.optimisations.malraux.montant > 0) {
      const tauxMalraux = params.optimisations.malraux.secteurSauvegarde ? 0.30 : 0.22;
      reductions.malraux = Math.min(
        params.optimisations.malraux.montant * tauxMalraux,
        120000 * tauxMalraux // Plafond annuel
      );
    }

    // Girardin Industriel
    if (params.optimisations.girardin.montant > 0) {
      const tauxGirardin = params.optimisations.girardin.type === 'industriel' ? 1.10 : 0.95;
      reductions.girardin = Math.min(
        params.optimisations.girardin.montant * tauxGirardin,
        revenuImposable * 0.4 // Plafond 40% du revenu
      );
    }

    // SOFICA
    if (params.optimisations.sofica.montant > 0) {
      reductions.sofica = Math.min(
        params.optimisations.sofica.montant * 0.36,
        25000 * 0.36 // Plafond 25k€
      );
    }

    // FCPI
    if (params.optimisations.fcpi.montant > 0) {
      reductions.fcpi = Math.min(
        params.optimisations.fcpi.montant * 0.18,
        24000 * 0.18 // Plafond 24k€
      );
    }

    // Denormandie
    if (params.optimisations.denormandie.montant > 0) {
      const tauxDenormandie = 0.12; // 6 ans minimum
      reductions.denormandie = Math.min(
        params.optimisations.denormandie.montant * tauxDenormandie,
        300000 * tauxDenormandie
      );
    }

    reductions.total = Object.values(reductions).reduce((sum, val) => sum + val, 0) - reductions.total;

    return reductions;
  }

  // Calcul des crédits d'impôt
  private calculateCredits(params: TaxScenario['parameters']) {
    const credits = {
      emploiDomicile: 0,
      garde: 0,
      total: 0
    };

    // Approximations basées sur la situation familiale
    if (params.situation.enfantsACharge > 0) {
      credits.garde = Math.min(2300 * params.situation.enfantsACharge, 11500);
    }

    credits.total = credits.emploiDomicile + credits.garde;

    return credits;
  }

  // Calcul IFI
  private calculateIFI(params: TaxScenario['parameters']) {
    const patrimoineImmobilier = params.patrimoine.immobilier;
    
    // Abattements
    const abattements = {
      residencePrincipale: Math.min(patrimoineImmobilier * 0.3, 200000),
      dettes: Math.min(params.patrimoine.dettes, patrimoineImmobilier * 0.5),
      total: 0
    };
    abattements.total = abattements.residencePrincipale + abattements.dettes;
    
    const assiette = Math.max(0, patrimoineImmobilier - abattements.total);
    const baseImposable = Math.max(0, assiette - 800000); // Seuil IFI
    
    // Calcul impôt
    let impot = 0;
    for (const bracket of this.ifiBrackets2024) {
      if (assiette > bracket.min) {
        const baseImposable = Math.min(assiette, bracket.max) - bracket.min;
        impot += baseImposable * bracket.rate;
      }
    }
    
    // Plafonnement à 75% des revenus
    const revenus = Object.values(params.revenus).reduce((sum, val) => sum + val, 0);
    const plafonnement = Math.max(0, impot - revenus * 0.75);
    const impotDefinitif = impot - plafonnement;

    return {
      assiette,
      abattements,
      baseImposable,
      impot,
      plafonnement,
      impotDefinitif
    };
  }

  // Calcul prélèvements sociaux
  private calculatePrelevements(params: TaxScenario['parameters']) {
    const tauxPrelevements = 0.172; // 17,2%
    
    const revenus = (params.revenus.capitauxMobiliers + params.revenus.foncier) * tauxPrelevements;
    const plusValues = params.revenus.plusValues * tauxPrelevements;
    
    return {
      revenus,
      plusValues,
      total: revenus + plusValues
    };
  }

  // Calcul droits de transmission
  private calculateTransmissions(params: TaxScenario['parameters']) {
    let droitsTotal = 0;
    let abattementsTotal = 0;
    let montantTaxable = 0;

    params.transmissions.donations.forEach(donation => {
      // Abattements selon le lien de parenté
      let abattement = 0;
      switch (donation.beneficiaire) {
        case 'enfant': abattement = 100000; break;
        case 'petit_enfant': abattement = 31865; break;
        case 'conjoint': abattement = 80724; break;
        case 'tiers': abattement = 1594; break;
      }
      
      const montantTaxableDonation = Math.max(0, donation.montant - abattement);
      montantTaxable += montantTaxableDonation;
      abattementsTotal += Math.min(donation.montant, abattement);
      
      // Calcul droits (barème progressif simplifié)
      if (montantTaxableDonation > 0) {
        let droits = 0;
        if (montantTaxableDonation <= 8072) droits = montantTaxableDonation * 0.05;
        else if (montantTaxableDonation <= 12109) droits = 403 + (montantTaxableDonation - 8072) * 0.10;
        else if (montantTaxableDonation <= 15932) droits = 807 + (montantTaxableDonation - 12109) * 0.15;
        else droits = montantTaxableDonation * 0.20; // Approximation pour les montants élevés
        
        droitsTotal += droits;
      }
    });

    return {
      droits: droitsTotal,
      abattements: abattementsTotal,
      montantTaxable
    };
  }

  // Analyse d'un scénario
  private analyzeScenario(scenario: TaxScenario, totals: { totalTax: number; totalOptimizations: number }) {
    const recommendations: string[] = [];
    const warnings: string[] = [];

    // Recommandations basées sur les optimisations
    if (scenario.parameters.optimisations.pinel.montant === 0 && totals.totalTax > 5000) {
      recommendations.push("Considérer un investissement Pinel pour réduire l'IR");
    }

    if (scenario.parameters.optimisations.per.versements < scenario.parameters.revenus.salaires * 0.08) {
      recommendations.push("Augmenter les versements PER pour optimiser la déduction");
    }

    // Warnings
    if (scenario.parameters.patrimoine.immobilier > 1300000 && scenario.parameters.optimisations.per.versements === 0) {
      warnings.push("Patrimoine IFI élevé sans optimisation PER");
    }

    return {
      economieVsBase: 0, // Sera calculé lors de la comparaison
      optimisationRate: totals.totalOptimizations > 0 ? (totals.totalOptimizations / totals.totalTax) * 100 : 0,
      efficaciteMarginal: 0, // Sera calculé
      recommendations,
      warnings
    };
  }

  // Recherche du meilleur scénario
  private findBestScenario(results: TaxCalculationResult[], baseScenario: TaxCalculationResult) {
    let bestScenario = results[0];
    let maxEconomy = 0;

    results.forEach(result => {
      const baseTotalTax = baseScenario.calculations.ir.impotNet + 
                          baseScenario.calculations.ifi.impotDefinitif + 
                          baseScenario.calculations.prelevements.total;
      
      const scenarioTotalTax = result.calculations.ir.impotNet + 
                              result.calculations.ifi.impotDefinitif + 
                              result.calculations.prelevements.total;
      
      const economy = baseTotalTax - scenarioTotalTax;
      
      if (economy > maxEconomy) {
        maxEconomy = economy;
        bestScenario = result;
      }
    });

    // Identification des optimisations du meilleur scénario
    const optimizations: string[] = [];
    const bestReductions = bestScenario.calculations.ir.reductions;
    
    if (bestReductions.pinel > 0) optimizations.push(`Pinel: -${bestReductions.pinel.toLocaleString()}€`);
    if (bestReductions.malraux > 0) optimizations.push(`Malraux: -${bestReductions.malraux.toLocaleString()}€`);
    if (bestReductions.girardin > 0) optimizations.push(`Girardin: -${bestReductions.girardin.toLocaleString()}€`);

    return {
      scenarioId: bestScenario.scenarioId,
      totalEconomy: maxEconomy,
      optimizations
    };
  }

  // Génération du résumé
  private generateSummary(
    baseScenario: TaxCalculationResult,
    alternativeScenarios: TaxCalculationResult[],
    bestScenario: { scenarioId: string; totalEconomy: number; optimizations: string[] }
  ) {
    const baseTotalTax = baseScenario.calculations.ir.impotNet + 
                        baseScenario.calculations.ifi.impotDefinitif + 
                        baseScenario.calculations.prelevements.total;

    const percentageGain = baseTotalTax > 0 ? (bestScenario.totalEconomy / baseTotalTax) * 100 : 0;

    // Détermination de la complexité
    let implementationComplexity: 'SIMPLE' | 'MOYEN' | 'COMPLEXE' = 'SIMPLE';
    if (bestScenario.optimizations.length > 2) implementationComplexity = 'MOYEN';
    if (bestScenario.optimizations.some(opt => opt.includes('Girardin') || opt.includes('Malraux'))) {
      implementationComplexity = 'COMPLEXE';
    }

    // Timeline
    let timeline = '3-6 mois';
    if (implementationComplexity === 'COMPLEXE') timeline = '6-12 mois';
    if (implementationComplexity === 'SIMPLE') timeline = '1-3 mois';

    // Actions requises
    const requiredActions = [
      'Validation avec conseiller fiscal',
      'Préparation des documents',
      'Mise en place des investissements'
    ];

    if (implementationComplexity === 'COMPLEXE') {
      requiredActions.push('Étude juridique approfondie', 'Coordination avec notaire');
    }

    return {
      totalSavings: bestScenario.totalEconomy,
      percentageGain,
      implementationComplexity,
      timeline,
      requiredActions
    };
  }

  // Simulation rapide pour comparaison instantanée
  async quickCompare(baseParams: TaxScenario['parameters'], optimizations: Partial<TaxScenario['parameters']['optimisations']>): Promise<{
    baseResult: number;
    optimizedResult: number;
    savings: number;
    recommendations: string[];
  }> {
    // Scénario de base
    const baseScenario: TaxScenario = {
      id: 'base',
      name: 'Situation actuelle',
      description: 'Sans optimisation',
      parameters: baseParams
    };

    // Scénario optimisé
    const optimizedScenario: TaxScenario = {
      id: 'optimized',
      name: 'Situation optimisée',
      description: 'Avec optimisations',
      parameters: {
        ...baseParams,
        optimisations: {
          ...baseParams.optimisations,
          ...optimizations
        }
      }
    };

    const results = await this.runSimulation([baseScenario, optimizedScenario]);
    
    const baseTotal = results.baseScenario.calculations.ir.impotNet + 
                     results.baseScenario.calculations.ifi.impotDefinitif;
    const optimizedTotal = results.alternativeScenarios[0].calculations.ir.impotNet + 
                           results.alternativeScenarios[0].calculations.ifi.impotDefinitif;

    return {
      baseResult: baseTotal,
      optimizedResult: optimizedTotal,
      savings: baseTotal - optimizedTotal,
      recommendations: results.alternativeScenarios[0].analysis.recommendations
    };
  }

  // Génération de scénarios automatiques
  generateAutomaticScenarios(clientProfile: any): TaxScenario[] {
    const scenarios: TaxScenario[] = [];
    
    // Scénario de base
    scenarios.push({
      id: 'base',
      name: 'Situation actuelle',
      description: 'Situation fiscale actuelle sans optimisation',
      parameters: this.profileToParameters(clientProfile)
    });

    // Scénario Pinel optimisé
    if (clientProfile.revenus.salaires > 50000) {
      const pinelParams = { ...this.profileToParameters(clientProfile) };
      pinelParams.optimisations.pinel = {
        montant: Math.min(300000, clientProfile.revenus.salaires * 2),
        duree: 9,
        zone: 'B1'
      };
      
      scenarios.push({
        id: 'pinel',
        name: 'Optimisation Pinel',
        description: 'Investissement locatif Pinel 9 ans',
        parameters: pinelParams
      });
    }

    // Scénario PER maximisé
    const perParams = { ...this.profileToParameters(clientProfile) };
    perParams.optimisations.per = {
      versements: Math.min(clientProfile.revenus.salaires * 0.1, 35194)
    };
    
    scenarios.push({
      id: 'per',
      name: 'PER optimisé',
      description: 'Maximisation des versements PER',
      parameters: perParams
    });

    return scenarios;
  }

  // Conversion profil client vers paramètres de simulation
  private profileToParameters(profile: any): TaxScenario['parameters'] {
    return {
      revenus: {
        salaires: profile.revenus?.salaires || 0,
        bnc: profile.revenus?.bnc || 0,
        bic: profile.revenus?.bic || 0,
        foncier: profile.revenus?.foncier || 0,
        capitauxMobiliers: profile.revenus?.capitauxMobiliers || 0,
        plusValues: profile.revenus?.plusValues || 0
      },
      situation: {
        statut: profile.situation?.statut || 'celibataire',
        nombreParts: profile.situation?.nombreParts || 1,
        enfantsACharge: profile.situation?.enfantsACharge || 0,
        personnesACharge: profile.situation?.personnesACharge || 0
      },
      patrimoine: {
        immobilier: profile.patrimoine?.immobilier || 0,
        mobilier: profile.patrimoine?.mobilier || 0,
        professionnels: profile.patrimoine?.professionnels || 0,
        dettes: profile.patrimoine?.dettes || 0
      },
      optimisations: {
        pinel: { montant: 0, duree: 9, zone: 'B1' },
        malraux: { montant: 0, secteurSauvegarde: false },
        girardin: { montant: 0, type: 'industriel' },
        per: { versements: 0 },
        sofica: { montant: 0 },
        fcpi: { montant: 0 },
        denormandie: { montant: 0, travaux: 0 },
        monumentsHistoriques: { deficits: 0 },
        lmnp: { recettes: 0, amortissements: 0 }
      },
      transmissions: {
        donations: []
      }
    };
  }
}

export default new WhatIfSimulator();

interface SuccessionProfile {
  client: {
    age: number;
    situationMatrimoniale: 'celibataire' | 'marie' | 'pacs' | 'divorce' | 'veuf';
    enfants: Array<{ age: number; situationFamiliale: string; patrimoinePropre: number; revenus: number; }>;
    
    patrimoine: {
      immobilier: {
        residencePrincipale: { valeur: number; dettes: number };
        immobilierLocatif: Array<{ valeur: number; revenus: number; dettes: number; zone: string; }>;
        immobilierProfessionnel: { valeur: number; dettes: number };
      };
      
      mobilier: {
        liquidites: number;
        assuranceVie: Array<{ valeur: number; antecedence: number; beneficiaires: string[]; clause: string; }>;
        titres: { actions: number; obligations: number; fcp: number; scpi: number; };
        artEtAntiquite: number;
      };
      
      professionnel: {
        partsEntreprise: { valeur: number; pourcentage: number };
        droitsAuteur: number;
        brevets: number;
      };
      
      dettes: { immobilier: number; consommation: number; professionnelles: number; };
    };
    
    revenus: { salaires: number; foncier: number; dividendes: number; pensions: number; autresRevenus: number; };
    charges: { trainVie: number; fiscalite: number; interets: number; };
  };
  
  objectifs: {
    preservationPatrimoine: number;
    egaliteEnfants: boolean;
    optimisationFiscale: boolean;
    liquiditeHeritiers: boolean;
    donationsVivant: boolean;
    continuiteFamiliale: boolean;
  };
}

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  priority: 'FAIBLE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  
  actions: Array<{
    type: 'donation' | 'assuranceVie' | 'demembrement' | 'societe' | 'trust' | 'pacte';
    description: string;
    montant: number;
    delai: string;
    fiscalite: { economieImpots: number; coutMiseEnPlace: number; economieNette: number; };
    complexite: 'SIMPLE' | 'MOYEN' | 'COMPLEXE';
    risques: string[];
  }>;
  
  impact: {
    droitsSuccession: { avant: number; apres: number; economie: number; };
    patrimoineTransmis: { avant: number; apres: number; augmentation: number; };
    liquiditesHeritiers: number;
    delaiOptimalisation: string;
  };
  
  faisabilite: {
    juridique: boolean;
    fiscale: boolean;
    familiale: boolean;
    contraintes: string[];
    recommandations: string[];
  };
}

interface SuccessionSimulation {
  strategies: OptimizationStrategy[];
  bestStrategy: OptimizationStrategy;
  
  comparison: {
    situationActuelle: { patrimoineNet: number; droitsSuccession: number; patrimoineTransmis: number; tauxTransmission: number; };
    avecOptimisation: { patrimoineNet: number; droitsSuccession: number; patrimoineTransmis: number; tauxTransmission: number; };
    benefices: { economieAbsolue: number; economieRelative: number; augmentationTransmission: number; roiOptimisation: number; };
  };
  
  timeline: Array<{ periode: string; actions: string[]; montants: number; beneficesCumules: number; }>;
  
  recommendations: {
    immediate: string[];
    courtTerme: string[];
    moyenTerme: string[];
    longTerme: string[];
  };
}

class SuccessionOptimizer {
  
  private successionBrackets = [
    { min: 0, max: 8072, rate: 0.05 },
    { min: 8072, max: 12109, rate: 0.10 },
    { min: 12109, max: 15932, rate: 0.15 },
    { min: 15932, max: 552324, rate: 0.20 },
    { min: 552324, max: 902838, rate: 0.30 },
    { min: 902838, max: 1805677, rate: 0.40 },
    { min: 1805677, max: Infinity, rate: 0.45 }
  ];

  private abattements = {
    enfant: 100000,
    petitEnfant: 31865,
    conjoint: 80724,
    frere: 15932,
    neveu: 7967,
    autre: 1594
  };

  async optimizeSuccession(profile: SuccessionProfile): Promise<SuccessionSimulation> {
    try {
      console.log('🎯 DÉBUT OPTIMISATION SUCCESSION:', profile.client.age, 'ans');

      const situationActuelle = this.calculateCurrentSituation(profile);
      const strategies = await this.generateStrategies(profile);
      const bestStrategy = this.selectBestStrategy(strategies);
      const avecOptimisation = this.simulateWithOptimization(profile, bestStrategy);
      const comparison = this.compareResults(situationActuelle, avecOptimisation);
      const timeline = this.generateTimeline(bestStrategy);
      const recommendations = this.generateRecommendations(profile, bestStrategy);

      return {
        strategies,
        bestStrategy,
        comparison,
        timeline,
        recommendations
      };

    } catch (error) {
      console.error('❌ Erreur optimisation succession:', error);
      throw new Error(`Échec optimisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  private calculateCurrentSituation(profile: SuccessionProfile) {
    const patrimoine = this.calculateNetPatrimoine(profile);
    const droitsSuccession = this.calculateSuccessionTax(patrimoine, profile.client.enfants.length);
    const patrimoineTransmis = patrimoine - droitsSuccession;
    const tauxTransmission = patrimoine > 0 ? (patrimoineTransmis / patrimoine) * 100 : 0;

    console.log(`📊 Situation actuelle: ${patrimoine.toLocaleString()}€ patrimoine → ${patrimoineTransmis.toLocaleString()}€ transmis (${tauxTransmission.toFixed(1)}%)`);

    return { patrimoineNet: patrimoine, droitsSuccession, patrimoineTransmis, tauxTransmission };
  }

  private calculateNetPatrimoine(profile: SuccessionProfile): number {
    const { patrimoine } = profile.client;
    
    let total = 0;
    total += patrimoine.immobilier.residencePrincipale.valeur;
    total += patrimoine.immobilier.immobilierLocatif.reduce((sum, bien) => sum + bien.valeur, 0);
    total += patrimoine.immobilier.immobilierProfessionnel.valeur;
    total += patrimoine.mobilier.liquidites;
    total += patrimoine.mobilier.assuranceVie.reduce((sum, av) => sum + av.valeur, 0);
    total += patrimoine.mobilier.titres.actions + patrimoine.mobilier.titres.obligations + patrimoine.mobilier.titres.fcp + patrimoine.mobilier.titres.scpi;
    total += patrimoine.mobilier.artEtAntiquite;
    total += patrimoine.professionnel.partsEntreprise.valeur + patrimoine.professionnel.droitsAuteur + patrimoine.professionnel.brevets;
    total -= patrimoine.dettes.immobilier + patrimoine.dettes.consommation + patrimoine.dettes.professionnelles;
    
    return Math.max(0, total);
  }

  private calculateSuccessionTax(patrimoine: number, nombreEnfants: number): number {
    if (nombreEnfants === 0) return 0;
    
    const partParEnfant = patrimoine / nombreEnfants;
    const montantTaxableParEnfant = Math.max(0, partParEnfant - this.abattements.enfant);
    
    let impotParEnfant = 0;
    for (const bracket of this.successionBrackets) {
      if (montantTaxableParEnfant > bracket.min) {
        const baseImposable = Math.min(montantTaxableParEnfant, bracket.max) - bracket.min;
        impotParEnfant += baseImposable * bracket.rate;
      }
    }
    
    return impotParEnfant * nombreEnfants;
  }

  private async generateStrategies(profile: SuccessionProfile): Promise<OptimizationStrategy[]> {
    const strategies: OptimizationStrategy[] = [];
    
    if (profile.objectifs.donationsVivant) {
      strategies.push(await this.createDonationStrategy(profile));
    }
    
    strategies.push(await this.createAssuranceVieStrategy(profile));
    
    if (profile.client.patrimoine.immobilier.immobilierLocatif.length > 0) {
      strategies.push(await this.createDemembermentStrategy(profile));
    }
    
    if (profile.client.patrimoine.immobilier.immobilierLocatif.length > 1) {
      strategies.push(await this.createSocieteCivileStrategy(profile));
    }
    
    if (profile.client.patrimoine.professionnel.partsEntreprise.valeur > 0) {
      strategies.push(await this.createPacteDutreilStrategy(profile));
    }

    strategies.push(await this.createMixStrategy(profile));
    
    return strategies.filter(s => s.faisabilite.juridique && s.faisabilite.fiscale);
  }

  private async createDonationStrategy(profile: SuccessionProfile): Promise<OptimizationStrategy> {
    const montantDonationAnnuelle = Math.min(
      this.abattements.enfant / 15,
      profile.client.revenus.salaires * 0.1,
      200000
    );
    
    const nombreEnfants = profile.client.enfants.length;
    const donationTotaleAnnuelle = montantDonationAnnuelle * nombreEnfants;
    const economieAnnuelle = this.calculateDonationTaxSaving(montantDonationAnnuelle, nombreEnfants);
    
    return {
      id: 'donations-regulieres',
      name: 'Donations régulières',
      description: 'Donations annuelles optimisées dans la limite des abattements',
      priority: 'HAUTE',
      actions: [{
        type: 'donation',
        description: `Donation annuelle de ${montantDonationAnnuelle.toLocaleString()}€ par enfant`,
        montant: donationTotaleAnnuelle,
        delai: 'Immédiat, puis annuel',
        fiscalite: {
          economieImpots: economieAnnuelle * 10,
          coutMiseEnPlace: 2000,
          economieNette: (economieAnnuelle * 10) - 2000
        },
        complexite: 'SIMPLE',
        risques: ['Réduction liquidités du donateur', 'Risque ingratitude']
      }],
      impact: {
        droitsSuccession: {
          avant: this.calculateSuccessionTax(this.calculateNetPatrimoine(profile), nombreEnfants),
          apres: this.calculateSuccessionTax(this.calculateNetPatrimoine(profile) - (donationTotaleAnnuelle * 10), nombreEnfants),
          economie: economieAnnuelle * 10
        },
        patrimoineTransmis: {
          avant: this.calculateNetPatrimoine(profile),
          apres: this.calculateNetPatrimoine(profile) + (economieAnnuelle * 10),
          augmentation: economieAnnuelle * 10
        },
        liquiditesHeritiers: donationTotaleAnnuelle * 10,
        delaiOptimalisation: '10-15 ans'
      },
      faisabilite: {
        juridique: true,
        fiscale: true,
        familiale: profile.objectifs.egaliteEnfants,
        contraintes: ['Liquidités suffisantes du donateur'],
        recommandations: ['Étaler sur 15 ans pour optimiser les abattements']
      }
    };
  }

  private async createAssuranceVieStrategy(profile: SuccessionProfile): Promise<OptimizationStrategy> {
    const versementOptimal = Math.min(profile.client.revenus.salaires * 0.15, 150000);
    const economie = profile.client.age < 70 ? versementOptimal * 0.20 : Math.min(versementOptimal, 30500) * 0.20;
    
    return {
      id: 'assurance-vie',
      name: 'Optimisation Assurance-Vie',
      description: 'Versements assurance-vie pour optimiser la transmission',
      priority: 'MOYENNE',
      actions: [{
        type: 'assuranceVie',
        description: `Versement assurance-vie de ${versementOptimal.toLocaleString()}€`,
        montant: versementOptimal,
        delai: 'Immédiat',
        fiscalite: {
          economieImpots: economie,
          coutMiseEnPlace: versementOptimal * 0.01,
          economieNette: economie - (versementOptimal * 0.01)
        },
        complexite: 'SIMPLE',
        risques: ['Risque de performance', 'Blocage des fonds']
      }],
      impact: {
        droitsSuccession: {
          avant: this.calculateSuccessionTax(this.calculateNetPatrimoine(profile), profile.client.enfants.length),
          apres: this.calculateSuccessionTax(this.calculateNetPatrimoine(profile) - versementOptimal, profile.client.enfants.length),
          economie
        },
        patrimoineTransmis: {
          avant: this.calculateNetPatrimoine(profile),
          apres: this.calculateNetPatrimoine(profile) + economie,
          augmentation: economie
        },
        liquiditesHeritiers: 0,
        delaiOptimalisation: 'Immédiat'
      },
      faisabilite: {
        juridique: true,
        fiscale: true,
        familiale: true,
        contraintes: ['Liquidités disponibles'],
        recommandations: ['Privilégier versements avant 70 ans', 'Diversifier les bénéficiaires']
      }
    };
  }

  private async createMixStrategy(profile: SuccessionProfile): Promise<OptimizationStrategy> {
    const actions = [];
    let economieTotal = 0;
    let coutTotal = 0;

    if (profile.client.patrimoine.mobilier.liquidites > 200000) {
      const montantDonation = 50000 * profile.client.enfants.length;
      const economieDonation = this.calculateDonationTaxSaving(50000, profile.client.enfants.length);
      actions.push({
        type: 'donation' as const,
        description: `Donations immédiates ${montantDonation.toLocaleString()}€`,
        montant: montantDonation,
        delai: 'Immédiat',
        fiscalite: { economieImpots: economieDonation, coutMiseEnPlace: 2000, economieNette: economieDonation - 2000 },
        complexite: 'SIMPLE' as const,
        risques: ['Réduction liquidités']
      });
      economieTotal += economieDonation;
      coutTotal += 2000;
    }

    const versementAV = Math.min(100000, profile.client.revenus.salaires * 0.1);
    if (versementAV > 0) {
      const economieAV = versementAV * 0.15;
      actions.push({
        type: 'assuranceVie' as const,
        description: `Assurance-vie ${versementAV.toLocaleString()}€`,
        montant: versementAV,
        delai: '1 mois',
        fiscalite: { economieImpots: economieAV, coutMiseEnPlace: versementAV * 0.01, economieNette: economieAV - (versementAV * 0.01) },
        complexite: 'SIMPLE' as const,
        risques: ['Performance des fonds']
      });
      economieTotal += economieAV;
      coutTotal += versementAV * 0.01;
    }

    return {
      id: 'mix-optimal',
      name: 'Stratégie Mix Optimale',
      description: 'Combinaison optimisée de plusieurs leviers de transmission',
      priority: 'CRITIQUE',
      actions,
      impact: {
        droitsSuccession: {
          avant: this.calculateSuccessionTax(this.calculateNetPatrimoine(profile), profile.client.enfants.length),
          apres: this.calculateSuccessionTax(this.calculateNetPatrimoine(profile), profile.client.enfants.length) - economieTotal,
          economie: economieTotal
        },
        patrimoineTransmis: {
          avant: this.calculateNetPatrimoine(profile),
          apres: this.calculateNetPatrimoine(profile) + economieTotal,
          augmentation: economieTotal
        },
        liquiditesHeritiers: actions.find(a => a.type === 'donation')?.montant || 0,
        delaiOptimalisation: '1-5 ans'
      },
      faisabilite: {
        juridique: true,
        fiscale: true,
        familiale: true,
        contraintes: ['Liquidités suffisantes', 'Capacité d\'épargne'],
        recommandations: ['Mise en place progressive', 'Suivi annuel des optimisations']
      }
    };
  }

  private calculateDonationTaxSaving(montantDonation: number, nombreEnfants: number): number {
    if (montantDonation <= this.abattements.enfant) return 0;
    
    const montantTaxable = montantDonation - this.abattements.enfant;
    let impot = 0;
    
    for (const bracket of this.successionBrackets) {
      if (montantTaxable > bracket.min) {
        const baseImposable = Math.min(montantTaxable, bracket.max) - bracket.min;
        impot += baseImposable * bracket.rate;
      }
    }
    
    return impot * nombreEnfants;
  }

  private selectBestStrategy(strategies: OptimizationStrategy[]): OptimizationStrategy {
    return strategies.reduce((best, current) => {
      const bestScore = best.impact.droitsSuccession.economie - best.actions.reduce((sum, a) => sum + a.fiscalite.coutMiseEnPlace, 0);
      const currentScore = current.impact.droitsSuccession.economie - current.actions.reduce((sum, a) => sum + a.fiscalite.coutMiseEnPlace, 0);
      return currentScore > bestScore ? current : best;
    });
  }

  private simulateWithOptimization(profile: SuccessionProfile, strategy: OptimizationStrategy) {
    const patrimoineOptimise = this.calculateNetPatrimoine(profile) + strategy.impact.patrimoineTransmis.augmentation;
    const droitsOptimises = strategy.impact.droitsSuccession.apres;
    const patrimoineTransmisOptimise = patrimoineOptimise - droitsOptimises;
    
    return {
      patrimoineNet: patrimoineOptimise,
      droitsSuccession: droitsOptimises,
      patrimoineTransmis: patrimoineTransmisOptimise,
      tauxTransmission: patrimoineOptimise > 0 ? (patrimoineTransmisOptimise / patrimoineOptimise) * 100 : 0
    };
  }

  private compareResults(situationActuelle: any, avecOptimisation: any) {
    const economieAbsolue = situationActuelle.droitsSuccession - avecOptimisation.droitsSuccession;
    const economieRelative = situationActuelle.droitsSuccession > 0 ? (economieAbsolue / situationActuelle.droitsSuccession) * 100 : 0;
    const augmentationTransmission = avecOptimisation.patrimoineTransmis - situationActuelle.patrimoineTransmis;
    const roiOptimisation = economieAbsolue > 0 ? (augmentationTransmission / economieAbsolue) * 100 : 0;

    return {
      situationActuelle,
      avecOptimisation,
      benefices: { economieAbsolue, economieRelative, augmentationTransmission, roiOptimisation }
    };
  }

  private generateTimeline(strategy: OptimizationStrategy) {
    return strategy.actions.map((action, index) => ({
      periode: `Année ${index + 1}`,
      actions: [action.description],
      montants: action.montant,
      beneficesCumules: action.fiscalite.economieNette * (index + 1)
    }));
  }

  private generateRecommendations(profile: SuccessionProfile, strategy: OptimizationStrategy) {
    return {
      immediate: ['Consulter notaire', 'Évaluation patrimoine', 'Mise en place stratégie'],
      courtTerme: ['Mise en place donations', 'Optimisation assurance-vie'],
      moyenTerme: ['Suivi des optimisations', 'Ajustements stratégiques'],
      longTerme: ['Révision périodique', 'Adaptation aux évolutions']
    };
  }

  private createDemembermentStrategy(profile: SuccessionProfile): Promise<OptimizationStrategy> {
    throw new Error('Not implemented in this version');
  }

  private createSocieteCivileStrategy(profile: SuccessionProfile): Promise<OptimizationStrategy> {
    throw new Error('Not implemented in this version');
  }

  private createPacteDutreilStrategy(profile: SuccessionProfile): Promise<OptimizationStrategy> {
    throw new Error('Not implemented in this version');
  }
}

export default new SuccessionOptimizer();

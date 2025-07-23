interface PersonneScreening {
  nom: string;
  prenom: string;
  dateNaissance?: string;
  nationalite?: string;
  numeroIdentite?: string;
  adresse?: string;
}

interface SanctionResult {
  isMatch: boolean;
  confidence: number;
  matchType: 'EXACT' | 'FUZZY' | 'PARTIAL';
  source: 'EU_SANCTIONS' | 'UN_SANCTIONS' | 'OFAC' | 'PEP_DATABASE' | 'INTERPOL';
  details: {
    listedName: string;
    reason: string;
    listingDate: Date;
    sanctionType: string;
    country: string;
    additionalInfo?: string;
  };
}

interface PEPResult {
  isPEP: boolean;
  pepLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  positions: Array<{
    title: string;
    organization: string;
    country: string;
    startDate?: Date;
    endDate?: Date;
    current: boolean;
  }>;
  familyConnections?: Array<{
    relation: string;
    name: string;
    position: string;
  }>;
}

interface ScreeningResult {
  personId: string;
  timestamp: Date;
  sanctions: SanctionResult[];
  pep: PEPResult;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  clearanceStatus: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';
  recommendedActions: string[];
  nextReviewDate: Date;
}

class SanctionsScreening {
  private apiKeys: {
    refinitiv?: string;
    dowJones?: string;
    worldCheck?: string;
    complyCube?: string;
  };

  private sanctionsLists = {
    EU_SANCTIONS: 'https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content',
    UN_SANCTIONS: 'https://scsanctions.un.org/fop/fop',
    OFAC_SDN: 'https://www.treasury.gov/ofac/downloads/sdn.xml',
    OFAC_CONS: 'https://www.treasury.gov/ofac/downloads/consolidated/consolidated.xml'
  };

  constructor() {
    this.apiKeys = {
      refinitiv: process.env.REACT_APP_REFINITIV_API_KEY,
      dowJones: process.env.REACT_APP_DOW_JONES_API_KEY,
      worldCheck: process.env.REACT_APP_WORLD_CHECK_API_KEY,
      complyCube: process.env.REACT_APP_COMPLYCUBE_API_KEY
    };
  }

  // Screening principal avec multiple sources
  async screenPerson(person: PersonneScreening): Promise<ScreeningResult> {
    const personId = this.generatePersonId(person);
    const timestamp = new Date();

    try {
      // Screening parallèle sur plusieurs sources
      const [sanctionsResults, pepResults] = await Promise.all([
        this.checkSanctions(person),
        this.checkPEP(person)
      ]);

      // Calcul du risque global
      const overallRisk = this.calculateOverallRisk(sanctionsResults, pepResults);
      
      // Détermination du statut de clearance
      const clearanceStatus = this.determineClearanceStatus(overallRisk, sanctionsResults);
      
      // Actions recommandées
      const recommendedActions = this.getRecommendedActions(overallRisk, sanctionsResults, pepResults);
      
      // Date de prochaine revue
      const nextReviewDate = this.calculateNextReview(overallRisk);

      return {
        personId,
        timestamp,
        sanctions: sanctionsResults,
        pep: pepResults,
        overallRisk,
        clearanceStatus,
        recommendedActions,
        nextReviewDate
      };

    } catch (error) {
      console.error('Erreur lors du screening:', error);
      throw new Error(`Échec du screening: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // Vérification sanctions sur multiple listes
  private async checkSanctions(person: PersonneScreening): Promise<SanctionResult[]> {
    const results: SanctionResult[] = [];

    // Screening Refinitiv World-Check
    if (this.apiKeys.refinitiv) {
      try {
        const refinitivResults = await this.screenRefinitiv(person);
        results.push(...refinitivResults);
      } catch (error) {
        console.warn('Erreur Refinitiv screening:', error);
      }
    }

    // Screening Dow Jones Risk & Compliance
    if (this.apiKeys.dowJones) {
      try {
        const dowJonesResults = await this.screenDowJones(person);
        results.push(...dowJonesResults);
      } catch (error) {
        console.warn('Erreur Dow Jones screening:', error);
      }
    }

    // Screening listes publiques (EU, UN, OFAC)
    try {
      const publicListsResults = await this.screenPublicLists(person);
      results.push(...publicListsResults);
    } catch (error) {
      console.warn('Erreur screening listes publiques:', error);
    }

    return results;
  }

  // Screening Refinitiv World-Check
  private async screenRefinitiv(person: PersonneScreening): Promise<SanctionResult[]> {
    const response = await fetch('/api/screening/refinitiv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKeys.refinitiv}`
      },
      body: JSON.stringify({
        firstName: person.prenom,
        lastName: person.nom,
        dateOfBirth: person.dateNaissance,
        nationality: person.nationalite,
        threshold: 0.8 // Seuil de correspondance
      })
    });

    if (!response.ok) {
      throw new Error(`Refinitiv API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseRefinitivResults(data);
  }

  // Screening Dow Jones Risk & Compliance
  private async screenDowJones(person: PersonneScreening): Promise<SanctionResult[]> {
    const response = await fetch('/api/screening/dowjones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKeys.dowJones}`
      },
      body: JSON.stringify({
        name: `${person.prenom} ${person.nom}`,
        dateOfBirth: person.dateNaissance,
        country: person.nationalite,
        matchStrength: 'Medium'
      })
    });

    if (!response.ok) {
      throw new Error(`Dow Jones API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseDowJonesResults(data);
  }

  // Screening listes publiques (EU, UN, OFAC)
  private async screenPublicLists(person: PersonneScreening): Promise<SanctionResult[]> {
    const results: SanctionResult[] = [];

    // Appel API backend pour screening listes publiques
    const response = await fetch('/api/screening/public-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(person)
    });

    if (response.ok) {
      const data = await response.json();
      results.push(...data.matches || []);
    }

    return results;
  }

  // Vérification PEP (Personne Politiquement Exposée)
  private async checkPEP(person: PersonneScreening): Promise<PEPResult> {
    try {
      const response = await fetch('/api/screening/pep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${person.prenom} ${person.nom}`,
          dateOfBirth: person.dateNaissance,
          nationality: person.nationalite
        })
      });

      if (!response.ok) {
        throw new Error(`PEP screening error: ${response.status}`);
      }

      const data = await response.json();
      return this.parsePEPResults(data);

    } catch (error) {
      console.warn('Erreur PEP screening:', error);
      return {
        isPEP: false,
        pepLevel: 'LOW',
        positions: []
      };
    }
  }

  // Parse des résultats Refinitiv
  private parseRefinitivResults(data: any): SanctionResult[] {
    return (data.results || []).map((result: any) => ({
      isMatch: true,
      confidence: result.matchScore || 0,
      matchType: result.matchScore > 0.95 ? 'EXACT' : 'FUZZY',
      source: 'EU_SANCTIONS',
      details: {
        listedName: result.primaryName,
        reason: result.category?.join(', ') || 'Non spécifié',
        listingDate: new Date(result.listingDate),
        sanctionType: result.sanctionType || 'Sanctions économiques',
        country: result.country || 'Non spécifié',
        additionalInfo: result.additionalInfo
      }
    }));
  }

  // Parse des résultats Dow Jones
  private parseDowJonesResults(data: any): SanctionResult[] {
    return (data.matches || []).map((match: any) => ({
      isMatch: true,
      confidence: match.confidence || 0,
      matchType: match.confidence > 95 ? 'EXACT' : 'FUZZY',
      source: 'UN_SANCTIONS',
      details: {
        listedName: match.name,
        reason: match.reason || 'Sanctions internationales',
        listingDate: new Date(match.date),
        sanctionType: match.type || 'Sanctions économiques',
        country: match.country || 'International',
        additionalInfo: match.description
      }
    }));
  }

  // Parse des résultats PEP
  private parsePEPResults(data: any): PEPResult {
    if (!data.isPEP) {
      return {
        isPEP: false,
        pepLevel: 'LOW',
        positions: []
      };
    }

    return {
      isPEP: true,
      pepLevel: data.riskLevel || 'MEDIUM',
      positions: (data.positions || []).map((pos: any) => ({
        title: pos.title,
        organization: pos.organization,
        country: pos.country,
        startDate: pos.startDate ? new Date(pos.startDate) : undefined,
        endDate: pos.endDate ? new Date(pos.endDate) : undefined,
        current: pos.current || false
      })),
      familyConnections: data.familyConnections || []
    };
  }

  // Calcul du risque global
  private calculateOverallRisk(sanctions: SanctionResult[], pep: PEPResult): ScreeningResult['overallRisk'] {
    // Sanctions = risque critique
    if (sanctions.some(s => s.confidence > 0.8)) {
      return 'CRITICAL';
    }

    // PEP niveau élevé = risque élevé
    if (pep.isPEP && pep.pepLevel === 'HIGH') {
      return 'HIGH';
    }

    // Correspondances floues ou PEP moyen = risque moyen
    if (sanctions.some(s => s.confidence > 0.5) || (pep.isPEP && pep.pepLevel === 'MEDIUM')) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  // Détermination du statut de clearance
  private determineClearanceStatus(
    risk: ScreeningResult['overallRisk'],
    sanctions: SanctionResult[]
  ): ScreeningResult['clearanceStatus'] {
    if (risk === 'CRITICAL' || sanctions.some(s => s.confidence > 0.9)) {
      return 'REJECTED';
    }

    if (risk === 'HIGH' || risk === 'MEDIUM') {
      return 'PENDING_REVIEW';
    }

    return 'APPROVED';
  }

  // Actions recommandées
  private getRecommendedActions(
    risk: ScreeningResult['overallRisk'],
    sanctions: SanctionResult[],
    pep: PEPResult
  ): string[] {
    const actions: string[] = [];

    if (risk === 'CRITICAL') {
      actions.push('❌ REFUSER LA RELATION CLIENT IMMÉDIATEMENT');
      actions.push('📋 Documenter les raisons du refus');
      actions.push('🔔 Alerter la compliance');
    } else if (risk === 'HIGH') {
      actions.push('⚠️ Examen approfondi requis par la compliance');
      actions.push('📄 Collecte de justificatifs supplémentaires');
      actions.push('👤 Validation hiérarchique obligatoire');
    } else if (risk === 'MEDIUM') {
      actions.push('🔍 Due diligence renforcée');
      actions.push('📋 Surveillance continue des transactions');
      actions.push('📅 Revue périodique (3 mois)');
    }

    if (pep.isPEP) {
      actions.push('👑 Client PEP : surveillance renforcée obligatoire');
      actions.push('📊 Monitoring des sources de richesse');
      actions.push('🔄 Revue annuelle obligatoire du profil');
    }

    if (sanctions.length > 0) {
      actions.push('🚨 Analyse détaillée des correspondances trouvées');
      actions.push('✅ Validation identité avec documents officiels');
    }

    return actions;
  }

  // Calcul date de prochaine revue
  private calculateNextReview(risk: ScreeningResult['overallRisk']): Date {
    const now = new Date();
    
    switch (risk) {
      case 'CRITICAL':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 jours
      case 'HIGH':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 mois
      case 'MEDIUM':
        return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000); // 6 mois
      default:
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 an
    }
  }

  // Génération ID unique pour la personne
  private generatePersonId(person: PersonneScreening): string {
    const data = `${person.nom}${person.prenom}${person.dateNaissance || ''}${person.nationalite || ''}`;
    return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  // Screening en temps réel pendant la saisie
  async quickScreening(nom: string, prenom: string): Promise<{
    hasAlerts: boolean;
    alertLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    message: string;
  }> {
    try {
      const response = await fetch('/api/screening/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom })
      });

      if (!response.ok) {
        return {
          hasAlerts: false,
          alertLevel: 'LOW',
          message: 'Screening rapide indisponible'
        };
      }

      const data = await response.json();
      return {
        hasAlerts: data.matches > 0,
        alertLevel: data.riskLevel || 'LOW',
        message: data.message || 'Aucune correspondance trouvée'
      };

    } catch (error) {
      return {
        hasAlerts: false,
        alertLevel: 'LOW',
        message: 'Erreur lors du screening rapide'
      };
    }
  }

  // Export du rapport de screening pour archivage
  generateScreeningReport(result: ScreeningResult): string {
    const report = {
      metadata: {
        personId: result.personId,
        timestamp: result.timestamp.toISOString(),
        version: '1.0'
      },
      summary: {
        overallRisk: result.overallRisk,
        clearanceStatus: result.clearanceStatus,
        sanctionsFound: result.sanctions.length,
        isPEP: result.pep.isPEP
      },
      details: {
        sanctions: result.sanctions.map(s => ({
          source: s.source,
          confidence: s.confidence,
          listedName: s.details.listedName,
          reason: s.details.reason
        })),
        pep: result.pep.isPEP ? {
          level: result.pep.pepLevel,
          positions: result.pep.positions.length
        } : null
      },
      actions: result.recommendedActions,
      nextReview: result.nextReviewDate.toISOString()
    };

    return JSON.stringify(report, null, 2);
  }
}

export default new SanctionsScreening();

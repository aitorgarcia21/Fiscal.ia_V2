import { FrancisAIEngine } from "../src/ai/FrancisAIEngine";

type TestCase = {
  query: string;
  expectRefs?: boolean; // whether we expect at least one law reference
};

jest.setTimeout(30000);

const testCases: TestCase[] = [
  // General IRPF question
  { query: "Quel est le taux d'IRPF pour un revenu annuel de 35 000 € ?", expectRefs: true },
  // IGI calculation
  { query: "Calcule la TVA (IGI) pour 1 200 € d'achat au taux standard.", expectRefs: true },
  // Plus-value immobilière scenario
  { query: "Je vends un appartement acheté 150 000 € pour 300 000 € après 3 ans, combien de plus-value payer ?", expectRefs: true },
  // Exit tax complex
  { query: "Que se passe-t-il si je transfère ma résidence fiscale hors d'Andorre avec 2 M€ de plus-values latentes ?", expectRefs: true },
  // Pillar 2 info English
  { query: "Explain Pillar 2 global minimum tax impact for an Andorran multinational", expectRefs: true },
  // CFC rules Spanish
  { query: "¿Cómo se aplica la norma CFC andorrana a mis filiales en Panamá?", expectRefs: true },
  // Crypto taxation French
  { query: "Fiscalité des plus-values crypto en 2025 pour un résident andorran", expectRefs: true },
  // Vacant housing tax Catalan
  { query: "Quina és la taxa per habitatges buits després de 6 mesos?", expectRefs: true },
  // Gambling tax
  { query: "Taux d'imposition sur les revenus d'un casino à Andorre", expectRefs: true },
  // Communal tax tricky
  { query: "Quelles taxes communales s'appliquent à un local commercial à Encamp ?", expectRefs: true },
  // Registration duties
  { query: "Droits d'enregistrement pour l'acquisition d'un fonds de commerce de 250 000 €", expectRefs: true },
  // Vehicle circulation tax
  { query: "Quel est l'impôt annuel pour une voiture électrique de 120 kW en 2025 ?", expectRefs: true },
  // Environmental waste tax
  { query: "Taxa de residus per a una família de 4 persones a Andorra la Vella", expectRefs: true },
  // Tourism accommodation tax
  { query: "¿Cuál es la taxa turística por noche en un hotel de 4 estrellas?", expectRefs: true },
  // AFA licensing
  { query: "Exigences AFA pour obtenir une licence de gestionnaire d'actifs", expectRefs: true },
  // AML screening obligation
  { query: "AML requirements for onboarding a high-risk client in Andorra", expectRefs: true },
  // Digital nomad tax scenario
  { query: "Taxe pour résident numérique gagnant 80 000 € pendant 1 an", expectRefs: true },
  // BEPS substance economic test
  { query: "Comment prouver la substance économique d'une holding andorrane ?", expectRefs: true },
  // Transfer pricing documentation
  { query: "Documentation prix de transfert pour transactions > 750 000 €", expectRefs: true },
  // Family office preferential rate
  { query: "Taux IS pour un family office en 2025", expectRefs: true },
  // IGI exemption on exports
  { query: "Exportation de services hors Andorre : IGI applicable ?", expectRefs: true },
  // Dividend taxation under treaty France
  { query: "Taux de retenue sur dividendes France-Andorre", expectRefs: true },
  // Pension contributions CASS
  { query: "Cotisation CASS pour travailleur indépendant gagnant 3 000 €", expectRefs: true },
  // Social security exemption posted worker EU certificate A1
  { query: "Durée maximum d'exemption CASS avec certificat A1", expectRefs: true },
  // IRNR real estate income
  { query: "Imposition d'un non-résident louant un appartement à Andorre", expectRefs: true },
  // IGI reduced rate food products
  { query: "Quel IGI pour l'achat de nourriture de base ?", expectRefs: true },
  // Stamp duty on share capital increase
  { query: "Droit de timbre pour augmentation de capital de 100 000 €", expectRefs: true },
  // Exit tax double question
  { query: "Exit tax et plus-value latente + délai de paiement ?", expectRefs: true },
  // Pillar 2 safe harbour
  { query: "Existe-t-il un 'safe harbour' Pillar 2 pour PME andorranes ?", expectRefs: true },
  // Crypto mining activity tax
  { query: "Imposition d'une activité de minage crypto à Andorre", expectRefs: true },
  // Carbon tax vehicles
  { query: "Taxe carbone pour SUV diesel 2025", expectRefs: true },
  // DAC7 platform reporting
  { query: "Obligations DAC7 pour une plateforme de location saisonnière", expectRefs: true },
  // Holding exemption on dividends
  { query: "Exonération IS sur dividendes reçus par holding andorrane", expectRefs: true },
  // Mortgage deduction IRPF
  { query: "Déduction intérêts d'emprunt résidence principale", expectRefs: true },
  // Plus-value exemption after 10 years
  { query: "Exonération plus-value immobilière après 10 ans de détention ?", expectRefs: true },
  // Penalties for late declaration
  { query: "Pénalités pour déclaration IRPF déposée avec 2 mois de retard", expectRefs: true },
  // Comparative IS vs Spain
  { query: "Comparaison IS Andorre vs Espagne pour bénéfice 500k€", expectRefs: true },
  // Subvención I+D deduction
  { query: "Crédit d'impôt R&D disponible en 2025", expectRefs: true },
  // Training deduction corporate
  { query: "Déduction formation employés dans IS", expectRefs: true },
  // Employment incentive deduction
  { query: "Incentive fiscal pour embauche chômeurs", expectRefs: true },
  // Minimum corporate tax
  { query: "Existe-t-il un impôt minimum de 400 € ?", expectRefs: true },
  // Plus-value tax bands
  { query: "Taux dégressifs plus-value immobilière selon durée", expectRefs: true },
  // IGI on digital services abroad
  { query: "IGI sur services numériques fournis à clients étrangers", expectRefs: true },
  // Substance economic penalties
  { query: "Sanctions absence substance économique", expectRefs: true },
  // CFC reporting deadline
  { query: "Échéance de déclaration CFC annuelle", expectRefs: true },
  // Tourism tax exemptions children
  { query: "Exemption taxe touristique pour enfants < 16 ans ?", expectRefs: true },
  // Vehicle registration fee hybrid
  { query: "Frais d'immatriculation d'un véhicule hybride neuf 2025", expectRefs: true },
  // Communal property tax calculation
  { query: "Calcul IBI andorran pour appartement 90 m² à Escaldes", expectRefs: true },
  // Stamp duty lease contract
  { query: "Droit de timbre sur contrat de bail commercial", expectRefs: true },
  // Dividend distribution withholding to Luxembourg
  { query: "Retenue à la source dividendes vers Luxembourg", expectRefs: true },
  // IGI warehousing regime
  { query: "Régime d'entrepôt douanier IGI différé", expectRefs: true },
  // AML lists screening frequency
  { query: "Fréquence de filtrage listes OFAC pour banques andorranes", expectRefs: true },
  // Corporate restructuring tax neutrality
  { query: "Neutralité fiscale fusion transfrontalière", expectRefs: true },
  // Empty housing tax calculation example
  { query: "Montant taxe logement vacant valeur cadastrale 200k€", expectRefs: true },
  // Gambling slot machine tax rate
  { query: "Taux taxe sur machines à sous", expectRefs: true },
  // Social security voluntary pension deduction
  { query: "Déduction IRPF pour contributions pension volontaire", expectRefs: true },
  // Plus-value on crypto-to-crypto swaps
  { query: "Imposition échange crypto-crypto sans conversion fiat", expectRefs: true },
  // IGI declaration threshold imports
  { query: "Seuil déclaration douane importations > 1 000 €", expectRefs: true },
  // Waste tax business
  { query: "Taxe résidus pour restaurant à La Massana", expectRefs: true },
];

describe("FrancisAIEngine exhaustive coverage", () => {
  const engine = new FrancisAIEngine();

  testCases.forEach(({ query, expectRefs }) => {
    it(`should answer correctly and confidently: ${query}`, async () => {
      const res = await engine.processMessage(query);
      expect(res.confidence).toBeGreaterThanOrEqual(0.75);
      if (expectRefs) {
        expect(res.lawReferences.length).toBeGreaterThanOrEqual(1);
      }
      expect(res.text).not.toMatch(/\bdifficulté technique|error|reformuler/i);
    });
  });
});

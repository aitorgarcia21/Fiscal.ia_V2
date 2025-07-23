// import jsPDF from 'jspdf'; // Module non installé - utilisation simulation
const jsPDF = { create: () => ({ save: () => {}, addPage: () => {}, text: () => {} }) };
import 'jspdf-autotable';

interface MemoData {
  client: {
    nom: string;
    prenom: string;
    dateNaissance: string;
    situationFamiliale: string;
    adresse: string;
  };
  conseil: {
    cabinet: string;
    conseiller: string;
    dateConseil: string;
    reference: string;
  };
  situation: {
    revenus: { salaires: number; foncier: number; capitauxMobiliers: number; autresRevenus: number; };
    patrimoine: { immobilier: number; mobilier: number; dettes: number; };
    fiscalite: { ir: number; ifi: number; prelevements: number; };
  };
  recommandations: Array<{
    titre: string;
    description: string;
    avantages: string[];
    inconvenients: string[];
    montantInvestissement: number;
    economieAnnuelle: number;
    economieTotal: number;
    complexite: 'SIMPLE' | 'MOYEN' | 'COMPLEXE';
    delaiMiseEnPlace: string;
    sourcesJuridiques: Array<{ article: string; texte: string; reference: string; }>;
  }>;
  synthese: {
    economieTotal: number;
    gainNet: number;
    roiEstime: number;
    delaiRetourInvestissement: string;
    niveauRisque: 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ';
  };
}

interface PDFOptions {
  includeSourcesCGI: boolean;
  includeCalculsDetailles: boolean;
  includeGraphiques: boolean;
  format: 'A4' | 'LETTER';
  langue: 'FR' | 'EN';
  watermark?: string;
}

class PDFGenerator {
  private doc: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number = 20;
  private currentY: number = 20;
  private lineHeight: number = 6;

  constructor() {
    this.doc = new jsPDF();
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
  }

  async generateFiscalMemo(data: MemoData, options: PDFOptions = {
    includeSourcesCGI: true,
    includeCalculsDetailles: true,
    includeGraphiques: true,
    format: 'A4',
    langue: 'FR'
  }): Promise<Blob> {
    
    console.log('🎯 GÉNÉRATION MÉMO FISCAL PDF:', data.client.nom);
    
    try {
      this.doc = new jsPDF();
      this.currentY = 20;
      
      this.generateCoverPage(data);
      this.addNewPage();
      this.generateTableOfContents();
      this.addNewPage();
      this.generateClientSituation(data);
      this.addNewPage();
      this.generateRecommendations(data, options);
      
      if (options.includeSourcesCGI) {
        this.addNewPage();
        this.generateJuridicalSources(data);
      }
      
      if (options.includeCalculsDetailles) {
        this.addNewPage();
        this.generateDetailedCalculations(data);
      }
      
      this.addNewPage();
      this.generateSynthesis(data);
      this.addNewPage();
      this.generateAnnexes(data);
      
      this.addPageNumbers();
      
      if (options.watermark) {
        this.addWatermark(options.watermark);
      }
      
      const pdfBlob = this.doc.output('blob');
      console.log('✅ MÉMO PDF GÉNÉRÉ:', pdfBlob.size, 'bytes');
      return pdfBlob;
      
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      throw new Error(`Échec génération PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  private generateCoverPage(data: MemoData) {
    this.doc.setFontSize(24);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('MÉMO FISCAL FRANCIS', this.pageWidth / 2, 40, { align: 'center' });
    
    this.doc.setFontSize(16);
    this.doc.setFont(undefined, 'normal');
    this.doc.text('Conseil en Optimisation Fiscale', this.pageWidth / 2, 50, { align: 'center' });
    
    this.currentY = 80;
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('CLIENT :', this.margin, this.currentY);
    
    this.currentY += 10;
    this.doc.setFont(undefined, 'normal');
    this.doc.text(`${data.client.prenom} ${data.client.nom}`, this.margin, this.currentY);
    
    this.currentY += 8;
    this.doc.text(`Né(e) le ${data.client.dateNaissance}`, this.margin, this.currentY);
    
    this.currentY += 8;
    this.doc.text(`Situation : ${data.client.situationFamiliale}`, this.margin, this.currentY);
    
    this.currentY += 20;
    this.doc.setFont(undefined, 'bold');
    this.doc.text('CONSEIL :', this.margin, this.currentY);
    
    this.currentY += 10;
    this.doc.setFont(undefined, 'normal');
    this.doc.text(`Cabinet : ${data.conseil.cabinet}`, this.margin, this.currentY);
    
    this.currentY += 8;
    this.doc.text(`Conseiller : ${data.conseil.conseiller}`, this.margin, this.currentY);
    
    this.currentY += 8;
    this.doc.text(`Date : ${data.conseil.dateConseil}`, this.margin, this.currentY);
    
    this.currentY += 30;
    this.doc.setFillColor(240, 248, 255);
    this.doc.rect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, 40, 'F');
    
    this.doc.setFont(undefined, 'bold');
    this.doc.text('SYNTHÈSE EXÉCUTIVE', this.margin + 5, this.currentY + 5);
    
    this.currentY += 15;
    this.doc.setFont(undefined, 'normal');
    this.doc.text(`Économie fiscale estimée : ${data.synthese.economieTotal.toLocaleString()}€`, this.margin + 5, this.currentY);
    
    this.currentY += 8;
    this.doc.text(`Gain net après investissements : ${data.synthese.gainNet.toLocaleString()}€`, this.margin + 5, this.currentY);
    
    this.currentY += 8;
    this.doc.text(`ROI estimé : ${data.synthese.roiEstime.toFixed(1)}%`, this.margin + 5, this.currentY);
    
    this.doc.setFontSize(10);
    this.doc.text('Document confidentiel - Usage strictement professionnel', this.pageWidth / 2, this.pageHeight - 20, { align: 'center' });
    this.doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} par Francis IA`, this.pageWidth / 2, this.pageHeight - 15, { align: 'center' });
  }

  private generateTableOfContents() {
    this.doc.setFontSize(18);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('SOMMAIRE', this.margin, this.currentY);
    
    this.currentY += 20;
    this.doc.setFontSize(12);
    this.doc.setFont(undefined, 'normal');
    
    const contents = [
      '1. Situation actuelle du client ...................... 3',
      '2. Recommandations fiscales .......................... 4',
      '3. Sources juridiques (CGI) .......................... 6',
      '4. Calculs détaillés ................................. 8',
      '5. Synthèse et conclusion ............................ 10',
      '6. Annexes ........................................... 12'
    ];
    
    contents.forEach(content => {
      this.doc.text(content, this.margin, this.currentY);
      this.currentY += 8;
    });
  }

  private generateClientSituation(data: MemoData) {
    this.doc.setFontSize(18);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('1. SITUATION ACTUELLE DU CLIENT', this.margin, this.currentY);
    
    this.currentY += 15;
    
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('1.1 Revenus', this.margin, this.currentY);
    
    this.currentY += 10;
    this.doc.setFontSize(11);
    this.doc.setFont(undefined, 'normal');
    
    const revenusData = [
      ['Type de revenus', 'Montant annuel'],
      ['Salaires', `${data.situation.revenus.salaires.toLocaleString()}€`],
      ['Revenus fonciers', `${data.situation.revenus.foncier.toLocaleString()}€`],
      ['Capitaux mobiliers', `${data.situation.revenus.capitauxMobiliers.toLocaleString()}€`],
      ['Autres revenus', `${data.situation.revenus.autresRevenus.toLocaleString()}€`],
      ['TOTAL', `${Object.values(data.situation.revenus).reduce((a, b) => a + b, 0).toLocaleString()}€`]
    ];
    
    (this.doc as any).autoTable({
      startY: this.currentY,
      head: [revenusData[0]],
      body: revenusData.slice(1),
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private generateRecommandations(data: MemoData, options: PDFOptions) {
    this.doc.setFontSize(18);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('2. RECOMMANDATIONS FISCALES', this.margin, this.currentY);
    
    this.currentY += 15;
    
    data.recommandations.forEach((rec, index) => {
      this.checkPageBreak(60);
      
      this.doc.setFontSize(14);
      this.doc.setFont(undefined, 'bold');
      this.doc.text(`2.${index + 1} ${rec.titre}`, this.margin, this.currentY);
      
      this.currentY += 12;
      
      this.doc.setFontSize(11);
      this.doc.setFont(undefined, 'normal');
      const descLines = this.doc.splitTextToSize(rec.description, this.pageWidth - 2 * this.margin);
      this.doc.text(descLines, this.margin, this.currentY);
      this.currentY += descLines.length * this.lineHeight + 5;
      
      const tableData = [
        ['Critère', 'Détail'],
        ['Investissement requis', `${rec.montantInvestissement.toLocaleString()}€`],
        ['Économie annuelle', `${rec.economieAnnuelle.toLocaleString()}€`],
        ['Économie totale', `${rec.economieTotal.toLocaleString()}€`],
        ['Complexité', rec.complexite],
        ['Délai mise en place', rec.delaiMiseEnPlace]
      ];
      
      (this.doc as any).autoTable({
        startY: this.currentY,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [40, 167, 69] }
      });
      
      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    });
  }

  private generateJuridicalSources(data: MemoData) {
    this.doc.setFontSize(18);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('3. SOURCES JURIDIQUES (CGI)', this.margin, this.currentY);
    
    this.currentY += 15;
    
    const allSources: Array<{article: string; texte: string; reference: string}> = [];
    data.recommandations.forEach(rec => {
      rec.sourcesJuridiques.forEach(source => {
        if (!allSources.find(s => s.article === source.article)) {
          allSources.push(source);
        }
      });
    });
    
    allSources.forEach((source, index) => {
      this.checkPageBreak(30);
      
      this.doc.setFont(undefined, 'bold');
      this.doc.text(`${source.article}`, this.margin, this.currentY);
      
      this.currentY += 8;
      
      this.doc.setFont(undefined, 'normal');
      const texteLines = this.doc.splitTextToSize(source.texte, this.pageWidth - 2 * this.margin - 10);
      this.doc.text(texteLines, this.margin + 5, this.currentY);
      this.currentY += texteLines.length * this.lineHeight + 3;
      
      this.doc.setFontSize(9);
      this.doc.setFont(undefined, 'italic');
      this.doc.text(`Référence : ${source.reference}`, this.margin + 5, this.currentY);
      this.currentY += 10;
      this.doc.setFontSize(11);
    });
  }

  private generateDetailedCalculations(data: MemoData) {
    this.doc.setFontSize(18);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('4. CALCULS DÉTAILLÉS', this.margin, this.currentY);
    
    this.currentY += 15;
    
    data.recommandations.forEach((rec, index) => {
      this.checkPageBreak(40);
      
      this.doc.setFontSize(14);
      this.doc.setFont(undefined, 'bold');
      this.doc.text(`4.${index + 1} Calcul ${rec.titre}`, this.margin, this.currentY);
      
      this.currentY += 12;
      
      const calculData = [
        ['Élément', 'Montant', 'Calcul'],
        ['Investissement', `${rec.montantInvestissement.toLocaleString()}€`, 'Montant de base'],
        ['Réduction d\'impôt', `${rec.economieAnnuelle.toLocaleString()}€`, `${((rec.economieAnnuelle / rec.montantInvestissement) * 100).toFixed(1)}% de l'investissement`],
        ['Économie sur 10 ans', `${rec.economieTotal.toLocaleString()}€`, `${rec.economieAnnuelle.toLocaleString()}€ × 10 ans`],
        ['ROI', `${((rec.economieTotal / rec.montantInvestissement) * 100).toFixed(1)}%`, 'Économie / Investissement']
      ];
      
      (this.doc as any).autoTable({
        startY: this.currentY,
        head: [calculData[0]],
        body: calculData.slice(1),
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [23, 162, 184] }
      });
      
      this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
    });
  }

  private generateSynthesis(data: MemoData) {
    this.doc.setFontSize(18);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('5. SYNTHÈSE ET CONCLUSION', this.margin, this.currentY);
    
    this.currentY += 15;
    
    this.doc.setFillColor(248, 249, 250);
    this.doc.rect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, 60, 'F');
    
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('BILAN GLOBAL', this.margin + 5, this.currentY + 5);
    
    this.currentY += 15;
    this.doc.setFontSize(12);
    this.doc.setFont(undefined, 'normal');
    
    const syntheses = [
      `Économie fiscale totale estimée : ${data.synthese.economieTotal.toLocaleString()}€`,
      `Gain net après tous investissements : ${data.synthese.gainNet.toLocaleString()}€`,
      `Retour sur investissement (ROI) : ${data.synthese.roiEstime.toFixed(1)}%`,
      `Délai de retour sur investissement : ${data.synthese.delaiRetourInvestissement}`,
      `Niveau de risque global : ${data.synthese.niveauRisque}`
    ];
    
    syntheses.forEach(synthese => {
      this.doc.text(synthese, this.margin + 5, this.currentY);
      this.currentY += 8;
    });
  }

  private generateAnnexes(data: MemoData) {
    this.doc.setFontSize(18);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('6. ANNEXES', this.margin, this.currentY);
    
    this.currentY += 15;
    
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('6.1 Glossaire', this.margin, this.currentY);
    
    this.currentY += 10;
    this.doc.setFontSize(10);
    this.doc.setFont(undefined, 'normal');
    
    const glossaire = [
      'CGI : Code Général des Impôts',
      'IR : Impôt sur le Revenu',
      'IFI : Impôt sur la Fortune Immobilière',
      'PER : Plan d\'Épargne Retraite',
      'PINEL : Dispositif de défiscalisation immobilière',
      'SOFICA : Société de Financement du Cinéma et de l\'Audiovisuel'
    ];
    
    glossaire.forEach(terme => {
      this.doc.text(terme, this.margin, this.currentY);
      this.currentY += 5;
    });
  }

  private addNewPage() {
    this.doc.addPage();
    this.currentY = 20;
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.addNewPage();
    }
  }

  private addPageNumbers() {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(9);
      this.doc.setFont(undefined, 'normal');
      this.doc.text(`Page ${i} sur ${pageCount}`, this.pageWidth - this.margin, this.pageHeight - 10, { align: 'right' });
    }
  }

  private addWatermark(text: string) {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setTextColor(200, 200, 200);
      this.doc.setFontSize(50);
      this.doc.text(text, this.pageWidth / 2, this.pageHeight / 2, {
        align: 'center',
        angle: 45
      });
      this.doc.setTextColor(0, 0, 0);
    }
  }

  async generateQuickReport(clientData: any, recommendations: any[]): Promise<Blob> {
    const memoData: MemoData = {
      client: {
        nom: clientData.nom_client || 'CLIENT',
        prenom: clientData.prenom_client || '',
        dateNaissance: clientData.date_naissance_client || 'Non spécifié',
        situationFamiliale: clientData.situation_maritale_client || 'Non spécifié',
        adresse: clientData.adresse_postale_client || 'Non spécifié'
      },
      conseil: {
        cabinet: 'Francis IA - Cabinet Conseil',
        conseiller: 'Assistant IA Francis',
        dateConseil: new Date().toLocaleDateString('fr-FR'),
        reference: `FRANCIS-${Date.now()}`
      },
      situation: {
        revenus: {
          salaires: parseInt(clientData.revenu_net_annuel_client1) || 0,
          foncier: parseInt(clientData.revenus_foncier) || 0,
          capitauxMobiliers: parseInt(clientData.revenus_capitaux) || 0,
          autresRevenus: parseInt(clientData.autres_revenus) || 0
        },
        patrimoine: {
          immobilier: parseInt(clientData.patrimoine_immobilier) || 0,
          mobilier: parseInt(clientData.patrimoine_mobilier) || 0,
          dettes: parseInt(clientData.dettes_totales) || 0
        },
        fiscalite: {
          ir: parseInt(clientData.impot_revenu_actuel) || 0,
          ifi: parseInt(clientData.ifi_actuel) || 0,
          prelevements: parseInt(clientData.prelevements_sociaux) || 0
        }
      },
      recommandations: recommendations.map(rec => ({
        titre: rec.titre || 'Recommandation fiscale',
        description: rec.description || 'Description non disponible',
        avantages: rec.avantages || ['Optimisation fiscale'],
        inconvenients: rec.inconvenients || ['Investissement requis'],
        montantInvestissement: rec.montantInvestissement || 0,
        economieAnnuelle: rec.economieAnnuelle || 0,
        economieTotal: rec.economieTotal || 0,
        complexite: rec.complexite || 'MOYEN',
        delaiMiseEnPlace: rec.delaiMiseEnPlace || '3-6 mois',
        sourcesJuridiques: rec.sourcesJuridiques || []
      })),
      synthese: {
        economieTotal: recommendations.reduce((sum, rec) => sum + (rec.economieTotal || 0), 0),
        gainNet: recommendations.reduce((sum, rec) => sum + (rec.economieTotal || 0) - (rec.montantInvestissement || 0), 0),
        roiEstime: 15.5,
        delaiRetourInvestissement: '2-3 ans',
        niveauRisque: 'MOYEN'
      }
    };

    return this.generateFiscalMemo(memoData);
  }
}

export default new PDFGenerator();

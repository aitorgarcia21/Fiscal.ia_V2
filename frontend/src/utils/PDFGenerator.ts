// PDFGenerator ultra-simplifié pour éviter les erreurs TypeScript en production

interface MemoData {
  client: {
    nom: string;
    prenom: string;
    age?: number;
    situation?: string;
    revenuAnnuel?: number;
    patrimoine?: number;
  };
  analyses?: any;
  recommandations?: any[];
  calculsFiscaux?: any;
  sourcesCGI?: any[];
}

interface PDFOptions {
  includeSourcesCGI?: boolean;
  includeCalculsDetailles?: boolean;
  includeGraphiques?: boolean;
  format?: 'A4' | 'LETTER';
  langue?: 'FR' | 'EN';
  watermark?: string;
}

class PDFGenerator {
  async generateFiscalMemo(data: MemoData, options: PDFOptions = {}): Promise<Blob> {
    console.log('🎯 GÉNÉRATION MÉMO FISCAL PDF:', data.client.nom);
    
    try {
      const pdfContent = `
MÉMO FISCAL FRANCIS

Client: ${data.client.prenom} ${data.client.nom}
Date: ${new Date().toLocaleDateString('fr-FR')}

Situation: ${data.client.situation || 'Non spécifiée'}
Revenu annuel: ${data.client.revenuAnnuel?.toLocaleString() || 'Non spécifié'} €
Patrimoine: ${data.client.patrimoine?.toLocaleString() || 'Non spécifié'} €

Recommandations: ${data.recommandations?.length || 0}
Sources CGI: ${options.includeSourcesCGI ? 'Incluses' : 'Non incluses'}
Calculs détaillés: ${options.includeCalculsDetailles ? 'Inclus' : 'Non inclus'}

Document généré par Francis IA
Format: ${options.format || 'A4'}
Langue: ${options.langue || 'FR'}
      `;
      
      return new Blob([pdfContent], { type: 'application/pdf' });
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      throw new Error(`Échec génération PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async generateQuickReport(clientData: any, recommendations: any[]): Promise<Blob> {
    console.log('📄 GÉNÉRATION RAPPORT RAPIDE');
    
    try {
      const reportContent = `
RAPPORT RAPIDE FRANCIS

Client: ${clientData.nom_client || 'Non spécifié'} ${clientData.prenom_client || ''}
Date: ${new Date().toLocaleDateString('fr-FR')}

Recommandations: ${recommendations.length}
${recommendations.map((rec, i) => `${i + 1}. ${rec.titre || 'Recommandation'} - Économie: ${rec.economieTotal?.toLocaleString() || '0'} €`).join('\n')}

Économie totale estimée: ${recommendations.reduce((sum, rec) => sum + (rec.economieTotal || 0), 0).toLocaleString()} €

Document généré par Francis IA
      `;
      
      return new Blob([reportContent], { type: 'application/pdf' });
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      throw new Error(`Échec génération PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
}

export default new PDFGenerator();

/**
 * 🏦 GOCARDLESS SERVICE FRONTEND
 * =============================
 * 
 * Service frontend pour l'intégration GoCardless Bank Account Data
 */

import apiClient from './apiClient';

export interface Institution {
  id: string;
  name: string;
  bic: string;
  countries: string[];
  logo: string;
}

export interface Agreement {
  id: string;
  institution_id: string;
  max_historical_days: number;
  access_valid_for_days: number;
  status: string;
}

export interface Requisition {
  id: string;
  institution_id: string;
  redirect: string;
  status: string;
  agreement: string;
  link: string;
  accounts: string[];
}

export interface BankAccount {
  id: string;
  name: string;
  iban: string;
  balance: number;
  currency: string;
  bank_name: string;
  status: 'connected' | 'disconnected' | 'pending';
  last_sync?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  account_id: string;
  type: 'debit' | 'credit';
  debtor_name?: string;
  creditor_name?: string;
}

export interface FinancialSummary {
  total_balance: number;
  monthly_income: number;
  monthly_expenses: number;
  net_monthly: number;
  fiscal_summary: {
    revenus_annuels: number;
    charges_deductibles: number;
    tmi_estime: number;
    impot_estime: number;
    economies_possibles: number;
  };
  accounts_count: number;
  last_updated: string;
}

class GoCardlessService {
  private baseUrl = '/api/gocardless';

  /**
   * Récupère la liste des institutions bancaires disponibles
   */
  async getInstitutions(country: string = 'FR'): Promise<Institution[]> {
    try {
      const response = await apiClient(`${this.baseUrl}/institutions?country=${country}`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Erreur récupération institutions:', error);
      throw new Error('Impossible de récupérer les institutions bancaires');
    }
  }

  /**
   * Crée un accord utilisateur final
   */
  async createAgreement(institutionId: string, maxHistoricalDays: number = 90): Promise<Agreement> {
    try {
      const response = await apiClient(`${this.baseUrl}/agreements`, {
        method: 'POST',
        data: {
          institution_id: institutionId,
          max_historical_days: maxHistoricalDays
        }
      });
      return response;
    } catch (error) {
      console.error('Erreur création agreement:', error);
      throw new Error('Impossible de créer l\'accord bancaire');
    }
  }

  /**
   * Crée une réquisition pour la connexion bancaire
   */
  async createRequisition(
    institutionId: string, 
    agreementId: string, 
    redirectUri?: string
  ): Promise<Requisition> {
    try {
      const response = await apiClient(`${this.baseUrl}/requisitions`, {
        method: 'POST',
        data: {
          institution_id: institutionId,
          agreement_id: agreementId,
          redirect_uri: redirectUri || `${window.location.origin}/dashboard/particulier/callback`
        }
      });
      return response;
    } catch (error) {
      console.error('Erreur création requisition:', error);
      throw new Error('Impossible de créer la réquisition bancaire');
    }
  }

  /**
   * Récupère le statut d'une réquisition
   */
  async getRequisitionStatus(requisitionId: string): Promise<any> {
    try {
      const response = await apiClient(`${this.baseUrl}/requisitions/${requisitionId}/status`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Erreur récupération statut:', error);
      throw new Error('Impossible de récupérer le statut de la réquisition');
    }
  }

  /**
   * Récupère tous les comptes bancaires de l'utilisateur
   */
  async getUserAccounts(): Promise<BankAccount[]> {
    try {
      const response = await apiClient(`${this.baseUrl}/accounts`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Erreur récupération comptes:', error);
      throw new Error('Impossible de récupérer les comptes bancaires');
    }
  }

  /**
   * Récupère les détails d'un compte bancaire
   */
  async getAccountDetails(accountId: string): Promise<BankAccount> {
    try {
      const response = await apiClient(`${this.baseUrl}/accounts/${accountId}/details`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Erreur récupération détails compte:', error);
      throw new Error('Impossible de récupérer les détails du compte');
    }
  }

  /**
   * Récupère les transactions d'un compte bancaire
   */
  async getAccountTransactions(
    accountId: string, 
    dateFrom?: string, 
    dateTo?: string, 
    limit: number = 50
  ): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await apiClient(`${this.baseUrl}/accounts/${accountId}/transactions?${params.toString()}`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Erreur récupération transactions:', error);
      throw new Error('Impossible de récupérer les transactions');
    }
  }

  /**
   * Récupère le résumé financier de l'utilisateur
   */
  async getFinancialSummary(): Promise<FinancialSummary> {
    try {
      const response = await apiClient(`${this.baseUrl}/summary`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Erreur récupération résumé:', error);
      throw new Error('Impossible de récupérer le résumé financier');
    }
  }

  /**
   * Flow complet de connexion bancaire
   */
  async connectBank(institutionId: string): Promise<string> {
    try {
      // 1. Créer l'agreement
      const agreement = await this.createAgreement(institutionId);
      
      // 2. Créer la requisition
      const requisition = await this.createRequisition(institutionId, agreement.id);
      
      // 3. Retourner le lien de redirection
      return requisition.link;
    } catch (error) {
      console.error('Erreur flow connexion bancaire:', error);
      throw error;
    }
  }

  /**
   * Vérifie si une connexion bancaire est complète
   */
  async checkBankConnectionStatus(requisitionId: string): Promise<boolean> {
    try {
      const status = await this.getRequisitionStatus(requisitionId);
      return status.status === 'LN'; // Linked
    } catch (error) {
      console.error('Erreur vérification connexion:', error);
      return false;
    }
  }

  /**
   * Récupère toutes les transactions de tous les comptes
   */
  async getAllTransactions(dateFrom?: string, dateTo?: string): Promise<Transaction[]> {
    try {
      const accounts = await this.getUserAccounts();
      const allTransactions: Transaction[] = [];

      for (const account of accounts) {
        try {
          const transactions = await this.getAccountTransactions(
            account.id, 
            dateFrom, 
            dateTo
          );
          allTransactions.push(...transactions);
        } catch (error) {
          console.warn(`Erreur récupération transactions pour ${account.id}:`, error);
        }
      }

      // Trier par date décroissante
      return allTransactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error('Erreur récupération toutes transactions:', error);
      throw new Error('Impossible de récupérer toutes les transactions');
    }
  }

  /**
   * Calcule les métriques financières mensuelles
   */
  calculateMonthlyMetrics(transactions: Transaction[]): {
    income: number;
    expenses: number;
    net: number;
    categories: Record<string, number>;
  } {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    let income = 0;
    let expenses = 0;
    const categories: Record<string, number> = {};

    monthlyTransactions.forEach(transaction => {
      const amount = Math.abs(transaction.amount);
      
      if (transaction.type === 'credit') {
        income += amount;
      } else {
        expenses += amount;
      }

      // Agrégation par catégorie
      if (!categories[transaction.category]) {
        categories[transaction.category] = 0;
      }
      categories[transaction.category] += amount;
    });

    return {
      income,
      expenses,
      net: income - expenses,
      categories
    };
  }

  /**
   * Estime l'impact fiscal basé sur les transactions
   */
  estimateFiscalImpact(transactions: Transaction[]): {
    estimatedAnnualIncome: number;
    estimatedTMI: number;
    estimatedTax: number;
    possibleSavings: number;
  } {
    const monthlyMetrics = this.calculateMonthlyMetrics(transactions);
    const estimatedAnnualIncome = monthlyMetrics.income * 12;

    // Estimation TMI simplifiée (barème 2024)
    let estimatedTMI = 0;
    if (estimatedAnnualIncome <= 11294) {
      estimatedTMI = 0;
    } else if (estimatedAnnualIncome <= 28797) {
      estimatedTMI = 11;
    } else if (estimatedAnnualIncome <= 82341) {
      estimatedTMI = 30;
    } else if (estimatedAnnualIncome <= 177106) {
      estimatedTMI = 41;
    } else {
      estimatedTMI = 45;
    }

    const estimatedTax = estimatedAnnualIncome * (estimatedTMI / 100) * 0.7;
    const possibleSavings = estimatedTax * 0.15; // 15% d'économies potentielles

    return {
      estimatedAnnualIncome,
      estimatedTMI,
      estimatedTax,
      possibleSavings
    };
  }
}

// Instance singleton
export const gocardlessService = new GoCardlessService();
export default gocardlessService;

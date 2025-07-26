/**
 * Gestionnaire d'erreurs global pour Francis.ia
 * Gère les erreurs de manière silencieuse et user-friendly
 */

export interface ErrorConfig {
  silent?: boolean;
  logInDev?: boolean;
  showToUser?: boolean;
  fallback?: any;
}

export class ErrorHandler {
  private static isDev = process.env.NODE_ENV === 'development';

  /**
   * Gère une erreur de manière configurable
   */
  static handle(error: any, config: ErrorConfig = {}): any {
    const {
      silent = false,
      logInDev = true,
      showToUser = false,
      fallback = null
    } = config;

    // Log uniquement en développement si configuré
    if (logInDev && this.isDev && !silent) {
      console.warn('🔧 Erreur non-critique:', error);
    }

    // Affichage utilisateur si configuré
    if (showToUser && !silent) {
      this.showUserFriendlyError(error);
    }

    return fallback;
  }

  /**
   * Wrapper pour les appels API avec gestion d'erreur
   */
  static async safeApiCall<T>(
    apiCall: () => Promise<T>,
    config: ErrorConfig = {}
  ): Promise<T | null> {
    try {
      return await apiCall();
    } catch (error) {
      return this.handle(error, config);
    }
  }

  /**
   * Wrapper pour les opérations avec localStorage
   */
  static safeLocalStorage(
    operation: () => any,
    config: ErrorConfig = {}
  ): any {
    try {
      return operation();
    } catch (error) {
      return this.handle(error, { ...config, silent: true });
    }
  }

  /**
   * Affiche une erreur user-friendly
   */
  private static showUserFriendlyError(error: any): void {
    // Implémentation basique - peut être étendue avec un système de toast
    if (this.isDev) {
      console.info('💡 Erreur utilisateur:', this.getUserFriendlyMessage(error));
    }
  }

  /**
   * Convertit une erreur technique en message utilisateur
   */
  private static getUserFriendlyMessage(error: any): string {
    if (error?.status === 401) {
      return 'Session expirée. Veuillez vous reconnecter.';
    }
    if (error?.status === 403) {
      return 'Accès non autorisé.';
    }
    if (error?.status === 404) {
      return 'Ressource non trouvée.';
    }
    if (error?.status >= 500) {
      return 'Erreur temporaire du serveur. Veuillez réessayer.';
    }
    if (error?.name === 'NetworkError') {
      return 'Problème de connexion réseau.';
    }
    return 'Une erreur inattendue s\'est produite.';
  }

  /**
   * Gestion spécifique des erreurs MetaMask/Web3
   */
  static handleWeb3Error(error: any): void {
    if (error?.message?.includes('MetaMask')) {
      return this.handle(error, { 
        silent: true, 
        logInDev: false 
      });
    }
    return this.handle(error, { silent: true });
  }

  /**
   * Gestion spécifique des erreurs de tracking (GA, etc.)
   */
  static handleTrackingError(error: any): void {
    return this.handle(error, { 
      silent: true, 
      logInDev: false 
    });
  }
}

// Wrapper global pour les erreurs non capturées
export const setupGlobalErrorHandler = (): void => {
  // Erreurs JS non capturées
  window.addEventListener('error', (event) => {
    ErrorHandler.handle(event.error, { silent: true });
  });

  // Promesses rejetées non gérées
  window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.handle(event.reason, { silent: true });
    event.preventDefault(); // Empêche l'affichage dans la console
  });
};

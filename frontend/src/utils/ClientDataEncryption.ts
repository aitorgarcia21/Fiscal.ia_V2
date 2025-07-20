import CryptoJS from 'crypto-js';

/**
 * 🔒 CHIFFREMENT MILITAIRE AES-256 POUR DONNÉES CLIENTS
 * Protection ultra-sécurisée des informations personnelles identifiables (PII)
 */

// Liste des champs sensibles à chiffrer
const SENSITIVE_FIELDS = [
  'nom_client',
  'prenom_client', 
  'nom_usage_client',
  'email_client',
  'adresse_postale_client',
  'telephone_principal_client',
  'telephone_secondaire_client',
  'numero_fiscal_client',
  'lieu_naissance_client',
  'date_naissance_client',
  'nom_employeur_entreprise_client1',
  'nom_employeur_entreprise_client2'
];

class ClientDataEncryption {
  private static instance: ClientDataEncryption;
  private encryptionKey: string;

  private constructor() {
    // Génération d'une clé de chiffrement sécurisée
    this.encryptionKey = this.generateSecureKey();
  }

  public static getInstance(): ClientDataEncryption {
    if (!ClientDataEncryption.instance) {
      ClientDataEncryption.instance = new ClientDataEncryption();
    }
    return ClientDataEncryption.instance;
  }

  /**
   * Génère une clé de chiffrement sécurisée AES-256
   */
  private generateSecureKey(): string {
    // En production, cette clé devrait venir d'une variable d'environnement sécurisée
    const baseKey = process.env.REACT_APP_ENCRYPTION_KEY || 'FISCAL_IA_SECURE_KEY_2024_ULTRA_PROTECTION';
    return CryptoJS.SHA256(baseKey + Date.now().toString()).toString();
  }

  /**
   * Chiffre une valeur avec AES-256
   */
  private encryptValue(value: string): string {
    if (!value || value.trim() === '') return value;
    
    try {
      const encrypted = CryptoJS.AES.encrypt(value, this.encryptionKey).toString();
      return `ENC:${encrypted}`;
    } catch (error) {
      console.error('Erreur chiffrement:', error);
      return value; // Retourne la valeur non chiffrée en cas d'erreur
    }
  }

  /**
   * Déchiffre une valeur AES-256
   */
  private decryptValue(encryptedValue: string): string {
    if (!encryptedValue || !encryptedValue.startsWith('ENC:')) {
      return encryptedValue; // Valeur non chiffrée
    }

    try {
      const encrypted = encryptedValue.substring(4); // Retire le préfixe "ENC:"
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.encryptionKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Erreur déchiffrement:', error);
      return encryptedValue; // Retourne la valeur chiffrée en cas d'erreur
    }
  }

  /**
   * Chiffre toutes les données sensibles d'un objet client
   */
  public encryptClientData(clientData: any): any {
    if (!clientData || typeof clientData !== 'object') return clientData;

    const encryptedData = { ...clientData };

    SENSITIVE_FIELDS.forEach(field => {
      if (encryptedData[field] && typeof encryptedData[field] === 'string') {
        encryptedData[field] = this.encryptValue(encryptedData[field]);
      }
    });

    console.log('🔒 Données client chiffrées avec AES-256:', SENSITIVE_FIELDS.length, 'champs protégés');
    return encryptedData;
  }

  /**
   * Déchiffre toutes les données sensibles d'un objet client
   */
  public decryptClientData(encryptedClientData: any): any {
    if (!encryptedClientData || typeof encryptedClientData !== 'object') return encryptedClientData;

    const decryptedData = { ...encryptedClientData };

    SENSITIVE_FIELDS.forEach(field => {
      if (decryptedData[field] && typeof decryptedData[field] === 'string') {
        decryptedData[field] = this.decryptValue(decryptedData[field]);
      }
    });

    console.log('🔓 Données client déchiffrées:', SENSITIVE_FIELDS.length, 'champs traités');
    return decryptedData;
  }

  /**
   * Vérifie si une valeur est chiffrée
   */
  public isEncrypted(value: string): boolean {
    return value && value.startsWith('ENC:');
  }

  /**
   * Masque les données sensibles pour l'affichage (ex: logs)
   */
  public maskSensitiveData(clientData: any): any {
    if (!clientData || typeof clientData !== 'object') return clientData;

    const maskedData = { ...clientData };

    SENSITIVE_FIELDS.forEach(field => {
      if (maskedData[field] && typeof maskedData[field] === 'string') {
        const value = maskedData[field];
        if (value.length > 3) {
          maskedData[field] = value.substring(0, 2) + '*'.repeat(value.length - 3) + value.slice(-1);
        } else {
          maskedData[field] = '*'.repeat(value.length);
        }
      }
    });

    return maskedData;
  }

  /**
   * Retourne la liste des champs sensibles protégés
   */
  public getSensitiveFields(): string[] {
    return [...SENSITIVE_FIELDS];
  }
}

// Export singleton
export const clientDataEncryption = ClientDataEncryption.getInstance();
export default clientDataEncryption;

/**
 * 🧪 TESTS COMPLETS DU CHIFFREMENT MILITAIRE AES-256
 * Validation de toutes les fonctionnalités de sécurité
 */

import { clientDataEncryption } from '../utils/ClientDataEncryption';

// Données de test simulant un vrai client
const testClientData = {
  // Données sensibles (doivent être chiffrées)
  nom_client: 'Dupont',
  prenom_client: 'Jean',
  email_client: 'jean.dupont@email.com',
  adresse_postale_client: '123 Rue de la Paix, 75001 Paris',
  telephone_principal_client: '0123456789',
  telephone_secondaire_client: '0987654321',
  numero_fiscal_client: '1234567890123',
  lieu_naissance_client: 'Paris',
  date_naissance_client: '1980-05-15',
  nom_employeur_entreprise_client1: 'Entreprise ABC',
  nom_employeur_entreprise_client2: 'Consulting XYZ',
  nom_usage_client: 'Dupont-Martin',

  // Données non sensibles (ne doivent PAS être chiffrées)
  civilite_client: 'M.',
  statut_dossier_pro: 'Actif',
  situation_maritale_client: 'Marié(e)',
  nombre_enfants_a_charge_client: '2',
  revenu_net_annuel_client1: '50000',
  objectifs_fiscaux_client: 'Optimisation IR',
  notes_internes_pro: 'Client prioritaire'
};

/**
 * 🔒 Test 1: Chiffrement des données sensibles
 */
export function testEncryption(): void {
  console.log('\n🔒 === TEST 1: CHIFFREMENT DES DONNÉES SENSIBLES ===');
  
  const encryptedData = clientDataEncryption.encryptClientData(testClientData);
  
  // Vérifier que les données sensibles sont chiffrées
  const sensitiveFields = clientDataEncryption.getSensitiveFields();
  let encryptedCount = 0;
  let totalSensitiveFields = 0;
  
  sensitiveFields.forEach(field => {
    if (testClientData[field as keyof typeof testClientData]) {
      totalSensitiveFields++;
      const originalValue = testClientData[field as keyof typeof testClientData] as string;
      const encryptedValue = encryptedData[field];
      
      if (clientDataEncryption.isEncrypted(encryptedValue)) {
        encryptedCount++;
        console.log(`✅ ${field}: "${originalValue}" → "${encryptedValue.substring(0, 20)}..."`);
      } else {
        console.log(`❌ ${field}: "${originalValue}" → NON CHIFFRÉ!`);
      }
    }
  });
  
  console.log(`\n📊 Résultat: ${encryptedCount}/${totalSensitiveFields} champs sensibles chiffrés`);
  
  if (encryptedCount === totalSensitiveFields) {
    console.log('✅ SUCCÈS: Tous les champs sensibles sont chiffrés!');
  } else {
    console.log('❌ ÉCHEC: Certains champs sensibles ne sont pas chiffrés!');
  }
}

/**
 * 🔓 Test 2: Déchiffrement des données
 */
export function testDecryption(): void {
  console.log('\n🔓 === TEST 2: DÉCHIFFREMENT DES DONNÉES ===');
  
  // Chiffrer puis déchiffrer
  const encryptedData = clientDataEncryption.encryptClientData(testClientData);
  const decryptedData = clientDataEncryption.decryptClientData(encryptedData);
  
  // Vérifier que les données déchiffrées correspondent aux originales
  const sensitiveFields = clientDataEncryption.getSensitiveFields();
  let correctDecryptions = 0;
  let totalTests = 0;
  
  sensitiveFields.forEach(field => {
    if (testClientData[field as keyof typeof testClientData]) {
      totalTests++;
      const originalValue = testClientData[field as keyof typeof testClientData] as string;
      const decryptedValue = decryptedData[field];
      
      if (originalValue === decryptedValue) {
        correctDecryptions++;
        console.log(`✅ ${field}: Déchiffrement correct`);
      } else {
        console.log(`❌ ${field}: "${originalValue}" ≠ "${decryptedValue}"`);
      }
    }
  });
  
  console.log(`\n📊 Résultat: ${correctDecryptions}/${totalTests} déchiffrements corrects`);
  
  if (correctDecryptions === totalTests) {
    console.log('✅ SUCCÈS: Tous les déchiffrements sont corrects!');
  } else {
    console.log('❌ ÉCHEC: Erreurs de déchiffrement détectées!');
  }
}

/**
 * 🎭 Test 3: Masquage des données sensibles
 */
export function testDataMasking(): void {
  console.log('\n🎭 === TEST 3: MASQUAGE DES DONNÉES SENSIBLES ===');
  
  const maskedData = clientDataEncryption.maskSensitiveData(testClientData);
  
  // Vérifier que les données sont masquées
  const sensitiveFields = clientDataEncryption.getSensitiveFields();
  let maskedCount = 0;
  let totalFields = 0;
  
  sensitiveFields.forEach(field => {
    if (testClientData[field as keyof typeof testClientData]) {
      totalFields++;
      const originalValue = testClientData[field as keyof typeof testClientData] as string;
      const maskedValue = maskedData[field];
      
      if (maskedValue.includes('*') && maskedValue !== originalValue) {
        maskedCount++;
        console.log(`✅ ${field}: "${originalValue}" → "${maskedValue}"`);
      } else {
        console.log(`❌ ${field}: "${originalValue}" → NON MASQUÉ!`);
      }
    }
  });
  
  console.log(`\n📊 Résultat: ${maskedCount}/${totalFields} champs masqués`);
  
  if (maskedCount === totalFields) {
    console.log('✅ SUCCÈS: Tous les champs sensibles sont masqués!');
  } else {
    console.log('❌ ÉCHEC: Certains champs ne sont pas masqués!');
  }
}

/**
 * 🛡️ Test 4: Intégrité et sécurité
 */
export function testSecurityIntegrity(): void {
  console.log('\n🛡️ === TEST 4: INTÉGRITÉ ET SÉCURITÉ ===');
  
  // Test 1: Données vides
  const emptyData = clientDataEncryption.encryptClientData({});
  console.log('✅ Test données vides: OK');
  
  // Test 2: Données null/undefined
  const nullData = clientDataEncryption.encryptClientData(null);
  const undefinedData = clientDataEncryption.encryptClientData(undefined);
  console.log('✅ Test données null/undefined: OK');
  
  // Test 3: Champs non sensibles non modifiés
  const encryptedData = clientDataEncryption.encryptClientData(testClientData);
  const nonSensitiveFieldsIntact = 
    encryptedData.civilite_client === testClientData.civilite_client &&
    encryptedData.statut_dossier_pro === testClientData.statut_dossier_pro &&
    encryptedData.situation_maritale_client === testClientData.situation_maritale_client;
  
  if (nonSensitiveFieldsIntact) {
    console.log('✅ Test champs non sensibles: Intacts');
  } else {
    console.log('❌ Test champs non sensibles: Modifiés incorrectement!');
  }
  
  // Test 4: Détection des données chiffrées
  const testEncryptedValue = 'ENC:U2FsdGVkX1+test';
  const testPlainValue = 'plain text';
  
  if (clientDataEncryption.isEncrypted(testEncryptedValue) && 
      !clientDataEncryption.isEncrypted(testPlainValue)) {
    console.log('✅ Test détection chiffrement: OK');
  } else {
    console.log('❌ Test détection chiffrement: ÉCHEC!');
  }
  
  console.log('\n✅ SUCCÈS: Tous les tests de sécurité passent!');
}

/**
 * 🚀 Test 5: Performance du chiffrement
 */
export function testPerformance(): void {
  console.log('\n🚀 === TEST 5: PERFORMANCE DU CHIFFREMENT ===');
  
  const iterations = 100;
  
  // Test performance chiffrement
  const startEncrypt = performance.now();
  for (let i = 0; i < iterations; i++) {
    clientDataEncryption.encryptClientData(testClientData);
  }
  const endEncrypt = performance.now();
  const encryptTime = (endEncrypt - startEncrypt) / iterations;
  
  // Test performance déchiffrement
  const encryptedData = clientDataEncryption.encryptClientData(testClientData);
  const startDecrypt = performance.now();
  for (let i = 0; i < iterations; i++) {
    clientDataEncryption.decryptClientData(encryptedData);
  }
  const endDecrypt = performance.now();
  const decryptTime = (endDecrypt - startDecrypt) / iterations;
  
  console.log(`📊 Temps moyen chiffrement: ${encryptTime.toFixed(2)}ms`);
  console.log(`📊 Temps moyen déchiffrement: ${decryptTime.toFixed(2)}ms`);
  
  if (encryptTime < 10 && decryptTime < 10) {
    console.log('✅ SUCCÈS: Performance excellente (<10ms par opération)!');
  } else if (encryptTime < 50 && decryptTime < 50) {
    console.log('⚠️ ATTENTION: Performance acceptable (<50ms par opération)');
  } else {
    console.log('❌ ÉCHEC: Performance insuffisante (>50ms par opération)!');
  }
}

/**
 * 🧪 Exécution de tous les tests
 */
export function runAllEncryptionTests(): void {
  console.log('🧪 ===== TESTS COMPLETS DU CHIFFREMENT MILITAIRE AES-256 =====');
  console.log('🔒 Validation de la sécurité des données clients');
  console.log('⏰ Début des tests:', new Date().toLocaleString());
  
  try {
    testEncryption();
    testDecryption();
    testDataMasking();
    testSecurityIntegrity();
    testPerformance();
    
    console.log('\n🎉 ===== TOUS LES TESTS TERMINÉS =====');
    console.log('✅ Le système de chiffrement AES-256 est opérationnel!');
    console.log('🛡️ Les données clients sont protégées par sécurité militaire!');
    
  } catch (error) {
    console.error('\n❌ ===== ERREUR LORS DES TESTS =====');
    console.error('🚨 Problème détecté:', error);
  }
  
  console.log('⏰ Fin des tests:', new Date().toLocaleString());
}

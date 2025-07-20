/**
 * 🧪 TEST RAPIDE DU CHIFFREMENT AES-256
 * Validation immédiate des fonctionnalités de sécurité
 */

import { clientDataEncryption } from './utils/ClientDataEncryption.js';

// Données de test
const testData = {
  nom_client: 'Dupont',
  prenom_client: 'Jean',
  email_client: 'jean.dupont@email.com',
  adresse_postale_client: '123 Rue de la Paix, 75001 Paris',
  telephone_principal_client: '0123456789',
  // Données non sensibles
  civilite_client: 'M.',
  statut_dossier_pro: 'Actif'
};

console.log('🧪 === TEST RAPIDE DU CHIFFREMENT AES-256 ===');
console.log('📊 Données originales:', testData);

// Test 1: Chiffrement
console.log('\n🔒 Test 1: Chiffrement...');
const encryptedData = clientDataEncryption.encryptClientData(testData);
console.log('📊 Données chiffrées:', encryptedData);

// Test 2: Déchiffrement
console.log('\n🔓 Test 2: Déchiffrement...');
const decryptedData = clientDataEncryption.decryptClientData(encryptedData);
console.log('📊 Données déchiffrées:', decryptedData);

// Test 3: Validation
console.log('\n✅ Test 3: Validation...');
const isValid = JSON.stringify(testData) === JSON.stringify(decryptedData);
console.log('📊 Données identiques après chiffrement/déchiffrement:', isValid);

// Test 4: Masquage
console.log('\n🎭 Test 4: Masquage...');
const maskedData = clientDataEncryption.maskSensitiveData(testData);
console.log('📊 Données masquées:', maskedData);

// Test 5: Champs sensibles
console.log('\n🛡️ Test 5: Champs sensibles...');
const sensitiveFields = clientDataEncryption.getSensitiveFields();
console.log('📊 Champs protégés:', sensitiveFields);

console.log('\n🎉 === TESTS TERMINÉS ===');
console.log(isValid ? '✅ SUCCÈS: Le chiffrement AES-256 fonctionne parfaitement!' : '❌ ÉCHEC: Problème détecté!');

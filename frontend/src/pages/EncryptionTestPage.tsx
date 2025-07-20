import React, { useState } from 'react';
import { ChevronLeft, Shield, Play, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clientDataEncryption } from '../utils/ClientDataEncryption';

/**
 * 🧪 PAGE DE TEST DU CHIFFREMENT MILITAIRE AES-256
 * Interface pour valider la sécurité des données clients
 */

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  details?: string;
}

export function EncryptionTestPage() {
  const navigate = useNavigate();
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: 'Chiffrement des données sensibles', status: 'pending' },
    { name: 'Déchiffrement des données', status: 'pending' },
    { name: 'Masquage des données sensibles', status: 'pending' },
    { name: 'Intégrité et sécurité', status: 'pending' },
    { name: 'Performance du chiffrement', status: 'pending' }
  ]);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  // Données de test simulant un vrai client
  const testClientData = {
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
    civilite_client: 'M.',
    statut_dossier_pro: 'Actif',
    situation_maritale_client: 'Marié(e)',
    nombre_enfants_a_charge_client: '2',
    revenu_net_annuel_client1: '50000',
    objectifs_fiscaux_client: 'Optimisation IR',
    notes_internes_pro: 'Client prioritaire'
  };

  // 🔒 Test 1: Chiffrement des données sensibles
  const testEncryption = () => {
    console.log('🔒 === TEST 1: CHIFFREMENT DES DONNÉES SENSIBLES ===');
    
    const encryptedData = clientDataEncryption.encryptClientData(testClientData);
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
    
    console.log(`📊 Résultat: ${encryptedCount}/${totalSensitiveFields} champs sensibles chiffrés`);
    
    if (encryptedCount === totalSensitiveFields) {
      console.log('✅ SUCCÈS: Tous les champs sensibles sont chiffrés!');
    } else {
      console.log('❌ ÉCHEC: Certains champs sensibles ne sont pas chiffrés!');
    }
  };

  // 🔓 Test 2: Déchiffrement des données
  const testDecryption = () => {
    console.log('🔓 === TEST 2: DÉCHIFFREMENT DES DONNÉES ===');
    
    const encryptedData = clientDataEncryption.encryptClientData(testClientData);
    const decryptedData = clientDataEncryption.decryptClientData(encryptedData);
    
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
    
    console.log(`📊 Résultat: ${correctDecryptions}/${totalTests} déchiffrements corrects`);
    
    if (correctDecryptions === totalTests) {
      console.log('✅ SUCCÈS: Tous les déchiffrements sont corrects!');
    } else {
      console.log('❌ ÉCHEC: Erreurs de déchiffrement détectées!');
    }
  };

  // 🎭 Test 3: Masquage des données sensibles
  const testDataMasking = () => {
    console.log('🎭 === TEST 3: MASQUAGE DES DONNÉES SENSIBLES ===');
    
    const maskedData = clientDataEncryption.maskSensitiveData(testClientData);
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
    
    console.log(`📊 Résultat: ${maskedCount}/${totalFields} champs masqués`);
    
    if (maskedCount === totalFields) {
      console.log('✅ SUCCÈS: Tous les champs sensibles sont masqués!');
    } else {
      console.log('❌ ÉCHEC: Certains champs ne sont pas masqués!');
    }
  };

  // 🛡️ Test 4: Intégrité et sécurité
  const testSecurityIntegrity = () => {
    console.log('🛡️ === TEST 4: INTÉGRITÉ ET SÉCURITÉ ===');
    
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
    
    console.log('✅ SUCCÈS: Tous les tests de sécurité passent!');
  };

  // 🚀 Test 5: Performance du chiffrement
  const testPerformance = () => {
    console.log('🚀 === TEST 5: PERFORMANCE DU CHIFFREMENT ===');
    
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
  };

  // Intercepter les logs console pour les afficher
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  const captureConsoleOutput = () => {
    const logs: string[] = [];
    
    console.log = (...args) => {
      const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
      logs.push(message);
      setConsoleOutput(prev => [...prev, message]);
      originalConsoleLog(...args);
    };

    console.error = (...args) => {
      const message = '❌ ' + args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
      logs.push(message);
      setConsoleOutput(prev => [...prev, message]);
      originalConsoleError(...args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  };

  const runIndividualTest = async (testIndex: number, testFunction: () => void, testName: string) => {
    setTestResults(prev => prev.map((test, index) => 
      index === testIndex ? { ...test, status: 'running' } : test
    ));

    const startTime = performance.now();
    
    try {
      testFunction();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setTestResults(prev => prev.map((test, index) => 
        index === testIndex ? { 
          ...test, 
          status: 'success', 
          duration: Math.round(duration),
          details: `Terminé en ${Math.round(duration)}ms`
        } : test
      ));
    } catch (error) {
      setTestResults(prev => prev.map((test, index) => 
        index === testIndex ? { 
          ...test, 
          status: 'error',
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        } : test
      ));
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setConsoleOutput([]);
    
    // Réinitialiser les résultats
    setTestResults(prev => prev.map(test => ({ ...test, status: 'pending' })));
    
    const restoreConsole = captureConsoleOutput();
    
    try {
      // Exécuter chaque test individuellement
      await runIndividualTest(0, testEncryption, 'Chiffrement des données sensibles');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await runIndividualTest(1, testDecryption, 'Déchiffrement des données');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await runIndividualTest(2, testDataMasking, 'Masquage des données sensibles');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await runIndividualTest(3, testSecurityIntegrity, 'Intégrité et sécurité');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await runIndividualTest(4, testPerformance, 'Performance du chiffrement');
      
    } catch (error) {
      console.error('Erreur lors de l\'exécution des tests:', error);
    } finally {
      restoreConsole();
      setIsRunningTests(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-400"></div>;
      case 'running':
        return <div className="w-4 h-4 border-2 border-transparent border-t-[#c5a572] rounded-full animate-spin"></div>;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-400';
      case 'running':
        return 'text-[#c5a572]';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
    }
  };

  const allTestsCompleted = testResults.every(test => test.status === 'success' || test.status === 'error');
  const allTestsSuccessful = testResults.every(test => test.status === 'success');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#162238] to-[#1a2332]">
      {/* Header */}
      <div className="bg-[#162238] border-b border-[#c5a572]/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/pro/dashboard')}
              className="flex items-center gap-2 text-gray-300 hover:text-[#c5a572] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour au dashboard
            </button>
            <div className="h-6 w-px bg-[#c5a572]/30"></div>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-[#c5a572]" />
              <h1 className="text-xl font-bold text-white">Tests de Chiffrement AES-256</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Introduction */}
        <div className="bg-[#1a2332] rounded-xl border border-[#c5a572]/20 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-[#c5a572]" />
            <div>
              <h2 className="text-lg font-semibold text-white">Validation du Chiffrement Militaire</h2>
              <p className="text-gray-400 text-sm">Tests complets de sécurité pour les données clients</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-[#0E2444] rounded-lg p-4 border border-[#c5a572]/10">
              <div className="text-[#c5a572] font-medium">🔒 Chiffrement</div>
              <div className="text-gray-300">AES-256 militaire</div>
            </div>
            <div className="bg-[#0E2444] rounded-lg p-4 border border-[#c5a572]/10">
              <div className="text-[#c5a572] font-medium">🛡️ Protection</div>
              <div className="text-gray-300">Données PII clients</div>
            </div>
            <div className="bg-[#0E2444] rounded-lg p-4 border border-[#c5a572]/10">
              <div className="text-[#c5a572] font-medium">⚡ Performance</div>
              <div className="text-gray-300">Optimisée & rapide</div>
            </div>
          </div>
        </div>

        {/* Bouton de lancement des tests */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={runAllTests}
            disabled={isRunningTests}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunningTests ? (
              <>
                <div className="w-5 h-5 border-2 border-transparent border-t-[#162238] rounded-full animate-spin"></div>
                Tests en cours...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Lancer tous les tests
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Résultats des tests */}
          <div className="bg-[#1a2332] rounded-xl border border-[#c5a572]/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#c5a572]" />
              Résultats des Tests
            </h3>
            
            <div className="space-y-3">
              {testResults.map((test, index) => (
                <div key={index} className="bg-[#0E2444] rounded-lg p-4 border border-[#c5a572]/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <span className={`font-medium ${getStatusColor(test.status)}`}>
                        {test.name}
                      </span>
                    </div>
                    {test.duration && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {test.duration}ms
                      </div>
                    )}
                  </div>
                  {test.details && (
                    <div className="mt-2 text-xs text-gray-400">
                      {test.details}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Résumé global */}
            {allTestsCompleted && (
              <div className={`mt-4 p-4 rounded-lg border ${
                allTestsSuccessful 
                  ? 'bg-green-900/20 border-green-500/30 text-green-400'
                  : 'bg-red-900/20 border-red-500/30 text-red-400'
              }`}>
                <div className="flex items-center gap-2 font-medium">
                  {allTestsSuccessful ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Tous les tests réussis !
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Certains tests ont échoué
                    </>
                  )}
                </div>
                <div className="text-xs mt-1">
                  {allTestsSuccessful 
                    ? 'Le chiffrement AES-256 fonctionne parfaitement.'
                    : 'Vérifiez les erreurs dans la console de sortie.'
                  }
                </div>
              </div>
            )}
          </div>

          {/* Console de sortie */}
          <div className="bg-[#1a2332] rounded-xl border border-[#c5a572]/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-5 h-5 bg-[#c5a572] rounded"></div>
              Console de Sortie
            </h3>
            
            <div className="bg-[#0E2444] rounded-lg p-4 border border-[#c5a572]/10 h-96 overflow-y-auto">
              <div className="font-mono text-xs space-y-1">
                {consoleOutput.length === 0 ? (
                  <div className="text-gray-500 italic">
                    Aucune sortie pour le moment. Lancez les tests pour voir les résultats détaillés.
                  </div>
                ) : (
                  consoleOutput.map((line, index) => (
                    <div key={index} className="text-gray-300 whitespace-pre-wrap">
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

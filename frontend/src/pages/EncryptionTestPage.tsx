import React, { useState } from 'react';
import { ChevronLeft, Shield, Play, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { runAllEncryptionTests, testEncryption, testDecryption, testDataMasking, testSecurityIntegrity, testPerformance } from '../tests/ClientDataEncryption.test';

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

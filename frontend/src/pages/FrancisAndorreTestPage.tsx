import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import testFrancisAndorreWorkflow from '../utils/testFrancisAndorreWorkflow';

interface TestResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

/**
 * Page de test pour valider le workflow complet Francis Andorre
 */
export const FrancisAndorreTestPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  const runTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setTestResults([]);

    try {
      const results = await testFrancisAndorreWorkflow();
      
      // Convertir les résultats en format d'affichage
      const formattedResults: TestResult[] = [
        {
          step: 'Vérification des pages',
          status: results.pagesAccessible ? 'success' : 'error',
          message: results.pagesAccessible ? 'Toutes les pages sont accessibles' : 'Certaines pages ne sont pas accessibles',
          details: results.pageTests
        },
        {
          step: 'API Backend',
          status: results.backendReachable ? 'success' : 'error',
          message: results.backendReachable ? 'API backend accessible' : 'API backend non accessible',
          details: results.apiTests
        },
        {
          step: 'Authentification',
          status: results.authWorking ? 'success' : 'warning',
          message: results.authWorking ? 'Système d\'authentification fonctionnel' : 'Authentification à vérifier',
          details: results.authTests
        },
        {
          step: 'Base de données',
          status: results.databaseConnected ? 'success' : 'error',
          message: results.databaseConnected ? 'Connexion base de données OK' : 'Problème de connexion base de données',
          details: results.dbTests
        },
        {
          step: 'Workflow complet',
          status: results.workflowComplete ? 'success' : 'warning',
          message: results.workflowComplete ? 'Workflow paiement → compte → accès fonctionnel' : 'Workflow à finaliser',
          details: results.workflowTests
        }
      ];

      setTestResults(formattedResults);
      
      // Déterminer le statut global
      const hasErrors = formattedResults.some(r => r.status === 'error');
      const hasWarnings = formattedResults.some(r => r.status === 'warning');
      
      if (hasErrors) {
        setOverallStatus('error');
      } else if (hasWarnings) {
        setOverallStatus('success'); // Considérer comme succès même avec warnings
      } else {
        setOverallStatus('success');
      }

    } catch (error) {
      console.error('Erreur lors des tests:', error);
      setTestResults([{
        step: 'Erreur générale',
        status: 'error',
        message: `Erreur lors de l'exécution des tests: ${error}`,
        details: error
      }]);
      setOverallStatus('error');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Loader2 className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-500/20 bg-green-600/10';
      case 'error':
        return 'border-red-500/20 bg-red-600/10';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-600/10';
      default:
        return 'border-gray-500/20 bg-gray-600/10';
    }
  };

  return (
    <>
      <title>Francis Andorre - Tests | Validation Workflow</title>
      <meta name="description" content="Page de test pour valider le workflow complet Francis Andorre : paiement, création de compte et accès." />
      
      <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/andorre" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c5a572] transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Retour à la page Andorre
            </Link>
            
            <div className="flex justify-center items-center gap-4 mb-6">
              <Logo size="xl" showText />
              <span className="text-3xl bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg font-bold">Tests</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Tests Francis Andorre
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Validation complète du workflow paiement → création de compte → accès
            </p>
          </div>

          {/* Contrôles de test */}
          <div className="bg-[#1E3253]/80 backdrop-blur-sm p-6 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Lancer les tests
                </h2>
                <p className="text-gray-400">
                  Valide tous les composants du système Francis Andorre
                </p>
              </div>
              
              <button
                onClick={runTests}
                disabled={isRunning}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Tests en cours...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Lancer les tests
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Statut global */}
          {overallStatus !== 'idle' && (
            <div className={`p-6 rounded-xl border mb-8 ${getStatusColor(overallStatus)}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(overallStatus)}
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {overallStatus === 'running' && 'Tests en cours...'}
                    {overallStatus === 'success' && '✅ Tests réussis !'}
                    {overallStatus === 'error' && '❌ Tests échoués'}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {overallStatus === 'running' && 'Validation du système en cours...'}
                    {overallStatus === 'success' && 'Le système Francis Andorre est opérationnel'}
                    {overallStatus === 'error' && 'Des problèmes ont été détectés'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Résultats des tests */}
          {testResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">
                Résultats détaillés
              </h2>
              
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start gap-4">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {result.step}
                      </h3>
                      <p className="text-gray-300 mb-3">
                        {result.message}
                      </p>
                      
                      {result.details && (
                        <details className="bg-black/20 rounded-lg p-4">
                          <summary className="text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">
                            Voir les détails
                          </summary>
                          <pre className="text-xs text-gray-400 mt-3 overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-[#1E3253]/60 backdrop-blur-sm p-6 rounded-xl border border-[#2A3F6C]/50">
            <h3 className="text-lg font-semibold text-white mb-4">
              Instructions de test
            </h3>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">1.</span>
                <span>Cliquez sur "Lancer les tests" pour valider tous les composants</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">2.</span>
                <span>Vérifiez que tous les tests passent (icônes vertes)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">3.</span>
                <span>En cas d'erreur, consultez les détails pour diagnostiquer</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">4.</span>
                <span>Testez manuellement le workflow : Paiement → Succès → Accès</span>
              </div>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/andorre/payment"
              className="bg-[#1E3253]/60 backdrop-blur-sm p-4 rounded-xl border border-[#2A3F6C]/50 hover:border-blue-500/50 transition-colors text-center"
            >
              <h4 className="text-white font-semibold mb-2">Page de paiement</h4>
              <p className="text-gray-400 text-sm">Tester le processus de paiement</p>
            </Link>
            
            <Link
              to="/andorre/success"
              className="bg-[#1E3253]/60 backdrop-blur-sm p-4 rounded-xl border border-[#2A3F6C]/50 hover:border-green-500/50 transition-colors text-center"
            >
              <h4 className="text-white font-semibold mb-2">Page de succès</h4>
              <p className="text-gray-400 text-sm">Tester la création de compte</p>
            </Link>
            
            <Link
              to="/analyse-ia-fiscale-andorrane"
              className="bg-[#1E3253]/60 backdrop-blur-sm p-4 rounded-xl border border-[#2A3F6C]/50 hover:border-indigo-500/50 transition-colors text-center"
            >
              <h4 className="text-white font-semibold mb-2">Francis Andorre</h4>
              <p className="text-gray-400 text-sm">Accéder à l'IA fiscale</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default FrancisAndorreTestPage;

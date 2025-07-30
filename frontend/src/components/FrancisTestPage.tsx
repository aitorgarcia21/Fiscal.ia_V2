import React, { useState, useEffect } from 'react';
import { FrancisAIEngine } from '../ai/FrancisAIEngine';

interface TestResult {
  name: string;
  input: string;
  success: boolean;
  output?: any;
  error?: string;
  duration?: number;
}

const FrancisTestPage: React.FC = () => {
  const [francis] = useState(() => new FrancisAIEngine());
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const testCases = [
    {
      name: '💰 IRPF Calculation - 50k€',
      input: 'Calcule mon IRPF pour un salaire de 50000 euros'
    },
    {
      name: '💰 IRPF Calculation - 30k€', 
      input: 'Combien je paierai d\'impôt avec 30000€ de revenus ?'
    },
    {
      name: '📚 General IRPF Info',
      input: 'Comment fonctionne l\'IRPF en Andorre ?'
    },
    {
      name: '🎯 Optimization Advice',
      input: 'Comment optimiser ma fiscalité andorrane ?'
    },
    {
      name: '🏢 Corporate Tax Info',
      input: 'Quel est le taux d\'IS pour une société ?'
    },
    {
      name: '💼 IGI Information',
      input: 'Qu\'est-ce que l\'IGI en Andorre ?'
    }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results: TestResult[] = [];
    
    for (const testCase of testCases) {
      setCurrentTest(testCase.name);
      
      const startTime = Date.now();
      
      try {
        const context = { previousMessages: [] };
        const response = await francis.processMessage(testCase.input, context);
        
        const duration = Date.now() - startTime;
        
        results.push({
          name: testCase.name,
          input: testCase.input,
          success: true,
          output: response,
          duration
        });
        
      } catch (error) {
        const duration = Date.now() - startTime;
        
        results.push({
          name: testCase.name,
          input: testCase.input,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration
        });
      }
      
      setTestResults([...results]);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    }
    
    setIsRunning(false);
    setCurrentTest('');
  };

  const testCalculatorDirectly = () => {
    try {
      const testIncomes = [25000, 35000, 50000, 75000, 100000];
      
      console.log('🧮 DIRECT CALCULATOR TESTS');
      
      testIncomes.forEach(income => {
        // @ts-ignore - accessing private property for testing
        const result = francis.calculators.irpf(income);
        console.log(`💰 Income ${income.toLocaleString()}€:`, result);
      });
      
      return true;
    } catch (error) {
      console.error('❌ Calculator test failed:', error);
      return false;
    }
  };

  const passedTests = testResults.filter(r => r.success).length;
  const totalTests = testResults.length;
  const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-[#0A192F] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          🧪 Francis AI Engine - Test Suite
        </h1>
        
        <div className="mb-6 text-center">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold mr-4"
          >
            {isRunning ? '⏳ Running Tests...' : '🚀 Run All Tests'}
          </button>
          
          <button
            onClick={testCalculatorDirectly}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold"
          >
            🧮 Test Calculators (Console)
          </button>
        </div>

        {isRunning && currentTest && (
          <div className="text-center mb-6 p-4 bg-blue-900/30 rounded-lg">
            <p className="text-blue-300">Currently testing: {currentTest}</p>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-bold mb-2">📊 Test Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-900/30 p-3 rounded">
                <div className="text-2xl font-bold text-green-400">✅ {passedTests}</div>
                <div className="text-sm text-green-300">Passed</div>
              </div>
              <div className="bg-red-900/30 p-3 rounded">
                <div className="text-2xl font-bold text-red-400">❌ {totalTests - passedTests}</div>
                <div className="text-sm text-red-300">Failed</div>
              </div>
              <div className="bg-blue-900/30 p-3 rounded">
                <div className="text-2xl font-bold text-blue-400">{successRate}%</div>
                <div className="text-sm text-blue-300">Success Rate</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                result.success 
                  ? 'bg-green-900/20 border-green-500' 
                  : 'bg-red-900/20 border-red-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">
                  {result.success ? '✅' : '❌'} {result.name}
                </h3>
                <span className="text-sm text-gray-400">
                  {result.duration}ms
                </span>
              </div>
              
              <p className="text-gray-300 mb-3">
                <strong>Input:</strong> "{result.input}"
              </p>
              
              {result.success && result.output ? (
                <div className="space-y-2">
                  <div className="bg-gray-800 p-3 rounded">
                    <strong>Response:</strong> 
                    <p className="mt-1 text-gray-300">{result.output.text}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Confidence:</strong> {(result.output.confidence * 100).toFixed(1)}%
                    </div>
                    <div>
                      <strong>Law References:</strong> {result.output.lawReferences?.join(', ') || 'None'}
                    </div>
                  </div>
                  
                  {result.output.calculations && (
                    <div className="bg-blue-900/30 p-3 rounded">
                      <strong>💰 Calculations:</strong>
                      <pre className="text-xs mt-1 overflow-x-auto">
                        {JSON.stringify(result.output.calculations.results, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {result.output.followUpQuestions?.length > 0 && (
                    <div className="bg-purple-900/30 p-3 rounded">
                      <strong>❓ Follow-up Questions:</strong>
                      <ul className="mt-1 text-sm">
                        {result.output.followUpQuestions.map((q: string, i: number) => (
                          <li key={i}>• {q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-900/30 p-3 rounded">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
            </div>
          ))}
        </div>

        {!isRunning && totalTests === 0 && (
          <div className="text-center text-gray-400 py-12">
            Click "Run All Tests" to start testing the Francis AI Engine
          </div>
        )}
      </div>
    </div>
  );
};

export default FrancisTestPage;

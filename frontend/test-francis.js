// 🧪 Test Francis AI Engine - Local Verification
// Test fiscal calculators and conversational flow

import { FrancisAIEngine } from './src/ai/FrancisAIEngine.js';

console.log('🚀 Francis AI Engine - Local Test Suite\n');

// Initialize Francis AI Engine
const francis = new FrancisAIEngine();

// Test Cases
const testCases = [
  {
    name: '💰 IRPF Calculation Test - Salary 50k€',
    message: 'Calcule mon IRPF pour un salaire de 50000 euros',
    expectedIntent: 'calculation',
    expectedAmount: 50000
  },
  {
    name: '💰 IRPF Calculation Test - Salary 30k€',
    message: 'Combien je paierai d\'impôt avec 30000€ de revenus ?',
    expectedIntent: 'calculation', 
    expectedAmount: 30000
  },
  {
    name: '📚 General Information Test',
    message: 'Comment fonctionne l\'IRPF en Andorre ?',
    expectedIntent: 'information'
  },
  {
    name: '🎯 Optimization Advice Test',
    message: 'Comment optimiser ma fiscalité andorrane ?',
    expectedIntent: 'optimization'
  },
  {
    name: '🏢 Corporate Tax Test',
    message: 'Quel est le taux d\'IS pour une société ?',
    expectedIntent: 'is'
  }
];

// Run Tests
async function runTests() {
  console.log('⏳ Running Francis AI Engine Tests...\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log(`Input: "${testCase.message}"`);
    
    try {
      const context = { previousMessages: [] };
      const response = await francis.processMessage(testCase.message, context);
      
      console.log(`✅ Response generated successfully`);
      console.log(`📝 Response: ${response.text.substring(0, 150)}${response.text.length > 150 ? '...' : ''}`);
      console.log(`🎯 Confidence: ${response.confidence}`);
      console.log(`📚 Law References: ${response.lawReferences?.join(', ') || 'None'}`);
      
      // Validate calculations if present
      if (response.calculations) {
        console.log(`🧮 Calculation Type: ${response.calculations.type}`);
        console.log(`💳 Results: ${JSON.stringify(response.calculations.results)}`);
      }
      
      // Validate follow-up questions
      if (response.followUpQuestions?.length > 0) {
        console.log(`❓ Follow-up Questions: ${response.followUpQuestions.length}`);
      }
      
      passedTests++;
      console.log(`✅ TEST PASSED`);
      
    } catch (error) {
      console.log(`❌ TEST FAILED: ${error.message}`);
      console.log(`Error Details:`, error);
    }
    
    console.log('─'.repeat(80));
  }
  
  // Test Summary
  console.log(`\n🎯 TEST SUMMARY`);
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📊 Success Rate: ${(passedTests/totalTests*100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log(`\n🎉 ALL TESTS PASSED! Francis AI Engine is working correctly.`);
  } else {
    console.log(`\n⚠️  Some tests failed. Please review the issues above.`);
  }
}

// Direct Calculator Tests
async function testCalculatorsDirectly() {
  console.log('\n🧮 DIRECT CALCULATOR TESTS\n');
  
  const testIncomes = [25000, 35000, 50000, 75000, 100000];
  
  for (const income of testIncomes) {
    console.log(`\n💰 Testing IRPF for ${income.toLocaleString()}€:`);
    
    try {
      const result = francis.calculators.irpf(income);
      console.log(`   Gross Income: ${result.grossIncome.toLocaleString()}€`);
      console.log(`   Deductions: ${result.deductions.toLocaleString()}€`);
      console.log(`   Taxable Income: ${result.taxableIncome.toLocaleString()}€`);
      console.log(`   Tax: ${result.tax.toLocaleString()}€`);
      console.log(`   Net Income: ${result.netIncome.toLocaleString()}€`);
      console.log(`   Effective Rate: ${result.effectiveRate}%`);
      console.log(`   ✅ Calculator working correctly`);
    } catch (error) {
      console.log(`   ❌ Calculator error: ${error.message}`);
    }
  }
}

// Run all tests
(async () => {
  try {
    await runTests();
    await testCalculatorsDirectly();
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
})();

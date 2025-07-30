// 🧪 Test Direct Francis AI Engine
import { FrancisAIEngine } from './src/ai/FrancisAIEngine';

async function testFrancisAI() {
  console.log('🚀 Francis AI Engine - Test Direct\n');
  
  // Initialiser Francis
  const francis = new FrancisAIEngine();
  console.log('✅ Francis AI Engine initialisé\n');
  
  // Test 1: Calcul IRPF 50k€
  console.log('💰 TEST 1: Calcul IRPF 50 000€');
  try {
    const response1 = await francis.processMessage('Calcule mon IRPF pour 50000 euros', { previousMessages: [] });
    console.log('✅ Réponse générée:', response1.text.substring(0, 200) + '...');
    console.log('📊 Confiance:', response1.confidence);
    console.log('🧮 Calculs:', response1.calculations ? 'Présents' : 'Absents');
    console.log('📚 Références légales:', response1.lawReferences?.join(', ') || 'Aucune');
    console.log('');
  } catch (error) {
    console.log('❌ Erreur:', error);
  }
  
  // Test 2: Calcul IRPF 30k€
  console.log('💰 TEST 2: Calcul IRPF 30 000€');
  try {
    const response2 = await francis.processMessage('Combien je paie d\'impôt avec 30000€ ?', { previousMessages: [] });
    console.log('✅ Réponse générée:', response2.text.substring(0, 200) + '...');
    console.log('📊 Confiance:', response2.confidence);
    console.log('🧮 Calculs:', response2.calculations ? 'Présents' : 'Absents');
    console.log('');
  } catch (error) {
    console.log('❌ Erreur:', error);
  }
  
  // Test 3: Info générale IRPF
  console.log('📚 TEST 3: Information générale IRPF');
  try {
    const response3 = await francis.processMessage('Comment fonctionne l\'IRPF en Andorre ?', { previousMessages: [] });
    console.log('✅ Réponse générée:', response3.text.substring(0, 200) + '...');
    console.log('📊 Confiance:', response3.confidence);
    console.log('❓ Questions de suivi:', response3.followUpQuestions?.length || 0);
    console.log('');
  } catch (error) {
    console.log('❌ Erreur:', error);
  }
  
  // Test 4: Conseils d'optimisation
  console.log('🎯 TEST 4: Conseils optimisation');
  try {
    const response4 = await francis.processMessage('Comment optimiser ma fiscalité ?', { previousMessages: [] });
    console.log('✅ Réponse générée:', response4.text.substring(0, 200) + '...');
    console.log('📊 Confiance:', response4.confidence);
    console.log('');
  } catch (error) {
    console.log('❌ Erreur:', error);
  }
  
  // Test 5: Test calculateur direct
  console.log('🧮 TEST 5: Calculateurs directs');
  try {
    // Test des revenus types
    const testIncomes = [25000, 35000, 50000, 75000, 100000];
    
    console.log('Calculs IRPF directs:');
    testIncomes.forEach(income => {
      // @ts-ignore - accès aux calculateurs privés pour test
      const result = francis.calculators.irpf(income);
      console.log(`  ${income.toLocaleString()}€ → Impôt: ${result.tax.toLocaleString()}€ (${result.effectiveRate}%)`);
    });
    
    console.log('✅ Tous les calculateurs fonctionnent');
  } catch (error) {
    console.log('❌ Erreur calculateurs:', error);
  }
  
  console.log('\n🎉 Tests terminés !');
}

// Exécuter les tests
testFrancisAI().catch(console.error);

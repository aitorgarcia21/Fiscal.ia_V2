// Test direct de l'authentification Supabase avec les variables d'environnement
const { createClient } = require('@supabase/supabase-js');

// Variables d'environnement directes
const SUPABASE_URL = 'https://lqxfjjtjxktjgpekugtf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTgyMDMsImV4cCI6MjA2MzM3NDIwM30.-E66kbBxRAVcJcPdhhUJWq5BZB-2GRpiBEaGtiWLVrA';

console.log('🔍 TEST DIRECT AUTHENTIFICATION SUPABASE');
console.log('======================================');

// Créer le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuth() {
  console.log('\n1️⃣ Test de connexion avec le compte existant:');
  console.log('Email: aitorgarcia2112@gmail.com');
  console.log('Mot de passe: 21AiPa01....');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'aitorgarcia2112@gmail.com',
      password: '21AiPa01....'
    });
    
    if (error) {
      console.error('❌ Erreur:', error);
      console.log('\nDétails de l\'erreur:');
      console.log('- Message:', error.message);
      console.log('- Status:', error.status);
      console.log('- Name:', error.name);
    } else {
      console.log('✅ Connexion réussie !');
      console.log('User:', data.user);
    }
  } catch (e) {
    console.error('💥 Exception:', e);
  }
  
  console.log('\n2️⃣ Test avec le compte test:');
  console.log('Email: test.andorre@example.com');
  console.log('Mot de passe: test123');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test.andorre@example.com',
      password: 'test123'
    });
    
    if (error) {
      console.error('❌ Erreur:', error);
      console.log('\nDétails de l\'erreur:');
      console.log('- Message:', error.message);
      console.log('- Status:', error.status);
      console.log('- Name:', error.name);
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('\n🚨 Le mot de passe est incorrect !');
        console.log('Solutions possibles:');
        console.log('1. Réinitialiser le mot de passe via Dashboard Supabase');
        console.log('2. Authentication > Users > test.andorre@example.com > Update password');
      }
    } else {
      console.log('✅ Connexion réussie !');
      console.log('User:', data.user);
    }
  } catch (e) {
    console.error('💥 Exception:', e);
  }
  
  console.log('\n3️⃣ Vérifier les settings d\'authentification:');
  console.log('- Allez dans Dashboard Supabase > Authentication > Providers');
  console.log('- Vérifiez que "Email" est activé');
  console.log('- Pour les tests, désactivez "Confirm email"');
}

testAuth();

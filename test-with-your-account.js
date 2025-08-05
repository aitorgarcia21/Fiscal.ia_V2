// Test simple avec VOTRE compte existant
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lqxfjjtjxktjgpekugtf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTgyMDMsImV4cCI6MjA2MzM3NDIwM30.-E66kbBxRAVcJcPdhhUJWq5BZB-2GRpiBEaGtiWLVrA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ TEST AVEC VOTRE COMPTE EXISTANT');
console.log('==================================\n');

// Test avec votre compte qui fonctionne
async function testYourAccount() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'aitorgarcia2112@gmail.com',
    password: '21AiPa01....'
  });
  
  if (error) {
    console.error('❌ Erreur:', error);
  } else {
    console.log('✅ Connexion réussie !');
    console.log('🔑 Token:', data.session.access_token.substring(0, 50) + '...');
    
    // Vérifier le profil Francis Andorre
    const { data: profile, error: profileError } = await supabase
      .from('profils_francis_andorre')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
      
    if (profile) {
      console.log('\n📊 Profil Francis Andorre trouvé:');
      console.log('- Nom:', profile.nom);
      console.log('- Prénom:', profile.prenom);
      console.log('- Entreprise:', profile.entreprise);
      console.log('- Statut abonnement:', profile.subscription_status);
      console.log('- Stripe ID:', profile.stripe_subscription_id);
    } else {
      console.log('\n⚠️  Pas de profil Francis Andorre trouvé');
      console.log('Erreur:', profileError);
    }
    
    console.log('\n✅ AUTHENTIFICATION SUPABASE FONCTIONNELLE !');
    console.log('Le problème n\'est pas la configuration mais le compte test.');
  }
}

testYourAccount();

// Test final après reset du mot de passe
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lqxfjjtjxktjgpekugtf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTgyMDMsImV4cCI6MjA2MzM3NDIwM30.-E66kbBxRAVcJcPdhhUJWq5BZB-2GRpiBEaGtiWLVrA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFinal() {
  console.log('✅ TEST FINAL - Compte test après reset');
  console.log('=====================================\n');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test.andorre@example.com',
      password: 'test123'
    });
    
    if (error) {
      console.error('❌ Échec:', error.message);
    } else {
      console.log('🎉 CONNEXION RÉUSSIE !');
      console.log('\n📌 Informations utilisateur:');
      console.log('- ID:', data.user.id);
      console.log('- Email:', data.user.email);
      console.log('- Confirmé:', data.user.email_confirmed_at ? '✅' : '❌');
      console.log('- Metadata:', data.user.user_metadata);
      
      // Vérifier le profil Francis Andorre
      const { data: profile } = await supabase
        .from('profils_francis_andorre')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
        
      if (profile) {
        console.log('\n📊 Profil Francis Andorre:');
        console.log('- Nom:', profile.nom);
        console.log('- Prénom:', profile.prenom);
        console.log('- Statut abonnement:', profile.subscription_status);
        console.log('- Entreprise:', profile.entreprise);
      }
      
      console.log('\n✅ TOUT EST OPÉRATIONNEL !');
      console.log('👉 Testez maintenant sur: http://localhost:3000/andorre/login');
      console.log('👉 Ou en production: https://fiscal-ia-v2-production.up.railway.app/andorre/login');
    }
  } catch (e) {
    console.error('💥 Exception:', e);
  }
}

testFinal();

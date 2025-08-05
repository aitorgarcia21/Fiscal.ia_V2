// Créer le compte test via l'API Admin Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lqxfjjtjxktjgpekugtf.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc5ODIwMywiZXhwIjoyMDYzMzc0MjAzfQ.8VWgJlJJGDmziDaRnxY-OedIXMD7DO9xgZsIxcVUVc0';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestAccount() {
  console.log('🚀 Création du compte test Francis Andorre...\n');
  
  try {
    // 1. Créer l'utilisateur
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: 'test.andorre@example.com',
      password: 'test123',
      email_confirm: true,
      user_metadata: {
        nom: 'Test',
        prenom: 'Andorre',
        entreprise: 'Test Company',
        telephone: '+376 123 456',
        francis_andorre: 'true',
        langue: 'fr'
      }
    });
    
    if (createError) {
      console.error('❌ Erreur création utilisateur:', createError);
      return;
    }
    
    console.log('✅ Utilisateur créé avec succès !');
    console.log('- ID:', user.user.id);
    console.log('- Email:', user.user.email);
    
    // 2. Créer le profil Francis Andorre
    const { error: profileError } = await supabase
      .from('profils_francis_andorre')
      .insert({
        user_id: user.user.id,
        nom: 'Test',
        prenom: 'Andorre',
        entreprise: 'Test Company',
        telephone: '+376 123 456',
        subscription_status: 'active',
        stripe_subscription_id: 'sub_test_' + Date.now(),
        created_at: new Date().toISOString()
      });
      
    if (profileError) {
      console.error('❌ Erreur création profil:', profileError);
    } else {
      console.log('✅ Profil Francis Andorre créé !');
    }
    
    console.log('\n🎉 COMPTE TEST CRÉÉ AVEC SUCCÈS !');
    console.log('=====================================');
    console.log('📧 Email: test.andorre@example.com');
    console.log('🔑 Mot de passe: test123');
    console.log('✅ Statut: Abonnement actif (sans paiement)');
    console.log('\n👉 Testez sur: http://localhost:3000/andorre/login');
    console.log('👉 Ou en production: https://fiscal-ia-v2-production.up.railway.app/andorre/login');
    
  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

createTestAccount();

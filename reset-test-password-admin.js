// Reset du mot de passe via Supabase Admin API
const { createClient } = require('@supabase/supabase-js');

// Vos vraies clés
const SUPABASE_URL = 'https://lqxfjjtjxktjgpekugtf.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc5ODIwMywiZXhwIjoyMDYzMzc0MjAzfQ.8VWgJlJJGDmziDaRnxY-OedIXMD7DO9xgZsIxcVUVc0';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetTestPassword() {
  console.log('🔧 Reset du mot de passe pour test.andorre@example.com...');
  
  try {
    // D'abord, récupérer l'ID de l'utilisateur
    const { data: users, error: searchError } = await supabase.auth.admin.listUsers({
      filter: {
        email: 'test.andorre@example.com'
      }
    });
    
    if (searchError) {
      console.error('❌ Erreur recherche utilisateur:', searchError);
      return;
    }
    
    if (!users || users.users.length === 0) {
      console.error('❌ Utilisateur test.andorre@example.com non trouvé');
      return;
    }
    
    const userId = users.users[0].id;
    console.log('📌 ID utilisateur trouvé:', userId);
    
    // Mettre à jour le mot de passe
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        password: 'test123',
        email_confirm: true
      }
    );
    
    if (error) {
      console.error('❌ Erreur mise à jour:', error);
    } else {
      console.log('✅ Mot de passe mis à jour avec succès !');
      console.log('\n🎉 Vous pouvez maintenant vous connecter avec:');
      console.log('📧 Email: test.andorre@example.com');
      console.log('🔑 Mot de passe: test123');
      console.log('\n👉 Testez sur: http://localhost:3000/andorre/login');
    }
  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

resetTestPassword();

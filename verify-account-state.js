// Vérifier l'état du compte test avec l'API Admin
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lqxfjjtjxktjgpekugtf.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc5ODIwMywiZXhwIjoyMDYzMzc0MjAzfQ.8VWgJlJJGDmziDaRnxY-OedIXMD7DO9xgZsIxcVUVc0';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyAccount() {
  console.log('🔍 Vérification de l\'état du compte test.andorre@example.com\n');
  
  try {
    // Lister tous les utilisateurs avec cet email
    const { data: users, error } = await supabase.auth.admin.listUsers({
      filter: {
        email: 'test.andorre@example.com'
      }
    });
    
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    console.log(`📊 Nombre d'utilisateurs trouvés: ${users.users.length}\n`);
    
    users.users.forEach((user, index) => {
      console.log(`👤 Utilisateur ${index + 1}:`);
      console.log('- ID:', user.id);
      console.log('- Email:', user.email);
      console.log('- Email confirmé:', user.email_confirmed_at ? '✅' : '❌');
      console.log('- Créé le:', user.created_at);
      console.log('- Dernière connexion:', user.last_sign_in_at || 'Jamais');
      console.log('- Metadata:', JSON.stringify(user.user_metadata, null, 2));
      console.log('');
    });
    
    // Si plusieurs utilisateurs existent, c'est peut-être le problème
    if (users.users.length > 1) {
      console.log('⚠️  ATTENTION: Plusieurs utilisateurs avec le même email !');
      console.log('Cela peut causer des problèmes de connexion.');
      console.log('\nSupprimez les doublons et gardez seulement celui avec l\'ID:');
      console.log(users.users[0].id);
    }
    
    // Proposer de réinitialiser le mot de passe du premier utilisateur trouvé
    if (users.users.length > 0) {
      console.log('\n🔧 Réinitialisation du mot de passe pour l\'utilisateur principal...');
      
      const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        users.users[0].id,
        { 
          password: 'test123',
          email_confirm: true
        }
      );
      
      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour:', updateError);
      } else {
        console.log('✅ Mot de passe réinitialisé avec succès !');
        console.log('\n📧 Email: test.andorre@example.com');
        console.log('🔑 Mot de passe: test123');
      }
    }
    
  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

verifyAccount();

// Script Node.js pour reset le mot de passe via Supabase Admin API
// Nécessite: npm install @supabase/supabase-js

const { createClient } = require('@supabase/supabase-js');

// Remplacez ces valeurs par vos propres clés
const SUPABASE_URL = 'https://lqxfjjtjxktjgpekugtf.supabase.co';
const SUPABASE_SERVICE_KEY = 'VOTRE_SERVICE_ROLE_KEY'; // Trouvez-la dans Settings > API

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword() {
  try {
    // Mettre à jour le mot de passe
    const { data, error } = await supabase.auth.admin.updateUserById(
      '56267ccd-f862-40ce-b25f-5d3e051dc6d5', // ID de l'utilisateur test
      { password: 'test123' }
    );
    
    if (error) {
      console.error('Erreur:', error);
    } else {
      console.log('✅ Mot de passe mis à jour avec succès !');
      console.log('Vous pouvez maintenant vous connecter avec:');
      console.log('Email: test.andorre@example.com');
      console.log('Mot de passe: test123');
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

resetPassword();

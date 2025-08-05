// Script de debug pour vérifier la configuration Supabase Auth
import { supabase } from './lib/supabase';

export async function debugSupabaseAuth() {
  console.log('🔍 DEBUG SUPABASE AUTH');
  console.log('=====================================');
  
  // 1. Vérifier la configuration
  console.log('📌 Configuration Supabase:');
  console.log('- URL:', import.meta.env.VITE_SUPABASE_URL || 'NON DÉFINIE');
  console.log('- Anon Key présente:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  
  // 2. Tester la connexion Supabase
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('- Session actuelle:', session ? 'Active' : 'Aucune');
  } catch (error) {
    console.error('❌ Erreur getSession:', error);
  }
  
  // 3. Tester la connexion avec des identifiants de test
  console.log('\n📌 Test de connexion:');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test.andorre@example.com',
      password: 'test123'
    });
    
    if (error) {
      console.error('❌ Erreur de connexion:', {
        message: error.message,
        status: error.status,
        name: error.name,
        __isAuthError: error.__isAuthError
      });
      
      // Vérifier si c'est un problème de configuration
      if (error.message.includes('not enabled') || error.message.includes('disabled')) {
        console.error('🚨 L\'authentification par email/password n\'est pas activée dans Supabase !');
        console.log('👉 Allez dans Dashboard Supabase > Authentication > Providers');
        console.log('👉 Activez "Email" et désactivez "Confirm email"');
      }
    } else {
      console.log('✅ Connexion réussie:', data);
    }
  } catch (error) {
    console.error('💥 Exception:', error);
  }
  
  // 4. Vérifier les providers activés
  console.log('\n📌 Providers d\'authentification:');
  console.log('- Vérifiez dans votre Dashboard Supabase > Authentication > Providers');
  console.log('- Email doit être activé');
  console.log('- "Confirm email" devrait être désactivé pour les tests');
}

// Exporter pour utilisation dans la console
(window as any).debugSupabaseAuth = debugSupabaseAuth;

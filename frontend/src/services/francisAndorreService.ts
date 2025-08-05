import { supabase } from '../lib/supabase';

interface FrancisAndorreSignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
}

interface FrancisAndorreProfile {
  user_id: string;
  prenom: string;
  nom: string;
  entreprise?: string;
  telephone?: string;
  subscription_status: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export class FrancisAndorreService {
  /**
   * Créer un compte utilisateur Francis Andorre après paiement
   */
  static async createAccountAfterPayment(): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      // Récupérer les données d'inscription stockées
      const signupDataStr = localStorage.getItem('andorre_signup_data');
      if (!signupDataStr) {
        throw new Error('Aucune donnée d\'inscription trouvée');
      }

      const signupData: FrancisAndorreSignupData = JSON.parse(signupDataStr);
      
      // Vérifier que les données ne sont pas trop anciennes (24h max)
      const timestamp = (signupData as any).timestamp;
      if (timestamp && Date.now() - timestamp > 24 * 60 * 60 * 1000) {
        throw new Error('Les données d\'inscription ont expiré');
      }

      // 1. Créer le compte utilisateur Supabase avec metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            francis_andorre: 'true',
            prenom: signupData.firstName,
            nom: signupData.lastName,
            entreprise: signupData.company,
            telephone: signupData.phone,
            signup_data: signupData,
            payment_intent: localStorage.getItem('francis_andorre_payment_intent'),
            langue: 'fr'
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erreur lors de la création du compte');
      }

      // 2. Le trigger Supabase créera automatiquement le profil Francis Andorre
      // grâce à handle_new_francis_andorre_user()

      // 3. Nettoyer le localStorage
      localStorage.removeItem('andorre_signup_data');
      localStorage.removeItem('francis_andorre_payment_intent');
      localStorage.removeItem('francis_andorre_payment_timestamp');

      // 4. Se connecter automatiquement
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: signupData.email,
        password: signupData.password
      });

      if (signInError) {
        console.warn('Connexion automatique échouée:', signInError);
      }

      return { success: true, user: authData.user };
    } catch (error: any) {
      console.error('Erreur création compte Francis Andorre:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la création du compte' 
      };
    }
  }

  /**
   * Vérifier si un utilisateur a un abonnement Francis Andorre actif
   */
  static async checkSubscriptionStatus(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profils_francis_andorre')
        .select('subscription_status, subscription_end_date')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return false;
      }

      // Vérifier que l'abonnement est actif et non expiré
      const isActive = data.subscription_status === 'active';
      const notExpired = !data.subscription_end_date || new Date(data.subscription_end_date) > new Date();

      return isActive && notExpired;
    } catch (error) {
      console.error('Erreur vérification abonnement:', error);
      return false;
    }
  }

  /**
   * Récupérer le profil Francis Andorre d'un utilisateur
   */
  static async getUserProfile(userId: string): Promise<FrancisAndorreProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profils_francis_andorre')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur récupération profil:', error);
      return null;
    }
  }

  /**
   * Mettre à jour les informations Stripe après paiement
   */
  static async updateStripeInfo(
    userId: string, 
    stripeCustomerId: string, 
    stripeSubscriptionId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profils_francis_andorre')
        .update({
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Erreur mise à jour Stripe:', error);
      return false;
    }
  }

  /**
   * Vérifier si un email existe déjà dans Francis Andorre
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('francis_andorre_users_view')
        .select('user_id')
        .eq('email', email)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }
}

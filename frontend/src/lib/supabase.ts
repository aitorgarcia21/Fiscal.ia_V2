// @ts-ignore
import { createClient } from '@supabase/supabase-js';

// Types pour le profil utilisateur
export interface UserProfile {
  id?: string;
  user_id: string;
  situation_familiale: string;
  localisation: string;
  secteur_activite: string;
  regime_imposition: string;
  objectifs_financiers: string[];
  created_at?: string;
  updated_at?: string;
}

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration manquante. Les fonctionnalités liées à Supabase seront désactivées.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonctions helper pour la gestion des profils
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return null;
  }
};

// Fonction pour récupérer les utilisateurs similaires
export const getSimilarUsers = async (currentUserProfile: UserProfile) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*, users!inner(email)')
      .neq('user_id', currentUserProfile.user_id)
      .limit(10);
    
    if (error) throw error;
    
    // Calculer un score de similarité basique
    const usersWithScores = data.map(profile => {
      let score = 0;
      
      // Critères de matching
      const matchingCriteria = [];
      
      if (profile.situation_familiale === currentUserProfile.situation_familiale) {
        score += 30;
        matchingCriteria.push('Même situation familiale');
      }
      
      if (profile.localisation === currentUserProfile.localisation) {
        score += 25;
        matchingCriteria.push('Même localisation');
      }
      
      if (profile.secteur_activite === currentUserProfile.secteur_activite) {
        score += 25;
        matchingCriteria.push('Même secteur d\'activité');
      }
      
      if (profile.regime_imposition === currentUserProfile.regime_imposition) {
        score += 20;
        matchingCriteria.push('Même régime d\'imposition');
      }
      
      // Objectifs financiers communs
      const commonObjectives = profile.objectifs_financiers?.filter(obj => 
        currentUserProfile.objectifs_financiers?.includes(obj)
      ) || [];
      
      if (commonObjectives.length > 0) {
        score += commonObjectives.length * 10;
        matchingCriteria.push(`${commonObjectives.length} objectif(s) en commun`);
      }
      
      return {
        id: profile.id,
        email: profile.users?.email || 'Email non disponible',
        profile,
        similarityScore: score,
        matchingCriteria
      };
    });
    
    // Trier par score de similarité
    return usersWithScores
      .filter(user => user.similarityScore > 0)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 5); // Top 5 utilisateurs similaires
    
  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateurs similaires:', error);
    return [];
  }
};

// Types pour la collecte d'emails
export interface EmailSubscriber {
  id?: string;
  email: string;
  source?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  ip_address?: string;
  user_agent?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  metadata?: any;
}

// Fonction pour ajouter un email à la liste de collecte
export const addEmailSubscriber = async (emailData: {
  email: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  metadata?: any;
}) => {
  try {
    // Récupérer l'adresse IP et user agent côté client
    const ipAddress = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => data.ip)
      .catch(() => null);
    
    const userAgent = navigator.userAgent;
    
    // Utiliser la fonction PostgreSQL pour ajouter l'email
    const { data, error } = await supabase
      .rpc('add_email_subscriber', {
        p_email: emailData.email,
        p_source: emailData.source || 'email-collector',
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_utm_source: emailData.utm_source || null,
        p_utm_medium: emailData.utm_medium || null,
        p_utm_campaign: emailData.utm_campaign || null,
        p_metadata: emailData.metadata || null
      });
    
    if (error) throw error;
    
    return {
      success: data[0]?.success || false,
      message: data[0]?.message || 'Erreur inconnue',
      subscriber_id: data[0]?.subscriber_id || null
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'email:', error);
    return {
      success: false,
      message: 'Erreur lors de l\'ajout de l\'email',
      subscriber_id: null
    };
  }
};

// Fonction pour récupérer les statistiques des emails
export const getEmailStats = async () => {
  try {
    const { data, error } = await supabase
      .from('email_stats')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return null;
  }
};

// Fonction pour récupérer tous les emails collectés (pour admin)
export const getAllEmailSubscribers = async () => {
  try {
    const { data, error } = await supabase
      .from('email_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as EmailSubscriber[];
  } catch (error) {
    console.error('Erreur lors de la récupération des emails:', error);
    return [];
  }
};

// Fonction pour désabonner un email
export const unsubscribeEmail = async (email: string) => {
  try {
    const { data, error } = await supabase
      .rpc('unsubscribe_email', {
        p_email: email
      });
    
    if (error) throw error;
    
    return {
      success: data[0]?.success || false,
      message: data[0]?.message || 'Erreur inconnue'
    };
  } catch (error) {
    console.error('Erreur lors du désabonnement:', error);
    return {
      success: false,
      message: 'Erreur lors du désabonnement'
    };
  }
};

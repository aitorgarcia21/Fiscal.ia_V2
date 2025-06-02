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

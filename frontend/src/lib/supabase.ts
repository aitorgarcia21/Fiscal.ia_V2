import { createClient } from '@supabase/supabase-js'

// ATTENTION: Ces valeurs doivent être mises à jour avec votre nouveau projet Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://[VOTRE-PROJET].supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '[VOTRE-CLE-ANON]'

// Vérification des variables d'environnement
if (!supabaseUrl || supabaseUrl.includes('[VOTRE-PROJET]')) {
  console.error('❌ ERREUR: VITE_SUPABASE_URL non configuré correctement')
}
if (!supabaseAnonKey || supabaseAnonKey.includes('[VOTRE-CLE]')) {
  console.error('❌ ERREUR: VITE_SUPABASE_ANON_KEY non configuré correctement')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour le profil utilisateur - CORRIGÉ pour correspondre à la BD
export interface UserProfile {
  id: string
  user_id: string
  situation: string
  revenus: string
  patrimoine: string
  objectifs: string[]
  tolerance_risque: string
  horizon_investissement: string
  nombre_enfants: number
  ages_enfants: string
  type_revenus: string[]
  autres_revenus: string
  created_at: string
  updated_at: string
  last_interaction: string
  situation_professionnelle: string
  statut_fiscal: string
  regime_imposition: string
  investissements_existants: string[]
  projets_immobiliers: string
  besoins_retraite: string
  situation_familiale: string
  localisation: string
  zone_fiscale: string
  secteur_activite: string
  revenus_passifs: string
  dettes: string
  objectifs_financiers: string[]
  contraintes_fiscales: string[]
  composition_patrimoine: string[]
  interaction_history: Array<{
    question: string
    response: string
    timestamp: string
    insights: Array<{
      type: string
      value: string
      confidence: number
    }>
  }>
  is_active: boolean
  
  // Nouveaux champs pour le questionnaire détaillé
  date_naissance?: string
  personnes_charge?: string
  type_contrat?: string
  societes_detenues?: string
  tmi?: string
  endettement?: string
} 
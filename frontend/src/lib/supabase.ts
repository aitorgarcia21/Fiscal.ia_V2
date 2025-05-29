import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lqxfjjtjxktjgpekugtf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTgyMDMsImV4cCI6MjA2MzM3NDIwM30.-E66kbBxRAVcJcPdhhUJWq5BZB-2GRpiBEaGtiWLVrA'

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
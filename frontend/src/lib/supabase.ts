import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lqxfjjtjxktjgpekugtf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTgyMDMsImV4cCI6MjA2MzM3NDIwM30.-E66kbBxRAVcJcPdhhUJWq5BZB-2GRpiBEaGtiWLVrA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour le profil utilisateur
export interface UserProfile {
  id: string
  user_id: string
  situation: string
  revenus: string
  patrimoine: string
  objectifs: string[]
  toleranceRisque: string
  horizonInvestissement: string
  nombreEnfants: number
  agesEnfants: string
  typeRevenus: string[]
  autresRevenus: string
  created_at: string
  updated_at: string
  last_interaction: string
  situationProfessionnelle: string
  statutFiscal: string
  regimeImposition: string
  investissementsExistants: string[]
  projetsImmobiliers: string
  besoinsRetraite: string
  situationFamiliale: string
  localisation: string
  zoneFiscale: string
  secteurActivite: string
  revenusPassifs: string
  dettes: string
  objectifsFinanciers: string[]
  contraintesFiscales: string[]
  compositionPatrimoine: string[]
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
} 
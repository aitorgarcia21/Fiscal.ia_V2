import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec les bonnes valeurs
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lqxfjjtjxktjgpekugtf.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTgyMDMsImV4cCI6MjA2MzM3NDIwM30.-E66kbBxRAVcJcPdhhUJWq5BZB-2GRpiBEaGtiWLVrA'

// Vérification des variables d'environnement
if (!supabaseUrl || supabaseUrl.includes('[VOTRE-PROJET]')) {
  console.error('❌ ERREUR: VITE_SUPABASE_URL non configuré correctement')
}
if (!supabaseAnonKey || supabaseAnonKey.includes('[VOTRE-CLE]')) {
  console.error('❌ ERREUR: VITE_SUPABASE_ANON_KEY non configuré correctement')
}

console.log('✅ Configuration Supabase frontend:', { 
  url: supabaseUrl,
  keySet: !!supabaseAnonKey 
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types TypeScript pour l'utilisateur
export interface UserProfile {
  id: string
  email: string
  username?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

// Helper functions
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

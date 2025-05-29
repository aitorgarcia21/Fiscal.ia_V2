-- Migration pour ajouter les nouveaux champs du questionnaire détaillé
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajout des nouvelles colonnes à la table user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS date_naissance TEXT,
ADD COLUMN IF NOT EXISTS personnes_charge TEXT,
ADD COLUMN IF NOT EXISTS type_contrat TEXT,
ADD COLUMN IF NOT EXISTS societes_detenues TEXT,
ADD COLUMN IF NOT EXISTS tmi TEXT,
ADD COLUMN IF NOT EXISTS endettement TEXT;

-- Vérification des colonnes ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position; 
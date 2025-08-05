-- Migration: Créer la structure pour Francis Andorre
-- Date: 2025-01-05
-- Description: Ajoute les tables et fonctions nécessaires pour gérer les profils utilisateurs Francis Andorre

BEGIN;

-- 1. Créer la table des profils Francis Andorre
CREATE TABLE IF NOT EXISTS public.profils_francis_andorre (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  -- Informations personnelles
  prenom text NOT NULL,
  nom text NOT NULL,
  entreprise text,
  telephone text,
  -- Informations d'abonnement
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text DEFAULT 'pending',
  subscription_start_date timestamp with time zone,
  subscription_end_date timestamp with time zone,
  -- Paramètres utilisateur
  langue character(2) DEFAULT 'fr' CHECK (langue IN ('fr', 'es', 'ca')),
  devise text DEFAULT 'EUR',
  -- Metadata
  signup_data jsonb, -- Stocke les données du formulaire d'inscription
  payment_intent text, -- Intent de paiement Stripe
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profils_francis_andorre_pkey PRIMARY KEY (id),
  CONSTRAINT profils_francis_andorre_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profils_francis_andorre_user_id_key UNIQUE (user_id)
);

-- 2. Créer les index
CREATE INDEX IF NOT EXISTS idx_profils_francis_andorre_user_id ON public.profils_francis_andorre(user_id);
CREATE INDEX IF NOT EXISTS idx_profils_francis_andorre_stripe_customer_id ON public.profils_francis_andorre(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profils_francis_andorre_subscription_status ON public.profils_francis_andorre(subscription_status);

-- 3. Activer RLS
ALTER TABLE public.profils_francis_andorre ENABLE ROW LEVEL SECURITY;

-- 4. Créer les policies RLS
DROP POLICY IF EXISTS "francis_andorre_select_own" ON public.profils_francis_andorre;
CREATE POLICY "francis_andorre_select_own" 
  ON public.profils_francis_andorre
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "francis_andorre_insert_own" ON public.profils_francis_andorre;
CREATE POLICY "francis_andorre_insert_own" 
  ON public.profils_francis_andorre
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "francis_andorre_update_own" ON public.profils_francis_andorre;
CREATE POLICY "francis_andorre_update_own" 
  ON public.profils_francis_andorre
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 5. Fonction pour gérer la création automatique du profil
CREATE OR REPLACE FUNCTION public.handle_new_francis_andorre_user()
RETURNS trigger AS $$
BEGIN
  -- Vérifier si les metadata contiennent les infos Francis Andorre
  IF NEW.raw_user_meta_data->>'francis_andorre' = 'true' THEN
    INSERT INTO public.profils_francis_andorre (
      user_id,
      prenom,
      nom,
      entreprise,
      telephone,
      signup_data,
      payment_intent,
      langue
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
      COALESCE(NEW.raw_user_meta_data->>'nom', ''),
      NEW.raw_user_meta_data->>'entreprise',
      NEW.raw_user_meta_data->>'telephone',
      NEW.raw_user_meta_data->'signup_data',
      NEW.raw_user_meta_data->>'payment_intent',
      COALESCE(NEW.raw_user_meta_data->>'langue', 'fr')
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created_francis_andorre ON auth.users;
CREATE TRIGGER on_auth_user_created_francis_andorre
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_francis_andorre_user();

-- 7. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger pour updated_at
DROP TRIGGER IF EXISTS update_profils_francis_andorre_updated_at ON public.profils_francis_andorre;
CREATE TRIGGER update_profils_francis_andorre_updated_at
  BEFORE UPDATE ON public.profils_francis_andorre
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Vue pour accès simplifié
CREATE OR REPLACE VIEW public.francis_andorre_users_view AS
SELECT 
  u.id as user_id,
  u.email,
  p.prenom,
  p.nom,
  p.entreprise,
  p.telephone,
  p.subscription_status,
  p.subscription_start_date,
  p.subscription_end_date,
  p.langue,
  p.created_at,
  p.updated_at,
  (SELECT COUNT(*) FROM public.chat_sessions cs WHERE cs.user_id = u.id AND cs.mode = 'andorre') as total_sessions,
  EXISTS(SELECT 1 FROM public.chat_sessions cs WHERE cs.user_id = u.id AND cs.mode = 'andorre' AND cs.is_active = true) as has_active_session
FROM 
  auth.users u
  INNER JOIN public.profils_francis_andorre p ON u.id = p.user_id
WHERE 
  u.deleted_at IS NULL;

-- 10. Permissions
GRANT SELECT ON public.francis_andorre_users_view TO authenticated;
GRANT ALL ON public.profils_francis_andorre TO authenticated;

-- 11. Fonction pour vérifier l'abonnement
CREATE OR REPLACE FUNCTION public.check_francis_andorre_subscription(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_status text;
  v_end_date timestamp with time zone;
BEGIN
  SELECT subscription_status, subscription_end_date
  INTO v_status, v_end_date
  FROM public.profils_francis_andorre
  WHERE user_id = p_user_id;
  
  RETURN v_status = 'active' AND (v_end_date IS NULL OR v_end_date > now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Fonction pour créer/mettre à jour le profil après paiement
CREATE OR REPLACE FUNCTION public.complete_francis_andorre_signup(
  p_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text
)
RETURNS void AS $$
BEGIN
  UPDATE public.profils_francis_andorre
  SET 
    stripe_customer_id = p_stripe_customer_id,
    stripe_subscription_id = p_stripe_subscription_id,
    subscription_status = 'active',
    subscription_start_date = now(),
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

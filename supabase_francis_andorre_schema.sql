-- Schema pour Francis Andorre
-- Table pour stocker les profils des utilisateurs Francis Andorre

-- 1. Créer la table des profils Francis Andorre
CREATE TABLE public.profils_francis_andorre (
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

-- 2. Index pour améliorer les performances
CREATE INDEX idx_profils_francis_andorre_user_id ON public.profils_francis_andorre(user_id);
CREATE INDEX idx_profils_francis_andorre_stripe_customer_id ON public.profils_francis_andorre(stripe_customer_id);
CREATE INDEX idx_profils_francis_andorre_subscription_status ON public.profils_francis_andorre(subscription_status);

-- 3. RLS (Row Level Security) pour sécuriser l'accès
ALTER TABLE public.profils_francis_andorre ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil Francis Andorre" 
  ON public.profils_francis_andorre
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy pour permettre aux utilisateurs de créer leur profil
CREATE POLICY "Les utilisateurs peuvent créer leur profil Francis Andorre" 
  ON public.profils_francis_andorre
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy pour permettre aux utilisateurs de mettre à jour leur profil
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur profil Francis Andorre" 
  ON public.profils_francis_andorre
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 4. Fonction pour créer automatiquement un profil après inscription
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
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger pour créer le profil automatiquement
CREATE TRIGGER on_auth_user_created_francis_andorre
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_francis_andorre_user();

-- 6. Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_profils_francis_andorre_updated_at
  BEFORE UPDATE ON public.profils_francis_andorre
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Vue pour faciliter l'accès aux données utilisateur complètes
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
  cs.message_count as total_messages,
  cs.is_active as has_active_session
FROM 
  auth.users u
  INNER JOIN public.profils_francis_andorre p ON u.id = p.user_id
  LEFT JOIN public.chat_sessions cs ON u.id = cs.user_id AND cs.mode = 'andorre'
WHERE 
  u.deleted_at IS NULL;

-- 9. Permissions pour la vue
GRANT SELECT ON public.francis_andorre_users_view TO authenticated;

-- 10. Fonction pour vérifier si un utilisateur a un abonnement actif
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
  
  IF v_status = 'active' AND (v_end_date IS NULL OR v_end_date > now()) THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

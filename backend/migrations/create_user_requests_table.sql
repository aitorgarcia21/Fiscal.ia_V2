
-- Migration pour ajouter la table user_requests
-- Date: 2025-07-07 16:50:23

-- Créer la table user_requests
CREATE TABLE IF NOT EXISTS user_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    request_type TEXT DEFAULT 'chat',
    metadata JSONB DEFAULT '{}'
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_requests_user_id ON user_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_requests_created_at ON user_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_user_requests_user_created ON user_requests(user_id, created_at);

-- RLS (Row Level Security)
ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour user_requests
CREATE POLICY "Users can view their own requests" ON user_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own requests" ON user_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ajouter la colonne plan_type à user_profiles si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'plan_type') THEN
        ALTER TABLE user_profiles ADD COLUMN plan_type TEXT DEFAULT 'particulier';
    END IF;
END $$;

-- Ajouter la colonne request_limit à user_profiles si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'request_limit') THEN
        ALTER TABLE user_profiles ADD COLUMN request_limit INTEGER DEFAULT 30;
    END IF;
END $$;

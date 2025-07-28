-- Script SQL pour créer la table de collecte d'emails sur Supabase
-- À exécuter dans le SQL Editor de Supabase

-- 1. Créer la table email_subscribers
CREATE TABLE IF NOT EXISTS email_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    source VARCHAR(100) DEFAULT 'email-collector' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
    ip_address INET NULL,
    user_agent TEXT NULL,
    utm_source VARCHAR(100) NULL,
    utm_medium VARCHAR(100) NULL,
    utm_campaign VARCHAR(100) NULL,
    metadata JSONB NULL
);

-- 2. Créer un index unique sur l'email pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS email_subscribers_email_unique_idx 
ON email_subscribers (email);

-- 3. Créer un index sur created_at pour les requêtes de tri
CREATE INDEX IF NOT EXISTS email_subscribers_created_at_idx 
ON email_subscribers (created_at DESC);

-- 4. Créer un index sur source pour filtrer par source
CREATE INDEX IF NOT EXISTS email_subscribers_source_idx 
ON email_subscribers (source);

-- 5. Créer un index sur is_active pour les requêtes de statut
CREATE INDEX IF NOT EXISTS email_subscribers_is_active_idx 
ON email_subscribers (is_active);

-- 6. Fonction pour mettre à jour le champ updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Créer le trigger pour mettre à jour updated_at
CREATE OR REPLACE TRIGGER update_email_subscribers_updated_at
    BEFORE UPDATE ON email_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Fonction pour ajouter un email avec vérification des doublons
CREATE OR REPLACE FUNCTION add_email_subscriber(
    p_email VARCHAR(255),
    p_source VARCHAR(100) DEFAULT 'email-collector',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_utm_source VARCHAR(100) DEFAULT NULL,
    p_utm_medium VARCHAR(100) DEFAULT NULL,
    p_utm_campaign VARCHAR(100) DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    subscriber_id UUID
) AS $$
DECLARE
    v_subscriber_id UUID;
    v_existing_email VARCHAR(255);
BEGIN
    -- Vérifier si l'email existe déjà
    SELECT email INTO v_existing_email
    FROM email_subscribers
    WHERE email = p_email;
    
    IF v_existing_email IS NOT NULL THEN
        -- Email déjà existant
        SELECT id INTO v_subscriber_id
        FROM email_subscribers
        WHERE email = p_email;
        
        RETURN QUERY SELECT FALSE, 'Email déjà enregistré'::TEXT, v_subscriber_id;
    ELSE
        -- Insérer le nouvel email
        INSERT INTO email_subscribers (
            email, source, ip_address, user_agent, 
            utm_source, utm_medium, utm_campaign, metadata
        ) VALUES (
            p_email, p_source, p_ip_address, p_user_agent,
            p_utm_source, p_utm_medium, p_utm_campaign, p_metadata
        ) RETURNING id INTO v_subscriber_id;
        
        RETURN QUERY SELECT TRUE, 'Email ajouté avec succès'::TEXT, v_subscriber_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 9. Fonction pour désabonner un email
CREATE OR REPLACE FUNCTION unsubscribe_email(p_email VARCHAR(255))
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_existing_email VARCHAR(255);
BEGIN
    -- Vérifier si l'email existe
    SELECT email INTO v_existing_email
    FROM email_subscribers
    WHERE email = p_email AND is_active = TRUE;
    
    IF v_existing_email IS NOT NULL THEN
        -- Désabonner l'email
        UPDATE email_subscribers
        SET is_active = FALSE, unsubscribed_at = NOW()
        WHERE email = p_email;
        
        RETURN QUERY SELECT TRUE, 'Email désabonné avec succès'::TEXT;
    ELSE
        RETURN QUERY SELECT FALSE, 'Email non trouvé ou déjà désabonné'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 10. Vue pour les statistiques des emails
CREATE OR REPLACE VIEW email_stats AS
SELECT 
    COUNT(*) as total_emails,
    COUNT(*) FILTER (WHERE is_active = TRUE) as active_emails,
    COUNT(*) FILTER (WHERE is_active = FALSE) as unsubscribed_emails,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day') as emails_last_24h,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 week') as emails_last_week,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month') as emails_last_month
FROM email_subscribers;

-- 11. Politique de sécurité RLS (Row Level Security)
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- 12. Politique pour permettre l'insertion publique (pour le formulaire)
CREATE POLICY "Allow public insert" ON email_subscribers
    FOR INSERT
    TO public
    WITH CHECK (true);

-- 13. Politique pour permettre la lecture aux utilisateurs authentifiés seulement
CREATE POLICY "Allow authenticated read" ON email_subscribers
    FOR SELECT
    TO authenticated
    USING (true);

-- 14. Politique pour permettre les mises à jour aux utilisateurs authentifiés seulement
CREATE POLICY "Allow authenticated update" ON email_subscribers
    FOR UPDATE
    TO authenticated
    USING (true);

-- 15. Grants pour les permissions
GRANT SELECT, INSERT ON email_subscribers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_subscribers TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 16. Commentaires pour la documentation
COMMENT ON TABLE email_subscribers IS 'Table pour stocker les emails collectés via le formulaire de collecte';
COMMENT ON COLUMN email_subscribers.id IS 'Identifiant unique UUID';
COMMENT ON COLUMN email_subscribers.email IS 'Adresse email du subscriber';
COMMENT ON COLUMN email_subscribers.source IS 'Source de collecte (email-collector, landing-page, etc.)';
COMMENT ON COLUMN email_subscribers.is_active IS 'Statut actif/inactif du subscriber';
COMMENT ON COLUMN email_subscribers.metadata IS 'Données supplémentaires en JSON';

-- 17. Exemples d'utilisation
-- Pour ajouter un email :
-- SELECT * FROM add_email_subscriber('test@example.com', 'email-collector');

-- Pour voir les statistiques :
-- SELECT * FROM email_stats;

-- Pour lister tous les emails actifs :
-- SELECT * FROM email_subscribers WHERE is_active = TRUE ORDER BY created_at DESC;

-- Pour désabonner un email :
-- SELECT * FROM unsubscribe_email('test@example.com');

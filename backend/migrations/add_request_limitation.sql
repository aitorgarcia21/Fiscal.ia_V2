
-- Fonction pour vérifier les limites de requêtes
CREATE OR REPLACE FUNCTION check_user_request_limit(
    p_user_id UUID,
    p_plan_type TEXT DEFAULT 'particulier'
) RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    request_limit INTEGER;
    current_month DATE;
BEGIN
    -- Déterminer la limite selon le plan
    IF p_plan_type = 'professionnel' THEN
        request_limit := -1; -- Illimité
    ELSE
        request_limit := 30; -- Particulier
    END IF;
    
    -- Si illimité, autoriser
    IF request_limit = -1 THEN
        RETURN TRUE;
    END IF;
    
    -- Obtenir le mois actuel
    current_month := DATE_TRUNC('month', CURRENT_DATE);
    
    -- Compter les requêtes du mois actuel
    SELECT COALESCE(COUNT(*), 0)
    INTO current_count
    FROM user_requests
    WHERE user_id = p_user_id
    AND created_at >= current_month;
    
    -- Vérifier la limite
    RETURN current_count < request_limit;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour incrémenter le compteur de requêtes
CREATE OR REPLACE FUNCTION increment_user_request(
    p_user_id UUID
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_requests (user_id, created_at)
    VALUES (p_user_id, NOW());
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les requêtes restantes
CREATE OR REPLACE FUNCTION get_remaining_requests(
    p_user_id UUID,
    p_plan_type TEXT DEFAULT 'particulier'
) RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
    request_limit INTEGER;
    current_month DATE;
BEGIN
    -- Déterminer la limite selon le plan
    IF p_plan_type = 'professionnel' THEN
        RETURN -1; -- Illimité
    ELSE
        request_limit := 30; -- Particulier
    END IF;
    
    -- Obtenir le mois actuel
    current_month := DATE_TRUNC('month', CURRENT_DATE);
    
    -- Compter les requêtes du mois actuel
    SELECT COALESCE(COUNT(*), 0)
    INTO current_count
    FROM user_requests
    WHERE user_id = p_user_id
    AND created_at >= current_month;
    
    -- Retourner les requêtes restantes
    RETURN GREATEST(0, request_limit - current_count);
END;
$$ LANGUAGE plpgsql;

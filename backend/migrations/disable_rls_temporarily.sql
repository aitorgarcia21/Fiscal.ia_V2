-- Désactiver temporairement RLS pour diagnostiquer
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Si vous voulez le réactiver plus tard, utilisez :
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY; 
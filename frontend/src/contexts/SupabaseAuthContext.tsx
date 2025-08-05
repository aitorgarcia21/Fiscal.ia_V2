import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// Interface User locale car @supabase/supabase-js types non disponibles
interface User {
  id: string;
  email?: string;
  user_metadata?: any;
  app_metadata?: any;
  aud?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFrancisAndorre: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFrancisAndorre, setIsFrancisAndorre] = useState(false);

  useEffect(() => {
    // Vérifier la session actuelle
    checkUser();

    // Écouter les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Vérifier si c'est un utilisateur Francis Andorre
      if (currentUser) {
        const { data } = await supabase
          .from('profils_francis_andorre')
          .select('user_id')
          .eq('user_id', currentUser.id)
          .single();
        
        setIsFrancisAndorre(!!data);
      } else {
        setIsFrancisAndorre(false);
      }
      
      setIsLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Vérifier si c'est un utilisateur Francis Andorre
      if (user) {
        const { data } = await supabase
          .from('profils_francis_andorre')
          .select('user_id')
          .eq('user_id', user.id)
          .single();
        
        setIsFrancisAndorre(!!data);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🔐 [SupabaseAuth] Tentative de connexion:', { 
      email, 
      passwordLength: password.length,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Créer une promesse avec timeout
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La connexion a pris trop de temps')), 10000)
      );
      
      console.log('⏱️ [SupabaseAuth] Appel API en cours...');
      
      // Race entre la connexion et le timeout
      const result = await Promise.race([loginPromise, timeoutPromise]) as any;
      
      console.log('📥 [SupabaseAuth] Réponse reçue:', { 
        hasData: !!result?.data,
        hasError: !!result?.error
      });
      
      const { data, error } = result;

      if (error) {
        console.error('❌ [SupabaseAuth] Erreur:', {
          message: error.message,
          status: error.status,
          code: error.code,
          details: error
        });
        return { success: false, error: error.message };
      }

      console.log('✅ [SupabaseAuth] Connexion réussie:', {
        userId: data.user?.id,
        email: data.user?.email,
        hasSession: !!data.session
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('💥 [SupabaseAuth] Exception:', error);
      return { success: false, error: error.message || 'Erreur de connexion' };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erreur lors de l\'inscription' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsFrancisAndorre(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isFrancisAndorre,
    login,
    logout,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Plus, Filter, Sparkles, TrendingUp, MapPin, Building2 } from 'lucide-react';
import { supabase, UserProfile, getSimilarUsers } from '../lib/supabase';

interface SuggestedUser {
  id: string;
  email: string;
  profile: UserProfile;
  similarityScore: number;
  matchingCriteria: string[];
}

export function UserDiscovery() {
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadDiscoveryData();
  }, []);

  const loadDiscoveryData = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('Pas de session utilisateur');
        return;
      }

      // Charger le profil de l'utilisateur actuel
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (currentProfile) {
        setCurrentUserProfile(currentProfile);
        
        // Charger les utilisateurs similaires
        const similarUsers = await getSimilarUsers(currentProfile);
        setSuggestedUsers(similarUsers);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (activeFilter === 'all') return suggestedUsers;
    
    return suggestedUsers.filter(user => {
      switch (activeFilter) {
        case 'location':
          return user.profile.localisation === currentUserProfile?.localisation;
        case 'sector':
          return user.profile.secteur_activite === currentUserProfile?.secteur_activite;
        case 'situation':
          return user.profile.situation_familiale === currentUserProfile?.situation_familiale;
        case 'regime':
          return user.profile.regime_imposition === currentUserProfile?.regime_imposition;
        default:
          return true;
      }
    });
  };

  const filteredUsers = filterUsers();

  const filters = [
    { id: 'all', label: 'Tous', icon: Users },
    { id: 'location', label: 'Même localisation', icon: MapPin },
    { id: 'sector', label: 'Même secteur', icon: Building2 },
    { id: 'situation', label: 'Même situation', icon: Users },
    { id: 'regime', label: 'Même régime', icon: TrendingUp }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c5a572] mx-auto"></div>
          <p className="mt-4">Chargement des suggestions...</p>
        </div>
      </div>
    );
  }

  if (!currentUserProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-[#1a2942]/80 backdrop-blur-sm rounded-xl p-8 border border-[#c5a572]/20 text-center">
            <Users className="w-16 h-16 text-[#c5a572] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Complétez votre profil</h2>
            <p className="text-gray-300 mb-6">
              Pour découvrir des utilisateurs similaires et échanger sur vos stratégies fiscales,
              veuillez d'abord compléter votre profil fiscal.
            </p>
            <button className="bg-[#c5a572] text-[#1a2942] font-bold py-3 px-6 rounded-lg hover:bg-[#e8cfa0] transition-colors">
              Compléter mon profil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Découverte d'utilisateurs</h1>
          <p className="text-gray-300">
            Connectez-vous avec des utilisateurs dans une situation fiscale similaire
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-[#1a2942]/80 backdrop-blur-sm rounded-xl p-4 border border-[#c5a572]/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#c5a572]" />
                Filtres
              </h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-[#c5a572] hover:text-[#e8cfa0] transition-colors"
              >
                {showFilters ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            
            {showFilters && (
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        activeFilter === filter.id
                          ? 'bg-[#c5a572] text-[#1a2942] font-semibold'
                          : 'bg-[#1a2942]/50 text-gray-300 hover:bg-[#1a2942]/70'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Aucun utilisateur similaire trouvé avec ces critères.</p>
            </motion.div>
          ) : (
            filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1a2942]/80 backdrop-blur-sm rounded-xl p-6 border border-[#c5a572]/20 hover:border-[#c5a572]/40 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#c5a572]/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#c5a572]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Utilisateur anonyme</h3>
                      <p className="text-sm text-gray-400">{user.email.split('@')[0]}***</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#c5a572] font-bold">{user.similarityScore}%</div>
                    <div className="text-xs text-gray-400">Similarité</div>
                  </div>
                </div>

                {/* Matching Criteria */}
                <div className="space-y-2 mb-4">
                  {user.matchingCriteria.slice(0, 3).map((criteria, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <Sparkles className="w-4 h-4 text-[#c5a572]" />
                      {criteria}
                    </div>
                  ))}
                  {user.matchingCriteria.length > 3 && (
                    <p className="text-xs text-gray-400">
                      +{user.matchingCriteria.length - 3} autre(s) point(s) commun(s)
                    </p>
                  )}
                </div>

                {/* Profile Summary */}
                <div className="border-t border-[#c5a572]/20 pt-4 space-y-1 text-sm">
                  <p className="text-gray-300">
                    <span className="text-gray-500">Situation:</span> {user.profile.situation_familiale}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Secteur:</span> {user.profile.secteur_activite}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Localisation:</span> {user.profile.localisation}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-[#c5a572] text-[#1a2942] font-semibold py-2 px-4 rounded-lg hover:bg-[#e8cfa0] transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Discuter
                  </button>
                  <button className="flex-1 bg-[#1a2942]/50 text-gray-300 font-semibold py-2 px-4 rounded-lg hover:bg-[#1a2942]/70 transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Suivre
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Add more users CTA */}
        {filteredUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400 mb-4">
              Vous voulez découvrir plus d'utilisateurs similaires ?
            </p>
            <button className="bg-[#1a2942]/80 text-[#c5a572] font-semibold py-3 px-6 rounded-lg hover:bg-[#1a2942] transition-colors border border-[#c5a572]/20">
              Affiner mon profil pour de meilleures suggestions
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

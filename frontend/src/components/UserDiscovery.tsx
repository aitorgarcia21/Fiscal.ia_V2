import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Plus, Filter, Sparkles, TrendingUp, MapPin, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  user_id: string;
  situation_familiale: string;
  localisation: string;
  secteur_activite: string;
  regime_imposition: string;
  objectifs_financiers: string[];
  created_at: string;
}

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
      if (!session?.user) return;

      // Charger le profil de l'utilisateur actuel
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (currentProfile) {
        setCurrentUserProfile(currentProfile);
        
        // Chercher des utilisateurs similaires
        const { data: otherProfiles } = await supabase
          .from('user_profiles')
          .select(`
            *,
            users:user_id (email)
          `)
          .neq('user_id', session.user.id)
          .eq('is_active', true)
          .limit(20);

        if (otherProfiles) {
          const suggestions = generateSuggestions(currentProfile, otherProfiles);
          setSuggestedUsers(suggestions);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des découvertes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = (currentProfile: UserProfile, otherProfiles: any[]): SuggestedUser[] => {
    return otherProfiles
      .map((profile) => {
        const matchingCriteria: string[] = [];
        let similarityScore = 0;

        // Critères de similarité
        if (profile.situation_familiale === currentProfile.situation_familiale) {
          matchingCriteria.push('Situation familiale similaire');
          similarityScore += 25;
        }

        if (profile.localisation === currentProfile.localisation) {
          matchingCriteria.push('Même région');
          similarityScore += 20;
        }

        if (profile.secteur_activite === currentProfile.secteur_activite) {
          matchingCriteria.push('Même secteur d\'activité');
          similarityScore += 15;
        }

        if (profile.regime_imposition === currentProfile.regime_imposition) {
          matchingCriteria.push('Même régime d\'imposition');
          similarityScore += 20;
        }

        // Objectifs communs
        const commonObjectives = profile.objectifs_financiers?.filter((obj: string) =>
          currentProfile.objectifs_financiers?.includes(obj)
        ) || [];

        if (commonObjectives.length > 0) {
          matchingCriteria.push(`${commonObjectives.length} objectif(s) commun(s)`);
          similarityScore += commonObjectives.length * 10;
        }

        return {
          id: profile.id,
          email: profile.users?.email || 'Utilisateur anonyme',
          profile,
          similarityScore,
          matchingCriteria
        };
      })
      .filter(user => user.similarityScore > 10)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 12);
  };

  const filterUsers = (users: SuggestedUser[]) => {
    switch (activeFilter) {
      case 'high-match':
        return users.filter(user => user.similarityScore >= 50);
      case 'same-region':
        return users.filter(user => 
          user.matchingCriteria.some(criteria => criteria.includes('région'))
        );
      case 'same-sector':
        return users.filter(user => 
          user.matchingCriteria.some(criteria => criteria.includes('secteur'))
        );
      default:
        return users;
    }
  };

  const filteredUsers = filterUsers(suggestedUsers);

  const getSimilarityColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 30) return 'text-orange-400';
    return 'text-gray-400';
  };

  const getSimilarityBadge = (score: number) => {
    if (score >= 70) return 'Excellent match';
    if (score >= 50) return 'Bon match';
    if (score >= 30) return 'Match modéré';
    return 'Match faible';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#c5a572] text-lg">Chargement des suggestions...</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* En-tête avec filtres */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-[#c5a572] to-[#e8cfa0]">
            <Sparkles className="w-6 h-6 text-[#162238]" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white">Découverte de Profils</h3>
            <p className="text-sm text-gray-400">
              Connectez-vous avec des utilisateurs partageant des profils fiscaux similaires
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#1E3253]/60 border border-[#2A3F6C]/40 rounded-lg text-gray-300 hover:bg-[#1E3253]/80 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
          </button>
          <div className="text-sm text-gray-400">
            {filteredUsers.length} suggestion(s)
          </div>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-[#1E3253]/40 rounded-lg p-4 border border-[#2A3F6C]/30"
        >
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'high-match', label: 'Correspondance élevée' },
              { id: 'same-region', label: 'Même région' },
              { id: 'same-sector', label: 'Même secteur' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-[#c5a572] text-[#162238] font-medium'
                    : 'bg-[#101A2E]/50 text-gray-400 hover:text-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Grille des utilisateurs suggérés */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-[#1E3253]/60 backdrop-blur-sm rounded-xl border border-[#2A3F6C]/40 p-6 hover:shadow-lg hover:shadow-[#c5a572]/10 transition-all duration-300"
            >
              {/* Avatar et score */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] flex items-center justify-center text-[#162238] font-semibold text-lg">
                    {user.email.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      {user.email.split('@')[0]}
                    </h4>
                    <p className="text-xs text-gray-400">
                      Membre depuis {new Date(user.profile.created_at).getFullYear()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${getSimilarityColor(user.similarityScore)}`}>
                    {user.similarityScore}%
                  </div>
                  <div className="text-xs text-gray-400">
                    {getSimilarityBadge(user.similarityScore)}
                  </div>
                </div>
              </div>

              {/* Informations du profil */}
              <div className="space-y-2 mb-4">
                {user.profile.localisation && (
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{user.profile.localisation}</span>
                  </div>
                )}
                {user.profile.secteur_activite && (
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span>{user.profile.secteur_activite}</span>
                  </div>
                )}
              </div>

              {/* Critères de correspondance */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-300 mb-2">Points communs :</h5>
                <div className="flex flex-wrap gap-1">
                  {user.matchingCriteria.slice(0, 3).map((criteria, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2 py-1 bg-[#c5a572]/20 text-[#c5a572] text-xs rounded-full"
                    >
                      {criteria}
                    </span>
                  ))}
                  {user.matchingCriteria.length > 3 && (
                    <span className="inline-block px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full">
                      +{user.matchingCriteria.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-[#c5a572]/20 text-[#c5a572] rounded-lg hover:bg-[#c5a572]/30 transition-colors text-sm">
                  <MessageCircle className="w-4 h-4" />
                  <span>Message</span>
                </button>
                <button className="flex items-center justify-center px-3 py-2 bg-[#101A2E]/50 text-gray-400 rounded-lg hover:text-gray-200 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">
            Aucune suggestion trouvée
          </h3>
          <p className="text-gray-500">
            Complétez votre profil pour recevoir des suggestions personnalisées
          </p>
        </div>
      )}

      {/* Statistiques */}
      {suggestedUsers.length > 0 && (
        <div className="bg-[#1E3253]/40 rounded-lg p-6 border border-[#2A3F6C]/30">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[#c5a572]" />
            <span>Statistiques de découverte</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#c5a572]">
                {suggestedUsers.filter(u => u.similarityScore >= 50).length}
              </div>
              <div className="text-sm text-gray-400">Correspondances élevées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#c5a572]">
                {Math.round(suggestedUsers.reduce((acc, u) => acc + u.similarityScore, 0) / suggestedUsers.length) || 0}%
              </div>
              <div className="text-sm text-gray-400">Score moyen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#c5a572]">
                {suggestedUsers.filter(u => u.matchingCriteria.length >= 3).length}
              </div>
              <div className="text-sm text-gray-400">Profils très similaires</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
} 
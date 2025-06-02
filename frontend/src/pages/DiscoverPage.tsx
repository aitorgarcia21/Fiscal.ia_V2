import React from 'react';
import { ArrowLeft, Users, MapPin, Briefcase, Home, TrendingUp, MessageCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserCardProps {
  name: string;
  location: string;
  job: string;
  situation: string;
  goals: string[];
  score: number;
}

const UserCard: React.FC<UserCardProps> = ({ name, location, job, situation, goals, score }) => {
  return (
    <div className="bg-[#1a2942]/80 backdrop-blur-sm rounded-xl p-6 border border-[#c5a572]/20 hover:border-[#c5a572]/40 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <div className="flex items-center text-gray-400 text-sm mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            {location}
          </div>
        </div>
        <div className="bg-[#c5a572] text-[#1a2942] font-bold px-3 py-1 rounded-full text-sm">
          {score}% match
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center text-sm">
          <Briefcase className="w-4 h-4 mr-2 text-[#c5a572]" />
          <span className="text-gray-300">{job}</span>
        </div>
        <div className="flex items-center text-sm">
          <Home className="w-4 h-4 mr-2 text-[#c5a572]" />
          <span className="text-gray-300">{situation}</span>
        </div>
        
        <div className="pt-2 mt-2 border-t border-[#c5a572]/20">
          <h4 className="text-sm font-medium text-[#c5a572] mb-2">Objectifs communs</h4>
          <div className="flex flex-wrap gap-2">
            {goals.map((goal, index) => (
              <span key={index} className="text-xs bg-[#c5a572]/10 text-[#c5a572] px-2 py-1 rounded">
                {goal}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-2 pt-3">
          <button className="flex-1 bg-[#c5a572] text-[#1a2942] font-medium py-2 px-4 rounded-lg hover:bg-[#e8cfa0] transition-colors flex items-center justify-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            Discuter
          </button>
          <button className="flex-1 bg-[#1a2942] text-[#c5a572] font-medium py-2 px-4 rounded-lg border border-[#c5a572]/30 hover:bg-[#223c63] transition-colors flex items-center justify-center">
            <Plus className="w-4 h-4 mr-2" />
            Suivre
          </button>
        </div>
      </div>
    </div>
  );
};

export function DiscoverPage() {
  const navigate = useNavigate();
  
  // Données factices pour les utilisateurs
  const users = [
    {
      id: 1,
      name: 'Marie D.',
      location: 'Paris, France',
      job: 'Freelance en communication',
      situation: 'Auto-entrepreneur',
      goals: ['Optimisation fiscale', 'Épargne retraite'],
      score: 87
    },
    {
      id: 2,
      name: 'Thomas L.',
      location: 'Lyon, France',
      job: 'Développeur indépendant',
      situation: 'SASU',
      goals: ['Déduction des frais', 'Investissement locatif'],
      score: 76
    },
    {
      id: 3,
      name: 'Sophie M.',
      location: 'Bordeaux, France',
      job: 'Consultante en gestion',
      situation: 'Portage salarial',
      goals: ['Optimisation fiscale', 'Épargne retraite'],
      score: 92
    },
    {
      id: 4,
      name: 'Alexandre P.',
      location: 'Paris, France',
      job: 'Graphiste freelance',
      situation: 'Auto-entrepreneur',
      goals: ['Déduction des frais', 'Investissement locatif'],
      score: 81
    },
    {
      id: 5,
      name: 'Julie T.',
      location: 'Toulouse, France',
      job: 'Rédactrice web',
      situation: 'Portage salarial',
      goals: ['Optimisation fiscale', 'Épargne retraite'],
      score: 79
    },
    {
      id: 6,
      name: 'Nicolas B.',
      location: 'Marseille, France',
      job: 'Photographe indépendant',
      situation: 'Auto-entrepreneur',
      goals: ['Déduction des frais', 'Réduction d\'impôts'],
      score: 85
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-[#c5a572] hover:text-[#e8cfa0] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Retour au chat
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Users className="w-6 h-6 mr-2 text-[#c5a572]" />
            Découvrez des utilisateurs
          </h1>
          <div className="w-24"></div> {/* Pour équilibrer le flex */}
        </div>

        {/* Filtres */}
        <div className="mb-8 p-4 bg-[#1a2942]/80 backdrop-blur-sm rounded-xl border border-[#c5a572]/20">
          <h2 className="text-lg font-semibold text-white mb-4">Filtrer par</h2>
          <div className="flex flex-wrap gap-3">
            <select className="px-4 py-2 bg-[#1a2942] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#c5a572]">
              <option>Toutes les localisations</option>
              <option>Paris</option>
              <option>Lyon</option>
              <option>Bordeaux</option>
              <option>Toulouse</option>
              <option>Marseille</option>
            </select>
            
            <select className="px-4 py-2 bg-[#1a2942] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#c5a572]">
              <option>Tous les statuts</option>
              <option>Auto-entrepreneur</option>
              <option>SASU</option>
              <option>Portage salarial</option>
            </select>
            
            <select className="px-4 py-2 bg-[#1a2942] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#c5a572]">
              <option>Tous les objectifs</option>
              <option>Optimisation fiscale</option>
              <option>Déduction des frais</option>
              <option>Investissement locatif</option>
              <option>Épargne retraite</option>
            </select>
            
            <button className="ml-auto px-4 py-2 bg-[#c5a572] text-[#1a2942] font-medium rounded-lg hover:bg-[#e8cfa0] transition-colors">
              Appliquer les filtres
            </button>
          </div>
        </div>

        {/* Grille d'utilisateurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <UserCard
              key={user.id}
              name={user.name}
              location={user.location}
              job={user.job}
              situation={user.situation}
              goals={user.goals}
              score={user.score}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Users, Building, Crown } from 'lucide-react';
import { Logo } from './Logo';

interface CategoryOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  description: string;
}

const categories: CategoryOption[] = [
  {
    id: 'particulier',
    label: 'Particulier',
    icon: <Users className="w-5 h-5" />,
    path: '/',
    description: 'Solutions pour particuliers'
  },
  {
    id: 'pro',
    label: 'Professionnel',
    icon: <Building className="w-5 h-5" />,
    path: '/pro-landing',
    description: 'Outils pour professionnels'
  },
  {
    id: 'andorre',
    label: 'Francis Andorre',
    icon: <Crown className="w-5 h-5" />,
    path: '/andorre',
    description: 'Expertise fiscale andorrane'
  }
];

export function CategorySwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<CategoryOption | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Déterminer la catégorie actuelle basée sur l'URL
  useEffect(() => {
    const path = location.pathname;
    let category = categories.find(cat => {
      if (cat.path === '/' && path === '/') return true;
      if (cat.path !== '/' && path.startsWith(cat.path)) return true;
      return false;
    });
    
    // Par défaut, si aucune correspondance, utiliser "pro"
    if (!category) {
      category = categories.find(cat => cat.id === 'pro') || categories[1];
    }
    
    setCurrentCategory(category);
  }, [location.pathname]);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = (category: CategoryOption) => {
    console.log('🎯 CategorySwitcher: CLICKED on', category.label, 'navigating to:', category.path);
    setIsOpen(false);
    
    // Navigation directe et immédiate
    window.location.href = category.path;
  };

  if (!currentCategory) return null;

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Logo cliquable avec indicateur dropdown */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🎯 CategorySwitcher: Toggle clicked, isOpen:', !isOpen);
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all duration-300 group touch-manipulation cursor-pointer"
        aria-label="Changer de catégorie"
        type="button"
      >
        <Logo size="lg" className="transition-transform duration-300 group-hover:scale-105" />
        
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-2 text-white">
            {currentCategory.icon}
            <span className="font-semibold text-lg">{currentCategory.label}</span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
        
        {/* Version mobile - juste le chevron */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 sm:hidden ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-gradient-to-br from-[#162238]/95 to-[#1E3253]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[9999] overflow-hidden pointer-events-auto">
          <div className="p-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={(e) => {
                  console.log('🚨 BUTTON CLICKED!', category.label);
                  e.preventDefault();
                  e.stopPropagation();
                  handleCategoryChange(category);
                }}
                onMouseDown={(e) => console.log('🖱️ MOUSE DOWN on', category.label)}
                onMouseUp={(e) => console.log('🖱️ MOUSE UP on', category.label)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 text-left touch-manipulation cursor-pointer pointer-events-auto ${
                  currentCategory.id === category.id
                    ? 'bg-gradient-to-r from-[#c5a572]/20 to-[#e8cfa0]/20 border border-[#c5a572]/30'
                    : 'hover:bg-white/5 hover:scale-[1.02]'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  currentCategory.id === category.id
                    ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238]'
                    : 'bg-white/10 text-gray-300'
                }`}>
                  {category.icon}
                </div>
                
                <div className="flex-1">
                  <div className={`font-semibold ${
                    currentCategory.id === category.id ? 'text-[#e8cfa0]' : 'text-white'
                  }`}>
                    {category.label}
                  </div>
                  <div className="text-sm text-gray-400">
                    {category.description}
                  </div>
                </div>
                
                {currentCategory.id === category.id && (
                  <div className="w-2 h-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full"></div>
                )}
              </button>
            ))}
          </div>
          
          {/* Footer du dropdown */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#0A0F1C]/50 to-[#162238]/50 border-t border-white/5">
            <p className="text-xs text-gray-400 text-center">
              Cliquez pour changer de catégorie
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

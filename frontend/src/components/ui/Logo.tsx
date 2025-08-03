import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Euro, ChevronDown } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  showDropdown?: boolean;
  currentCategory?: 'particulier' | 'pro' | 'andorre';
}

interface CategoryOption {
  key: string;
  label: string;
  path: string;
  active: boolean;
}

export function Logo({ 
  size = 'md', 
  className = '', 
  showText = false, 
  showDropdown = false,
  currentCategory = 'particulier'
}: LogoProps) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: { main: 'h-6 w-6', euro: 'h-4 w-4', padding: 'p-0.5', text: 'text-lg' },
    md: { main: 'h-8 w-8', euro: 'h-5 w-5', padding: 'p-0.5', text: 'text-xl' },
    lg: { main: 'h-10 w-10', euro: 'h-7 w-7', padding: 'p-0.5', text: 'text-2xl' },
    xl: { main: 'h-12 w-12', euro: 'h-8 w-8', padding: 'p-1', text: 'text-3xl' }
  };

  const categories: CategoryOption[] = [
    {
      key: 'particulier',
      label: 'Particulier',
      path: '/',
      active: currentCategory === 'particulier'
    },
    {
      key: 'pro',
      label: 'Pro',
      path: '/pro-landing',
      active: currentCategory === 'pro'
    },
    {
      key: 'andorre',
      label: 'Andorre',
      path: '/andorre',
      active: currentCategory === 'andorre'
    }
  ];

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogoClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (showDropdown) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      navigate('/');
    }
  };

  const handleCategorySelect = (categoryPath: string, categoryLabel: string) => {
    console.log(`🚀 NAVIGATION: ${categoryLabel}`);
    setIsDropdownOpen(false);
    window.location.href = categoryPath; // Utilisation de window.location pour éviter les problèmes de routing
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleLogoClick}
        className={`flex items-center gap-3 group transition-all duration-300 ${
          showDropdown ? 'hover:bg-[#1a2942]/50 rounded-lg p-2' : ''
        }`}
      >
        <div className="relative">
          <MessageSquare className={`${sizeClasses[size].main} text-[#c5a572] transition-transform group-hover:scale-110 duration-300`} />
          <Euro className={`${sizeClasses[size].euro} text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full ${sizeClasses[size].padding} border-2 border-[#162238] transition-transform group-hover:scale-110 duration-300`} />
        </div>
        
        {showText && (
          <div className="flex items-center gap-2">
            <span className={`${sizeClasses[size].text} font-bold text-white`}>Francis</span>
            {showDropdown && (
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} />
            )}
          </div>
        )}
      </button>

      {/* Menu déroulant */}
      {showDropdown && isDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#162238] border border-[#c5a572]/20 rounded-lg shadow-xl z-50 overflow-hidden">
          <a
            href="/"
            className={`block w-full text-left px-4 py-3 transition-colors duration-200 flex items-center justify-between no-underline ${
              currentCategory === 'particulier'
                ? 'bg-[#c5a572] text-[#162238] font-semibold'
                : 'text-white hover:bg-[#1a2942] hover:text-[#c5a572]'
            }`}
          >
            <span>Particulier</span>
            {currentCategory === 'particulier' && (
              <div className="w-2 h-2 bg-[#162238] rounded-full"></div>
            )}
          </a>
          
          <a
            href="/pro-landing"
            className={`block w-full text-left px-4 py-3 transition-colors duration-200 flex items-center justify-between no-underline ${
              currentCategory === 'pro'
                ? 'bg-[#c5a572] text-[#162238] font-semibold'
                : 'text-white hover:bg-[#1a2942] hover:text-[#c5a572]'
            }`}
          >
            <span>Pro</span>
            {currentCategory === 'pro' && (
              <div className="w-2 h-2 bg-[#162238] rounded-full"></div>
            )}
          </a>
          
          <a
            href="/andorre"
            className={`block w-full text-left px-4 py-3 transition-colors duration-200 flex items-center justify-between no-underline ${
              currentCategory === 'andorre'
                ? 'bg-[#c5a572] text-[#162238] font-semibold'
                : 'text-white hover:bg-[#1a2942] hover:text-[#c5a572]'
            }`}
          >
            <span>Andorre</span>
            {currentCategory === 'andorre' && (
              <div className="w-2 h-2 bg-[#162238] rounded-full"></div>
            )}
          </a>
        </div>
      )}
    </div>
  );
}
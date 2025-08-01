import React, { useState } from 'react';
import { ChevronDown, Users, Building, Crown } from 'lucide-react';
import { Logo } from './Logo';

interface CategoryOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const categories: CategoryOption[] = [
  {
    id: 'particulier',
    label: 'Particulier',
    icon: <Users className="w-5 h-5" />,
    path: '/'
  },
  {
    id: 'pro',
    label: 'Professionnel',
    icon: <Building className="w-5 h-5" />,
    path: '/pro-landing'
  },
  {
    id: 'andorre',
    label: 'Francis Andorre',
    icon: <Crown className="w-5 h-5" />,
    path: '/andorre'
  }
];

export function SimpleCategorySwitcher() {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryClick = (path: string, label: string) => {
    console.log('🚀 DIRECT NAVIGATION to', label, 'path:', path);
    window.location.href = path;
  };

  return (
    <div style={{ position: 'relative', zIndex: 9999 }}>
      {/* Logo cliquable */}
      <button
        onClick={() => {
          console.log('🎯 Toggle menu, isOpen will be:', !isOpen);
          setIsOpen(!isOpen);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px',
          borderRadius: '12px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'white'
        }}
      >
        <Logo size="lg" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '600', fontSize: '18px' }}>Francis</span>
          <ChevronDown 
            style={{
              width: '16px',
              height: '16px',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s'
            }}
          />
        </div>
      </button>

      {/* Menu déroulant SIMPLE */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            left: '16px',
            width: '280px',
            backgroundColor: 'rgba(22, 34, 56, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '8px',
            zIndex: 99999,
            backdropFilter: 'blur(12px)'
          }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.path, category.label)}
              onMouseDown={() => console.log('🖱️ MOUSE DOWN:', category.label)}
              onMouseUp={() => console.log('🖱️ MOUSE UP:', category.label)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                color: 'white',
                textAlign: 'left',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {category.icon}
              </div>
              <div>
                <div style={{ fontWeight: '600' }}>{category.label}</div>
              </div>
            </button>
          ))}
          
          {/* Bouton fermer */}
          <div style={{ padding: '8px', textAlign: 'center' }}>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(197, 165, 114, 0.2)',
                border: '1px solid rgba(197, 165, 114, 0.3)',
                borderRadius: '8px',
                color: '#e8cfa0',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
      
      {/* Backdrop pour fermer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9998,
            backgroundColor: 'transparent'
          }}
        />
      )}
    </div>
  );
}

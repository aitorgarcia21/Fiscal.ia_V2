import React, { useState } from 'react';
import { ChevronDown, Users, Building, Crown } from 'lucide-react';
import { Logo } from './Logo';

const categories = [
  { id: 'particulier', label: 'Particulier', path: '/' },
  { id: 'pro', label: 'Professionnel', path: '/pro-landing' },
  { id: 'andorre', label: 'Francis Andorre', path: '/andorre' }
];

export function SimpleCategorySwitcher() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (path: string, label: string) => {
    console.log('🚀 NAVIGATION:', label, '→', path);
    alert(`Navigation vers: ${label}`);
    window.location.href = path;
  };

  const toggleMenu = () => {
    console.log('🎯 TOGGLE MENU:', !isOpen);
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    console.log('❌ CLOSE MENU');
    setIsOpen(false);
  };

  return (
    <>
      {/* Logo cliquable */}
      <div
        onClick={toggleMenu}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px',
          cursor: 'pointer',
          color: 'white',
          zIndex: 999999,
          position: 'relative'
        }}
      >
        <Logo size="lg" />
        <span style={{ fontWeight: '600', fontSize: '18px' }}>Francis</span>
        <ChevronDown style={{ width: '16px', height: '16px' }} />
      </div>

      {/* Menu déroulant - MÊME STYLE QUE LE BOUTON DE TEST */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '100px',
            left: '20px',
            width: '300px',
            backgroundColor: 'rgba(22, 34, 56, 0.95)',
            border: '2px solid white',
            borderRadius: '12px',
            padding: '16px',
            zIndex: 999999
          }}
        >
          <div style={{ marginBottom: '16px', color: 'white', fontWeight: 'bold' }}>
            Choisir une catégorie:
          </div>
          
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleClick(cat.path, cat.label)}
              onMouseDown={() => console.log('🖱️ MOUSE DOWN:', cat.label)}
              style={{
                padding: '12px',
                margin: '8px 0',
                backgroundColor: 'red',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                border: '2px solid white'
              }}
            >
              {cat.label}
            </div>
          ))}
          
          <div
            onClick={closeMenu}
            style={{
              padding: '8px',
              marginTop: '16px',
              backgroundColor: 'green',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'center',
              fontWeight: 'bold',
              border: '2px solid white'
            }}
          >
            FERMER
          </div>
        </div>
      )}
      
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999998,
            backgroundColor: 'rgba(0,0,0,0.3)'
          }}
        />
      )}
    </>
  );
}

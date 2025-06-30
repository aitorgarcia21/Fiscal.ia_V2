import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  // Redirection automatique vers l'interface pro
  useEffect(() => {
    navigate('/pro-landing', { replace: true });
  }, [navigate]);

  // Affichage temporaire pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c5a572] mx-auto mb-4"></div>
        <p className="text-gray-300">Redirection vers l'espace professionnel...</p>
      </div>
    </div>
  );
} 
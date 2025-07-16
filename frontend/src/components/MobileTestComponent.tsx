import React, { useState } from 'react';
import { 
  MobileOptimizedInput, 
  PhoneInput, 
  EmailInput, 
  NumberInput 
} from './ui/MobileOptimizedInput';
import { 
  MobileOptimizedButton, 
  FloatingActionButton 
} from './ui/MobileOptimizedButton';
import { 
  MobileLayout, 
  MobileContainer, 
  MobileHeader, 
  MobileBottomNav, 
  MobileContent, 
  MobileCard, 
  MobileGrid 
} from './ui/MobileLayout';
import { 
  MessageSquare, 
  Euro, 
  User, 
  Settings, 
  Home,
  Plus,
  Check
} from 'lucide-react';

export const MobileTestComponent: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MobileLayout>
      <MobileHeader>
        <div className="flex items-center gap-3">
          <div className="relative inline-flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-[#c5a572]" />
            <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1.5 -right-1.5" />
          </div>
          <span className="text-xl font-bold text-white">Francis</span>
        </div>
        <MobileOptimizedButton size="sm" variant="outline">
          <Settings className="w-4 h-4" />
        </MobileOptimizedButton>
      </MobileHeader>

      <MobileContent>
        <MobileContainer>
          <div className="space-y-6 py-6">
            <h1 className="text-3xl font-bold text-white text-center">
              Test Mobile
            </h1>
            
            {/* Test des inputs optimisés */}
            <MobileCard>
              <h2 className="text-xl font-semibold text-white mb-4">
                Inputs Optimisés Mobile
              </h2>
              <div className="space-y-4">
                <MobileOptimizedInput
                  label="Nom complet"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Votre nom"
                />
                
                <EmailInput
                  label="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="votre@email.com"
                />
                
                <PhoneInput
                  label="Téléphone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="06 12 34 56 78"
                />
                
                <NumberInput
                  label="Âge"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="25"
                />
              </div>
            </MobileCard>

            {/* Test des boutons */}
            <MobileCard>
              <h2 className="text-xl font-semibold text-white mb-4">
                Boutons Optimisés
              </h2>
              <div className="space-y-4">
                <MobileOptimizedButton 
                  variant="primary" 
                  size="lg"
                  className="w-full"
                >
                  <Check className="w-5 h-5" />
                  Bouton Principal
                </MobileOptimizedButton>
                
                <MobileOptimizedButton 
                  variant="secondary" 
                  size="md"
                  className="w-full"
                >
                  Bouton Secondaire
                </MobileOptimizedButton>
                
                <MobileOptimizedButton 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  Bouton Outline
                </MobileOptimizedButton>
              </div>
            </MobileCard>

            {/* Test de la grille responsive */}
            <MobileCard>
              <h2 className="text-xl font-semibold text-white mb-4">
                Grille Responsive
              </h2>
              <MobileGrid cols={2} gap="md">
                <div className="bg-[#1a2332]/40 p-4 rounded-lg text-center">
                  <User className="w-8 h-8 text-[#c5a572] mx-auto mb-2" />
                  <p className="text-white font-medium">Profil</p>
                </div>
                <div className="bg-[#1a2332]/40 p-4 rounded-lg text-center">
                  <MessageSquare className="w-8 h-8 text-[#c5a572] mx-auto mb-2" />
                  <p className="text-white font-medium">Chat</p>
                </div>
                <div className="bg-[#1a2332]/40 p-4 rounded-lg text-center">
                  <Euro className="w-8 h-8 text-[#c5a572] mx-auto mb-2" />
                  <p className="text-white font-medium">Finance</p>
                </div>
                <div className="bg-[#1a2332]/40 p-4 rounded-lg text-center">
                  <Settings className="w-8 h-8 text-[#c5a572] mx-auto mb-2" />
                  <p className="text-white font-medium">Réglages</p>
                </div>
              </MobileGrid>
            </MobileCard>

            {/* Test de scroll */}
            <div className="space-y-4">
              {Array.from({ length: 10 }, (_, i) => (
                <MobileCard key={i}>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Section de Test {i + 1}
                  </h3>
                  <p className="text-gray-300">
                    Ceci est une section de test pour vérifier le scroll et l'espacement 
                    sur mobile. Le contenu doit être bien lisible et accessible.
                  </p>
                </MobileCard>
              ))}
            </div>
          </div>
        </MobileContainer>
      </MobileContent>

      {/* Navigation mobile en bas */}
      <MobileBottomNav>
        <MobileOptimizedButton variant="outline" size="sm">
          <Home className="w-5 h-5" />
        </MobileOptimizedButton>
        <MobileOptimizedButton variant="outline" size="sm">
          <MessageSquare className="w-5 h-5" />
        </MobileOptimizedButton>
        <MobileOptimizedButton variant="outline" size="sm">
          <User className="w-5 h-5" />
        </MobileOptimizedButton>
        <MobileOptimizedButton variant="outline" size="sm">
          <Settings className="w-5 h-5" />
        </MobileOptimizedButton>
      </MobileBottomNav>

      {/* Bouton flottant */}
      <FloatingActionButton variant="primary">
        <Plus className="w-6 h-6" />
      </FloatingActionButton>
    </MobileLayout>
  );
};
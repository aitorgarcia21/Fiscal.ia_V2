import React from 'react';
import { Bot, MessageSquare, Euro } from 'lucide-react';

interface FrancisFloatingButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

export const FrancisFloatingButton: React.FC<FrancisFloatingButtonProps> = ({
  onClick,
  isActive = false
}) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'bg-white text-blue-600 hover:bg-blue-50'
      }`}
      aria-label="Ouvrir le chat Francis"
    >
      {isActive ? (
        <div className="relative inline-flex items-center justify-center group">
          <MessageSquare size={28} className="animate-pulse text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
          <Euro size={20} className="text-[#c5a572] absolute -bottom-1 -right-1 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
        </div>
      ) : (
        <div className="relative inline-flex items-center justify-center group">
          <MessageSquare size={28} className="text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
          <Euro size={20} className="text-[#c5a572] absolute -bottom-1 -right-1 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
        </div>
      )}
    </button>
  );
};

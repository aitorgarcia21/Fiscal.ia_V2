import React from 'react';
import { Bot, MessageSquare } from 'lucide-react';

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
        <MessageSquare size={28} className="animate-pulse" />
      ) : (
        <div className="relative">
          <Bot size={28} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
          </span>
        </div>
      )}
    </button>
  );
};

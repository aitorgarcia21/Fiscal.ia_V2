import React from 'react';
import { MessageSquare, Euro } from 'lucide-react';

interface FrancisFloatingButtonProps {
  onClick?: () => void;
  className?: string;
}

/**
 * Minimal placeholder component so that the build passes.
 * To be replaced with a real implementation later.
 */
export const FrancisFloatingButton: React.FC<FrancisFloatingButtonProps> = ({ onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`fixed bottom-6 right-6 w-16 h-16 flex items-center justify-center rounded-full bg-[#c5a572] text-[#162238] shadow-xl hover:bg-[#e8cfa0] transition-colors animate-bounce ${className}`}
    title="Francis, votre copilote"
  >
    <div className="relative">
      <MessageSquare className="w-7 h-7" />
      <Euro className="w-4 h-4 absolute -bottom-0.5 -right-0.5 bg-[#c5a572] rounded-full p-0.5" />
    </div>
  </button>
);

export default FrancisFloatingButton;

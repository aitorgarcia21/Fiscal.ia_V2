import React from 'react';
import { Bot } from 'lucide-react';

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
    title="Parler à Francis"
  >
    <Bot className="w-7 h-7" />
  </button>
);

export default FrancisFloatingButton;

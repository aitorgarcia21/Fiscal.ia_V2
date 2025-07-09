import React from 'react';

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
    className={`fixed bottom-6 right-6 p-4 rounded-full bg-[#c5a572] text-[#162238] shadow-lg hover:bg-[#e8cfa0] transition-colors ${className}`}
    title="Parler à Francis"
  >
    Francis
  </button>
);

export default FrancisFloatingButton;

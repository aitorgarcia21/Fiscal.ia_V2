import React from 'react';

interface QuickQuestionCardProps {
  question: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Placeholder QuickQuestionCard component.
 * Displays a simple clickable card with a question.
 */
export const QuickQuestionCard: React.FC<QuickQuestionCardProps> = ({ question, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-4 bg-[#162238] text-[#c5a572] rounded-lg shadow hover:bg-[#1a2942] transition-colors text-left ${className}`}
  >
    {question}
  </button>
);

export default QuickQuestionCard;

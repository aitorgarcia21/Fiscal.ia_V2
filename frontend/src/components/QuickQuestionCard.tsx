import React from 'react';

interface QuickQuestionCardProps {
  question: string;
  onClick: () => void;
}

export const QuickQuestionCard: React.FC<QuickQuestionCardProps> = ({ question, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left h-full w-full"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
        <span className="text-sm font-medium text-gray-800">{question}</span>
      </div>
    </button>
  );
};

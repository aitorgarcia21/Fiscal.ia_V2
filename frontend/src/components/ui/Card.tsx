import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-[#1a2942]/80 backdrop-blur-sm rounded-xl p-6 border border-[#c5a572]/20 ${className}`}>
      {children}
    </div>
  );
}

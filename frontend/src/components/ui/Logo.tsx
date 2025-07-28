import React from 'react';
import { MessageSquare, Euro } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 'md', className = '', showText = false }: LogoProps) {
  const sizeClasses = {
    sm: { main: 'h-6 w-6', euro: 'h-4 w-4', padding: 'p-0.5' },
    md: { main: 'h-8 w-8', euro: 'h-5 w-5', padding: 'p-0.5' },
    lg: { main: 'h-10 w-10', euro: 'h-7 w-7', padding: 'p-0.5' },
    xl: { main: 'h-12 w-12', euro: 'h-8 w-8', padding: 'p-1' }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative inline-flex items-center justify-center">
        <MessageSquare className={`${sizeClasses[size].main} text-[#c5a572] transition-transform group-hover:scale-110 duration-300`} />
        <Euro className={`${sizeClasses[size].euro} text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full ${sizeClasses[size].padding} transition-transform group-hover:scale-110 duration-300`} />
      </div>
      {showText && (
        <span className="text-xl font-bold text-white">Francis</span>
      )}
    </div>
  );
} 
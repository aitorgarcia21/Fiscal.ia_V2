import React from 'react';
import { MessageSquare, Euro } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export function Logo({ 
  size = 'md', 
  className = '', 
  showText = false
}: LogoProps) {
  const sizeClasses = {
    sm: { main: 'h-6 w-6', euro: 'h-4 w-4', padding: 'p-0.5', text: 'text-lg' },
    md: { main: 'h-8 w-8', euro: 'h-5 w-5', padding: 'p-0.5', text: 'text-xl' },
    lg: { main: 'h-10 w-10', euro: 'h-7 w-7', padding: 'p-0.5', text: 'text-2xl' },
    xl: { main: 'h-12 w-12', euro: 'h-8 w-8', padding: 'p-1', text: 'text-3xl' }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <MessageSquare className={`${sizeClasses[size].main} text-[#c5a572] transition-transform group-hover:scale-110 duration-300`} />
        <Euro className={`${sizeClasses[size].euro} text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full ${sizeClasses[size].padding} border-2 border-[#162238] transition-transform group-hover:scale-110 duration-300`} />
      </div>
      {showText && (
        <span className={`${sizeClasses[size].text} font-bold text-white`}>Francis</span>
      )}
    </div>
  );
}
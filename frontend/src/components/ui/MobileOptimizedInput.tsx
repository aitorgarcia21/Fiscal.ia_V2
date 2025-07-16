import React from 'react';

interface MobileOptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const MobileOptimizedInput: React.FC<MobileOptimizedInputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <input
        {...props}
        className={`
          w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg 
          px-4 py-3 text-white text-base
          focus:ring-2 focus:ring-[#c5a572] focus:border-transparent
          placeholder-gray-400
          min-h-[44px] /* Taille minimale pour le touch */
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
      />
      {helperText && (
        <p className="text-sm text-gray-400">{helperText}</p>
      )}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

// Composant spécialisé pour les numéros de téléphone
export const PhoneInput: React.FC<MobileOptimizedInputProps> = (props) => {
  return (
    <MobileOptimizedInput
      {...props}
      type="tel"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="tel"
    />
  );
};

// Composant spécialisé pour les emails
export const EmailInput: React.FC<MobileOptimizedInputProps> = (props) => {
  return (
    <MobileOptimizedInput
      {...props}
      type="email"
      inputMode="email"
      autoComplete="email"
    />
  );
};

// Composant spécialisé pour les nombres
export const NumberInput: React.FC<MobileOptimizedInputProps> = (props) => {
  return (
    <MobileOptimizedInput
      {...props}
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
    />
  );
};
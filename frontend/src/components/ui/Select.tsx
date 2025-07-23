import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  onValueChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ 
  className = '', 
  children,
  onValueChange,
  onChange,
  ...props 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <select
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onChange={handleChange}
      {...props}
    >
      {children}
    </select>
  );
};

// Export sub-components for compatibility with CGP imports
export const SelectContent: React.FC<{children: React.ReactNode}> = ({ children }) => <>{children}</>;
export const SelectItem: React.FC<{value: string, children: React.ReactNode}> = ({ value, children }) => <option value={value}>{children}</option>;
export const SelectTrigger: React.FC<{children: React.ReactNode}> = ({ children }) => <>{children}</>;
export const SelectValue: React.FC<{placeholder?: string}> = ({ placeholder }) => <option value="" disabled>{placeholder}</option>;

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface StripeErrorProps {
  message: string;
}

export function StripeError({ message }: StripeErrorProps) {
  if (!message) return null;

  return (
    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="h-5 w-5" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
} 
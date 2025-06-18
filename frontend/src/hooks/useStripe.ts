import { useState } from 'react';
import { createCheckoutSession, createPortalSession, CreateCheckoutSessionRequest, CreatePortalSessionRequest } from '../services/stripe';

export const useStripe = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectToCheckout = async (data: CreateCheckoutSessionRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { url } = await createCheckoutSession(data);
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
      console.error('Erreur redirection checkout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToPortal = async (data?: CreatePortalSessionRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { url } = await createPortalSession(data);
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
      console.error('Erreur redirection portal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    redirectToCheckout,
    redirectToPortal,
  };
}; 
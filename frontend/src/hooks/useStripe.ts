import { useState } from 'react';
import { StripeService } from '../services/stripe';
import { PricingPlan } from '../config/pricing';

export const useStripe = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stripeService = StripeService.getInstance();

  const handleCheckout = async (plan: PricingPlan) => {
    try {
      setIsLoading(true);
      setError(null);
      const url = await stripeService.createCheckoutSession(plan);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePortal = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const url = await stripeService.createPortalSession();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleCheckout,
    handlePortal,
    isLoading,
    error
  };
}; 
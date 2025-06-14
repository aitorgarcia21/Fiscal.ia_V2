import { PRICING, PricingPlan } from '../config/pricing';

export class StripeService {
  private static instance: StripeService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  }

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  public async createCheckoutSession(plan: PricingPlan): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: PRICING[plan].stripePriceId,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Erreur Stripe:', error);
      throw error;
    }
  }

  public async createPortalSession(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/account`,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session du portail');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Erreur Stripe:', error);
      throw error;
    }
  }
} 
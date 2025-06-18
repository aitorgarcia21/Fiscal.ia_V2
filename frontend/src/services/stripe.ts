import apiClient from './apiClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface CreateCheckoutSessionRequest {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreatePortalSessionRequest {
  returnUrl?: string;
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface PortalSessionResponse {
  url: string;
}

export async function createCheckoutSession(data: CreateCheckoutSessionRequest): Promise<CheckoutSessionResponse> {
  try {
    const response = await apiClient<CheckoutSessionResponse>('/api/create-checkout-session', {
      method: 'POST',
      data: {
        priceId: data.priceId,
        successUrl: data.successUrl || `${window.location.origin}/success`,
        cancelUrl: data.cancelUrl || `${window.location.origin}/pricing`
      }
    });
    
    return response;
  } catch (error: any) {
    console.error('Erreur lors de la création de la session de checkout:', error);
    throw new Error(
      error.data?.detail || 
      'Erreur lors de la création de la session de paiement'
    );
  }
}

export async function createPortalSession(data: CreatePortalSessionRequest = {}): Promise<PortalSessionResponse> {
  try {
    const response = await apiClient<PortalSessionResponse>('/api/create-portal-session', {
      method: 'POST',
      data: {
        returnUrl: data.returnUrl || `${window.location.origin}/account`
      }
    });
    
    return response;
  } catch (error: any) {
    console.error('Erreur lors de la création de la session portal:', error);
    throw new Error(
      error.data?.detail || 
      'Erreur lors de l\'accès au portail de gestion'
    );
  }
} 
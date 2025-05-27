export const PRICING = {
  MONTHLY: {
    price: 9.99,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: 'price_monthly', // À remplacer par l'ID réel de Stripe
    features: [
      'Accès illimité à Francis',
      'Conseils personnalisés',
      'Sans engagement'
    ]
  },
  ANNUAL: {
    price: 99.99,
    currency: 'EUR',
    interval: 'year',
    stripePriceId: 'price_annual', // À remplacer par l'ID réel de Stripe
    features: [
      'Accès illimité à Francis',
      'Conseils personnalisés',
      'Sans engagement',
      'Économisez 17%'
    ]
  }
} as const;

export type PricingPlan = keyof typeof PRICING; 
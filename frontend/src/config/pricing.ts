export const PRICING = {
  // Plans Particuliers
  MONTHLY: {
    price: 9.99,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: 'price_1QVVfZGZEuLRLMp4FZd4eqCH', // ID de test Stripe pour 9.99€/mois
    type: 'particulier',
    features: [
      'Accès illimité à Francis 24/7',
      'Analyse personnalisée de votre situation fiscale',
      'Recommandations adaptées à votre profil',
      'Suivi en temps réel de vos optimisations',
      'Mises à jour quotidiennes de la fiscalité',
      'Sans engagement - Annulez à tout moment'
    ]
  },
  ANNUAL: {
    price: 99.99,
    currency: 'EUR',
    interval: 'year',
    stripePriceId: 'price_1QVVh0GZEuLRLMp4qwjkFxrE', // ID de test Stripe pour 99.99€/an
    type: 'particulier',
    features: [
      'Accès illimité à Francis 24/7',
      'Analyse personnalisée de votre situation fiscale',
      'Recommandations adaptées à votre profil',
      'Suivi en temps réel de vos optimisations',
      'Mises à jour quotidiennes de la fiscalité',
      'Sans engagement - Annulez à tout moment',
      'Économisez 17% par rapport au tarif mensuel'
    ]
  },
  // Plans Professionnels
  PRO_MONTHLY: {
    price: 49.99,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: 'price_1QVVfZGZEuLRLMp4FZd4eqCH', // Utilisation temporaire de l'ID particulier pour test
    type: 'professionnel',
    features: [
      'Interface Pro complète',
      'Gestion illimitée de clients',
      'Analyses patrimoniales et fiscales automatisées',
      'Rapports professionnels personnalisés',
      'Dashboard temps réel',
      'Support prioritaire',
      'Formation et onboarding inclus'
    ]
  },
  PRO_ANNUAL: {
    price: 499.99,
    currency: 'EUR',
    interval: 'year',
    stripePriceId: 'price_1QVVh0GZEuLRLMp4qwjkFxrE', // Utilisation temporaire de l'ID particulier pour test
    type: 'professionnel',
    features: [
      'Interface Pro complète',
      'Gestion illimitée de clients',
      'Analyses patrimoniales et fiscales automatisées',
      'Rapports professionnels personnalisés',
      'Dashboard temps réel',
      'Support prioritaire',
      'Formation et onboarding inclus',
      'Économisez 17% par rapport au tarif mensuel'
    ]
  }
} as const;

export type PricingPlan = keyof typeof PRICING; 
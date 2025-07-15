export const PRICING = {
  // Plans Particuliers (limités à 30 requêtes/mois)
  MONTHLY: {
    price: 9.99,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: 'price_1RiGEHG0JMtmHIL2YEl2kzaH', // Prix mensuel particulier (9.99€/mois - 30 requêtes)
    type: 'particulier',
    requestLimit: 30,
    features: [
      'Accès à Francis 24/7',
      'Analyse personnalisée de votre situation fiscale',
      'Recommandations adaptées à votre profil',
      'Suivi en temps réel de vos optimisations',
      'Mises à jour quotidiennes de la fiscalité',
      '30 requêtes par mois incluses',
      'Sans engagement - Annulez à tout moment'
    ]
  },
  ANNUAL: {
    price: 99.99,
    currency: 'EUR',
    interval: 'year',
    stripePriceId: 'price_1RiGEoG0JMtmHIL27nuiIWfm', // Prix annuel particulier (99.99€/an - 360 requêtes)
    type: 'particulier',
    requestLimit: 360,
    features: [
      'Accès à Francis 24/7',
      'Analyse personnalisée de votre situation fiscale',
      'Recommandations adaptées à votre profil',
      'Suivi en temps réel de vos optimisations',
      'Mises à jour quotidiennes de la fiscalité',
      '360 requêtes par an incluses',
      'Sans engagement - Annulez à tout moment',
      'Économisez 17% par rapport au tarif mensuel'
    ]
  },
  // Plans Professionnels (illimités)
  PRO_MONTHLY: {
    price: 49,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: 'price_1RiGKGG0JMtmHIL25K3BCdXs', // Prix mensuel Pro (49.00€/mois - illimité)
    type: 'professionnel',
    requestLimit: -1, // Illimité
    features: [
      'Interface Pro complète',
      'Gestion illimitée de clients',
      'Analyses patrimoniales et fiscales automatisées',
      'Rapports professionnels personnalisés',
      'Dashboard temps réel',
      'Support prioritaire',
      'Formation et onboarding inclus',
      'Requêtes illimitées'
    ]
  },
  PRO_ANNUAL: {
    price: 490,
    currency: 'EUR',
    interval: 'year',
    stripePriceId: 'price_1RiGKHG0JMtmHIL2dd1tuPjz', // Prix annuel Pro (490.00€/an - illimité)
    type: 'professionnel',
    requestLimit: -1, // Illimité
    features: [
      'Interface Pro complète',
      'Gestion illimitée de clients',
      'Analyses patrimoniales et fiscales automatisées',
      'Rapports professionnels personnalisés',
      'Dashboard temps réel',
      'Support prioritaire',
      'Formation et onboarding inclus',
      'Requêtes illimitées',
      'Économisez 17% par rapport au tarif mensuel'
    ]
  }
} as const;

export type PricingPlan = keyof typeof PRICING; 
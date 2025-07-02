import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, TrendingUp, Calculator, Euro, Building, Target, Zap, Shield, Brain, Clock } from 'lucide-react';

const blogPosts = [
  {
    id: 'optimisation-fiscale-2025',
    title: 'Optimisation Fiscale 2025 : Les 15 Stratégies les Plus Efficaces pour Réduire vos Impôts',
    excerpt: 'Découvrez les techniques d\'optimisation fiscale les plus performantes pour 2025. Guide complet avec calculs et exemples concrets pour maximiser vos économies d\'impôts.',
    content: `
      <h2>Optimisation Fiscale 2025 : Guide Complet pour Réduire vos Impôts</h2>
      
      <p>L'optimisation fiscale 2025 représente une opportunité unique pour les contribuables français de réduire significativement leur charge fiscale. Dans ce guide complet, nous vous révélons les stratégies les plus efficaces validées par les experts comptables.</p>
      
      <h3>1. Plan Épargne Retraite (PER) : L'Optimisation Fiscale par Excellence</h3>
      <p>Le PER reste l'outil d'optimisation fiscale le plus performant en 2025. Avec une déduction fiscale pouvant atteindre 10% de vos revenus professionnels, le PER permet de réaliser des économies d'impôts substantielles.</p>
      
      <h4>Calcul d'optimisation PER 2025 :</h4>
      <ul>
        <li>Revenus imposables : 80 000€</li>
        <li>Cotisation PER optimale : 8 000€</li>
        <li>Économie d'impôt : 3 280€ (taux marginal 41%)</li>
        <li>Coût net : 4 720€</li>
        <li>Gain net : 3 280€ par an</li>
      </ul>
      
      <h3>2. Investissement LMNP : Optimisation Fiscale Immobilière</h3>
      <p>L'investissement en Loueur Meublé Non Professionnel (LMNP) permet de déduire les charges et intérêts d'emprunt de vos revenus locatifs, créant ainsi une optimisation fiscale immobilière efficace.</p>
      
      <h3>3. Donation-Partage : Optimisation de la Transmission</h3>
      <p>La donation-partage anticipée permet de réduire significativement les droits de succession tout en optimisant la transmission du patrimoine familial.</p>
      
      <h3>4. Création de SCI : Optimisation ISF/IFI</h3>
      <p>La Société Civile Immobilière (SCI) familiale constitue un outil d'optimisation fiscale puissant pour réduire l'Impôt sur la Fortune Immobilière (IFI).</p>
      
      <h3>5. Optimisation Fiscale via l'Assurance-Vie</h3>
      <p>L'assurance-vie reste un pilier de l'optimisation fiscale française, offrant une fiscalité avantageuse sur les plus-values et la transmission.</p>
      
      <h2>Stratégies d'Optimisation Fiscale Avancées</h2>
      
      <h3>6. Optimisation Fiscale des Plus-Values</h3>
      <p>La gestion optimisée des plus-values mobilières et immobilières permet de réduire significativement l'impôt sur les plus-values.</p>
      
      <h3>7. Optimisation Fiscale des Revenus de Capitaux</h3>
      <p>La diversification des placements et l'utilisation des enveloppes fiscales appropriées optimisent la fiscalité des revenus de capitaux.</p>
      
      <h3>8. Optimisation Fiscale des Dons</h3>
      <p>Les dons aux associations d'intérêt général permettent une réduction d'impôt de 66% du montant versé, dans la limite de 20% du revenu imposable.</p>
      
      <h2>Calculs d'Optimisation Fiscale 2025</h2>
      
      <h3>Exemple d'Optimisation Fiscale Complète :</h3>
      <p>Pour un contribuable avec 100 000€ de revenus imposables :</p>
      <ul>
        <li>Optimisation PER : -3 280€ d'impôts</li>
        <li>Optimisation LMNP : -2 400€ d'impôts</li>
        <li>Optimisation dons : -1 320€ d'impôts</li>
        <li>Optimisation assurance-vie : -800€ d'impôts</li>
        <li><strong>Économie totale : 7 800€ par an</strong></li>
      </ul>
      
      <h2>Conseils d'Experts pour l'Optimisation Fiscale</h2>
      
      <p>L'optimisation fiscale 2025 nécessite une approche globale et personnalisée. Chaque situation fiscale est unique et mérite une analyse approfondie pour identifier les leviers d'optimisation les plus pertinents.</p>
      
      <h3>Points Clés de l'Optimisation Fiscale :</h3>
      <ul>
        <li>Anticiper les changements fiscaux</li>
        <li>Diversifier les stratégies d'optimisation</li>
        <li>Respecter la légalité fiscale</li>
        <li>Adapter les stratégies à sa situation personnelle</li>
        <li>Suivre l'évolution de la réglementation</li>
      </ul>
      
      <h2>Conclusion : Optimisation Fiscale 2025</h2>
      
      <p>L'optimisation fiscale 2025 offre de nombreuses opportunités pour réduire sa charge fiscale de manière légale et efficace. En combinant les différentes stratégies présentées, il est possible de réaliser des économies d'impôts significatives tout en préparant son avenir financier.</p>
      
      <p>Pour une optimisation fiscale personnalisée et optimale, il est recommandé de faire appel à un expert-comptable ou un conseiller en investissement financier spécialisé dans l'optimisation fiscale.</p>
    `,
    date: '2024-12-19',
    author: 'Équipe Francis',
    tags: ['optimisation fiscale', 'impôts', 'PER', 'LMNP', 'SCI', 'assurance-vie'],
    readTime: '8 min',
    priority: 1.0
  },
  {
    id: 'per-optimisation-2025',
    title: 'PER 2025 : Optimisation Fiscale Maximale avec le Plan Épargne Retraite',
    excerpt: 'Guide complet du PER 2025 : calculs d\'optimisation fiscale, montants optimaux, avantages et inconvénients. Maximisez vos économies d\'impôts avec le PER.',
    content: `
      <h2>PER 2025 : L'Optimisation Fiscale par Excellence</h2>
      
      <p>Le Plan Épargne Retraite (PER) constitue l'outil d'optimisation fiscale le plus performant en 2025. Ce dispositif permet de réduire significativement sa charge fiscale tout en préparant sa retraite.</p>
      
      <h3>Calcul d'Optimisation Fiscale PER 2025</h3>
      
      <h4>Exemple 1 : Revenus 60 000€</h4>
      <ul>
        <li>Cotisation PER optimale : 6 000€</li>
        <li>Économie d'impôt : 1 800€ (taux 30%)</li>
        <li>Coût net : 4 200€</li>
        <li>Gain net : 1 800€ par an</li>
      </ul>
      
      <h4>Exemple 2 : Revenus 100 000€</h4>
      <ul>
        <li>Cotisation PER optimale : 10 000€</li>
        <li>Économie d'impôt : 4 100€ (taux 41%)</li>
        <li>Coût net : 5 900€</li>
        <li>Gain net : 4 100€ par an</li>
      </ul>
      
      <h3>Stratégies d'Optimisation PER Avancées</h3>
      
      <p>Pour maximiser l'optimisation fiscale via le PER, il est essentiel de :</p>
      <ul>
        <li>Calculer le montant optimal de cotisation</li>
        <li>Choisir le bon moment pour cotiser</li>
        <li>Diversifier les supports d'investissement</li>
        <li>Anticiper la fiscalité de sortie</li>
      </ul>
      
      <h2>Optimisation Fiscale PER : Points Clés</h2>
      
      <p>Le PER offre une optimisation fiscale unique grâce à sa déduction immédiate et sa fiscalité de sortie avantageuse. C'est l'outil d'optimisation fiscale préféré des experts comptables en 2025.</p>
    `,
    date: '2024-12-18',
    author: 'Équipe Francis',
    tags: ['PER', 'optimisation fiscale', 'retraite', 'économie d\'impôt'],
    readTime: '6 min',
    priority: 0.9
  },
  {
    id: 'lmnp-optimisation-fiscale',
    title: 'LMNP 2025 : Optimisation Fiscale Immobilière Complète',
    excerpt: 'Guide LMNP 2025 : optimisation fiscale immobilière, calculs de rentabilité, déductions fiscales. Maximisez vos économies d\'impôts avec l\'investissement LMNP.',
    content: `
      <h2>LMNP 2025 : Optimisation Fiscale Immobilière</h2>
      
      <p>L'investissement LMNP (Loueur Meublé Non Professionnel) représente une stratégie d'optimisation fiscale immobilière particulièrement efficace en 2025.</p>
      
      <h3>Calcul d'Optimisation Fiscale LMNP</h3>
      
      <h4>Exemple d'Investissement LMNP :</h4>
      <ul>
        <li>Prix d'acquisition : 200 000€</li>
        <li>Revenus locatifs : 12 000€/an</li>
        <li>Charges déductibles : 8 000€/an</li>
        <li>Amortissement : 10 000€/an</li>
        <li>Résultat fiscal : -6 000€ (déficit)</li>
        <li>Économie d'impôt : 2 460€ (taux 41%)</li>
      </ul>
      
      <h3>Optimisation Fiscale LMNP : Stratégies</h3>
      
      <p>L'optimisation fiscale LMNP passe par :</p>
      <ul>
        <li>La maximisation des déductions</li>
        <li>L'optimisation de l'amortissement</li>
        <li>La gestion des charges</li>
        <li>L'anticipation de la fiscalité de sortie</li>
      </ul>
      
      <h2>Avantages de l'Optimisation Fiscale LMNP</h2>
      
      <p>Le LMNP offre une optimisation fiscale immobilière unique avec des déductions importantes et une fiscalité de sortie avantageuse.</p>
    `,
    date: '2024-12-17',
    author: 'Équipe Francis',
    tags: ['LMNP', 'optimisation fiscale', 'immobilier', 'investissement'],
    readTime: '7 min',
    priority: 0.8
  },
  {
    id: 'transformer-cabinet-conseil',
    title: 'Transformer votre cabinet en 2025 : Automatisation et IA au service des conseillers',
    excerpt: 'Découvrez comment digitaliser vos processus, automatiser la prise de notes et offrir une expérience client premium grâce à Francis.',
    content: `
      <h2>Transformer votre cabinet en 2025</h2>
      <p>Les cabinets de conseil financier qui adoptent l\'IA voient leur productivité grimper de 30 % en moyenne. Dans cet article, nous détaillons les étapes pour automatiser vos tâches administratives et recentrer votre temps sur la valeur ajoutée : le conseil.</p>
      <h3>1. Identifier les tâches chronophages</h3>
      <p>Transcription d\'entretiens, rédaction de synthèses, mise à jour des dossiers clients… Autant d\'activités que Francis peut réaliser automatiquement.</p>
      <h3>2. Mettre en place une solution d\'IA sécurisée</h3>
      <p>Francis assure la conformité RGPD et l\'hébergement en France, garantissant la sécurité des données sensibles de vos clients.</p>
      <h3>3. Mesurer l\'impact économique</h3>
      <ul>
        <li>Jusqu\'à 10 h économisées par conseiller chaque semaine</li>
        <li>Augmentation de 20 % du nombre de rendez-vous traités</li>
        <li>Amélioration de la satisfaction client (+15 pts NPS)</li>
      </ul>
      <h2>Conclusion</h2>
      <p>La transformation digitale de votre cabinet n\'est plus une option. Avec Francis, vous passez à la vitesse supérieure tout en offrant un service haut de gamme.</p>
    `,
    date: '2025-01-05',
    author: 'Équipe Francis',
    tags: ['digitalisation', 'cabinet', 'IA', 'automatisation'],
    readTime: '5 min',
    priority: 1.1
  }
];

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100">
      {/* Header discret */}
      <header className="bg-[#162238]/95 backdrop-blur-lg border-b border-[#2A3F6C]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-[#c5a572] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au site</span>
            </Link>
            <h1 className="text-lg font-semibold text-gray-300">Blog Fiscal</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction discrète */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Conseils d'Optimisation Fiscale
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Découvrez nos articles spécialisés sur l'optimisation fiscale, la réduction d'impôts et les stratégies financières efficaces.
          </p>
        </div>

        {/* Articles de blog */}
        <div className="space-y-8">
          {blogPosts.map((post, index) => (
            <article key={post.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-[#c5a572]/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 hover:text-[#c5a572] transition-colors cursor-pointer">
                    {post.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    {post.excerpt}
                  </p>
                  
                  {/* Meta informations discrètes */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                  </div>
                  
                  {/* Tags SEO */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 bg-[#c5a572]/20 text-[#c5a572] text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Bouton lire plus discret */}
              <button className="text-[#c5a572] text-sm font-semibold hover:text-[#e8cfa0] transition-colors">
                Lire l'article complet →
              </button>
            </article>
          ))}
        </div>

        {/* Section SEO discrète */}
        <div className="mt-16 bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Optimisation Fiscale : Ressources Complémentaires</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-[#c5a572] mb-2">Stratégies d'Optimisation</h4>
              <ul className="space-y-1">
                <li>• Optimisation fiscale PER</li>
                <li>• Optimisation fiscale LMNP</li>
                <li>• Optimisation fiscale SCI</li>
                <li>• Optimisation fiscale assurance-vie</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#c5a572] mb-2">Calculs d'Optimisation</h4>
              <ul className="space-y-1">
                <li>• Calcul optimisation fiscale 2025</li>
                <li>• Simulateur d'économie d'impôt</li>
                <li>• Optimisation fiscale personnalisée</li>
                <li>• Conseils d'optimisation fiscale</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogPage; 
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Building, MapPin, Phone } from 'lucide-react';

const MentionsLegales = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100">
      <header className="bg-[#162238]/95 backdrop-blur-lg border-b border-[#2A3F6C]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-[#c5a572] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au site</span>
            </Link>
            <h1 className="text-lg font-semibold text-gray-300">Mentions Légales</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/5 rounded-xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Mentions Légales</h2>
            <p className="text-gray-400 text-sm">(Conformes aux articles 6‑III et 19 de la LCEN n° 2004‑575 du 21 juin 2004 et au RGPD n° 2016/679)</p>
          </div>
          
          <div className="space-y-8 text-gray-300">
            {/* 1. Éditeur du site */}
            <section>
              <h3 className="text-xl font-semibold text-[#c5a572] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                1. Éditeur du site
              </h3>
              <div className="bg-[#0E2444] rounded-lg p-6 border border-[#c5a572]/20">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-[#c5a572] mb-2">Dénomination sociale</h4>
                    <p className="text-sm mb-4">FISCAL.IA – copilote d'optimisation fiscale à destination des professionnels de la fiscalité et de la finance, sans caractère de conseil réglementé</p>
                    
                    <h4 className="font-semibold text-[#c5a572] mb-2">Forme juridique</h4>
                    <p className="text-sm mb-4">Société par actions simplifiée unipersonnelle (SASU)</p>
                    
                    <h4 className="font-semibold text-[#c5a572] mb-2">Capital social</h4>
                    <p className="text-sm">100 €</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#c5a572] mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Siège social
                    </h4>
                    <p className="text-sm mb-4">17 chemin du Prieuré, 79260 La Crèche</p>
                    
                    <h4 className="font-semibold text-[#c5a572] mb-2">Immatriculation</h4>
                    <p className="text-sm mb-4">RCS Niort n° 943 531 152</p>
                    
                    <h4 className="font-semibold text-[#c5a572] mb-2">TVA intracommunautaire</h4>
                    <p className="text-sm mb-4">FR93 943 531 152</p>
                    
                    <h4 className="font-semibold text-[#c5a572] mb-2">Directeur de la publication</h4>
                    <p className="text-sm mb-4">Aitor Garcia, président</p>
                    
                    <h4 className="font-semibold text-[#c5a572] mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Contact
                    </h4>
                    <p className="text-sm">✉️ contact@fiscal.ia</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Hébergeur */}
            <section>
              <h3 className="text-xl font-semibold text-[#c5a572] mb-4">2. Hébergeur</h3>
              <div className="bg-[#0E2444] rounded-lg p-6 border border-[#c5a572]/20">
                <p>Le site est hébergé par <strong>Railway Inc.</strong>, 818 E 3rd St, Little Rock, AR 72202, États-Unis – <a href="https://railway.app" target="_blank" rel="noopener noreferrer" className="text-[#c5a572] hover:underline">https://railway.app</a></p>
              </div>
            </section>

            {/* 3. Activité & services */}
            <section>
              <h3 className="text-xl font-semibold text-[#c5a572] mb-4">3. Activité & services proposés</h3>
              <div className="bg-[#0E2444] rounded-lg p-6 border border-[#c5a572]/20">
                <p className="mb-4">FISCAL.IA est un copilote fiscal automatisé conçu pour assister les professionnels dans leurs démarches fiscales, comptables et administratives à l'aide d'automatisations et de simulations, sans fournir de recommandations personnalisées relevant du conseil réglementé. Il propose notamment :</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-[#c5a572] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Simulation et projection d'impôt 2025</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-[#c5a572] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Automatisation des déclarations fiscales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-[#c5a572] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Analyse d'optimisation PER, LMNP, SCI, assurance-vie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-[#c5a572] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Préparation des bilans comptables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-[#c5a572] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Aide à la structuration juridique et patrimoniale</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-[#c5a572] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Intégration avec des outils bancaires, comptables et CRM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-[#c5a572] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Suivi fiscal automatisé et alertes personnalisées (à titre informatif uniquement)</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 4. Propriété intellectuelle */}
            <section>
              <h3 className="text-xl font-semibold text-[#c5a572] mb-4">4. Propriété intellectuelle</h3>
              <div className="bg-[#0E2444] rounded-lg p-6 border border-[#c5a572]/20">
                <p>Tout le contenu (textes, logos, outils, code) est la propriété exclusive de FISCAL.IA. Toute reproduction totale ou partielle sans autorisation est interdite (articles L. 335‑2 et suivants du Code de la propriété intellectuelle).</p>
              </div>
            </section>

            {/* 5. Responsabilité */}
            <section>
              <h3 className="text-xl font-semibold text-[#c5a572] mb-4">5. Responsabilité</h3>
              <div className="bg-[#0E2444] rounded-lg p-6 border border-[#c5a572]/20">
                <p>Les informations sont fournies à titre indicatif. FISCAL.IA ne peut être tenue responsable des dommages—directs ou indirects—résultant de l'usage des outils, sauf en cas de faute lourde ou intentionnelle. L'utilisateur demeure seul responsable de la véracité des données saisies, des décisions prises sur la base des résultats générés et du respect de ses obligations fiscales et déclaratives.</p>
              </div>
            </section>

            {/* 6. RGPD */}
            <section>
              <h3 className="text-xl font-semibold text-[#c5a572] mb-4">6. Protection des données personnelles (RGPD)</h3>
              <div className="bg-[#0E2444] rounded-lg p-6 border border-[#c5a572]/20 space-y-4">
                <div>
                  <h4 className="font-semibold text-[#c5a572] mb-2">Finalités</h4>
                  <p className="text-sm">Gestion des demandes, simulations fiscales, prospection (avec consentement)</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#c5a572] mb-2">Base légale</h4>
                  <p className="text-sm">Exécution de contrat ou intérêt légitime</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#c5a572] mb-2">Destinataires</h4>
                  <p className="text-sm">Équipe interne, prestataires soumis au secret</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#c5a572] mb-2">Durées de conservation</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Prospection : 3 ans après dernier contact</li>
                    <li>• Données contractuelles : 10 ans</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-[#c5a572] mb-2">Droits</h4>
                  <p className="text-sm mb-2">Accès, rectification, effacement, opposition, limitation, portabilité (articles 15–22 RGPD)</p>
                  <p className="text-sm mb-2"><strong>Exercice des droits :</strong> dpo@fiscal.ia</p>
                  <p className="text-sm"><strong>Réclamation :</strong> CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#c5a572] hover:underline">www.cnil.fr</a>)</p>
                </div>
              </div>
            </section>

            {/* 7. Cookies */}
            <section>
              <h3 className="text-xl font-semibold text-[#c5a572] mb-4">7. Cookies</h3>
              <div className="bg-[#0E2444] rounded-lg p-6 border border-[#c5a572]/20">
                <p>Utilisation de cookies techniques (impératifs) et analytiques ou publicitaires (après consentement). Modification possible via bandeau ou paramètres du navigateur.</p>
              </div>
            </section>

            {/* 8. Droit applicable */}
            <section>
              <h3 className="text-xl font-semibold text-[#c5a572] mb-4">8. Droit applicable & juridiction</h3>
              <div className="bg-[#0E2444] rounded-lg p-6 border border-[#c5a572]/20">
                <p><strong>Loi applicable :</strong> droit français. <strong>En cas de litige :</strong> tribunaux français compétents.</p>
              </div>
            </section>
          </div>
          
          <div className="mt-12 pt-8 border-t border-[#c5a572]/20 text-center">
            <p className="text-sm text-gray-400">Dernière mise à jour : Juillet 2024</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentionsLegales; 
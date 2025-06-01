import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { TrueLayerCallback } from './pages/TrueLayerCallback';
import { supabase } from './lib/supabase';

const LEGAL_TEXT = `MENTIONS LÉGALES ET CONDITIONS GÉNÉRALES D'UTILISATION (CGU)

DERNIÈRE MISE À JOUR : 27 MAI 2025

Résumé express
• Vos données sont protégées, chiffrées, stockées selon les standards RGPD, jamais revendues et supprimables sur simple demande.
• Abonnement clair, résiliable à tout moment, prix garanti à vie pour les 100 premiers inscrits.
• Support humain et contact facile : fiscalia.group@gmail.com

⸻

1. Identification de l'Éditeur

Nom du site : Fiscal.IA
Éditeur : FISCAL.IA SAS au capital de 100 €
• SIREN : 943 531 152
• SIRET : 943 531 152 00016
• Siège social : 17 Chemin du Prieuré, 79260 La Crèche, France
• Directeur de la publication : Monsieur Garcia Aitor

Hébergeur :
Netlify, Inc.
44 Montgomery Street, Suite 300, San Francisco, CA 94104, USA
Tél. : +1 415-691-1573
Email : support@netlify.com

Contact général : fiscalia.group@gmail.com

⸻

2. Définitions

Dans les présentes CGU, les termes suivants ont la signification ci-après :
• « Site » : le portail accessible à l'URL https://www.fiscal.ia et ses sous-domaines.
• « Utilisateur » : toute personne physique majeure accédant au Site.
• « Données Utilisateur » : toutes informations collectées lors de l'utilisation du Site.
• « Services » : l'ensemble des fonctionnalités proposées par Fiscal.IA, notamment l'assistant fiscal et financier.

⸻

3. Objet

Le présent document définit les modalités et conditions dans lesquelles FISCAL.IA met à disposition des Utilisateurs les Services du Site. L'utilisation du Site implique l'acceptation sans réserve des présentes CGU.

⸻

4. Accès et conditions d'utilisation
1. Accès
• L'accès au Site est réservé aux personnes physiques majeures (18 ans révolus) et capables juridiquement.
2. Création de compte
• Certaines fonctionnalités exigent un compte. L'Utilisateur est responsable de la confidentialité de ses identifiants et de toutes les activités réalisées via son compte.
3. Usage licite
• L'Utilisateur s'engage à utiliser le Site conformément aux lois en vigueur et aux présentes CGU. Tout usage frauduleux ou abusif pourra entraîner la suspension ou la suppression du compte.
4. Responsabilité de l'Utilisateur
• Il appartient à l'Utilisateur de vérifier la conformité des suggestions IA auprès d'experts compétents avant tout usage.

⸻

5. Propriété intellectuelle

Tous les éléments (textes, logos, marques, visuels, logiciels, bases de données) présents sur le Site sont la propriété exclusive de FISCAL.IA ou de ses partenaires. Toute reproduction, représentation ou exploitation non autorisée est interdite et constitue une contrefaçon.

⸻

6. Données personnelles et RGPD
1. Responsable de traitement : FISCAL.IA SAS
2. Finalités
• Gestion des abonnements, personnalisation des services, amélioration et sécurité du Site.
3. Catégories de données
• Identification (email, nom d'utilisateur), fiscales (revenus, dépenses), financières (épargne, budget), techniques (adresse IP, logs).
4. Base légale
• Exécution du contrat (art. 6.1.b RGPD) et intérêt légitime (art. 6.1.f RGPD).
5. Durées de conservation
• Données fiscales et financières : durée de l'abonnement + 5 ans.
• Données de compte : jusqu'à suppression.
• Données techniques : 1 an.
6. Transferts hors UE
• Conformes via clauses contractuelles types.
7. Droits des Utilisateurs
• Accès, rectification, suppression, limitation, portabilité, opposition.
• Exercice par email à fiscalia.group@gmail.com ou courrier au siège.
8. Cookies
• Cookie strictement nécessaires, analytiques et fonctionnels.
• Consentement géré via bannière.
• Paramétrage possible à tout moment dans votre navigateur.
9. Délégué à la protection des données (DPO)
• Contact : fiscalia.group@gmail.com

⸻

7. Clauses de responsabilité
1. Absence de conseil personnalisé
• Les suggestions IA sont fournies "en l'état" sans garantie. Elles ne constituent pas un conseil fiscal ou financier personnalisé.
2. Limitation de responsabilité
• FISCAL.IA décline toute responsabilité en cas de dommages directs ou indirects résultant de l'utilisation du Site ou de l'impossibilité d'y accéder.
3. Force majeure
• Événements échappant au contrôle de FISCAL.IA (incendie, inondation, cyberattaque, grève) exonèrent partiellement ou totalement la responsabilité de l'Éditeur.
4. Indemnisation
• L'Utilisateur s'engage à indemniser FISCAL.IA contre toute réclamation ou dommage résultant de son usage non conforme du Site.

⸻

8. Conditions tarifaires et abonnement
1. Tarif
• Abonnement mensuel : 9,99 € TTC.
• Prix garanti à vie pour les 100 premiers inscrits (bêta privée avant 15/05/2025).
2. Facturation et paiement
• Paiement automatique par carte bancaire via un prestataire sécurisé.
3. Renouvellement et résiliation
• Renouvellement automatique chaque mois.
• Résiliation possible à tout moment via l'espace "Mon Compte" ou par email.
• Résiliation effective en fin de période en cours, sans remboursement prorata.
4. Droit de rétractation
• 14 jours selon l'article L.221-18 du Code de la consommation, sans frais, par email à fiscalia.group@gmail.com.

⸻

9. Loi applicable et juridiction

Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation ou exécution sera de la compétence exclusive des tribunaux de Niort, France.

⸻

10. Modification des CGU

FISCAL.IA se réserve le droit de modifier à tout moment les présentes CGU. Les modifications seront publiées sur cette page et notifiées par email. L'utilisation continue du Site après publication vaut acceptation des nouvelles CGU.

⸻

Pour toute question ou réclamation, contactez-nous à fiscalia.group@gmail.com.`;

function LegalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', zIndex: 1000, left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', background: '#1a2942', color: '#fff', borderRadius: 12, maxWidth: 600, width: '90vw', maxHeight: '90vh', overflowY: 'auto', padding: 24, fontSize: 12, boxShadow: '0 8px 32px #0008' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: '#c5a572', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' }}>×</button>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 11, color: '#e8cfa0', marginTop: 24 }}>{LEGAL_TEXT}</pre>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLegal, setShowLegal] = useState(false);

  useEffect(() => {
    // Vérifier l'état de l'authentification au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/truelayer-callback" 
            element={user ? <TrueLayerCallback /> : <Navigate to="/" replace />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <footer style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 100, textAlign: 'center', fontSize: 10, color: '#c5a572', background: 'rgba(26,41,66,0.85)', padding: 4, letterSpacing: 0.5 }}>
        <button style={{ background: 'none', border: 'none', color: '#c5a572', textDecoration: 'underline', cursor: 'pointer', fontSize: 10 }} onClick={() => setShowLegal(true)}>
          Mentions légales et CGU
        </button>
      </footer>
      <LegalModal open={showLegal} onClose={() => setShowLegal(false)} />
    </>
  );
}

export default App; 
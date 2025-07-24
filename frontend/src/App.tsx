import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { TrueLayerCallback } from './pages/TrueLayerCallback';
import { AuthCallback } from './pages/AuthCallback';
import { ProSignupPage } from './pages/ProSignupPage';
import { DemoPage } from './pages/DemoPage';
import { ContactProPage } from './pages/ContactProPage';
import { ProDashboardPage } from './pages/ProDashboardPage';
import { ProProtectedRoute } from './components/auth/ProProtectedRoute';
import { ProCreateClientPage } from './pages/ProCreateClientPage';
import { ProClientDetailPage } from './pages/ProClientDetailPage';
import { ProEditClientPage } from './pages/ProEditClientPage';
import ProLandingPage from './pages/ProLandingPage';
import { ProChatPage } from './pages/ProChatPage';
import { ProTeamsAssistantPage } from './pages/ProTeamsAssistantPage';
import { EncryptionTestPage } from './pages/EncryptionTestPage';

import { ProSettingsPage } from './pages/ProSettingsPage';
import { ProEditProfilePage } from './pages/ProEditProfilePage';
import { ProExtensionPage } from './pages/ProExtensionPage';
import { SuccessPage } from './pages/SuccessPage';
import { OptimisationFiscaleIA } from './pages/OptimisationFiscaleIA';
import { SimulateurImpot } from './pages/SimulateurImpot';
import { Simulateur } from './pages/Simulateur';
import { SimulateurIRPF } from './pages/SimulateurIRPF';
import SimulateurImpotSuisse from './pages/SimulateurImpotSuisse';
import SimulateurImpotLuxembourg from './pages/SimulateurImpotLuxembourg';
import { SimulateurTvaSuisse } from './pages/SimulateurTvaSuisse';
import { SimulateurIgiAndorre } from './pages/SimulateurIgiAndorre';
import { SimulateurTvaLuxembourg } from './pages/SimulateurTvaLuxembourg';
import { SimulateurTmi } from './pages/SimulateurTmi';
import { SimulateurOptimisation } from './pages/SimulateurOptimisation';
import BlogPage from './pages/BlogPage';
import MentionsLegales from './pages/MentionsLegales';
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';
import DataPrivacyPage from './pages/DataPrivacyPage';
import ProLoginPage from './pages/ProLoginPage';
import ActivateAccountPage from './pages/ActivateAccountPage';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { AccountPage } from './pages/AccountPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ParticulierProtectedRoute } from './components/auth/ParticulierProtectedRoute';
import { CompleteSignupPage } from './pages/CompleteSignupPage';
import CGPWorkspace from './pages/CGPWorkspace';
import ReportsManager from './components/reports/ReportsManager';
import ClientPortal from './components/portal/ClientPortal';
import APIDashboard from './components/api/APIDashboard';
import SecurityDashboard from './components/security/SecurityDashboard';
import { ParticulierDashboard } from './pages/ParticulierDashboard';
import { GoCardlessCallback } from './pages/GoCardlessCallback';
import { MonProfilPage } from './pages/MonProfilPage';
import { DocumentsFiscauxPage } from './pages/DocumentsFiscauxPage';

// Commentaire pour forcer un nouveau build - v2
function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/pro-landing" replace />} />
          <Route path="/pro-landing" element={<ProLandingPage />} />
          <Route path="/patrimonia" element={<Navigate to="/pro-landing" replace />} />
          {/* Page de connexion unifiée */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Navigate to="/pro/signup" replace />} />
          <Route path="/pro/signup" element={<ProSignupPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/contact-pro" element={<ContactProPage />} />
          <Route path="/success" element={<SuccessPage />} />
          
          {/* Pages SEO + simulateur générique */}
          <Route path="/optimisation-fiscale-ia" element={<OptimisationFiscaleIA />} />
          <Route path="/simulateur" element={<Simulateur />} />
          <Route path="/simulateur-impot" element={<SimulateurImpot />} />
          <Route path="/simulateur-irpf" element={<SimulateurIRPF />} />
          <Route path="/simulateur-impot-suisse" element={<SimulateurImpotSuisse />} />
          <Route path="/simulateur-impot-luxembourg" element={<SimulateurImpotLuxembourg />} />
          <Route path="/simulateur-tva-suisse" element={<SimulateurTvaSuisse />} />
          <Route path="/simulateur-igi-andorre" element={<SimulateurIgiAndorre />} />
          <Route path="/simulateur-tva-luxembourg" element={<SimulateurTvaLuxembourg />} />
          <Route path="/simulateur-tmi" element={<SimulateurTmi />} />
          <Route path="/simulateur-optimisation" element={<SimulateurOptimisation />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="/mes-donnees" element={<DataPrivacyPage />} />
          <Route path="/complete-signup" element={<CompleteSignupPage />} />
          
          <Route path="/truelayer-callback" element={<TrueLayerCallback />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Routes particuliers réactivées */}
          <Route element={<ParticulierProtectedRoute />} >
            <Route path="/dashboard" element={<ParticulierDashboard />} />
            <Route path="/dashboard/particulier" element={<ParticulierDashboard />} />
            <Route path="/dashboard/particulier/callback" element={<GoCardlessCallback />} />
            <Route path="/portal" element={<ClientPortal />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/mon-profil" element={<MonProfilPage />} />
            <Route path="/documents-fiscaux" element={<DocumentsFiscauxPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
          </Route>
          
          {/* Route de connexion Pro accessible sans authentification */}
          <Route path="/pro/login" element={<ProLoginPage />} />

          <Route element={<ProProtectedRoute />}>
            <Route path="/pro/dashboard" element={<ProDashboardPage />} />
            <Route path="/pro/cgp" element={<CGPWorkspace />} />
            <Route path="/pro/reports" element={<ReportsManager />} />
            <Route path="/pro/api" element={<APIDashboard />} />
            <Route path="/pro/security" element={<SecurityDashboard />} />
            <Route path="/pro/clients/new" element={<ProCreateClientPage />} />
            <Route path="/pro/clients/:clientId" element={<ProClientDetailPage />} />
            <Route path="/pro/clients/:clientId/edit" element={<ProEditClientPage />} />
            <Route path="/pro/chat" element={<ProChatPage />} />
            <Route path="/pro/teams-assistant" element={<ProTeamsAssistantPage />} />
            <Route path="/pro/encryption-test" element={<EncryptionTestPage />} />

            <Route path="/pro/settings" element={<ProSettingsPage />} />
            <Route path="/pro/edit-profile" element={<ProEditProfilePage />} />
            <Route path="/pro/extension" element={<ProExtensionPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>
          <Route path="/activate-account" element={<ActivateAccountPage />} />
        </Routes>
      </Router>
  );
}

export default App;

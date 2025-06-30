import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
// import { Dashboard } from './pages/Dashboard';
import { TrueLayerCallback } from './pages/TrueLayerCallback';
import { AuthCallback } from './pages/AuthCallback';
// import SignupPage from './pages/SignupPage';
import { ProSignupPage } from './pages/ProSignupPage';
// import { DiscoverPage } from './pages/DiscoverPage';
// import { ChatPage } from './pages/ChatPage';

import { DemoPage } from './pages/DemoPage';
import { ContactProPage } from './pages/ContactProPage';
import { ProDashboardPage } from './pages/ProDashboardPage';
import { ProProtectedRoute } from './components/auth/ProProtectedRoute';
// import { ParticulierProtectedRoute } from './components/auth/ParticulierProtectedRoute';
import { ProCreateClientPage } from './pages/ProCreateClientPage';
import { ProClientDetailPage } from './pages/ProClientDetailPage';
import { ProEditClientPage } from './pages/ProEditClientPage';
import ProLandingPage from './pages/ProLandingPage';
// import { UserProfilePage } from './pages/UserProfilePage';
import { ProChatPage } from './pages/ProChatPage';
import { ProAgendaPage } from './pages/ProAgendaPage';
// import { ProfilePage } from './pages/ProfilePage';
import { SuccessPage } from './pages/SuccessPage';
// import { AccountPage } from './pages/AccountPage';
import { OptimisationFiscaleIA } from './pages/OptimisationFiscaleIA';
import { SimulateurImpot } from './pages/SimulateurImpot';
import BlogPage from './pages/BlogPage';
import MentionsLegales from './pages/MentionsLegales';
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';
import DataPrivacyPage from './pages/DataPrivacyPage';
import ProLoginPage from './pages/ProLoginPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ActivateAccountPage from './pages/ActivateAccountPage';
// import LoginPage from './pages/LoginPage';

// Commentaire pour forcer un nouveau build - v2
function App() {
  return (
      <Router>
        <Routes>
          <Route path="/update-password" element={<UpdatePasswordPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/" element={<Navigate to="/pro-landing" replace />} />
          <Route path="/pro-landing" element={<ProLandingPage />} />
          <Route path="/patrimonia" element={<Navigate to="/pro-landing" replace />} />
          {/* Routes particuliers temporairement désactivées */}
          {/* <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} /> */}
          <Route path="/login" element={<Navigate to="/pro/login" replace />} />
          <Route path="/signup" element={<Navigate to="/pro/signup" replace />} />
          <Route path="/pro/signup" element={<ProSignupPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/contact-pro" element={<ContactProPage />} />
          <Route path="/success" element={<SuccessPage />} />
          
          {/* Pages SEO */}
          <Route path="/optimisation-fiscale-ia" element={<OptimisationFiscaleIA />} />
          <Route path="/simulateur-impot" element={<SimulateurImpot />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="/mes-donnees" element={<DataPrivacyPage />} />
          
          <Route path="/truelayer-callback" element={<TrueLayerCallback />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Routes particuliers désactivées temporairement */}
          {/* <Route element={<ParticulierProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
          </Route> */}
          
          {/* Redirection des anciennes routes particuliers vers pro */}
          <Route path="/dashboard" element={<Navigate to="/pro/dashboard" replace />} />
          <Route path="/chat" element={<Navigate to="/pro/chat" replace />} />
          <Route path="/profil" element={<Navigate to="/pro/dashboard" replace />} />
          <Route path="/account" element={<Navigate to="/pro/dashboard" replace />} />
          <Route path="/discover" element={<Navigate to="/pro/dashboard" replace />} />
          
          {/* Route de connexion Pro accessible sans authentification */}
          <Route path="/pro/login" element={<ProLoginPage />} />

          <Route element={<ProProtectedRoute />}>
            <Route path="/pro/dashboard" element={<ProDashboardPage />} />
            <Route path="/pro/clients/new" element={<ProCreateClientPage />} />
            <Route path="/pro/clients/:clientId" element={<ProClientDetailPage />} />
            <Route path="/pro/clients/:clientId/edit" element={<ProEditClientPage />} />
            <Route path="/pro/chat" element={<ProChatPage />} />
            <Route path="/pro/agenda" element={<ProAgendaPage />} />
          </Route>
          <Route path="/activate-account" element={<ActivateAccountPage />} />
        </Routes>
      </Router>
  );
}

export default App;

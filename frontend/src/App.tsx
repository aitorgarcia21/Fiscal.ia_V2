import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { TrueLayerCallback } from './pages/TrueLayerCallback';
import { SignupPage } from './pages/SignupPage';
import { ProSignupPage } from './pages/ProSignupPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ChatPage } from './pages/ChatPage';

import { DemoPage } from './pages/DemoPage';
import { ContactProPage } from './pages/ContactProPage';
import { ProDashboardPage } from './pages/ProDashboardPage';
import { ProProtectedRoute } from './components/auth/ProProtectedRoute';
import { ParticulierProtectedRoute } from './components/auth/ParticulierProtectedRoute';
import { ProCreateClientPage } from './pages/ProCreateClientPage';
import { ProClientDetailPage } from './pages/ProClientDetailPage';
import { ProEditClientPage } from './pages/ProEditClientPage';
import ProLandingPage from './pages/ProLandingPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { ProChatPage } from './pages/ProChatPage';
import { ProAgendaPage } from './pages/ProAgendaPage';
import { ProfilePage } from './pages/ProfilePage';
import { SuccessPage } from './pages/SuccessPage';
import { AccountPage } from './pages/AccountPage';
import { OptimisationFiscaleIA } from './pages/OptimisationFiscaleIA';
import { SimulateurImpot } from './pages/SimulateurImpot';

// Commentaire pour forcer un nouveau build - v1
function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pro" element={<ProLandingPage />} />
          <Route path="/patrimonia" element={<Navigate to="/pro" replace />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/pro/signup" element={<ProSignupPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/contact-pro" element={<ContactProPage />} />
          <Route path="/success" element={<SuccessPage />} />
          
          {/* Pages SEO */}
          <Route path="/optimisation-fiscale-ia" element={<OptimisationFiscaleIA />} />
          <Route path="/simulateur-impot" element={<SimulateurImpot />} />
          
          <Route path="/truelayer-callback" element={<TrueLayerCallback />} />
          <Route element={<ParticulierProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
          </Route>
          <Route element={<ProProtectedRoute />}>
            <Route path="/pro/dashboard" element={<ProDashboardPage />} />
            <Route path="/pro/clients/new" element={<ProCreateClientPage />} />
            <Route path="/pro/clients/:clientId" element={<ProClientDetailPage />} />
            <Route path="/pro/clients/:clientId/edit" element={<ProEditClientPage />} />
            <Route path="/pro/chat" element={<ProChatPage />} />
            <Route path="/pro/agenda" element={<ProAgendaPage />} />
          </Route>
        </Routes>
      </Router>
  );
}

export default App;

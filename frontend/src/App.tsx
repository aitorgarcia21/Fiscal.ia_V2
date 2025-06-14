import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { TrueLayerCallback } from './pages/TrueLayerCallback';
import { SignupPage } from './pages/SignupPage';
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
import { PatrimoniaLandingPage } from './pages/PatrimoniaLandingPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { ProChatPage } from './pages/ProChatPage';

// Commentaire pour forcer un nouveau build - v1
function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/patrimonia" element={<PatrimoniaLandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/contact-pro" element={<ContactProPage />} />
          <Route path="/truelayer-callback" element={<TrueLayerCallback />} />
          <Route element={<ParticulierProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profil" element={<UserProfilePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
          </Route>
          <Route element={<ProProtectedRoute />}>
            <Route path="/pro/dashboard" element={<ProDashboardPage />} />
            <Route path="/pro/clients/new" element={<ProCreateClientPage />} />
            <Route path="/pro/clients/:clientId" element={<ProClientDetailPage />} />
            <Route path="/pro/clients/:clientId/edit" element={<ProEditClientPage />} />
            <Route path="/pro/chat" element={<ProChatPage />} />
          </Route>
        </Routes>
      </Router>
  );
}

export default App;

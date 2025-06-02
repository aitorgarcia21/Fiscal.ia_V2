import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { TrueLayerCallback } from './pages/TrueLayerCallback';
import { SignupPage } from './pages/SignupPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ChatPage } from './pages/ChatPage';
import { DemoPage } from './pages/DemoPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/truelayer-callback" element={<TrueLayerCallback />} />
      </Routes>
    </Router>
  );
}

export default App;

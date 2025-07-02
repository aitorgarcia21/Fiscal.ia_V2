import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { supabase } from './supabase';

import LoginPage from './pages/Login';
import ChatPage from './pages/Chat';
import DocumentsPage from './pages/Documents';

export default function App() {
  const session = supabase.auth.session();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/chat" element={session ? <ChatPage /> : <Navigate to="/login" replace />} />
      <Route path="/docs" element={session ? <DocumentsPage /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={session ? '/chat' : '/login'} replace />} />
    </Routes>
  );
} 
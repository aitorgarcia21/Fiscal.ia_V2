import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { CountryProvider } from './contexts/CountryContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <CountryProvider>
      <SupabaseAuthProvider>
        <App />
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </SupabaseAuthProvider>
    </CountryProvider>
  </React.StrictMode>
); 
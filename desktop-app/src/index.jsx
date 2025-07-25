import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Créer un élément racine pour l'application
const container = document.getElementById('root');
const root = createRoot(container);

// Rendre l'application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

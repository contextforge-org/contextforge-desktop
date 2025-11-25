import React from 'react';
import { createRoot } from 'react-dom/client';
import App  from './mainapp';
import { initializeClient } from './lib/api/contextforge-api';

// Initialize API client with stored token
initializeClient();

const root = createRoot(document.body);
root.render(
  <App />
);
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Layout } from './components/layout';
import { TrayDemo } from './components/tray-demo';
import App  from './mainapp';

const root = createRoot(document.body);
root.render(
  <App />
);
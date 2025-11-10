import React from 'react';
import { createRoot } from 'react-dom/client';
import { Layout } from './components/layout';

const root = createRoot(document.body);
root.render(<Layout><h2 className=''>Hello from React!</h2></Layout>);
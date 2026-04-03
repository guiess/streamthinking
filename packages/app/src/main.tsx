/**
 * Application entry point.
 *
 * Renders the InfiniCanvas app (Excalidraw + gateway sync).
 *
 * @module
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in the DOM.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

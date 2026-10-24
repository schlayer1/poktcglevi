import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { registerSW } from 'virtual:pwa-register';

// Auto-update service worker immediately whenever a new version is built
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New version detected - updating immediately...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('PokéLevi offline assets precached successfully');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

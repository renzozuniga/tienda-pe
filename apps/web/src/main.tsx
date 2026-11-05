import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './styles/tokens.css';
import './styles/base.css';
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Minimal path switch until the catalog slice adds a router. /design is lazy so it never weighs on the store.
const DesignPage = lazy(() => import('./pages/DesignPage').then((m) => ({ default: m.DesignPage })));
const isDesign = window.location.pathname.replace(/\/$/, '') === '/design';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isDesign ? (
      <Suspense fallback={null}>
        <DesignPage />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);

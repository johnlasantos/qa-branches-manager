
import { createRoot } from 'react-dom/client'
import { lazy, Suspense } from 'react';
import './index.css'

// Lazy load the main App component
const App = lazy(() => import('./App.tsx'));

// Create a simple loading state for the root level
const LoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-screen">
    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

// Add a small delay to execute non-critical operations
const deferNonCriticalOperations = () => {
  // Any non-critical operations can be deferred here
  // For example, analytics, non-essential feature detection, etc.
};

// Start rendering as soon as possible
createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<LoadingFallback />}>
    <App />
  </Suspense>
);

// Defer non-critical operations
if (window.requestIdleCallback) {
  window.requestIdleCallback(deferNonCriticalOperations);
} else {
  setTimeout(deferNonCriticalOperations, 1000);
}

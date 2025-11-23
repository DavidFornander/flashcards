import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('Starting app...');

try {
  const App = await import('./App');
  console.log('App imported successfully');
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App.default />
    </React.StrictMode>
  );
  console.log('App rendered');
} catch (error) {
  console.error('Failed to start app:', error);
  document.body.innerHTML = `<div style="color: white; padding: 20px; font-family: monospace;">
    <h1>Error loading app</h1>
    <pre>${error}</pre>
  </div>`;
}

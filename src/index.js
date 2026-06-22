import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.register({
  onUpdate: () => {
    if (window.confirm('Yeni versiya mövcuddur. Yeniləmək istəyirsiniz?')) {
      window.location.reload();
    }
  },
});

reportWebVitals();

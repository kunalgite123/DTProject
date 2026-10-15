import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { UtilityProvider } from './context/UtilityContext';
import '../vars.css';
import '../style.css';
import 'leaflet/dist/leaflet.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UtilityProvider>
        <App />
      </UtilityProvider>
    </BrowserRouter>
  </React.StrictMode>
);

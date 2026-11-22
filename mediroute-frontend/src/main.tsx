import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { GPSProvider } from './context/GPSContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <GPSProvider>
        <App />
      </GPSProvider>
    </BrowserRouter>
  </React.StrictMode>
);

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import 'admin-lte/dist/css/adminlte.min.css';
import 'admin-lte/dist/js/adminlte.js';

import './css/cloudbox.css';
import './css/dashboard.css';
import './css/login.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './config/amplify';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);

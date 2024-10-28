// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './AuthContext';
import App from './App';
import './index.css';

ReactDOM.render(
  <GoogleOAuthProvider clientId="1022922383898-l1g1ljhqsfiujdff5dp5m0k02k6mtmqc.apps.googleusercontent.com">
    <AuthProvider>
      <App />
    </AuthProvider>
  </GoogleOAuthProvider>,
  document.getElementById('root')
);

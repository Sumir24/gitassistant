import React, { useState, useEffect } from 'react';
import Authentication from './pages/Authentication';
import AiWorkspace from './pages/AiWorkspace';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local storage for existing token first
    const existingToken = localStorage.getItem('gitspeak_token');
    if (existingToken) {
      setIsAuthenticated(true);
    }

    // Check URL parameters for a new token from the backend
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const activeToken = token || existingToken;

    if (activeToken) {
      localStorage.setItem('gitspeak_token', activeToken);
      setIsAuthenticated(true);

      if (token) {
        // Clean up the URL only if the token came from the URL
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      }

      // Fetch user profile
      fetch('http://localhost:4000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch(console.error);
    }
  }, []);

  if (!isAuthenticated) {
    return <Authentication onLogin={() => setIsAuthenticated(true)} />;
  }

  return <AiWorkspace user={user} />;
}

export default App;

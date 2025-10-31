// App.jsx
// Main application component with routing, authentication, and context

import React, { createContext, useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import AdminLogin from './components/AdminLogin';
import TeamMemberLogin from './components/TeamMemberLogin';
import AdminPage from './pages/AdminPage';
import ProjectorPage from './pages/ProjectorPage';
import AttendeePage from './pages/AttendeePage';
import TeamMemberPage from './pages/TeamMemberPage';

// Create User Context to share user ID across components
export const UserContext = createContext(null);

function App() {
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState('attendee');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isTeamAuthenticated, setIsTeamAuthenticated] = useState(false);

  // Initialize Firebase Auth with anonymous sign-in
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Sign in anonymously
        const result = await signInAnonymously(auth);
        setUserId(result.user.uid);
        setAuthLoading(false);
      } catch (error) {
        console.error('Error signing in anonymously:', error);
        setAuthLoading(false);
      }
    };

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setAuthLoading(false);
      } else {
        // If no user, sign in anonymously
        initAuth();
      }
    });

    return () => unsubscribe();
  }, []);

  // Check for admin and team authentication on load
  useEffect(() => {
    const savedAdminAuth = localStorage.getItem('adminAuth');
    if (savedAdminAuth === 'true') {
      setIsAdminAuthenticated(true);
    }
    
    const savedTeamAuth = localStorage.getItem('teamAuth');
    if (savedTeamAuth === 'true') {
      setIsTeamAuthenticated(true);
    }
  }, []);

  // Hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      
      if (hash.startsWith('#/admin')) {
        setCurrentRoute('admin');
      } else if (hash.startsWith('#/projector')) {
        setCurrentRoute('projector');
      } else if (hash.startsWith('#/team')) {
        setCurrentRoute('team');
      } else {
        setCurrentRoute('attendee');
      }
    };

    // Set initial route
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAdminLogin = (authenticated) => {
    setIsAdminAuthenticated(authenticated);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('adminAuth');
    window.location.hash = '#/';
  };

  const handleTeamLogin = (authenticated) => {
    setIsTeamAuthenticated(authenticated);
  };

  const handleTeamLogout = () => {
    setIsTeamAuthenticated(false);
    localStorage.removeItem('teamAuth');
    window.location.hash = '#/';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex items-center justify-center">
        <LoadingSpinner message="Initializing..." />
      </div>
    );
  }

  // If admin route but not authenticated, show login
  if (currentRoute === 'admin' && !isAdminAuthenticated) {
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  // If team route but not authenticated, show login
  if (currentRoute === 'team' && !isTeamAuthenticated) {
    return <TeamMemberLogin onLogin={handleTeamLogin} />;
  }

  return (
    <UserContext.Provider value={{ userId }}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 font-sans">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
          {currentRoute !== 'admin' && currentRoute !== 'team' && <Header />}
          
          <main className="mt-4 sm:mt-8">
            {currentRoute === 'admin' && <AdminPage onLogout={handleAdminLogout} />}
            {currentRoute === 'team' && <TeamMemberPage onLogout={handleTeamLogout} />}
            {currentRoute === 'projector' && <ProjectorPage />}
            {currentRoute === 'attendee' && <AttendeePage />}
          </main>
        </div>
      </div>
    </UserContext.Provider>
  );
}

export default App;

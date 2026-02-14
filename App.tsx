import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import SignupPage from './pages/SignupPage';
import { getStoredUser } from './services/authService';
import { supabase } from './services/supabaseClient';
import { User } from './types';
import { ADMIN_EMAIL } from './constants';
import { ThemeProvider } from './context/ThemeContext';


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      const storedUser = await getStoredUser();
      if (storedUser) {
        // Check if admin was authenticated in this session
        const isAdminAuth = sessionStorage.getItem('isAdminAuthenticated') === 'true';
        setUser({ ...storedUser, isAdminAuthenticated: isAdminAuth });
      }
      setIsLoading(false);
    };
    
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Re-check session storage on sign in
        const isAdminAuth = sessionStorage.getItem('isAdminAuthenticated') === 'true';
        const currentUser: User = {
          id: session.user.id,
          username: session.user.user_metadata.username || session.user.email?.split('@')[0],
          email: session.user.email || '',
          isAdminAuthenticated: isAdminAuth
        };
        setUser(currentUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        sessionStorage.removeItem('isAdminAuthenticated');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
          <Navbar user={user} setUser={setUser} />
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <LoginPage setUser={setUser} />} 
            />
            
            <Route 
              path="/admin/login" 
              element={user && user.isAdminAuthenticated ? <Navigate to="/admin" /> : <AdminLoginPage setUser={(u) => setUser({ ...u, isAdminAuthenticated: true })} />} 
            />

            <Route 
              path="/signup" 
              element={user ? <Navigate to="/" /> : <SignupPage setUser={setUser} />} 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={user ? <LandingPage /> : <Navigate to="/login" />} 
            />
            
            <Route 
              path="/admin" 
              element={user && user.isAdminAuthenticated ? <AdminPage /> : <Navigate to="/admin/login" />} 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
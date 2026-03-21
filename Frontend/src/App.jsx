import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Welcome from './pages/Welcome';
import Auth from './pages/Auth';
import SendAsk from './pages/SendAsk';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Welcome Screen (Intro Animation) */}
          <Route path="/" element={<Welcome />} />

          {/* Login / Sign Up Page */}
          <Route path="/auth" element={<Auth />} />

          {/* Main Dashboard - Protected */}
          <Route 
            path="/send-ask" 
            element={
              <ProtectedRoute>
                <SendAsk />
              </ProtectedRoute>
            } 
          />

          {/* Catch all - Redirect to welcome */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

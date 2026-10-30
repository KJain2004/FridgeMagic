import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthPage from './pages/AuthPage';
import ChefPage from './pages/ChefPage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import StarsBg from './components/StarsBg';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="glow-text" style={{ fontSize: 24, fontWeight: 700 }}>Loading kitchen...</div>
    </div>
  );
  return user ? children : <Navigate to="/auth" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={<ProtectedRoute><ChefPage /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><SavedRecipesPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <StarsBg />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

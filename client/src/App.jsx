import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';

// A premium loading screen for session validation
const TelemetryLoader = () => (
  <div style={loaderStyles.container}>
    <div style={loaderStyles.spinner}></div>
    <div style={loaderStyles.text}>DECRYPTING TELEMETRY NODE...</div>
  </div>
);

const AppContent = () => {
  const { loading } = useAuth();
  if (loading) {
    return <TelemetryLoader />;
  }
  return <Dashboard />;
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

const loaderStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    gap: '20px',
    background: 'radial-gradient(circle at 0% 0%, #0c0828 0%, #03020b 100%)',
    zIndex: 9999,
    position: 'fixed',
    top: 0,
    left: 0
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid rgba(0, 240, 255, 0.1)',
    borderTopColor: '#00f0ff',
    animation: 'spin 1s linear infinite'
  },
  text: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: '#94a3b8',
    letterSpacing: '2px',
    textShadow: '0 0 8px rgba(0, 240, 255, 0.2)'
  }
};

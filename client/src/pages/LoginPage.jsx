import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const { playClickSound } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    playClickSound(1200, 800, 0.05);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.authPageContainer}>
      <div className="glass-panel" style={styles.authCard}>
        <div style={styles.authHeader}>
          <i className="fa-solid fa-compass-drafting" style={styles.logoIcon}></i>
          <h1 style={styles.logoTitle}>AETHER <span className="accent-text">OS</span></h1>
          <p style={styles.subtitle}>ENTER Telemetry Coordinates</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email">
              <i className="fa-solid fa-user" style={styles.inputIcon}></i> TELEMETRY IDENTIFIER (EMAIL)
            </label>
            <input
              type="email"
              id="email"
              placeholder="e.g. agent@aether.os"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              className="glass-input"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="password">
              <i className="fa-solid fa-lock" style={styles.inputIcon}></i> ACCESS DECRYPTION KEY (PASSWORD)
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              className="glass-input"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={styles.submitBtn}
            onClick={() => playClickSound(1400, 1000, 0.05)}
          >
            {submitting ? 'DECRYPTING...' : 'DECRYPT & ACCESS'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            First time logging telemetry?{' '}
            <Link to="/register" style={styles.link} onClick={() => playClickSound(1000, 700, 0.05)}>
              Establish New Beacon
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Inline styles designed to integrate with our glassmorphic theme system
const styles = {
  authPageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '24px',
    zIndex: 10
  },
  authCard: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  authHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px'
  },
  logoIcon: {
    fontSize: '32px',
    color: 'var(--accent)',
    filter: 'drop-shadow(0 0 8px var(--accent))',
    marginBottom: '8px'
  },
  logoTitle: {
    fontFamily: 'var(--font-heading)',
    fontWeight: '800',
    fontSize: '24px',
    letterSpacing: '3px',
    margin: 0
  },
  subtitle: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    letterSpacing: '1.5px',
    fontFamily: 'var(--font-mono)'
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    letterSpacing: '1px',
    fontFamily: 'var(--font-heading)',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  inputIcon: {
    color: 'var(--accent)'
  },
  input: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '12px 14px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    transition: 'all 0.3s ease'
  },
  submitBtn: {
    background: 'rgba(var(--accent-rgb), 0.15)',
    border: '1px solid rgba(var(--accent-rgb), 0.3)',
    color: 'var(--accent)',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '1.5px',
    fontFamily: 'var(--font-heading)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '8px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '8px'
  },
  footerText: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  link: {
    color: 'var(--accent)',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  }
};

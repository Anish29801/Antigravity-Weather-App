import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Initializing workspace...');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let msg = 'System Boot Complete';
      if (hour < 5) msg = 'Midnight Watch, Commander';
      else if (hour < 12) msg = 'Good Morning, Commander';
      else if (hour < 17) msg = 'Good Afternoon, Agent';
      else if (hour < 22) msg = 'Good Evening, Sentinel';
      else msg = 'Night Operations Mode';
      setGreeting(msg);
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <header id="main-header" className="glass-panel">
      <div className="logo-area">
        <i className="fa-solid fa-compass-drafting glow-icon"></i>
        <h1>AETHER <span className="accent-text">OS</span></h1>
      </div>
      
      <div className="greeting-area">
        <span id="greeting-text">{greeting}</span>
      </div>

      <div style={styles.navRight}>
        {user && (
          <div style={styles.userInfo}>
            <span style={styles.userName}>
              <i className="fa-solid fa-user-shield" style={{ marginRight: '6px', color: 'var(--accent)' }}></i>
              {user.name.toUpperCase()}
            </span>
          </div>
        )}
        
        <div className="header-status" style={{ gap: '12px', display: 'flex', alignItems: 'center' }}>
          <div className="status-item">
            <span className="status-indicator online"></span>
            <span className="status-label">SYS_ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--glass-border)',
    padding: '6px 14px',
    borderRadius: '30px',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    letterSpacing: '0.5px'
  },
  userName: {
    color: 'var(--text-primary)'
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    outline: 'none'
  }
};
// Hover styles can be added in CSS, but let's keep inline style simple

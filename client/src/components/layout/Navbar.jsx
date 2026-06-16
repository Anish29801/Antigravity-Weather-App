import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

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
    <header className="glass-panel h-[70px] px-6 flex justify-between items-center animate-[slideDown_0.8s_forwards]">
      <div className="flex items-center gap-3">
        <i className="fa-solid fa-compass-drafting text-2xl text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent)]"></i>
        <h1 className="font-heading font-extrabold text-xl tracking-[2px]">
          AETHER <span className="accent-text">OS</span>
        </h1>
      </div>
      
      <div className="font-heading font-medium text-[15px] text-[var(--text-secondary)] tracking-[0.5px]">
        <span id="greeting-text">{greeting}</span>
      </div>

      <div className="flex items-center gap-5">
        {user && (
          <div className="flex items-center bg-[rgba(255,255,255,0.02)] border border-[var(--glass-border)] py-1.5 px-3.5 rounded-[30px] font-mono text-[11px] tracking-[0.5px]">
            <span className="text-[var(--text-primary)]">
              <i className="fa-solid fa-user-shield mr-1.5 text-[var(--accent)]"></i>
              {user.name.toUpperCase()}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <div className="status-item">
            <span className="status-indicator online"></span>
            <span className="status-label">SYS_ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
}

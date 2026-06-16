import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function ControlDeck() {
  const { 
    theme, 
    particlesActive, 
    audioActive, 
    setTheme, 
    setParticlesActive, 
    setAudioActive, 
    purgeWorkspace,
    playClickSound
  } = useTheme();

  const handleThemeChange = (newTheme) => {
    if (newTheme !== theme) {
      setTheme(newTheme);
      // Sound feedback will automatically fire inside context if audio is enabled
    }
  };

  const handlePurge = () => {
    playClickSound(800, 200, 0.1);
    const confirmPurge = window.confirm(
      'WARNING: This action resets your notes, tasks, and system layouts back to defaults. Proceed?'
    );
    if (confirmPurge) {
      purgeWorkspace();
    }
  };

  return (
    <section id="control-panel-widget" className="glass-panel interactive-card" aria-label="System Toggles and Customization">
      <div className="card-header">
        <h2><i className="fa-solid fa-sliders"></i> Control deck</h2>
      </div>

      <div className="control-grid">
        {/* Ambient FX Toggle */}
        <div className="control-item">
          <div className="control-info">
            <span className="control-title">Ambient Particles</span>
            <span className="control-desc">Interactive canvas backdrop</span>
          </div>
          <label className="switch" htmlFor="toggle-particles">
            <input 
              type="checkbox" 
              id="toggle-particles" 
              checked={particlesActive}
              onChange={(e) => {
                setParticlesActive(e.target.checked);
                playClickSound(1000, 600, 0.05);
              }}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Audio FX Toggle */}
        <div className="control-item">
          <div className="control-info">
            <span className="control-title">Interface Audio</span>
            <span className="control-desc">Acoustic click feedback</span>
          </div>
          <label className="switch" htmlFor="toggle-audio-fx">
            <input 
              type="checkbox" 
              id="toggle-audio-fx" 
              checked={audioActive}
              onChange={(e) => {
                setAudioActive(e.target.checked);
                // Play a brief click feedback just before turning off/on
                if (e.target.checked) {
                  // Direct bypass since state hasn't propagated to context audioActive yet
                  try {
                    const actx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = actx.createOscillator();
                    const gain = actx.createGain();
                    osc.connect(gain); gain.connect(actx.destination);
                    osc.type = 'sine'; osc.frequency.setValueAtTime(1000, actx.currentTime);
                    gain.gain.setValueAtTime(0.05, actx.currentTime);
                    osc.start(); osc.stop(actx.currentTime + 0.05);
                  } catch (err) {}
                }
              }}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="theme-selector-section">
        <span className="selector-title">SELECT COORDINATE THEME</span>
        <div className="themes-flex">
          <button 
            className={`theme-btn ${theme === 'theme-cyan' ? 'active' : ''}`}
            onClick={() => handleThemeChange('theme-cyan')}
            title="Cyan Neon"
          >
            <span className="color-dot cyan"></span> Cyan
          </button>
          <button 
            className={`theme-btn ${theme === 'theme-pink' ? 'active' : ''}`}
            onClick={() => handleThemeChange('theme-pink')}
            title="Cyber Pink"
          >
            <span className="color-dot pink"></span> Pink
          </button>
          <button 
            className={`theme-btn ${theme === 'theme-amber' ? 'active' : ''}`}
            onClick={() => handleThemeChange('theme-amber')}
            title="Amber Gold"
          >
            <span className="color-dot amber"></span> Amber
          </button>
          <button 
            className={`theme-btn ${theme === 'theme-green' ? 'active' : ''}`}
            onClick={() => handleThemeChange('theme-green')}
            title="Emerald Aura"
          >
            <span className="color-dot green"></span> Green
          </button>
        </div>
      </div>

      {/* Clear Workspace */}
      <div className="danger-zone-section">
        <button id="btn-purge-workspace" className="danger-btn" onClick={handlePurge}>
          <i className="fa-solid fa-triangle-exclamation"></i> PURGE CACHED TELEMETRY
        </button>
      </div>
    </section>
  );
}

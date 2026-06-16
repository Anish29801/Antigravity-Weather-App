import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [theme, setThemeState] = useState('theme-cyan');
  const [particlesActive, setParticlesActiveState] = useState(true);
  const [audioActive, setAudioActiveState] = useState(true);

  // Apply theme class to document.body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Load preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get('/settings');
          if (response.data && response.data.success) {
            const { theme, particlesActive, audioActive } = response.data.data;
            setThemeState(theme || 'theme-cyan');
            setParticlesActiveState(particlesActive !== false);
            setAudioActiveState(audioActive !== false);
            return;
          }
        } catch (error) {
          console.warn('Failed to load settings from server, falling back to local cache.');
        }
      }

      // Fallback: LocalStorage
      const cachedTheme = localStorage.getItem('aether_theme') || 'theme-cyan';
      const cachedParticles = localStorage.getItem('aether_particles_active') !== 'false';
      const cachedAudio = localStorage.getItem('aether_audio_active') !== 'false';

      setThemeState(cachedTheme);
      setParticlesActiveState(cachedParticles);
      setAudioActiveState(cachedAudio);
    };

    loadPreferences();
  }, [isAuthenticated]);

  const updateSettings = async (newTheme, newParticles, newAudio) => {
    const nextTheme = newTheme !== undefined ? newTheme : theme;
    const nextParticles = newParticles !== undefined ? newParticles : particlesActive;
    const nextAudio = newAudio !== undefined ? newAudio : audioActive;

    // Update state
    setThemeState(nextTheme);
    setParticlesActiveState(nextParticles);
    setAudioActiveState(nextAudio);

    // Save to LocalStorage
    localStorage.setItem('aether_theme', nextTheme);
    localStorage.setItem('aether_particles_active', String(nextParticles));
    localStorage.setItem('aether_audio_active', String(nextAudio));

    // Save to Database if logged in
    if (isAuthenticated) {
      try {
        await api.put('/settings', {
          theme: nextTheme,
          particlesActive: nextParticles,
          audioActive: nextAudio
        });
      } catch (error) {
        console.error('Failed to sync settings with server:', error);
      }
    }
  };

  const setTheme = (t) => updateSettings(t, undefined, undefined);
  const setParticlesActive = (p) => updateSettings(undefined, p, undefined);
  const setAudioActive = (a) => updateSettings(undefined, undefined, a);

  const purgeWorkspace = async () => {
    // 1. Reset Settings to default
    await updateSettings('theme-cyan', true, true);

    // 2. Clear local storage
    localStorage.removeItem('aether_theme');
    localStorage.removeItem('aether_particles_active');
    localStorage.removeItem('aether_audio_active');
    localStorage.removeItem('aether_tasks');
    localStorage.removeItem('aether_notes');

    // 3. Clear data from database if logged in
    if (isAuthenticated) {
      try {
        // Clear note
        await api.post('/notes', { text: '' });
        // Delete all tasks
        const tasksResponse = await api.get('/tasks');
        if (tasksResponse.data && tasksResponse.data.success) {
          const tasks = tasksResponse.data.data;
          await Promise.all(
            tasks.map(task => api.delete(`/tasks/${task._id || task.id}`))
          );
        }
      } catch (error) {
        console.error('Error purging server data:', error);
      }
    }

    // Refresh UI
    window.location.reload();
  };

  // Acoustic click sound helper (Web Audio API)
  const playClickSound = (startFreq = 1000, endFreq = 600, volume = 0.05) => {
    if (audioActive) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const actx = new AudioContextClass();
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        
        osc.connect(gain);
        gain.connect(actx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, actx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(volume, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.05);
        
        osc.start();
        osc.stop(actx.currentTime + 0.06);
      } catch (err) {
        console.error('AudioContext selection failure:', err);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        particlesActive,
        audioActive,
        setTheme,
        setParticlesActive,
        setAudioActive,
        purgeWorkspace,
        playClickSound
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

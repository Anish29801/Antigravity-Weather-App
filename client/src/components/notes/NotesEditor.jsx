import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

export default function NotesEditor() {
  const [text, setText] = useState('');
  const [saveStatus, setSaveStatus] = useState('AUTO-SAVED');
  const [isActive, setIsActive] = useState(false);
  const saveTimeoutRef = useRef(null);

  // 1. Fetch note on mount
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await api.get('/notes');
        if (response.data && response.data.success) {
          setText(response.data.data.text || '');
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
      }
    };

    fetchNote();
  }, []);

  // 2. Debounced save handler
  const handleInputChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    setSaveStatus('SAVING...');
    setIsActive(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.post('/notes', { text: newText });
        setSaveStatus('AUTO-SAVED');
        setIsActive(false);
      } catch (err) {
        console.error('Error autosaving notes:', err);
        setSaveStatus('SAVE ERROR');
      }
    }, 600);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  return (
    <section id="notes-widget" className="glass-panel interactive-card" aria-label="Aether Notes">
      <div className="card-header">
        <h2><i className="fa-solid fa-feather-pointed"></i> Aether Notes</h2>
        <span 
          id="save-indicator" 
          className={`header-badge-secondary ${isActive ? 'active' : ''}`}
        >
          {saveStatus}
        </span>
      </div>
      <textarea 
        id="notes-textarea" 
        placeholder="Record telemetry, ideas, or reminders here..."
        value={text}
        onChange={handleInputChange}
      ></textarea>
    </section>
  );
}

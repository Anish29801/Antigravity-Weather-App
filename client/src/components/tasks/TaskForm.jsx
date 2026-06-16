import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function TaskForm({ onAddTask }) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('Code');
  const { playClickSound } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    playClickSound(1600, 1000, 0.05); // Add sound
    onAddTask(text, category);
    setText('');
  };

  return (
    <form id="task-form" onSubmit={handleSubmit}>
      <input 
        type="text" 
        id="task-input" 
        placeholder="Initiate a new objective..." 
        value={text}
        onChange={(e) => setText(e.target.value)}
        required 
      />
      <select 
        id="task-category" 
        aria-label="Category Selection"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="Code">💻 Code</option>
        <option value="Design">🎨 Design</option>
        <option value="Work">💼 Work</option>
        <option value="Life">🔋 Life</option>
      </select>
      <button type="submit" id="btn-add-task" aria-label="Add Objective">
        <i className="fa-solid fa-plus"></i>
      </button>
    </form>
  );
}

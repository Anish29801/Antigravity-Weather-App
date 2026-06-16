import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function TaskItem({ task, onToggle, onDelete }) {
  const { playClickSound } = useTheme();

  const handleToggle = () => {
    // Play chime sound depending on next complete state
    if (!task.completed) {
      playClickSound(1200, 1800, 0.04); // Success chime
    } else {
      playClickSound(900, 700, 0.04); // Uncheck tone
    }
    onToggle(task._id || task.id);
  };

  const handleDelete = () => {
    playClickSound(600, 300, 0.05); // Purge tone
    onDelete(task._id || task.id);
  };

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`} data-id={task._id || task.id}>
      <div className="task-left">
        <label className="task-check-wrapper">
          <input 
            type="checkbox" 
            checked={task.completed} 
            onChange={handleToggle} 
          />
          <span className="checkbox-custom"></span>
        </label>
        <span className="task-content">{task.text}</span>
      </div>
      
      <div className="task-tags">
        <span className={`task-tag ${task.category.toLowerCase()}`}>
          {task.category}
        </span>
        <button 
          className="btn-delete-task" 
          title="Delete Objective"
          onClick={handleDelete}
        >
          <i className="fa-regular fa-trash-can"></i>
        </button>
      </div>
    </li>
  );
}

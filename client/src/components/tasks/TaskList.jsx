import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks');
        if (response.data && response.data.success) {
          setTasks(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to fetch tasks');
      }
    };

    fetchTasks();
  }, []);

  const handleAddTask = async (text, category) => {
    try {
      const response = await api.post('/tasks', { text, category });
      if (response.data && response.data.success) {
        setTasks((prev) => [response.data.data, ...prev]);
      }
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to create task');
    }
  };

  const handleToggleTask = async (id) => {
    const task = tasks.find(t => (t._id || t.id) === id);
    if (!task) return;

    try {
      const response = await api.put(`/tasks/${id}`, { completed: !task.completed });
      if (response.data && response.data.success) {
        setTasks((prev) => 
          prev.map((t) => ((t._id || t.id) === id ? response.data.data : t))
        );
      }
    } catch (err) {
      console.error('Error toggling task:', err);
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      if (response.data && response.data.success) {
        setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <section id="task-board-widget" className="glass-panel interactive-card" aria-label="Task Manager">
      <div className="card-header">
        <h2><i className="fa-solid fa-list-check"></i> Focus Board</h2>
        <span className="header-badge" id="task-count">
          {completedCount} / {tasks.length} Done
        </span>
      </div>

      {error && <div style={styles.errorText}>{error}</div>}

      <TaskForm onAddTask={handleAddTask} />

      <div className="tasks-scroll-container">
        <ul id="task-list">
          {tasks.map((task) => (
            <TaskItem 
              key={task._id || task.id} 
              task={task} 
              onToggle={handleToggleTask} 
              onDelete={handleDeleteTask} 
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

const styles = {
  errorText: {
    color: '#ef4444',
    fontSize: '11px',
    marginBottom: '10px',
    fontFamily: 'var(--font-mono)'
  }
};

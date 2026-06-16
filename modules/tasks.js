/**
 * AETHER OS - Focus Task Board
 * Manages daily task operations, categories, and browser localStorage persistence.
 */

export class TaskBoardEngine {
    constructor() {
        this.form = document.getElementById('task-form');
        this.input = document.getElementById('task-input');
        this.categorySelect = document.getElementById('task-category');
        this.listEl = document.getElementById('task-list');
        this.countEl = document.getElementById('task-count');

        this.tasks = [];

        this.init();
    }

    init() {
        this.loadTasks();
        this.setupForm();
        this.render();
    }

    setupForm() {
        if (!this.form) return;
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = this.input.value.trim();
            const category = this.categorySelect.value;
            if (!text) return;

            this.addTask(text, category);
            this.input.value = '';
            this.playClickFX(1600, 1000, 0.05);
        });
    }

    loadTasks() {
        const cached = localStorage.getItem('aether_tasks');
        if (cached) {
            this.tasks = JSON.parse(cached);
        } else {
            // Populate defaults on fresh launch
            this.tasks = [
                { id: '1', text: 'Initialize Aether OS modules', category: 'Code', completed: true },
                { id: '2', text: 'Calibrate glassmorphism grid layout', category: 'Design', completed: true },
                { id: '3', text: 'Compile orbital telemetry log files', category: 'Work', completed: false },
                { id: '4', text: 'Initiate lo-fi atmospheric track sweep', category: 'Life', completed: false }
            ];
            this.saveTasks();
        }
    }

    saveTasks() {
        localStorage.setItem('aether_tasks', JSON.stringify(this.tasks));
    }

    addTask(text, category) {
        const task = {
            id: String(Date.now()),
            text,
            category,
            completed: false
        };
        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
            if (task.completed) {
                // Happy success chime
                this.playClickFX(1200, 1800, 0.04);
            } else {
                this.playClickFX(900, 700, 0.04);
            }
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
        // Soft purge tone
        this.playClickFX(600, 300, 0.05);
    }

    purgeAll() {
        this.tasks = [];
        this.saveTasks();
        this.render();
    }

    render() {
        this.listEl.innerHTML = '';
        
        let completedCount = 0;
        
        this.tasks.forEach(task => {
            if (task.completed) completedCount++;

            // Create list item
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', task.id);

            // Left side elements (checkbox + text)
            const leftDiv = document.createElement('div');
            leftDiv.className = 'task-left';

            const checkWrapper = document.createElement('label');
            checkWrapper.className = 'task-check-wrapper';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => this.toggleTask(task.id));

            const customBox = document.createElement('span');
            customBox.className = 'checkbox-custom';

            checkWrapper.appendChild(checkbox);
            checkWrapper.appendChild(customBox);

            const contentSpan = document.createElement('span');
            contentSpan.className = 'task-content';
            contentSpan.textContent = task.text;

            leftDiv.appendChild(checkWrapper);
            leftDiv.appendChild(contentSpan);

            // Right side elements (tag + delete button)
            const rightDiv = document.createElement('div');
            rightDiv.className = 'task-tags';

            const tagSpan = document.createElement('span');
            tagSpan.className = `task-tag ${task.category.toLowerCase()}`;
            tagSpan.textContent = task.category;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-delete-task';
            deleteBtn.setAttribute('title', 'Delete Objective');
            deleteBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

            rightDiv.appendChild(tagSpan);
            rightDiv.appendChild(deleteBtn);

            li.appendChild(leftDiv);
            li.appendChild(rightDiv);

            this.listEl.appendChild(li);
        });

        // Update count badge
        this.countEl.textContent = `${completedCount} / ${this.tasks.length} Done`;
    }

    playClickFX(startFreq, endFreq, volume) {
        const audioFX = document.getElementById('toggle-audio-fx');
        if (audioFX && audioFX.checked) {
            const actx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            
            osc.connect(gain);
            gain.connect(actx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(startFreq, actx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(endFreq, actx.currentTime + 0.08);
            
            gain.gain.setValueAtTime(volume, actx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.08);
            
            osc.start();
            osc.stop(actx.currentTime + 0.09);
        }
    }
}

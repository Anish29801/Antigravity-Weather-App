/**
 * AETHER OS - Central Workspace Coordinator
 * Initializes all sub-engines and manages notes auto-save, controls, and theme overrides.
 */

import { BackgroundEngine } from './modules/background.js';
import { WeatherClockEngine } from './modules/weather.js';
import { SystemStatsEngine } from './modules/stats.js';
import { TaskBoardEngine } from './modules/tasks.js';
import { AetherSoundEngine } from './modules/player.js';

class AetherWorkspaceController {
    constructor() {
        this.bgEngine = null;
        this.weatherEngine = null;
        this.statsEngine = null;
        this.tasksEngine = null;
        this.soundEngine = null;

        // UI elements for notes
        this.notesArea = document.getElementById('notes-textarea');
        this.saveIndicator = document.getElementById('save-indicator');

        // UI toggles
        this.toggleParticles = document.getElementById('toggle-particles');
        this.toggleAudio = document.getElementById('toggle-audio-fx');
        this.btnPurge = document.getElementById('btn-purge-workspace');

        this.init();
    }

    init() {
        // 1. Set saved Theme
        this.initTheme();

        // 2. Initialize Sub-Engines
        try {
            this.bgEngine = new BackgroundEngine('bg-canvas');
            this.weatherEngine = new WeatherClockEngine();
            this.statsEngine = new SystemStatsEngine();
            this.tasksEngine = new TaskBoardEngine();
            this.soundEngine = new AetherSoundEngine();
        } catch (error) {
            console.error('Core module initialisation failure:', error);
        }

        // 3. Bind Notes Functionality
        this.initNotes();

        // 4. Bind Control Deck toggles
        this.setupControlDeck();

        console.log('Aether OS Workspace calibrated successfully.');
    }

    initTheme() {
        const cachedTheme = localStorage.getItem('aether_theme') || 'theme-cyan';
        document.body.className = cachedTheme;

        // Update active class on theme buttons
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            const btnTheme = btn.getAttribute('data-theme');
            if (btnTheme === cachedTheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    initNotes() {
        if (!this.notesArea) return;

        // Load cached notes
        const cachedNotes = localStorage.getItem('aether_notes');
        if (cachedNotes) {
            this.notesArea.value = cachedNotes;
        }

        // Auto-save debounced on keystrokes
        let debounceTimeout;
        this.notesArea.addEventListener('input', () => {
            this.saveIndicator.textContent = 'SAVING...';
            this.saveIndicator.classList.add('active');

            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                localStorage.setItem('aether_notes', this.notesArea.value);
                this.saveIndicator.textContent = 'AUTO-SAVED';
                this.saveIndicator.classList.remove('active');
            }, 600);
        });
    }

    setupControlDeck() {
        // Particle backdrop toggle
        if (this.toggleParticles) {
            // Load state
            const state = localStorage.getItem('aether_particles_active') !== 'false';
            this.toggleParticles.checked = state;
            if (this.bgEngine) this.bgEngine.toggle(state);

            this.toggleParticles.addEventListener('change', () => {
                const isActive = this.toggleParticles.checked;
                localStorage.setItem('aether_particles_active', String(isActive));
                if (this.bgEngine) this.bgEngine.toggle(isActive);
                this.playClickSound();
            });
        }

        // Audio toggle clicks
        if (this.toggleAudio) {
            const state = localStorage.getItem('aether_audio_active') !== 'false';
            this.toggleAudio.checked = state;

            this.toggleAudio.addEventListener('change', () => {
                localStorage.setItem('aether_audio_active', String(this.toggleAudio.checked));
                this.playClickSound();
            });
        }

        // Theme buttons click bindings
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const themeClass = btn.getAttribute('data-theme');
                document.body.className = themeClass;
                localStorage.setItem('aether_theme', themeClass);

                themeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.playClickSound();
            });
        });

        // Purge Workspace
        if (this.btnPurge) {
            this.btnPurge.addEventListener('click', () => {
                const confirmPurge = confirm('WARNING: This action resets your notes, tasks, and system layouts back to defaults. Proceed?');
                if (confirmPurge) {
                    localStorage.removeItem('aether_tasks');
                    localStorage.removeItem('aether_notes');
                    localStorage.removeItem('aether_theme');
                    localStorage.removeItem('aether_particles_active');
                    localStorage.removeItem('aether_audio_active');
                    
                    this.playClickSound(800, 200, 0.1);
                    setTimeout(() => window.location.reload(), 200);
                }
            });
        }
    }

    playClickSound(startFreq = 1000, endFreq = 600, volume = 0.05) {
        if (this.toggleAudio && this.toggleAudio.checked) {
            const actx = new (window.AudioContext || window.webkitAudioContext)();
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
        }
    }
}

// Instantiate workspace when window content loads
window.addEventListener('DOMContentLoaded', () => {
    new AetherWorkspaceController();
});

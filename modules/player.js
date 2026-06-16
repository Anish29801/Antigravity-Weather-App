/**
 * AETHER OS - Ambient Sound Engine & Procedural Synth
 * Synthesizes procedural lo-fi ambient tracks and draws real-time frequency visualizers on a canvas.
 */

export class AetherSoundEngine {
    constructor() {
        this.btnPlay = document.getElementById('btn-play-pause');
        this.btnPrev = document.getElementById('btn-prev');
        this.btnNext = document.getElementById('btn-next');
        this.btnShuffle = document.getElementById('btn-shuffle');
        this.btnMute = document.getElementById('btn-mute');
        
        this.trackArt = document.getElementById('track-art');
        this.trackTitle = document.getElementById('track-title');
        this.trackArtist = document.getElementById('track-artist');
        
        this.timeCurrent = document.getElementById('time-current');
        this.timeDuration = document.getElementById('time-duration');
        this.timelineSlider = document.getElementById('timeline-slider');
        this.timelineProgress = document.getElementById('timeline-progress');
        this.timelineHandle = document.getElementById('timeline-handle');
        
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeProgress = document.getElementById('volume-progress');

        this.canvas = document.getElementById('visualizer-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Playlists database
        this.playlist = [
            { title: 'Aetherial Drift', artist: 'Procedural Synth', duration: 180, chords: [['C#m9', [130.81, 196.00, 277.18, 329.63, 415.30]], ['F#13', [146.83, 220.00, 277.18, 369.99, 440.00]], ['Bmaj9', [123.47, 185.00, 246.94, 311.13, 392.00]], ['G#7alt', [103.83, 155.56, 233.08, 311.13, 415.30]]] },
            { title: 'Stardust Sleep', artist: 'Aether OS Chords', duration: 210, chords: [['Amaj9', [110.00, 165.00, 220.00, 277.18, 370.00]], ['C#m7', [130.81, 196.00, 246.94, 329.63, 392.00]], ['Dmaj9', [146.83, 220.00, 293.66, 370.00, 440.00]], ['E6/9', [164.81, 246.94, 329.63, 415.30, 493.88]]] },
            { title: 'Neon Raindrops', artist: 'Atmosphere Unit', duration: 160, chords: [['Fmaj7', [87.31, 130.81, 174.61, 261.63, 329.63]], ['G6', [98.00, 146.83, 196.00, 293.66, 392.00]], ['Em7', [82.41, 123.47, 164.81, 246.94, 329.63]], ['Am7', [110.00, 165.00, 220.00, 329.63, 392.00]]] }
        ];

        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isMuted = false;
        this.shuffle = false;
        this.currentTime = 0;
        this.volume = 0.8;
        
        // Synth properties
        this.audioCtx = null;
        this.analyser = null;
        this.gainNode = null;
        this.synthNodes = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTrack(this.currentTrackIndex);
        this.drawVisualizer();
    }

    setupEventListeners() {
        this.btnPlay.addEventListener('click', () => this.togglePlay());
        this.btnPrev.addEventListener('click', () => this.changeTrack(-1));
        this.btnNext.addEventListener('click', () => this.changeTrack(1));
        this.btnShuffle.addEventListener('click', () => this.toggleShuffle());
        this.btnMute.addEventListener('click', () => this.toggleMute());
        
        this.volumeSlider.addEventListener('mousedown', (e) => this.setVolume(e));
        this.timelineSlider.addEventListener('mousedown', (e) => this.scrub(e));

        // Time updates
        setInterval(() => this.updateTimeline(), 1000);
    }

    loadTrack(index) {
        this.currentTrackIndex = index;
        const track = this.playlist[index];
        
        this.trackTitle.textContent = track.title;
        this.trackArtist.textContent = track.artist;
        this.currentTime = 0;
        
        this.timeCurrent.textContent = '0:00';
        this.timeDuration.textContent = this.formatTime(track.duration);
        this.updateProgressBar();

        // If playing, restart the synth to play new chord sequences
        if (this.isPlaying) {
            this.playSynth();
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }

    togglePlay() {
        if (!this.audioCtx) {
            this.initSynthAudio();
        }

        this.isPlaying = !this.isPlaying;
        
        const recordIcon = this.trackArt.querySelector('i');

        if (this.isPlaying) {
            this.btnPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
            this.btnPlay.classList.add('active');
            recordIcon.style.animationPlayState = 'running';
            this.audioCtx.resume();
            this.playSynth();
        } else {
            this.btnPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
            this.btnPlay.classList.remove('active');
            recordIcon.style.animationPlayState = 'paused';
            this.stopSynth();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.gainNode) {
            this.gainNode.gain.value = this.isMuted ? 0 : this.volume * 0.15; // keep it subtle
        }
        
        if (this.isMuted) {
            this.btnMute.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            this.btnMute.classList.add('active');
        } else {
            this.btnMute.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            this.btnMute.classList.remove('active');
        }
    }

    toggleShuffle() {
        this.shuffle = !this.shuffle;
        this.btnShuffle.classList.toggle('active', this.shuffle);
    }

    changeTrack(dir) {
        let index = this.currentTrackIndex;
        if (this.shuffle) {
            index = Math.floor(Math.random() * this.playlist.length);
        } else {
            index = (index + dir + this.playlist.length) % this.playlist.length;
        }
        this.loadTrack(index);
    }

    setVolume(e) {
        const rect = this.volumeSlider.getBoundingClientRect();
        const update = (clientX) => {
            let pct = (clientX - rect.left) / rect.width;
            pct = Math.max(0, Math.min(1, pct));
            this.volume = pct;
            this.volumeProgress.style.width = `${pct * 100}%`;
            
            if (this.gainNode && !this.isMuted) {
                // Procedural synth has a maximum scale multiplier of 0.15 to keep it relaxing
                this.gainNode.gain.value = pct * 0.15;
            }
        };

        update(e.clientX);

        const onMouseMove = (moveEvent) => update(moveEvent.clientX);
        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    scrub(e) {
        const rect = this.timelineSlider.getBoundingClientRect();
        const track = this.playlist[this.currentTrackIndex];
        
        const update = (clientX) => {
            let pct = (clientX - rect.left) / rect.width;
            pct = Math.max(0, Math.min(1, pct));
            this.currentTime = pct * track.duration;
            this.timeCurrent.textContent = this.formatTime(this.currentTime);
            this.updateProgressBar();
        };

        update(e.clientX);

        const onMouseMove = (moveEvent) => update(moveEvent.clientX);
        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    updateTimeline() {
        if (!this.isPlaying) return;
        
        const track = this.playlist[this.currentTrackIndex];
        this.currentTime += 1;

        if (this.currentTime >= track.duration) {
            this.changeTrack(1);
            return;
        }

        this.timeCurrent.textContent = this.formatTime(this.currentTime);
        this.updateProgressBar();
    }

    updateProgressBar() {
        const track = this.playlist[this.currentTrackIndex];
        const pct = (this.currentTime / track.duration) * 100;
        this.timelineProgress.style.width = `${pct}%`;
        this.timelineHandle.style.left = `${pct}%`;
    }

    /* --- Procedural Lofi Synth Audio Engine --- */

    initSynthAudio() {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContextClass();
        
        // Setup nodes
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;

        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = this.isMuted ? 0 : this.volume * 0.12; // low, ambient volume

        // Lowpass filter to give it that cozy "warm lofi" muffled feel
        this.lowpass = this.audioCtx.createBiquadFilter();
        this.lowpass.type = 'lowpass';
        this.lowpass.frequency.setValueAtTime(800, this.audioCtx.currentTime); // muffled

        // Connections
        this.lowpass.connect(this.analyser);
        this.analyser.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);

        // Start static vinyl crackle
        this.startVinylStatic();
    }

    startVinylStatic() {
        // Create noise buffer (2 seconds long)
        const bufferSize = this.audioCtx.sampleRate * 2;
        const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            // Pink-ish noise + pop crackle
            let white = Math.random() * 2 - 1;
            // Pop static triggers
            let pop = Math.random() < 0.00015 ? (Math.random() > 0.5 ? 0.3 : -0.3) : 0;
            output[i] = white * 0.007 + pop * 0.12;
        }

        const noiseNode = this.audioCtx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        // Bandpass filter for static frequency band
        const staticFilter = this.audioCtx.createBiquadFilter();
        staticFilter.type = 'bandpass';
        staticFilter.frequency.setValueAtTime(1000, this.audioCtx.currentTime);
        staticFilter.Q.setValueAtTime(1.0, this.audioCtx.currentTime);

        noiseNode.connect(staticFilter);
        staticFilter.connect(this.analyser);
        noiseNode.start();
    }

    playSynth() {
        this.stopSynth();
        if (!this.audioCtx) return;

        const track = this.playlist[this.currentTrackIndex];
        const chords = track.chords;

        let chordIndex = 0;
        const playNextChord = () => {
            if (!this.isPlaying) return;

            const chordData = chords[chordIndex];
            const freqs = chordData[1];
            
            this.synthNodes = [];

            // Play chord notes (pads)
            freqs.forEach(freq => {
                const osc = this.audioCtx.createOscillator();
                const noteGain = this.audioCtx.createGain();
                
                osc.type = 'triangle'; // triangle is soft and mellow
                osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
                
                // Glide frequency slightly for a "vintage tape warp" effect
                osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
                osc.frequency.linearRampToValueAtTime(freq * (0.997 + Math.random() * 0.006), this.audioCtx.currentTime + 3);

                // Envelope: Soft attack, steady sustain, soft release
                noteGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
                noteGain.gain.linearRampToValueAtTime(0.12, this.audioCtx.currentTime + 1.2); // attack
                noteGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime + 3.0); 
                noteGain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 4.2); // decay/release

                osc.connect(noteGain);
                noteGain.connect(this.lowpass);
                
                osc.start();
                osc.stop(this.audioCtx.currentTime + 4.5);

                this.synthNodes.push(osc);
            });

            // Random delicate chiptune melody bell
            if (Math.random() < 0.8) {
                setTimeout(() => {
                    if (!this.isPlaying) return;
                    // Pick a random frequency from chords, scale up an octave for melody
                    const baseFreq = freqs[Math.floor(Math.random() * freqs.length)];
                    const bellFreq = baseFreq * 2;

                    const oscBell = this.audioCtx.createOscillator();
                    const bellGain = this.audioCtx.createGain();

                    oscBell.type = 'sine';
                    oscBell.frequency.setValueAtTime(bellFreq, this.audioCtx.currentTime);

                    bellGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
                    bellGain.gain.linearRampToValueAtTime(0.04, this.audioCtx.currentTime + 0.05); // sharp attack
                    bellGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1.8); // long delay decay

                    oscBell.connect(bellGain);
                    oscBell.connect(this.lowpass);

                    oscBell.start();
                    oscBell.stop(this.audioCtx.currentTime + 2.0);
                    this.synthNodes.push(oscBell);
                }, 1000 + Math.random() * 1500);
            }

            // Queue next chord in 4.0 seconds
            chordIndex = (chordIndex + 1) % chords.length;
            this.chordTimeout = setTimeout(playNextChord, 4000);
        };

        playNextChord();
    }

    stopSynth() {
        if (this.chordTimeout) {
            clearTimeout(this.chordTimeout);
        }
        this.synthNodes.forEach(node => {
            try { node.stop(); } catch(e) {}
        });
        this.synthNodes = [];
    }

    /* --- Visualizer Canvas Rendering --- */

    drawVisualizer() {
        requestAnimationFrame(() => this.drawVisualizer());

        const width = this.canvas.width;
        const height = this.canvas.height;
        this.ctx.clearRect(0, 0, width, height);

        const style = getComputedStyle(document.body);
        const accentColor = style.getPropertyValue('--accent').trim();

        if (!this.isPlaying || !this.analyser) {
            // Draw a steady warm flat waveform when paused
            this.ctx.strokeStyle = accentColor;
            this.ctx.globalAlpha = 0.25;
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(0, height / 2);
            this.ctx.lineTo(width, height / 2);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1.0;
            return;
        }

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        this.ctx.beginPath();
        for (let i = 0; i < bufferLength; i++) {
            barHeight = (dataArray[i] / 255) * height * 0.95;

            // Draw frequency bars reflecting actual sound nodes
            const radialGrad = this.ctx.createLinearGradient(x, height, x, height - barHeight);
            radialGrad.addColorStop(0, 'rgba(' + this.hexToRgb(accentColor) + ', 0.05)');
            radialGrad.addColorStop(0.5, 'rgba(' + this.hexToRgb(accentColor) + ', 0.35)');
            radialGrad.addColorStop(1, accentColor);

            this.ctx.fillStyle = radialGrad;
            // Draw slightly rounded columns
            this.ctx.fillRect(x, height - barHeight, barWidth - 1.5, barHeight);

            x += barWidth;
        }
    }

    hexToRgb(hex) {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `${r}, ${g}, ${b}`;
    }
}

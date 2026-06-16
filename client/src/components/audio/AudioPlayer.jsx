import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const PLAYLIST = [
  { 
    title: 'Aetherial Drift', 
    artist: 'Procedural Synth', 
    duration: 180, 
    chords: [
      ['C#m9', [130.81, 196.00, 277.18, 329.63, 415.30]], 
      ['F#13', [146.83, 220.00, 277.18, 369.99, 440.00]], 
      ['Bmaj9', [123.47, 185.00, 246.94, 311.13, 392.00]], 
      ['G#7alt', [103.83, 155.56, 233.08, 311.13, 415.30]]
    ] 
  },
  { 
    title: 'Stardust Sleep', 
    artist: 'Aether OS Chords', 
    duration: 210, 
    chords: [
      ['Amaj9', [110.00, 165.00, 220.00, 277.18, 370.00]], 
      ['C#m7', [130.81, 196.00, 246.94, 329.63, 392.00]], 
      ['Dmaj9', [146.83, 220.00, 293.66, 370.00, 440.00]], 
      ['E6/9', [164.81, 246.94, 329.63, 415.30, 493.88]]
    ] 
  },
  { 
    title: 'Neon Raindrops', 
    artist: 'Atmosphere Unit', 
    duration: 160, 
    chords: [
      ['Fmaj7', [87.31, 130.81, 174.61, 261.63, 329.63]], 
      ['G6', [98.00, 146.83, 196.00, 293.66, 392.00]], 
      ['Em7', [82.41, 123.47, 164.81, 246.94, 329.63]], 
      ['Am7', [110.00, 165.00, 220.00, 329.63, 392.00]]
    ] 
  }
];

export default function AudioPlayer() {
  const { playClickSound } = useTheme();
  
  // Track State
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const track = PLAYLIST[trackIndex];

  // Canvas and Audio Refs
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const gainNodeRef = useRef(null);
  const lowpassRef = useRef(null);
  
  // Active playing sound nodes tracker
  const activeNodesRef = useRef([]);
  const chordTimeoutRef = useRef(null);
  const playTimeIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Helper: Hex color parser
  const hexToRgb = (hex) => {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `${r}, ${g}, ${b}`;
  };

  // Helper: Format Time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // 1. Initialize Web Audio Context
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const actx = new AudioContextClass();
      audioCtxRef.current = actx;

      const analyser = actx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      const gainNode = actx.createGain();
      gainNode.gain.value = isMuted ? 0 : volume * 0.12;
      gainNodeRef.current = gainNode;

      const lowpass = actx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(800, actx.currentTime);
      lowpassRef.current = lowpass;

      // Connections
      lowpass.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(actx.destination);

      // Start static vinyl crackle
      startVinylStatic(actx, analyser);
    } catch (e) {
      console.error('Failed to initialize audio synth:', e);
    }
  };

  // 2. Play Vinyl Crackle background loop
  const startVinylStatic = (actx, destinationNode) => {
    const bufferSize = actx.sampleRate * 2;
    const noiseBuffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      let pop = Math.random() < 0.00015 ? (Math.random() > 0.5 ? 0.3 : -0.3) : 0;
      output[i] = white * 0.007 + pop * 0.12;
    }

    const noiseNode = actx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const staticFilter = actx.createBiquadFilter();
    staticFilter.type = 'bandpass';
    staticFilter.frequency.setValueAtTime(1000, actx.currentTime);
    staticFilter.Q.setValueAtTime(1.0, actx.currentTime);

    noiseNode.connect(staticFilter);
    staticFilter.connect(destinationNode);
    noiseNode.start();
  };

  // 3. Play Chord Synthesis Pads
  const playSynth = () => {
    stopSynth();
    const actx = audioCtxRef.current;
    const lowpass = lowpassRef.current;
    if (!actx || !lowpass) return;

    const chords = PLAYLIST[trackIndex].chords;
    let chordIdx = 0;

    const playNextChord = () => {
      const chordData = chords[chordIdx];
      const freqs = chordData[1];
      
      const chordNodes = [];

      // Synthesize chord pads
      freqs.forEach((freq) => {
        const osc = actx.createOscillator();
        const noteGain = actx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, actx.currentTime);
        
        // Analog tape warble glide
        osc.frequency.linearRampToValueAtTime(
          freq * (0.997 + Math.random() * 0.006), 
          actx.currentTime + 3
        );

        // Envelope config
        noteGain.gain.setValueAtTime(0, actx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.12, actx.currentTime + 1.2);
        noteGain.gain.setValueAtTime(0.12, actx.currentTime + 3.0);
        noteGain.gain.linearRampToValueAtTime(0, actx.currentTime + 4.2);

        osc.connect(noteGain);
        noteGain.connect(lowpass);
        
        osc.start();
        osc.stop(actx.currentTime + 4.5);

        chordNodes.push(osc);
      });

      activeNodesRef.current = chordNodes;

      // Random bell melody overlay
      if (Math.random() < 0.8) {
        const bellTimeout = setTimeout(() => {
          if (!audioCtxRef.current) return;
          const baseFreq = freqs[Math.floor(Math.random() * freqs.length)];
          const bellFreq = baseFreq * 2;

          const oscBell = actx.createOscillator();
          const bellGain = actx.createGain();

          oscBell.type = 'sine';
          oscBell.frequency.setValueAtTime(bellFreq, actx.currentTime);

          bellGain.gain.setValueAtTime(0, actx.currentTime);
          bellGain.gain.linearRampToValueAtTime(0.04, actx.currentTime + 0.05);
          bellGain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 1.8);

          oscBell.connect(bellGain);
          bellGain.connect(lowpass);

          oscBell.start();
          oscBell.stop(actx.currentTime + 2.0);
          
          activeNodesRef.current.push(oscBell);
        }, 1000 + Math.random() * 1500);

        chordTimeoutRef.current = bellTimeout;
      }

      chordIdx = (chordIdx + 1) % chords.length;
      chordTimeoutRef.current = setTimeout(playNextChord, 4000);
    };

    playNextChord();
  };

  const stopSynth = () => {
    if (chordTimeoutRef.current) {
      clearTimeout(chordTimeoutRef.current);
    }
    activeNodesRef.current.forEach((node) => {
      try {
        node.stop();
      } catch (e) {}
    });
    activeNodesRef.current = [];
  };

  // 4. Handles Play/Pause clicks
  const togglePlay = () => {
    playClickSound(1000, 600, 0.04);
    if (!audioCtxRef.current) {
      initAudio();
    }

    const nextPlayState = !isPlaying;
    setIsPlaying(nextPlayState);

    if (nextPlayState) {
      audioCtxRef.current.resume();
      playSynth();
    } else {
      stopSynth();
    }
  };

  // 5. Handles Mute clicks
  const toggleMute = () => {
    playClickSound(1100, 700, 0.04);
    const nextMuteState = !isMuted;
    setIsMuted(nextMuteState);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = nextMuteState ? 0 : volume * 0.15;
    }
  };

  const toggleShuffle = () => {
    playClickSound(1000, 800, 0.04);
    setShuffle(!shuffle);
  };

  const changeTrack = (dir) => {
    playClickSound(1300, 900, 0.04);
    let nextIndex = trackIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * PLAYLIST.length);
    } else {
      nextIndex = (trackIndex + dir + PLAYLIST.length) % PLAYLIST.length;
    }
    setTrackIndex(nextIndex);
    setCurrentTime(0);
  };

  // Restart synth if track changes while playing
  useEffect(() => {
    if (isPlaying) {
      playSynth();
    }
  }, [trackIndex]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      stopSynth();
      if (playTimeIntervalRef.current) clearInterval(playTimeIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // 6. Time and Progress tracking
  useEffect(() => {
    if (playTimeIntervalRef.current) clearInterval(playTimeIntervalRef.current);

    if (isPlaying) {
      playTimeIntervalRef.current = setInterval(() => {
        setCurrentTime((prevTime) => {
          if (prevTime >= track.duration - 1) {
            changeTrack(1);
            return 0;
          }
          return prevTime + 1;
        });
      }, 1000);
    }

    return () => clearInterval(playTimeIntervalRef.current);
  }, [isPlaying, trackIndex, shuffle]);

  // 7. Visualizer canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const accentColor = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#00f0ff';

      if (!isPlaying || !analyserRef.current) {
        ctx.strokeStyle = accentColor;
        ctx.globalAlpha = 0.25;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      ctx.beginPath();
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 0.95;

        const rgbAccent = hexToRgb(accentColor);
        const radialGrad = ctx.createLinearGradient(x, height, x, height - barHeight);
        radialGrad.addColorStop(0, `rgba(${rgbAccent}, 0.05)`);
        radialGrad.addColorStop(0.5, `rgba(${rgbAccent}, 0.35)`);
        radialGrad.addColorStop(1, accentColor);

        ctx.fillStyle = radialGrad;
        ctx.fillRect(x, height - barHeight, barWidth - 1.5, barHeight);

        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying]);

  // 8. Progress scrubbing
  const handleScrub = (e) => {
    const slider = e.currentTarget;
    const rect = slider.getBoundingClientRect();
    
    const update = (clientX) => {
      let pct = (clientX - rect.left) / rect.width;
      pct = Math.max(0, Math.min(1, pct));
      setCurrentTime(pct * track.duration);
    };

    update(e.clientX);

    const onMouseMove = (moveEvent) => update(moveEvent.clientX);
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // 9. Volume setting
  const handleVolumeChange = (e) => {
    const slider = e.currentTarget;
    const rect = slider.getBoundingClientRect();

    const update = (clientX) => {
      let pct = (clientX - rect.left) / rect.width;
      pct = Math.max(0, Math.min(1, pct));
      setVolume(pct);

      if (gainNodeRef.current && !isMuted) {
        gainNodeRef.current.gain.value = pct * 0.15;
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
  };

  const pctProgress = (currentTime / track.duration) * 100;

  return (
    <section id="music-player-widget" className="glass-panel interactive-card" aria-label="Aether Sound System">
      <div className="card-header">
        <h2><i className="fa-solid fa-music"></i> Aether Sound</h2>
        <span className="header-badge">LO-FI FEED</span>
      </div>
      
      {/* Canvas Audio Visualizer */}
      <div className="visualizer-container">
        <canvas ref={canvasRef} id="visualizer-canvas" height="60" width="300"></canvas>
      </div>
      
      {/* Track Details */}
      <div className="track-details">
        <div className="track-artwork" id="track-art">
          <i 
            className="fa-solid fa-record-vinyl spinning-record"
            style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
          ></i>
        </div>
        <div className="track-info">
          <div id="track-title" className="marquee">{track.title}</div>
          <div id="track-artist">{track.artist}</div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="player-timeline">
        <span id="time-current">{formatTime(currentTime)}</span>
        <div 
          className="timeline-bar" 
          id="timeline-slider" 
          role="slider" 
          aria-valuemin="0" 
          aria-valuemax="100" 
          aria-valuenow={Math.round(pctProgress)}
          tabIndex="0"
          onMouseDown={handleScrub}
        >
          <div className="timeline-progress" id="timeline-progress" style={{ width: `${pctProgress}%` }}></div>
          <div className="timeline-handle" id="timeline-handle" style={{ left: `${pctProgress}%`, opacity: 1 }}></div>
        </div>
        <span id="time-duration">{formatTime(track.duration)}</span>
      </div>
      
      {/* Controls */}
      <div className="player-controls">
        <button 
          id="btn-shuffle" 
          className={`control-btn ${shuffle ? 'active' : ''}`}
          onClick={toggleShuffle} 
          title="Shuffle"
        >
          <i className="fa-solid fa-shuffle"></i>
        </button>
        <button 
          id="btn-prev" 
          className="control-btn" 
          onClick={() => changeTrack(-1)} 
          title="Previous"
        >
          <i className="fa-solid fa-backward-step"></i>
        </button>
        <button 
          id="btn-play-pause" 
          className={`control-btn play-btn ${isPlaying ? 'active' : ''}`} 
          onClick={togglePlay} 
          title={isPlaying ? 'Pause' : 'Play'}
        >
          <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        </button>
        <button 
          id="btn-next" 
          className="control-btn" 
          onClick={() => changeTrack(1)} 
          title="Next"
        >
          <i className="fa-solid fa-forward-step"></i>
        </button>
        
        <div className="volume-container">
          <button 
            id="btn-mute" 
            className={`control-btn ${isMuted ? 'active' : ''}`} 
            onClick={toggleMute} 
            title="Mute"
          >
            <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
          </button>
          <div 
            className="volume-slider" 
            id="volume-slider" 
            role="slider" 
            aria-valuemin="0" 
            aria-valuemax="100" 
            aria-valuenow={Math.round(volume * 100)}
            tabIndex="0"
            onMouseDown={handleVolumeChange}
          >
            <div className="volume-progress" id="volume-progress" style={{ width: `${volume * 100}%` }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}

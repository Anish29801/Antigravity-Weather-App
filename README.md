# Aether Dashboard - Premium Glassmorphic Workspace

Welcome to **Aether Dashboard**, a high-fidelity, futuristic personal workspace, audio synth, and system monitor built using vanilla HTML5, CSS3, and ES6+ JavaScript.

---

## 📂 Project Architecture

```
aether-dashboard/
├── index.html          # Main HTML entry point (SEO optimized, CDN connections)
├── style.css           # Glassmorphism design system, responsive grid, theme configs
├── app.js              # Coordinator; controls themes, notes storage, and toggles
├── server.js           # Zero-dependency local Node.js server to bypass module CORS
├── README.md           # This files guide
└── modules/
    ├── background.js   # Dynamic ambient background particle canvas
    ├── weather.js      # Precision clock, greetings, and weather animation canvas
    ├── stats.js        # Simulated resources engine and custom line-charts canvas
    ├── tasks.js        # Daily Focus checklists with local storage persistence
    └── player.js       # Procedural audio synth, vinyl crackle, and music visualizer
```

---

## 🚀 Key Features

1. **Interactive Constellation Canvas**:
   - Background nodes drift smoothly, connect with glow lines, and react gently to mouse hover and click bursts.
   - Can be toggled on/off in the Control Deck to save CPU/GPU resources.
2. **Precision High-Tech Clock & Weather Engine**:
   - Digital clock tracks down to the second, with dynamic greetings adapting to time of day.
   - Interactive canvas visualizes weather: **Stormy** (Neo-Tokyo rain & lightning), **Mist** (Aether City drifting clouds), and **Orbit** (Solar wind planet flare & orbits).
3. **Procedural Lo-fi Audio Synthesizer**:
   - Synthesizes relaxing ambient chord progressions (e.g. minor 9th pads) using Web Audio API oscillators, lowpass filters, and tape-glide sweeps.
   - Continuous vinyl record static sound generation.
   - Real-time frequency analysis rendered to a glowing canvas visualizer.
4. **Core System Metrics**:
   - Live simulated CPU & RAM dials updating dynamically.
   - Custom-rendered double-line history chart plotting performance metrics.
5. **Interactive Productivity Units**:
   - **Focus Board**: Task manager supporting categories (Code, Design, Work, Life) with localStorage.
   - **Aether Notes**: Auto-saving text area with debounced state indicators.
6. **Theme Customization Deck**:
   - Switchable coordinate presets: **Cyan Neon** (default), **Cyber Pink**, **Amber Gold**, and **Emerald Aura**.
   - Clear/Reset cached workspace settings.

---

## 💻 How to Run

1. Open your terminal at the project directory (`C:\Users\Anish\Desktop\aether-dashboard\`).
2. Run the local Node server script:
   ```bash
   node server.js
   ```
3. Open your web browser and navigate to:
   ```
   http://localhost:3000/
   ```
   *(Note: Running a server is required because modern browsers block JavaScript ES Modules on the `file://` protocol due to CORS security policies).*
4. Click **Play** on the Aether Sound card to initialize the Audio Context and hear the procedural relaxing lo-fi synths!

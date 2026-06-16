import React from 'react';
import { useWeather } from '../../context/WeatherContext';

export default function Footer() {
  const { weatherData } = useWeather();
  const coords = weatherData?.coord || '35.6762° N, 139.6503° E';

  return (
    <footer className="glass-panel h-12 px-6 flex justify-between items-center text-[11px] text-[var(--text-secondary)] font-mono">
      <div>
        <span>COORD: <span className="accent-text" id="coord-val">{coords}</span></span>
      </div>
      <div className="hidden md:block">
        <span>AETHER OS v2.0.0 • CORE TELEMETRY STATUS</span>
      </div>
      <div>
        <span id="footer-fps">FPS: --</span>
      </div>
    </footer>
  );
}

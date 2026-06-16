import React from 'react';
import { useWeather } from '../../context/WeatherContext';

export default function Footer() {
  const { weatherData } = useWeather();
  const coords = weatherData?.coord || '35.6762° N, 139.6503° E';

  return (
    <footer id="main-footer" className="glass-panel">
      <div className="footer-left">
        <span>COORD: <span className="accent-text" id="coord-val">{coords}</span></span>
      </div>
      <div className="footer-center">
        <span>AETHER OS v2.0.0 • CORE TELEMETRY STATUS</span>
      </div>
      <div className="footer-right">
        <span id="footer-fps">FPS: --</span>
      </div>
    </footer>
  );
}

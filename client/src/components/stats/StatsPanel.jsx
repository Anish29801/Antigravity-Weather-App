import React, { useState, useEffect, useRef } from 'react';
import CpuGauge from './CpuGauge';
import RamGauge from './RamGauge';
import HistoryChart from './HistoryChart';

export default function StatsPanel() {
  // Stats parameters
  const [cpuVal, setCpuVal] = useState(25);
  const [ramVal, setRamVal] = useState(45);
  const [freq, setFreq] = useState('3.80 GHz');
  const [netDown, setNetDown] = useState('24.5 Mbps');
  const [netUp, setNetUp] = useState('8.2 Mbps');

  // Histories
  const [cpuHistory, setCpuHistory] = useState(() => Array(40).fill(25));
  const [ramHistory, setRamHistory] = useState(() => Array(40).fill(45));

  // Refs for interpolation loops
  const targetCPU = useRef(25);
  const targetRAM = useRef(45);
  const currentCPU = useRef(25);
  const currentRAM = useRef(45);
  const ticksElapsed = useRef(0);
  const animationFrameId = useRef(null);

  useEffect(() => {
    // 1. Regular telemetry updates
    const simulateStats = () => {
      targetCPU.current = Math.round(15 + Math.random() * 50 + (Math.random() < 0.1 ? 25 : 0));
      targetRAM.current = Math.round(40 + Math.random() * 10);
      
      const newFreq = (3.6 + Math.random() * 0.6).toFixed(2);
      setFreq(`${newFreq} GHz`);

      const newNetDown = (12 + Math.random() * 38).toFixed(1);
      const newNetUp = (4 + Math.random() * 12).toFixed(1);
      setNetDown(`${newNetDown} Mbps`);
      setNetUp(`${newNetUp} Mbps`);
    };

    simulateStats();
    const simInterval = setInterval(simulateStats, 1500);

    // 2. Rapid interpolation loop
    const tick = () => {
      currentCPU.current += (targetCPU.current - currentCPU.current) * 0.12;
      currentRAM.current += (targetRAM.current - currentRAM.current) * 0.12;

      setCpuVal(currentCPU.current);
      setRamVal(currentRAM.current);

      ticksElapsed.current += 1;
      if (ticksElapsed.current >= 8) {
        setCpuHistory((prev) => {
          const next = [...prev, currentCPU.current];
          next.shift();
          return next;
        });
        setRamHistory((prev) => {
          const next = [...prev, currentRAM.current];
          next.shift();
          return next;
        });
        ticksElapsed.current = 0;
      }

      animationFrameId.current = requestAnimationFrame(tick);
    };

    animationFrameId.current = requestAnimationFrame(tick);

    return () => {
      clearInterval(simInterval);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <section id="system-stats-widget" className="glass-panel interactive-card" aria-label="System Metrics Monitor">
      <div className="card-header">
        <h2><i className="fa-solid fa-server"></i> System Core</h2>
        <span className="header-badge" id="stats-freq">{freq}</span>
      </div>
      
      <div className="metrics-grid">
        <CpuGauge pct={cpuVal} />
        <RamGauge pct={ramVal} />
      </div>

      {/* System Line Chart */}
      <div className="chart-container">
        <div className="chart-header">
          <span className="chart-title">CORE ACTIVITY HISTORY</span>
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-color cpu"></span> CPU</span>
            <span className="legend-item"><span className="legend-color ram"></span> RAM</span>
          </div>
        </div>
        <HistoryChart cpuHistory={cpuHistory} ramHistory={ramHistory} />
      </div>

      {/* Additional mini stats */}
      <div className="mini-stats-bar">
        <div className="mini-stat">
          <span className="mini-stat-label">NET DOWN</span>
          <span className="mini-stat-value" id="net-down-val">{netDown}</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-label">NET UP</span>
          <span className="mini-stat-value" id="net-up-val">{netUp}</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-label">STORAGE</span>
          <span className="mini-stat-value" id="storage-val">42%</span>
        </div>
      </div>
    </section>
  );
}

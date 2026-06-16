import React from 'react';

export default function CpuGauge({ pct }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius; // ~201.06
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="metric-radial-card">
      <div className="radial-outer">
        <svg width="80" height="80">
          <circle className="radial-track" cx="40" cy="40" r={radius}></circle>
          <circle 
            className="radial-progress" 
            id="cpu-radial" 
            cx="40" 
            cy="40" 
            r={radius} 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset}
          ></circle>
        </svg>
        <span className="radial-value" id="cpu-text">{Math.round(pct)}%</span>
      </div>
      <span className="metric-name">CPU LOAD</span>
    </div>
  );
}

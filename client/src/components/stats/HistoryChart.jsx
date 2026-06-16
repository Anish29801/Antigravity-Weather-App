import React, { useEffect, useRef } from 'react';

export default function HistoryChart({ cpuHistory, ramHistory }) {
  const canvasRef = useRef(null);

  // Helper to parse hex colors
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Scale canvas to prevent blurriness
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Fetch theme colors
    const style = getComputedStyle(document.body);
    const cpuColor = style.getPropertyValue('--accent').trim() || '#00f0ff';
    const ramColor = style.getPropertyValue('--accent-secondary').trim() || '#9333ea';

    ctx.clearRect(0, 0, width, height);

    const drawCurve = (history, strokeColor, fillColor) => {
      if (!history || history.length < 2) return;
      const len = history.length;
      const stepX = width / (len - 1);
      
      ctx.beginPath();
      
      const points = history.map((val, index) => {
        const x = index * stepX;
        // Map 0-100% to height, leaving margins
        const y = height - (val / 100) * (height - 15) - 5;
        return { x, y };
      });

      ctx.moveTo(points[0].x, points[0].y);

      // Draw cubic bezier curves
      for (let i = 0; i < points.length - 1; i++) {
        const cpX1 = points[i].x + stepX / 2;
        const cpY1 = points[i].y;
        const cpX2 = points[i + 1].x - stepX / 2;
        const cpY2 = points[i + 1].y;
        ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, points[i + 1].x, points[i + 1].y);
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      
      // Glow effect
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = 4;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset glow

      // Fill area under the line
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
    };

    const cpuRgb = hexToRgb(cpuColor);
    const ramRgb = hexToRgb(ramColor);

    drawCurve(cpuHistory, cpuColor, `rgba(${cpuRgb}, 0.08)`);
    drawCurve(ramHistory, ramColor, `rgba(${ramRgb}, 0.08)`);

  }, [cpuHistory, ramHistory]);

  return <canvas ref={canvasRef} id="metrics-chart" height="110" style={{ width: '100%', height: '100%' }} />;
}

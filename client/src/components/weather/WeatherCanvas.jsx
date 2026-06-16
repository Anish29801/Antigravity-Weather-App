import React, { useEffect, useRef } from 'react';

export default function WeatherCanvas({ type }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animFrameId = useRef(null);
  
  // Track parameters for orbit theme
  const sunGlow = useRef(0);
  const sunGlowDir = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Helper to convert hex to RGB
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

    // Initialize particles based on weather type
    particles.current = [];
    if (type === 'storm') {
      // Acid Storm: Raindrops
      for (let i = 0; i < 40; i++) {
        particles.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 15 + 10,
          vy: Math.random() * 8 + 6,
          vx: -2 - Math.random() * 2,
          opacity: Math.random() * 0.4 + 0.1
        });
      }
    } else if (type === 'mist') {
      // Nebula Mist: Drift clouds
      for (let i = 0; i < 15; i++) {
        particles.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 20 + 10,
          vx: Math.random() * 0.3 + 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          opacity: Math.random() * 0.25 + 0.05
        });
      }
    } else if (type === 'orbit') {
      // Solar Wind: Stars
      for (let i = 0; i < 30; i++) {
        particles.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          vx: -Math.random() * 0.05 - 0.02,
          vy: (Math.random() - 0.5) * 0.02,
          glow: Math.random() * 0.5 + 0.5
        });
      }
      sunGlow.current = 0;
      sunGlowDir.current = 1;
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Fetch colors from styles
      const bodyStyle = getComputedStyle(document.body);
      const accentColor = bodyStyle.getPropertyValue('--accent').trim() || '#00f0ff';
      const accentSecondary = bodyStyle.getPropertyValue('--accent-secondary').trim() || '#9333ea';

      if (type === 'storm') {
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1;

        particles.current.forEach((p) => {
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx, p.y + p.length);
          ctx.stroke();

          p.y += p.vy;
          p.x += p.vx;

          if (p.y > height) {
            p.y = -p.length;
            p.x = Math.random() * width;
          }
        });

        // Lightning flicker
        if (Math.random() < 0.008) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.fillRect(0, 0, width, height);
        }
      } else if (type === 'mist') {
        ctx.fillStyle = accentSecondary;

        particles.current.forEach((p) => {
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.vx;
          p.y += p.vy;

          if (p.x - p.radius > width) {
            p.x = -p.radius;
            p.y = Math.random() * height;
          }
        });
      } else if (type === 'orbit') {
        // Stars background
        ctx.fillStyle = '#ffffff';
        particles.current.forEach((p) => {
          ctx.globalAlpha = p.glow * 0.7;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) {
            p.x = width;
            p.y = Math.random() * height;
          }

          p.glow += (Math.random() - 0.5) * 0.1;
          p.glow = Math.max(0.2, Math.min(1.0, p.glow));
        });

        // Pulsing planet core
        const cx = width / 2;
        const cy = height / 2;

        sunGlow.current += 0.015 * sunGlowDir.current;
        if (sunGlow.current > 1 || sunGlow.current < 0) {
          sunGlowDir.current *= -1;
        }

        const outerGlowRadius = 24 + sunGlow.current * 6;
        const rgbAccent = hexToRgb(accentColor);

        const radialGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, outerGlowRadius);
        radialGrad.addColorStop(0, accentColor);
        radialGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
        radialGrad.addColorStop(0.7, `rgba(${rgbAccent}, 0.15)`);
        radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.globalAlpha = 0.9;
        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, outerGlowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Planet rings
        ctx.strokeStyle = accentSecondary;
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 1.2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1.8, 0.35);
        ctx.rotate(-Math.PI / 10);

        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.globalAlpha = 1.0;
      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId.current);
    };
  }, [type]);

  return <canvas ref={canvasRef} id="weather-canvas" width="120" height="120" />;
}

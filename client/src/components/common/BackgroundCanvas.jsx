import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);
  const { particlesActive, theme } = useTheme();
  
  // Track parameters across frames
  const particles = useRef([]);
  const mouse = useRef({ x: null, y: null, radius: 150 });
  const animFrameId = useRef(null);
  
  // We need to keep track of the current theme variables dynamically
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particleCount = 60;
    let connectionDistance = 110;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (window.innerWidth < 768) {
        particleCount = 25;
        connectionDistance = 80;
      } else {
        particleCount = 60;
        connectionDistance = 110;
      }
    };

    const generateParticle = (x, y) => {
      return {
        x: x || Math.random() * canvas.width,
        y: y || Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.1
      };
    };

    const createParticles = () => {
      particles.current = [];
      for (let i = 0; i < particleCount; i++) {
        particles.current.push(generateParticle());
      }
    };

    const burst = (x, y) => {
      if (!particlesActive) return;
      const count = 10;
      const newParticles = [];
      for (let i = 0; i < count; i++) {
        const p = generateParticle(x, y);
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.radius = Math.random() * 2 + 1;
        newParticles.push(p);
      }
      particles.current.push(...newParticles);
      
      // Limit total particles
      if (particles.current.length > particleCount + 40) {
        particles.current.splice(0, count);
      }
    };

    // Initialize
    resize();
    createParticles();

    // Event Listeners
    const handleResize = () => resize();
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.current.x = null;
      mouse.current.y = null;
    };
    const handleClick = (e) => {
      burst(e.clientX, e.clientY);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    // FPS counter values
    let lastTime = performance.now();
    let frameCount = 0;

    const animate = () => {
      if (!particlesActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animFrameId.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fetch colors from variables or DOM
      const accentColor = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#00f0ff';

      // 1. Draw particles
      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Mouse attraction
        if (mouse.current.x !== null && mouse.current.y !== null) {
          const dx = mouse.current.x - p.x;
          const dy = mouse.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.current.radius) {
            const force = (mouse.current.radius - dist) / mouse.current.radius;
            p.x -= dx * force * 0.02;
            p.y -= dy * force * 0.02;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      // 2. Draw connections
      ctx.globalAlpha = 1.0;
      for (let i = 0; i < particles.current.length; i++) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const p1 = particles.current[i];
          const p2 = particles.current[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const fraction = 1 - dist / connectionDistance;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = accentColor;
            ctx.globalAlpha = fraction * 0.12;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1.0;

      // 3. Render FPS
      frameCount++;
      const now = performance.now();
      const delta = now - lastTime;
      if (delta >= 1000) {
        const fps = Math.round((frameCount * 1000) / delta);
        const fpsEl = document.getElementById('footer-fps');
        if (fpsEl) {
          fpsEl.textContent = `FPS: ${fps}`;
        }
        frameCount = 0;
        lastTime = now;
      }

      animFrameId.current = requestAnimationFrame(animate);
    };

    // Start loop
    animFrameId.current = requestAnimationFrame(animate);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animFrameId.current);
    };
  }, [particlesActive]);

  return <canvas ref={canvasRef} id="bg-canvas" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'all' }} />;
}

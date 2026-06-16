/**
 * AETHER OS - Ambient Particle Background
 * Interactive constellation node network running on HTML5 Canvas.
 */

export class BackgroundEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 60;
        this.connectionDistance = 110;
        this.isActive = true;
        
        this.mouse = {
            x: null,
            y: null,
            radius: 150
        };

        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.setupEventListeners();
        this.animate();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        window.addEventListener('click', (e) => {
            if (!this.isActive) return;
            this.burst(e.clientX, e.clientY);
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Adjust particle density based on screen size
        if (window.innerWidth < 768) {
            this.particleCount = 25;
            this.connectionDistance = 80;
        } else {
            this.particleCount = 60;
            this.connectionDistance = 110;
        }
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.generateParticle());
        }
    }

    generateParticle(x, y) {
        return {
            x: x || Math.random() * this.canvas.width,
            y: y || Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2 + 1,
            alpha: Math.random() * 0.5 + 0.1
        };
    }

    burst(x, y) {
        const count = 10;
        for (let i = 0; i < count; i++) {
            const p = this.generateParticle(x, y);
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 1.5 + 0.5;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.radius = Math.random() * 2 + 1;
            this.particles.push(p);
        }
        // Remove excess particles if list grows too large
        if (this.particles.length > this.particleCount + 40) {
            this.particles.splice(0, count);
        }
    }

    toggle(state) {
        this.isActive = state;
        if (!state) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    animate() {
        if (!this.isActive) {
            requestAnimationFrame(() => this.animate());
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Get primary theme color from CSS variable
        const style = getComputedStyle(document.body);
        const accentColor = style.getPropertyValue('--accent').trim();

        // Draw and update particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Move particle
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off boundaries
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Mouse interaction (gentle attraction)
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    p.x -= dx * force * 0.02;
                    p.y -= dy * force * 0.02;
                }
            }

            // Draw particle dot
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = accentColor;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fill();
        }

        // Draw connecting lines
        this.ctx.globalAlpha = 1.0;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.connectionDistance) {
                    const fraction = 1 - (dist / this.connectionDistance);
                    const lineAlpha = fraction * 0.12;

                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    
                    // Simple line styling
                    this.ctx.strokeStyle = accentColor;
                    this.ctx.globalAlpha = lineAlpha;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.stroke();
                }
            }
        }
        this.ctx.globalAlpha = 1.0;

        // Calculate and display FPS on the footer
        this.calculateFPS();

        requestAnimationFrame(() => this.animate());
    }

    calculateFPS() {
        if (!this.lastTime) {
            this.lastTime = performance.now();
            this.frameCount = 0;
            return;
        }
        this.frameCount++;
        const now = performance.now();
        const delta = now - this.lastTime;
        if (delta >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / delta);
            const fpsEl = document.getElementById('footer-fps');
            if (fpsEl) fpsEl.textContent = `FPS: ${fps}`;
            this.frameCount = 0;
            this.lastTime = now;
        }
    }
}

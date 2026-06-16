/**
 * AETHER OS - Time & Weather Command Center
 * Handles the high-precision clock, customized greetings, and animated weather canvas.
 */

export class WeatherClockEngine {
    constructor() {
        this.timeEl = document.getElementById('clock-time');
        this.dateEl = document.getElementById('clock-date');
        this.greetingEl = document.getElementById('greeting-text');
        this.canvas = document.getElementById('weather-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.tempEl = document.getElementById('weather-temp');
        this.statusEl = document.getElementById('weather-status');
        this.humidityEl = document.getElementById('weather-humidity');
        this.windEl = document.getElementById('weather-wind');
        this.coordEl = document.getElementById('coord-val');

        // Weather cities database
        this.cities = {
            'Neo-Tokyo': {
                temp: '18°C',
                status: 'Acid Storm',
                humidity: '89%',
                wind: '28 km/h',
                coord: '35.6762° N, 139.6503° E',
                type: 'storm'
            },
            'Aether City': {
                temp: '22°C',
                status: 'Nebula Mist',
                humidity: '65%',
                wind: '12 km/h',
                coord: '54.5260° N, 15.2551° W',
                type: 'mist'
            },
            'Orbital Terminal': {
                temp: '-3°C',
                status: 'Solar Wind',
                humidity: '0%',
                wind: '142 km/h',
                coord: 'GEO-SYNC LEO // NODE-7',
                type: 'orbit'
            }
        };

        this.currentCity = 'Neo-Tokyo';
        this.weatherParticles = [];
        this.animationFrameId = null;

        this.init();
    }

    init() {
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        this.setupCityButtons();
        this.loadCity(this.currentCity);
        this.animateWeather();
    }

    updateTime() {
        const now = new Date();
        
        // Time format: HH:MM:SS
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        this.timeEl.textContent = `${hours}:${minutes}:${seconds}`;

        // Date format: DAYNAME // MONTH DD, YYYY
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        
        const dayName = days[now.getDay()];
        const monthName = months[now.getMonth()];
        const dateNum = now.getDate();
        const year = now.getFullYear();
        this.dateEl.textContent = `${dayName} // ${monthName} ${dateNum}, ${year}`;

        // Dynamic greeting based on hour
        const hour = now.getHours();
        let greeting = 'System Boot Complete';
        if (hour < 5) greeting = 'Midnight Watch, Commander';
        else if (hour < 12) greeting = 'Good Morning, Commander';
        else if (hour < 17) greeting = 'Good Afternoon, Agent';
        else if (hour < 22) greeting = 'Good Evening, Sentinel';
        else greeting = 'Night Operations Mode';

        this.greetingEl.textContent = greeting;
    }

    setupCityButtons() {
        const btnNeo = document.getElementById('city-btn-neo');
        const btnAether = document.getElementById('city-btn-aether');
        const btnOrbit = document.getElementById('city-btn-orbit');

        const buttons = [btnNeo, btnAether, btnOrbit];

        buttons.forEach(btn => {
            if (!btn) return;
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const city = btn.getAttribute('data-city');
                this.loadCity(city);
                this.playClickFX();
            });
        });
    }

    loadCity(cityName) {
        this.currentCity = cityName;
        const data = this.cities[cityName];
        if (!data) return;

        this.tempEl.textContent = data.temp;
        this.statusEl.textContent = data.status;
        this.humidityEl.textContent = data.humidity;
        this.windEl.textContent = data.wind;
        this.coordEl.textContent = data.coord;

        // Reset and populate weather particles based on city type
        this.weatherParticles = [];
        const wType = data.type;
        
        if (wType === 'storm') {
            // Acid Storm: Initialize raindrops
            for (let i = 0; i < 40; i++) {
                this.weatherParticles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    length: Math.random() * 15 + 10,
                    vy: Math.random() * 8 + 6,
                    vx: -2 - Math.random() * 2,
                    opacity: Math.random() * 0.4 + 0.1
                });
            }
        } else if (wType === 'mist') {
            // Nebula Mist: Drift clouds
            for (let i = 0; i < 15; i++) {
                this.weatherParticles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    radius: Math.random() * 20 + 10,
                    vx: Math.random() * 0.3 + 0.1,
                    vy: (Math.random() - 0.5) * 0.1,
                    opacity: Math.random() * 0.25 + 0.05
                });
            }
        } else if (wType === 'orbit') {
            // Solar Wind: Ring structures & stars
            for (let i = 0; i < 30; i++) {
                this.weatherParticles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    radius: Math.random() * 1.5 + 0.5,
                    vx: -Math.random() * 0.05 - 0.02,
                    vy: (Math.random() - 0.5) * 0.02,
                    glow: Math.random() * 0.5 + 0.5
                });
            }
            // Add a sun scale tracker
            this.sunGlow = 0;
            this.sunGlowDir = 1;
        }
    }

    animateWeather() {
        const wType = this.cities[this.currentCity].type;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Fetch current accent colors
        const style = getComputedStyle(document.body);
        const accentColor = style.getPropertyValue('--accent').trim();
        const accentSecondary = style.getPropertyValue('--accent-secondary').trim();

        if (wType === 'storm') {
            // Draw Rain
            this.ctx.strokeStyle = accentColor;
            this.ctx.lineWidth = 1;
            
            this.weatherParticles.forEach(p => {
                this.ctx.globalAlpha = p.opacity;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x + p.vx, p.y + p.length);
                this.ctx.stroke();

                // Move raindrop
                p.y += p.vy;
                p.x += p.vx;

                // Recycle raindrop
                if (p.y > this.canvas.height) {
                    p.y = -p.length;
                    p.x = Math.random() * this.canvas.width;
                }
            });

            // Occasional lightning flicker
            if (Math.random() < 0.008) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        } else if (wType === 'mist') {
            // Draw Mist Clouds
            this.ctx.fillStyle = accentSecondary;
            
            this.weatherParticles.forEach(p => {
                this.ctx.globalAlpha = p.opacity;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fill();

                // Move cloud
                p.x += p.vx;
                p.y += p.vy;

                // Recycle cloud
                if (p.x - p.radius > this.canvas.width) {
                    p.x = -p.radius;
                    p.y = Math.random() * this.canvas.height;
                }
            });
        } else if (wType === 'orbit') {
            // Draw cosmic rings and stars
            this.ctx.fillStyle = '#ffffff';
            this.weatherParticles.forEach(p => {
                this.ctx.globalAlpha = p.glow * 0.7;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fill();

                // Slowly drift stars
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) {
                    p.x = this.canvas.width;
                    p.y = Math.random() * this.canvas.height;
                }

                // Twinkle
                p.glow += (Math.random() - 0.5) * 0.1;
                p.glow = Math.max(0.2, Math.min(1.0, p.glow));
            });

            // Draw Central Planet Core (Glowing Sphere)
            const cx = this.canvas.width / 2;
            const cy = this.canvas.height / 2;
            
            // Pulsing glow
            this.sunGlow += 0.015 * this.sunGlowDir;
            if (this.sunGlow > 1 || this.sunGlow < 0) this.sunGlowDir *= -1;
            
            const outerGlowRadius = 24 + this.sunGlow * 6;

            const radialGrad = this.ctx.createRadialGradient(cx, cy, 2, cx, cy, outerGlowRadius);
            radialGrad.addColorStop(0, accentColor);
            radialGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
            radialGrad.addColorStop(0.7, 'rgba(' + this.hexToRgb(accentColor) + ', 0.15)');
            radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.ctx.globalAlpha = 0.9;
            this.ctx.fillStyle = radialGrad;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, outerGlowRadius, 0, Math.PI * 2);
            this.ctx.fill();

            // Ring orbits
            this.ctx.strokeStyle = accentSecondary;
            this.ctx.globalAlpha = 0.2;
            this.ctx.lineWidth = 1.2;
            
            this.ctx.save();
            this.ctx.translate(cx, cy);
            this.ctx.scale(1.8, 0.35); // flatten the circle into an ellipse
            this.ctx.rotate(-Math.PI / 10);
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        }

        this.ctx.globalAlpha = 1.0;
        this.animationFrameId = requestAnimationFrame(() => this.animateWeather());
    }

    hexToRgb(hex) {
        // Simple hex converter (assumes format like #00f0ff)
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `${r}, ${g}, ${b}`;
    }

    playClickFX() {
        const audioFX = document.getElementById('toggle-audio-fx');
        if (audioFX && audioFX.checked) {
            // Synthesize short digital select sound
            const actx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            
            osc.connect(gain);
            gain.connect(actx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400, actx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, actx.currentTime + 0.06);
            
            gain.gain.setValueAtTime(0.04, actx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.06);
            
            osc.start();
            osc.stop(actx.currentTime + 0.07);
        }
    }
}

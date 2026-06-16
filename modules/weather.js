/**
 * AETHER OS - Time & Weather Command Center
 * Handles the high-precision clock, customized greetings, and animated weather canvas.
 */

// List of real world cities as local fallbacks
const REAL_CITIES = [
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, temp: 18, status: 'Rainy', type: 'storm', wind: 15, humidity: 80 },
  { name: 'London', lat: 51.5074, lon: -0.1278, temp: 14, status: 'Overcast Fog', type: 'mist', wind: 12, humidity: 75 },
  { name: 'New York', lat: 40.7128, lon: -74.0060, temp: 21, status: 'Clear Sky', type: 'orbit', wind: 10, humidity: 55 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, temp: 17, status: 'Foggy Mist', type: 'mist', wind: 8, humidity: 70 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, temp: 19, status: 'Sunny Clear', type: 'orbit', wind: 18, humidity: 60 },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357, temp: 32, status: 'Dry Heat', type: 'orbit', wind: 14, humidity: 30 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, temp: 28, status: 'Showers', type: 'storm', wind: 22, humidity: 85 },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, temp: 25, status: 'Heavy Rain', type: 'storm', wind: 9, humidity: 82 },
  { name: 'Cape Town', lat: -33.9249, lon: 18.4241, temp: 16, status: 'Windy Clear', type: 'orbit', wind: 35, humidity: 50 },
  { name: 'Moscow', lat: 55.7558, lon: 37.6173, temp: 8, status: 'Foggy Cold', type: 'mist', wind: 11, humidity: 78 }
];

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

        // Recent cities - starts empty if not saved
        const saved = localStorage.getItem('recent_cities');
        this.recentCities = saved ? JSON.parse(saved) : [];
        
        this.currentCity = this.recentCities[0] || 'New York';
        this.isCoordsActive = false;
        this.currentWeatherData = null;
        this.weatherParticles = [];
        this.animationFrameId = null;

        this.init();
    }

    init() {
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        
        // Setup Search Form
        const searchForm = document.getElementById('weather-search-form');
        const searchInput = document.getElementById('weather-search-input');
        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    this.loadCity(query, null);
                    searchInput.value = '';
                    this.playClickFX();
                }
            });
        }

        // Automatic scan on startup
        this.automaticScan();
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

    async reverseGeocode(lat, lon) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
                headers: {
                    'User-Agent': 'Aether-Dashboard/2.0.0 (contact: info@aetheros.io)'
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data && data.address) {
                    const addr = data.address;
                    return addr.city || addr.town || addr.village || addr.suburb || addr.state || addr.county || addr.country;
                }
            }
        } catch (err) {
            console.error("Nominatim reverse geocoding failed:", err);
        }
        return null;
    }

    findClosestRealCity(lat, lon) {
        let closest = REAL_CITIES[0];
        let minDist = Infinity;
        for (const c of REAL_CITIES) {
            const dist = Math.sqrt(Math.pow(c.lat - lat, 2) + Math.pow(c.lon - lon, 2));
            if (dist < minDist) {
                minDist = dist;
                closest = c;
            }
        }
        return closest;
    }

    getBaseWeatherForCity(city) {
        const match = REAL_CITIES.find(c => c.name.toLowerCase() === city.toLowerCase());
        if (match) return match;
        
        const types = ['storm', 'mist', 'orbit'];
        const type = types[Math.floor(Math.random() * types.length)];
        let temp = 20;
        let status = 'Clear Sky';
        if (type === 'storm') {
            temp = 15;
            status = 'Heavy Rain';
        } else if (type === 'mist') {
            temp = 12;
            status = 'Overcast Fog';
        }
        
        return {
            name: city,
            temp,
            status,
            humidity: 60 + Math.floor(Math.random() * 20),
            wind: 10 + Math.floor(Math.random() * 15),
            coord: '0.0000° N, 0.0000° E',
            type
        };
    }

    generateSimulatedWeather(city, customCoords = null) {
        const base = this.getBaseWeatherForCity(city);
        
        const tempVar = (Math.random() - 0.5) * 6;
        const windVar = (Math.random() - 0.5) * base.wind * 0.2;
        const humVar = (Math.random() - 0.5) * base.humidity * 0.1;

        const finalTemp = Math.round(base.temp + tempVar);
        const finalWind = Math.round(base.wind + windVar);
        let finalHum = Math.round(base.humidity + humVar);
        finalHum = Math.max(0, Math.min(100, finalHum));

        let coordsText = base.coord;
        if (customCoords) {
            const formattedLat = Math.abs(customCoords.lat).toFixed(4) + (customCoords.lat >= 0 ? '° N' : '° S');
            const formattedLon = Math.abs(customCoords.lon).toFixed(4) + (customCoords.lon >= 0 ? '° E' : '° W');
            coordsText = `${formattedLat}, ${formattedLon}`;
        }

        return {
            name: base.name,
            temp: `${finalTemp}°C`,
            status: base.status,
            humidity: `${finalHum}%`,
            wind: `${finalWind} km/h`,
            coord: coordsText,
            type: base.type
        };
    }

    loadCity(cityName, customCoords = null) {
        this.currentCity = cityName;
        this.isCoordsActive = (customCoords !== null);
        
        const data = this.generateSimulatedWeather(cityName, customCoords);
        this.currentWeatherData = data;

        this.tempEl.textContent = data.temp;
        this.statusEl.textContent = `${data.status} (${data.name})`;
        this.humidityEl.textContent = data.humidity;
        this.windEl.textContent = data.wind;
        this.coordEl.textContent = data.coord;

        // Push to recent cities ONLY if it is an explicit search (customCoords === null)
        if (!this.isCoordsActive) {
            let list = this.recentCities.filter(c => c.toLowerCase() !== cityName.toLowerCase());
            list.unshift(cityName);
            list = list.slice(0, 3);
            this.recentCities = list;
            localStorage.setItem('recent_cities', JSON.stringify(list));
        }

        // Re-render selector buttons
        this.renderCityButtons();

        // Reset and populate weather particles based on city type
        this.weatherParticles = [];
        const wType = data.type;
        
        if (wType === 'storm') {
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
            this.sunGlow = 0;
            this.sunGlowDir = 1;
        }
    }

    renderCityButtons() {
        const container = document.getElementById('weather-city-buttons');
        if (!container) return;
        
        container.innerHTML = '';

        // Add Scan / Current Location Button first
        const scanBtn = document.createElement('button');
        scanBtn.className = `city-btn ${this.isCoordsActive ? 'active' : ''}`;
        scanBtn.title = 'Scan Local Position Weather';
        scanBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Current Location';
        scanBtn.addEventListener('click', () => {
            this.playClickFX();
            this.scanLocation();
        });
        container.appendChild(scanBtn);
        
        // Add Searched Cities Buttons
        this.recentCities.forEach(cityName => {
            const btn = document.createElement('button');
            btn.className = `city-btn ${(!this.isCoordsActive && this.currentCity === cityName) ? 'active' : ''}`;
            btn.textContent = cityName;
            btn.setAttribute('data-city', cityName);
            btn.addEventListener('click', () => {
                this.loadCity(cityName);
                this.playClickFX();
            });
            container.appendChild(btn);
        });
    }

    scanLocation() {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                let resolvedName = await this.reverseGeocode(lat, lon);
                if (!resolvedName) {
                    const closest = this.findClosestRealCity(lat, lon);
                    resolvedName = closest.name;
                }
                this.loadCity(resolvedName, { lat, lon });
            },
            (err) => {
                alert(`Failed to retrieve location: ${err.message}`);
            }
        );
    }

    automaticScan() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    let resolvedName = await this.reverseGeocode(lat, lon);
                    if (!resolvedName) {
                        const closest = this.findClosestRealCity(lat, lon);
                        resolvedName = closest.name;
                    }
                    this.loadCity(resolvedName, { lat, lon });
                },
                (err) => {
                    console.warn("Automatic scan failed:", err.message);
                    this.loadCity(this.currentCity);
                }
            );
        } else {
            this.loadCity(this.currentCity);
        }
    }

    animateWeather() {
        const wType = this.currentWeatherData ? this.currentWeatherData.type : 'orbit';
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Fetch current accent colors
        const style = getComputedStyle(document.body);
        const accentColor = style.getPropertyValue('--accent').trim();
        const accentSecondary = style.getPropertyValue('--accent-secondary').trim();

        if (wType === 'storm') {
            this.ctx.strokeStyle = accentColor;
            this.ctx.lineWidth = 1;
            
            this.weatherParticles.forEach(p => {
                this.ctx.globalAlpha = p.opacity;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x + p.vx, p.y + p.length);
                this.ctx.stroke();

                p.y += p.vy;
                p.x += p.vx;

                if (p.y > this.canvas.height) {
                    p.y = -p.length;
                    p.x = Math.random() * this.canvas.width;
                }
            });

            if (Math.random() < 0.008) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        } else if (wType === 'mist') {
            this.ctx.fillStyle = accentSecondary;
            
            this.weatherParticles.forEach(p => {
                this.ctx.globalAlpha = p.opacity;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fill();

                p.x += p.vx;
                p.y += p.vy;

                if (p.x - p.radius > this.canvas.width) {
                    p.x = -p.radius;
                    p.y = Math.random() * this.canvas.height;
                }
            });
        } else if (wType === 'orbit') {
            this.ctx.fillStyle = '#ffffff';
            this.weatherParticles.forEach(p => {
                this.ctx.globalAlpha = p.glow * 0.7;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fill();

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) {
                    p.x = this.canvas.width;
                    p.y = Math.random() * this.canvas.height;
                }

                p.glow += (Math.random() - 0.5) * 0.1;
                p.glow = Math.max(0.2, Math.min(1.0, p.glow));
            });

            const cx = this.canvas.width / 2;
            const cy = this.canvas.height / 2;
            
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

            this.ctx.strokeStyle = accentSecondary;
            this.ctx.globalAlpha = 0.2;
            this.ctx.lineWidth = 1.2;
            
            this.ctx.save();
            this.ctx.translate(cx, cy);
            this.ctx.scale(1.8, 0.35);
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
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `${r}, ${g}, ${b}`;
    }

    playClickFX() {
        const audioFX = document.getElementById('toggle-audio-fx');
        if (audioFX && audioFX.checked) {
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

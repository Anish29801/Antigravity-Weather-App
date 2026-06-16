/**
 * AETHER OS - System Metrics Engine
 * Simulates system resource performance parameters and draws neon history tracking charts on HTML5 canvas.
 */

export class SystemStatsEngine {
    constructor() {
        this.cpuRadial = document.getElementById('cpu-radial');
        this.ramRadial = document.getElementById('ram-radial');
        
        this.cpuText = document.getElementById('cpu-text');
        this.ramText = document.getElementById('ram-text');
        
        this.freqText = document.getElementById('stats-freq');
        
        this.netDownText = document.getElementById('net-down-val');
        this.netUpText = document.getElementById('net-up-val');
        this.storageText = document.getElementById('storage-val');

        this.chartCanvas = document.getElementById('metrics-chart');
        this.chartCtx = this.chartCanvas.getContext('2d');

        // History logs (max 40 points)
        this.historyLength = 40;
        this.cpuHistory = Array(this.historyLength).fill(25);
        this.ramHistory = Array(this.historyLength).fill(45);

        // Radial circle config
        // Radius r=32. Perimeter = 2 * PI * r = 201.06
        this.radialCircumference = 201.06;

        this.currentCPU = 25;
        this.currentRAM = 45;
        this.targetCPU = 25;
        this.targetRAM = 45;

        this.init();
    }

    init() {
        this.resizeChart();
        window.addEventListener('resize', () => this.resizeChart());

        // Update stats regularly
        setInterval(() => this.simulateStats(), 1500);

        // Rapid smooth interpolation and chart drawing loop
        this.tick();
    }

    resizeChart() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.chartCanvas.getBoundingClientRect();
        
        // Scale canvas for sharp graphics on high-res displays
        this.chartCanvas.width = rect.width * dpr;
        this.chartCanvas.height = rect.height * dpr;
        
        this.chartCtx.scale(dpr, dpr);
    }

    simulateStats() {
        // CPU load swings organically
        this.targetCPU = Math.round(15 + Math.random() * 50 + (Math.random() < 0.1 ? 25 : 0));
        // RAM usage is more stable with tiny drifts
        this.targetRAM = Math.round(40 + Math.random() * 10);
        
        // Freq changes slightly around 3.7 - 4.2 GHz
        const freq = (3.6 + Math.random() * 0.6).toFixed(2);
        this.freqText.textContent = `${freq} GHz`;

        // Networks
        const netDown = (12 + Math.random() * 38).toFixed(1);
        const netUp = (4 + Math.random() * 12).toFixed(1);
        this.netDownText.textContent = `${netDown} Mbps`;
        this.netUpText.textContent = `${netUp} Mbps`;
    }

    tick() {
        // Interpolate current values toward target values for visual smoothness
        this.currentCPU += (this.targetCPU - this.currentCPU) * 0.12;
        this.currentRAM += (this.targetRAM - this.currentRAM) * 0.12;

        // Render Radial Ring updates
        this.updateRadialGauges();

        // Push history (less frequently)
        this.ticksElapsed = (this.ticksElapsed || 0) + 1;
        if (this.ticksElapsed >= 8) {
            this.cpuHistory.push(this.currentCPU);
            this.cpuHistory.shift();
            
            this.ramHistory.push(this.currentRAM);
            this.ramHistory.shift();
            
            this.ticksElapsed = 0;
        }

        // Draw line chart
        this.drawChart();

        requestAnimationFrame(() => this.tick());
    }

    updateRadialGauges() {
        // CPU Gauge
        const cpuPct = Math.min(100, Math.max(0, this.currentCPU));
        const cpuOffset = this.radialCircumference - (cpuPct / 100) * this.radialCircumference;
        this.cpuRadial.style.strokeDashoffset = cpuOffset;
        this.cpuText.textContent = `${Math.round(cpuPct)}%`;

        // RAM Gauge
        const ramPct = Math.min(100, Math.max(0, this.currentRAM));
        const ramOffset = this.radialCircumference - (ramPct / 100) * this.radialCircumference;
        this.ramRadial.style.strokeDashoffset = ramOffset;
        this.ramText.textContent = `${Math.round(ramPct)}%`;
    }

    drawChart() {
        const width = this.chartCanvas.width / (window.devicePixelRatio || 1);
        const height = this.chartCanvas.height / (window.devicePixelRatio || 1);
        
        this.chartCtx.clearRect(0, 0, width, height);

        // Fetch colors
        const style = getComputedStyle(document.body);
        const cpuColor = style.getPropertyValue('--accent').trim();
        const ramColor = style.getPropertyValue('--accent-secondary').trim();

        // Draw CPU curve
        this.drawCurve(this.cpuHistory, cpuColor, 'rgba(' + this.hexToRgb(cpuColor) + ', 0.08)', width, height);
        
        // Draw RAM curve
        this.drawCurve(this.ramHistory, ramColor, 'rgba(' + this.hexToRgb(ramColor) + ', 0.08)', width, height);
    }

    drawCurve(history, strokeColor, fillColor, width, height) {
        const ctx = this.chartCtx;
        const len = history.length;
        const stepX = width / (len - 1);
        
        ctx.beginPath();
        
        // Map points to coordinates
        const points = history.map((val, index) => {
            const x = index * stepX;
            // Map 0-100% to height. Leave margins
            const y = height - (val / 100) * (height - 15) - 5;
            return { x, y };
        });

        // Begin drawing stroke
        ctx.moveTo(points[0].x, points[0].y);

        // Draw cubic spline/bezier curves between points
        for (let i = 0; i < points.length - 1; i++) {
            const cpX1 = points[i].x + stepX / 2;
            const cpY1 = points[i].y;
            const cpX2 = points[i + 1].x - stepX / 2;
            const cpY2 = points[i + 1].y;
            ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, points[i + 1].x, points[i + 1].y);
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        
        // Optional glow effect for line
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 4;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Fill area under line
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    hexToRgb(hex) {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `${r}, ${g}, ${b}`;
    }
}

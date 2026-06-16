/**
 * AETHER OS - Local Dev Server
 * A zero-dependency Node.js HTTP server designed to bypass CORS restrictions for ES6 modules.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg'
};

const server = http.createServer((req, res) => {
    // Decode URI to handle spaces/special characters in paths
    let decodedUrl = decodeURIComponent(req.url);
    
    // Strip query parameters
    const queryIdx = decodedUrl.indexOf('?');
    if (queryIdx !== -1) {
        decodedUrl = decodedUrl.substring(0, queryIdx);
    }

    let filePath = path.join(__dirname, decodedUrl);
    
    // Default to index.html for root requests
    if (decodedUrl === '/' || decodedUrl === '') {
        filePath = path.join(__dirname, 'index.html');
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Resource Not Found</h1><p>Aether OS was unable to retrieve the requested telemetry path.</p>', 'utf-8');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`<h1>500 Server Error</h1><p>Internal error code: ${error.code}</p>`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('====================================================');
    console.log('            AETHER OS - WORKSPACE SERVER            ');
    console.log('====================================================');
    console.log(`📡 Local server listening on port: ${PORT}`);
    console.log(`🔗 Navigation endpoint: http://localhost:${PORT}/`);
    console.log('💡 Press Ctrl+C to terminate connection host.');
    console.log('====================================================');
});

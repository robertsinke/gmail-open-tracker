const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// CORS middleware for all endpoints (must be first)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Create logs directory if it doesn't exist (for local development)
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
    console.log('Created logs directory');
}

// Log tracking data to file
function logTrackingData(id, subject, to) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ID: ${id} - SUBJECT: ${subject} - TO: ${to}\n`;
    const logFile = path.join(logsDir, 'tracking.log');
    
    console.log('📧 New email open detected!');
    console.log(`⏰ Time: ${timestamp}`);
    console.log(`🆔 Tracking ID: ${id}`);
    if (subject) console.log(`✉️ Subject: ${subject}`);
    if (to) console.log(`👤 To: ${to}`);
    
    // For serverless environments, we might not be able to write files
    // So we'll log to console and optionally try to write to file
    try {
        fs.appendFileSync(logFile, logEntry);
        console.log('✅ Successfully logged to tracking.log');
    } catch (err) {
        console.log('⚠️ Could not write to file (serverless environment), logged to console instead');
    }
}

// Serve the tracking pixel
app.get('/pixel', (req, res) => {
    const id = req.query.id;
    const subject = req.query.subject ? decodeURIComponent(req.query.subject) : '';
    const to = req.query.to ? decodeURIComponent(req.query.to) : '';
    
    if (!id) {
        console.log('❌ Missing tracking ID in request');
        return res.status(400).send('Missing tracking ID');
    }

    console.log('📥 Received pixel request');
    console.log(`🔍 Query parameters:`, req.query);
    console.log(`🌐 Request from: ${req.get('User-Agent')}`);
    console.log(`📍 IP: ${req.ip || req.connection.remoteAddress}`);
    
    // Log the tracking data
    logTrackingData(id, subject, to);
    
    // Set headers to prevent caching
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'image/gif'
    });

    // Send a 1x1 transparent GIF
    const transparentGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.send(transparentGif);
    console.log('📤 Sent tracking pixel response');
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'Gmail Open Tracker Server Running',
        timestamp: new Date().toISOString()
    });
});

// /logs endpoint: returns last 10 tracking events
app.get('/logs', async (req, res) => {
    const logFile = path.join(logsDir, 'tracking.log');
    let events = [];
    try {
        if (fs.existsSync(logFile)) {
            const lines = fs.readFileSync(logFile, 'utf-8').split('\n').filter(Boolean);
            events = lines.slice(-10).map(line => {
                // Format: 2025-06-13T21:34:53.235Z - ID: ... - SUBJECT: ... - TO: ...
                const match = line.match(/^(.*?) - ID: (.*?) - SUBJECT: (.*?) - TO: (.*)$/);
                if (match) {
                    return { timestamp: match[1], id: match[2], subject: match[3], to: match[4] };
                }
                return null;
            }).filter(Boolean);
        }
    } catch (err) {
        return res.status(500).json({ error: 'Failed to read logs' });
    }
    res.json({ events });
});

// For Vercel, we export the app
module.exports = app;

// For local development, start the server
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log('🚀 Tracking server started!');
        console.log(`🌐 Server running at http://localhost:${port}`);
        console.log('📝 Logs will be saved to:', path.join(logsDir, 'tracking.log'));
    });
} 
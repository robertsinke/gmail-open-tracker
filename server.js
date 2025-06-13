const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Log tracking data to file
function logTrackingData(id) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ID: ${id}\n`;
    const logFile = path.join(logsDir, 'tracking.log');
    
    fs.appendFile(logFile, logEntry, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
}

// Serve the tracking pixel
app.get('/pixel', (req, res) => {
    const id = req.query.id;
    
    if (!id) {
        return res.status(400).send('Missing tracking ID');
    }

    // Log the tracking data
    logTrackingData(id);
    
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
});

// Start the server
app.listen(port, () => {
    console.log(`Tracking server running on port ${port}`);
}); 
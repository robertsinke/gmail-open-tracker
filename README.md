# Gmail Open Tracker

A Chrome extension that tracks email opens in Gmail by injecting a tracking pixel, along with a Node.js server to handle the tracking requests.

## Components

1. **Chrome Extension**
   - Injects a 1x1 transparent tracking pixel into outgoing Gmail messages
   - Generates unique tracking IDs for each email
   - Ensures only one pixel per message

2. **Tracking Server**
   - Node.js + Express server
   - Handles pixel requests and logs tracking data
   - Serves a transparent GIF with proper cache headers

## Setup

### Chrome Extension

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. Update the `TRACKING_SERVER` URL in `content.js` to point to your server

### Tracking Server

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

The server will run on port 3000 by default. You can change this by setting the `PORT` environment variable.

## Usage

1. Compose a new email in Gmail
2. The extension will automatically inject a tracking pixel when you click send
3. When the recipient opens the email, the pixel will be loaded
4. The server will log the tracking event in `logs/tracking.log`

## Log Format

Each tracking event is logged with a timestamp and unique ID:
```
2024-03-21T10:30:45.123Z - ID: 1711018245123-x7k9m2
```

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 
// Configuration
const TRACKING_SERVER = 'https://yourdomain.com'; // Replace with your actual domain

// Generate a unique tracking ID
function generateTrackingId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
}

// Create and inject the tracking pixel
function injectTrackingPixel(composeBody) {
    const trackingId = generateTrackingId();
    const pixelUrl = `${TRACKING_SERVER}/pixel?id=${trackingId}`;
    
    // Create the tracking pixel image
    const pixel = document.createElement('img');
    pixel.src = pixelUrl;
    pixel.width = 1;
    pixel.height = 1;
    pixel.style.display = 'none';
    
    // Add the pixel to the email body
    composeBody.appendChild(pixel);
}

// Watch for the send button click
function watchForSendButton() {
    // Gmail's compose window has a specific class
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Look for the send button
                        const sendButton = node.querySelector('[role="button"][aria-label*="Send"]');
                        if (sendButton) {
                            sendButton.addEventListener('click', () => {
                                // Find the compose body
                                const composeBody = document.querySelector('.Am.Al.editable');
                                if (composeBody) {
                                    // Check if we haven't already injected a pixel
                                    if (!composeBody.querySelector('img[src*="/pixel"]')) {
                                        injectTrackingPixel(composeBody);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Initialize when the page is loaded
document.addEventListener('DOMContentLoaded', watchForSendButton); 
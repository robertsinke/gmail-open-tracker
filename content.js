console.log('🚀 Gmail Open Tracker extension starting...');

const TRACKING_SERVER = 'https://localhost:3000'; // Use HTTPS for local testing

function generateTrackingId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
}

function injectTrackingPixel(composeArea) {
    console.log('🎯 Attempting to inject tracking pixel...');
    const trackingId = generateTrackingId();
    const pixelUrl = `${TRACKING_SERVER}/pixel?id=${trackingId}`;
    console.log('📡 Tracking URL:', pixelUrl);

    // Only inject if not already present
    if (!composeArea.querySelector(`img[src^="${TRACKING_SERVER}/pixel"]`)) {
        const pixel = document.createElement('img');
        pixel.src = pixelUrl;
        pixel.width = 1;
        pixel.height = 1;
        pixel.style.display = 'none';
        composeArea.appendChild(pixel);
        console.log('✅ Tracking pixel injected successfully');
        return true;
    } else {
        console.log('⚠️ Pixel already injected');
        return false;
    }
}

function findComposeArea() {
    // Try multiple selectors to find compose area
    const selectors = [
        'div[role="textbox"][aria-label*="Message Body"]',
        'div[role="textbox"][aria-label*="Body"]',
        '.Am.Al.editable',
        'div[contenteditable="true"][role="textbox"]'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            console.log(`📝 Found compose area with selector: ${selector}`);
            return element;
        }
    }
    
    console.log('❌ Could not find compose area');
    return null;
}

function setupSendTracking() {
    console.log('🔍 Setting up send tracking...');
    
    // Method 1: Direct click interception on document
    document.addEventListener('click', function(event) {
        const target = event.target;
        const sendButton = target.closest('[role="button"]');
        
        if (sendButton && (
            sendButton.getAttribute('aria-label')?.includes('Send') ||
            sendButton.getAttribute('data-tooltip')?.includes('Send') ||
            sendButton.textContent?.includes('Send')
        )) {
            console.log('📤 Send button clicked (direct interception)');
            const composeArea = findComposeArea();
            if (composeArea) {
                injectTrackingPixel(composeArea);
            }
        }
    }, true);
    
    // Method 2: Watch for keyboard shortcuts (Ctrl+Enter, Cmd+Enter)
    document.addEventListener('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            console.log('📤 Send keyboard shortcut detected');
            const composeArea = findComposeArea();
            if (composeArea) {
                injectTrackingPixel(composeArea);
            }
        }
    });
    
    // Method 3: MutationObserver to watch for compose window changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // Look for nodes being removed (compose window closing after send)
            mutation.removedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && 
                    (node.querySelector('[role="dialog"]') || node.matches('[role="dialog"]'))) {
                    console.log('📤 Compose dialog removed - email likely sent');
                }
            });
            
            // Look for new compose windows
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const composeDialog = node.querySelector('[role="dialog"]') || 
                                        (node.matches && node.matches('[role="dialog"]') ? node : null);
                    if (composeDialog) {
                        console.log('📝 New compose dialog detected');
                        // Add a small delay to let Gmail fully render
                        setTimeout(() => {
                            const composeArea = findComposeArea();
                            if (composeArea && !composeArea.querySelector(`img[src^="${TRACKING_SERVER}/pixel"]`)) {
                                console.log('🎯 Pre-injecting pixel in new compose window');
                                injectTrackingPixel(composeArea);
                            }
                        }, 500);
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ All tracking methods set up');
}

function initialize() {
    console.log('[initialize] Starting pixel tracker');
    setupSendTracking();
    console.log('[initialize] Pixel tracker initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
} 
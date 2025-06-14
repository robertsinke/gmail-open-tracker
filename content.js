console.log('🚀 Gmail Open Tracker extension starting...');

const TRACKING_SERVER = 'https://gmail-open-tracker.onrender.com'; // Live production server

function generateTrackingId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
}

function getEmailMetadata() {
    // Try to get subject
    let subject = '';
    let to = '';
    const subjectInput = document.querySelector('input[name="subjectbox"], input[aria-label="Subject"]');
    if (subjectInput) subject = encodeURIComponent(subjectInput.value.trim());
    const toField = document.querySelector('textarea[name="to"], input[aria-label="To"]');
    if (toField) to = encodeURIComponent(toField.value.trim());
    return { subject, to };
}

function getEmailMetadataFromDialog(dialog) {
    // Subject
    let subject = '';
    const subjectInput = dialog.querySelector('input[name="subjectbox"], input[aria-label="Subject"]');
    if (subjectInput) subject = subjectInput.value.trim();

    // To (recipients)
    let to = '';
    // Based on user's DevTools screenshot, the container for the 'To' field has a 'name' attribute.
    const toContainer = dialog.querySelector('div[name="to"]');
    let toChips = [];
    if (toContainer) {
        // Find all chips within that container. They have a data-hovercard-id attribute.
        toChips = toContainer.querySelectorAll('[data-hovercard-id]');
    }

    if (toChips.length > 0) {
        to = Array.from(toChips)
            .map(chip => chip.getAttribute('data-hovercard-id'))
            .filter(Boolean)
            .join(', ');
    } else {
        // Fallback to the input field if no chips are found (e.g., user is still typing)
        const toFieldInput = dialog.querySelector('textarea[name="to"], input[aria-label*="To"]');
        if (toFieldInput) to = toFieldInput.value.trim();
    }
    return { subject: encodeURIComponent(subject), to: encodeURIComponent(to) };
}

function injectTrackingPixel(composeArea, dialog) {
    console.log('🎯 Attempting to inject tracking pixel...');
    const trackingId = generateTrackingId();
    const { subject, to } = getEmailMetadataFromDialog(dialog);
    console.log('🟦 Extracted subject:', subject);
    console.log('🟦 Extracted to:', to);
    let pixelUrl = `${TRACKING_SERVER}/pixel?id=${trackingId}`;
    if (subject) pixelUrl += `&subject=${subject}`;
    if (to) pixelUrl += `&to=${to}`;
    console.log('📡 Tracking URL:', pixelUrl);

    // Only inject if not already present by checking the raw HTML of the compose area.
    if (!composeArea.innerHTML.includes(`${TRACKING_SERVER}/pixel`)) {
        // Construct the pixel as an HTML string with loading="lazy" to prevent the sender's browser from fetching it.
        const pixelHtml = `<img src="${pixelUrl}" width="1" height="1" style="display: none;" loading="lazy" alt="">`;
        
        // Append the HTML string to the message body.
        composeArea.innerHTML += pixelHtml;
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
    // Listen for send button clicks
    document.body.addEventListener('click', function(event) {
        const sendButton = event.target.closest('[role="button"]');
        if (sendButton && (
            sendButton.getAttribute('aria-label')?.includes('Send') ||
            sendButton.getAttribute('data-tooltip')?.includes('Send') ||
            sendButton.textContent?.includes('Send')
        )) {
            // Find the dialog and compose area
            const dialog = sendButton.closest('div[role="dialog"]');
            const composeArea = dialog?.querySelector('div[role="textbox"][aria-label*="Message Body"], div[role="textbox"][aria-label*="Body"]');
            if (composeArea && dialog) {
                injectTrackingPixel(composeArea, dialog);
            }
        }
    }, true);
    // Listen for keyboard shortcut (Ctrl+Enter, Cmd+Enter)
    document.addEventListener('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            console.log('⌨️ Send shortcut detected');
            // Find the currently focused element
            const activeElement = document.activeElement;
            // Check if the focused element is a compose area
            const isComposeArea = activeElement && activeElement.getAttribute('role') === 'textbox' && activeElement.getAttribute('aria-label')?.includes('Body');

            if (isComposeArea) {
                const composeArea = activeElement;
                const dialog = composeArea.closest('div[role="dialog"]');
                if (dialog) {
                    console.log('Found active compose area and dialog');
                    injectTrackingPixel(composeArea, dialog);
                } else {
                    console.log('Could not find parent dialog for active compose area');
                }
            } else {
                console.log('Send shortcut used, but not in a compose area.');
            }
        }
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
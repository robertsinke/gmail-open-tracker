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
    // Gmail uses divs with class 'vN' or 'vM' for each recipient chip
    const toChips = dialog.querySelectorAll('div[aria-label="To"] [email], div[aria-label="To"] span[email], div[aria-label="To"] .vN, div[aria-label="To"] .vM');
    if (toChips.length) {
        to = Array.from(toChips)
            .map(chip => chip.getAttribute('email') || chip.textContent.trim())
            .filter(Boolean)
            .join(', ');
    } else {
        // Fallback to textarea or input
        const toField = dialog.querySelector('textarea[name="to"], input[aria-label="To"]');
        if (toField) to = toField.value.trim();
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

    // Only inject if not already present
    if (!composeArea.querySelector(`img[src^=\"${TRACKING_SERVER}/pixel\"]`)) {
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
            // Find the active dialog and compose area
            const dialogs = document.querySelectorAll('div[role="dialog"]');
            const dialog = dialogs[dialogs.length - 1];
            const composeArea = dialog?.querySelector('div[role="textbox"][aria-label*="Message Body"], div[role="textbox"][aria-label*="Body"]');
            if (composeArea && dialog) {
                injectTrackingPixel(composeArea, dialog);
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
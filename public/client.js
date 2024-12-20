document.addEventListener('DOMContentLoaded', async () => {
    const fetchBtn = document.getElementById('fetchBtn');
    const pasteUrlInput = document.getElementById('pasteUrl');
    const autoCopyCheckbox = document.getElementById('autoCopyCheckbox');

    // Load default state for the checkbox
    const defaultAutoCopy = await getDefaultAutoCopy();
    const userPreference = getCookie('autoCopyEnabled');
    autoCopyCheckbox.checked = userPreference !== null ? userPreference === 'true' : defaultAutoCopy;

    // Save user preference to a cookie when the checkbox changes
    autoCopyCheckbox.addEventListener('change', () => {
        setCookie('autoCopyEnabled', autoCopyCheckbox.checked, 365);
    });

    // Handle "Go to Raw Paste" button click
    fetchBtn.addEventListener('click', async () => {
        const urlInput = pasteUrlInput.value.trim();
        const pasteId = getPasteId(urlInput);

        if (!pasteId) {
            alert('Please enter a valid Pastebin URL.');
            return;
        }

        const frontendUrl = `/${pasteId}`;

        // If auto-copy is enabled, fetch and copy the paste contents
        if (autoCopyCheckbox.checked) {
            try {
                const response = await fetch(frontendUrl);
                if (response.ok) {
                    const pasteContents = await response.text();
                    await navigator.clipboard.writeText(pasteContents);
                    alert('Raw paste contents copied to clipboard!');
                } else {
                    alert('Failed to fetch paste contents.');
                }
            } catch (error) {
                alert('Error copying to clipboard: ' + error.message);
            }
        }

        // Redirect to the frontend paste URL
        window.location.href = frontendUrl;
    });
});

// Utility function to get the default auto-copy value from the server
async function getDefaultAutoCopy() {
    try {
        const response = await fetch('/auto-copy-default');
        if (response.ok) {
            const data = await response.json();
            return data.autoCopyDefault;
        }
    } catch (error) {
        console.error('Error fetching auto-copy default:', error);
    }
    return false; // Default fallback
}

// Extract Paste ID from the given Pastebin URL
function getPasteId(url) {
    const regex = /pastebin\.com\/(?:raw\/)?([a-zA-Z0-9]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Utility functions to manage cookies
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

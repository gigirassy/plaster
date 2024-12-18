document.getElementById('fetchBtn').addEventListener('click', () => {
    const urlInput = document.getElementById('pasteUrl').value;
    
    // Extract the Paste ID from the provided Pastebin URL
    const pasteId = getPasteId(urlInput);
    
    if (pasteId) {
        window.location.href = `/${pasteId}`;
    } else {
        alert('Please enter a valid Pastebin URL.');
    }
});

function getPasteId(url) {
    // Check if the URL is a valid Pastebin URL and extract the Paste ID
    const regex = /pastebin\.com\/(?:raw\/)?([a-zA-Z0-9]+)/;
    const match = url.match(regex);
    
    if (match) {
        return match[1]; // Return the Paste ID
    }
    return null; // Invalid Pastebin URL
}

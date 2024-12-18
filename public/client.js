document.getElementById('fetchBtn').addEventListener('click', async () => {
    const urlInput = document.getElementById('pasteUrl').value;

    // Perform a redirection by using the input URL directly
    const redirectUrl = `/fetch-paste?url=${encodeURIComponent(urlInput)}`;
    window.location.href = redirectUrl; // This redirects the user to the raw paste URL
});

document.getElementById('fetchBtn').addEventListener('click', async () => {
    const urlInput = document.getElementById('pasteUrl').value;
    const output = document.getElementById('output');
    output.textContent = 'Loading...';

    try {
        const response = await fetch(`/fetch-paste?url=${encodeURIComponent(urlInput)}`);
        if (!response.ok) {
            const errorData = await response.json(); // Parse error JSON
            throw new Error(errorData.error || 'Unknown error occurred');
        }

        const text = await response.text(); // Always plain text
        output.textContent = text; // Display raw text
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
    }
});

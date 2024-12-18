document.getElementById('fetchBtn').addEventListener('click', async () => {
    const urlInput = document.getElementById('pasteUrl').value;
    const output = document.getElementById('output');
    output.textContent = 'Loading...';

    try {
        const response = await fetch(`/fetch-paste?url=${encodeURIComponent(urlInput)}`);
        const data = await response.json();
        if (data.error) {
            output.textContent = `Error: ${data.error}`;
        } else {
            output.textContent = data.text;
        }
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
    }
});

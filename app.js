const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Route to fetch Pastebin raw text data using the Paste ID
app.get('/fetch-paste', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Check if the URL is a Pastebin URL and convert to raw format
    let rawUrl = url;
    if (url.includes('pastebin.com/') && !url.includes('/raw/')) {
        const pasteId = url.split('/').pop();
        rawUrl = `https://pastebin.com/raw/${pasteId}`;
    }

    try {
        const response = await fetch(rawUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch data from Pastebin');
        }
        const text = await response.text();
        res.json({ text }); // Always send JSON
    } catch (error) {
        res.status(500).json({ error: error.message }); // Ensure error is JSON
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

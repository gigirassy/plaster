const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Route to fetch Pastebin raw text data using the Paste ID or URL
app.get('/:pasteId?', async (req, res) => {
    let rawUrl;

    // If the pasteId is provided directly in the URL (like /uxK7EPux)
    if (req.params.pasteId) {
        const pasteId = req.params.pasteId;
        rawUrl = `https://pastebin.com/raw/${pasteId}`;
    }
    // If the URL parameter is used (like /fetch-paste?url=https://pastebin.com/...)
    else if (req.query.url) {
        const url = req.query.url;
        if (url.includes('pastebin.com/') && !url.includes('/raw/')) {
            const pasteId = url.split('/').pop();
            rawUrl = `https://pastebin.com/raw/${pasteId}`;
        } else {
            rawUrl = url; // Assuming it already has '/raw/'
        }
    }

    if (!rawUrl) {
        return res.status(400).json({ error: 'URL or Paste ID is required' });
    }

    try {
        const response = await fetch(rawUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch data from Pastebin');
        }
        const text = await response.text();
        res.setHeader('Content-Type', 'text/plain'); // Ensure it's treated as plain text
        res.send(text); // Send raw text
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

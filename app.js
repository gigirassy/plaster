const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Route to fetch Pastebin raw text data using the Paste ID
app.get('/:pasteId', async (req, res) => {
    const pasteId = req.params.pasteId;

    // Construct the raw Pastebin URL
    const rawUrl = `https://pastebin.com/raw/${pasteId}`;

    try {
        const response = await fetch(rawUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch data from Pastebin');
        }
        const text = await response.text();
        res.send(`<pre>${text}</pre>`);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

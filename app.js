const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Route to handle raw Pastebin requests
app.get('/:pasteId', async (req, res) => {
    const pasteId = req.params.pasteId;
    const rawUrl = `https://pastebin.com/raw/${pasteId}`;

    try {
        const response = await fetch(rawUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch data from Pastebin');
        }
        const text = await response.text();
        res.setHeader('Content-Type', 'text/plain'); // Ensure raw text response
        res.send(text); // Send the raw paste content
    } catch (error) {
        res.status(500).json({ error: error.message }); // Return error in JSON format
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

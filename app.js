const express = require('express');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(cookieParser());

// Environment variable to toggle ASCII art
const showAsciiArt = process.env.SHOW_ASCII_ART === 'true';
const asciiArtFolder = process.env.ASCII_ART_FOLDER || path.join(__dirname, 'ascii');

// Get ASCII art files
const asciiArtFiles = showAsciiArt ? fs.readdirSync(asciiArtFolder).filter(file => file.endsWith('.txt')) : [];

// Serve a random ASCII art
app.get('/ascii', (req, res) => {
    if (!showAsciiArt || asciiArtFiles.length === 0) {
        res.json({ enabled: false });
        return;
    }

    const randomFile = asciiArtFiles[Math.floor(Math.random() * asciiArtFiles.length)];
    const art = fs.readFileSync(path.join(asciiArtFolder, randomFile), 'utf-8');
    res.json({ enabled: true, art });
});

const autoCopyDefault = process.env.AUTO_COPY_DEFAULT === 'true';

app.get('/auto-copy-default', (req, res) => {
    res.json({ autoCopyDefault });
});

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

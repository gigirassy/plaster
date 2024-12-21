const express = require('express');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const captcha = require('trek-captcha');
const JSZip = require('jszip');

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

let lastDownloadTime = {};  // To track cooldowns for each user

// Function to check cooldown
const checkCooldown = (userId) => {
    const now = Date.now();
    if (lastDownloadTime[userId] && now - lastDownloadTime[userId] < 180000) {  // 3-minute cooldown
        return false;
    }
    lastDownloadTime[userId] = now;
    return true;
};

// Function to fetch paste data from Pastebin
const fetchPasteData = async (pasteId) => {
    const rawUrl = `https://pastebin.com/raw/${pasteId}`;
    const response = await fetch(rawUrl);
    if (!response.ok) {
        throw new Error('Failed to fetch paste data');
    }
    return response.text();
};

// Function to generate Trek-Captcha
const generateCaptcha = async () => {
    const { token, buffer } = await captcha();
    return { token, buffer };
};

// Bulk download route
app.post('/bulk-download', async (req, res) => {
    const { userId, pasteIds, captchaToken } = req.body;

    if (!checkCooldown(userId)) {
        return res.status(429).json({ message: 'Please wait 3 minutes before making another bulk download request.' });
    }

    // Validate CAPTCHA
    const isCaptchaValid = await validateCaptcha(captchaToken);
    if (!isCaptchaValid) {
        return res.status(400).json({ message: 'Invalid CAPTCHA.' });
    }

    if (pasteIds.length > 64) {
        return res.status(400).json({ message: 'You can only request up to 64 pastes at a time.' });
    }

    try {
        // Create a new ZIP file
        const zip = new JSZip();
        
        for (const pasteId of pasteIds) {
            const pasteData = await fetchPasteData(pasteId);
            zip.file(`${pasteId}.txt`, pasteData);  // Save each paste as a text file in the ZIP
        }

        // Generate the ZIP file
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        // Send the ZIP file as a response
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', 'attachment; filename=pastes.zip');
        res.send(zipBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate the ZIP file.' });
    }
});

// Function to validate the CAPTCHA token (you'll need to implement this on your server)
const validateCaptcha = async (captchaToken) => {
    // This is where you would validate the token against Trek-Captcha's verification endpoint.
    // For now, assuming a mock validation function that always returns true.
    return true;
};

// Route to show CAPTCHA for bulk download
app.get('/captcha', async (req, res) => {
    try {
        const { token, buffer } = await generateCaptcha();
        res.status(200).json({ token, image: buffer.toString('base64') });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate CAPTCHA.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

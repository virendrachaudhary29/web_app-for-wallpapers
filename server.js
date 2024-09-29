const express = require('express');
const path = require('path');
const { downloadWallpapers } = require('./wallpaper-downloader');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use('/downloads', express.static('public/downloads'));

app.get('/api/download-wallpapers', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    const logCallback = (message) => {
        res.write(JSON.stringify({ type: 'log', message }) + '\n');
    };

    const imageCallback = (imagePath) => {
        const relativePath = path.relative(path.join(__dirname, 'public'), imagePath);
        const imageUrl = '/' + relativePath.replace(/\\/g, '/');
        res.write(JSON.stringify({ type: 'image', url: imageUrl }) + '\n');
    };

    try {
        await downloadWallpapers(logCallback, imageCallback);
        res.write(JSON.stringify({ type: 'complete', message: 'Download complete!' }) + '\n');
        res.end();
    } catch (error) {
        res.write(JSON.stringify({ type: 'error', message: `Error: ${error.message}` }) + '\n');
        res.end();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
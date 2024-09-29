const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadWallpapers(logCallback, imageCallback) {
    const url = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s';
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        logCallback('Fetching JSON data...');
        const jsonData = await fetchJson(url);
        const data = jsonData.data;

        if (!data) {
            throw new Error('JSON does not have a "data" property at its root.');
        }

        const downloadDir = path.join(__dirname, 'public', 'downloads');
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
            logCallback(`Created directory: ${downloadDir}`);
        }

        let fileIndex = 1;
        for (const key in data) {
            const subproperty = data[key];
            if (subproperty && subproperty.dhd) {
                const imageUrl = subproperty.dhd;
                logCallback(`Found image URL: ${imageUrl}`);
                await delay(100);

                const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
                const filename = `${fileIndex}${ext}`;
                const filePath = path.join(downloadDir, filename);

                await downloadImage(imageUrl, filePath);
                logCallback(`Saved image to ${filePath}`);
                imageCallback(filePath);
                fileIndex++;
                await delay(250);
            }
        }
    } catch (error) {
        logCallback(`Error: ${error.message}`);
        throw error;
    }
}

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function downloadImage(url, filePath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const fileStream = fs.createWriteStream(filePath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
        }).on('error', reject);
    });
}

module.exports = { downloadWallpapers };
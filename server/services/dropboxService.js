const { Dropbox } = require('dropbox');
const fetch = require('node-fetch');

// Setup static config-based token
const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN || 'YOUR_DROPBOX_ACCESS_TOKEN';

const dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN, fetch: fetch });

const uploadFile = async (fileName, fileBuffer) => {
    if (!DROPBOX_ACCESS_TOKEN || DROPBOX_ACCESS_TOKEN === 'YOUR_DROPBOX_ACCESS_TOKEN') {
        throw new Error('Dropbox token not configured. Please set DROPBOX_ACCESS_TOKEN');
    }

    const response = await dbx.filesUpload({
        path: `/${fileName}`,
        contents: fileBuffer,
        mode: { '.tag': 'overwrite' }
    });

    return response.result;
};

module.exports = { uploadFile };

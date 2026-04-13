const { google } = require('googleapis');
const { Readable } = require('stream');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const userTokens = {}; // In-memory config-based token storage

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "openid"
];

const getAuthUrl = (userId) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: SCOPES,
        include_granted_scopes: true
    });
    return authUrl;
};

const handleCallback = async (req, res) => {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    oauth2Client.setCredentials(tokens);
    if (req.session) {
        req.session.google = tokens;
    }
    // ensure existing functionality also saves to userTokens if state is provided
    const userId = req.query.state;
    if (userId) {
        userTokens[userId] = tokens;
    }
    return tokens;
};

const isConfigured = (userId) => {
    return !!userTokens[userId];
};

const uploadFile = async (userId, fileName, fileBuffer, mimeType) => {
    const tokens = userTokens[userId];
    if (!tokens) throw new Error('Not authenticated with Google Drive. Please authorize first.');

    oauth2Client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileMetadata = { name: fileName };
    const media = {
        mimeType: mimeType,
        body: Readable.from(fileBuffer)
    };

    const file = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
    });

    return file.data;
};

module.exports = { getAuthUrl, handleCallback, uploadFile, isConfigured, oauth2Client };

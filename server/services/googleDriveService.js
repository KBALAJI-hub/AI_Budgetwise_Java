const { google } = require('googleapis');
const { Readable } = require('stream');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "openid"
];

// Base client for backward compatibility or general reference
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const getAuthUrl = (userId) => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    include_granted_scopes: true,
    state: String(userId)
  });
};

const handleCallback = async (code, state) => {
  const userId = parseInt(state, 10);
  if (isNaN(userId)) {
    throw new Error('Invalid state/userId during Google OAuth callback.');
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await client.getToken(code);

  const dataToUpdate = {
    googleAccessToken: tokens.access_token,
    googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
  };

  if (tokens.refresh_token) {
    dataToUpdate.googleRefreshToken = tokens.refresh_token;
  }

  await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate
  });

  return tokens;
};

const isConfigured = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  return !!(user && user.googleAccessToken && user.googleRefreshToken);
};

const getOAuth2ClientForUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.googleAccessToken || !user.googleRefreshToken) {
    throw new Error('Not authenticated with Google Drive. Please authorize first.');
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
    expiry_date: user.googleTokenExpiry ? new Date(user.googleTokenExpiry).getTime() : null
  });

  // Automatically persist any refreshed tokens
  client.on('tokens', async (tokens) => {
    try {
      const dataToUpdate = {
        googleAccessToken: tokens.access_token,
      };
      if (tokens.expiry_date) {
        dataToUpdate.googleTokenExpiry = new Date(tokens.expiry_date);
      }
      if (tokens.refresh_token) {
        dataToUpdate.googleRefreshToken = tokens.refresh_token;
      }
      await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate
      });
    } catch (err) {
      console.error('Failed to save refreshed Google tokens to DB:', err);
    }
  });

  // Verify and trigger a token refresh if expired or close to expiry
  await client.getAccessToken();

  return client;
};

const uploadFile = async (userId, fileName, fileBuffer, mimeType) => {
  const client = await getOAuth2ClientForUser(userId);
  const drive = google.drive({ version: 'v3', auth: client });

  const fileMetadata = { name: fileName };
  const media = {
    mimeType: mimeType,
    body: Readable.from(fileBuffer)
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink',
  });

  return file.data;
};

module.exports = {
  getAuthUrl,
  handleCallback,
  uploadFile,
  isConfigured,
  getOAuth2ClientForUser,
  oauth2Client
};

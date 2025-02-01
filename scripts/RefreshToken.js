const { google } = require('googleapis');
const readline = require('readline');
const dotenv = require('dotenv')

dotenv.config();

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI

const oauth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  REDIRECT_URI,
);

// Generate the url that will be used for authorization
const authorizeUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://mail.google.com/'],
  prompt: 'consent'
});

console.log('Authorize this app by visiting this url:', authorizeUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Get the authorization code from the user
rl.question('Enter the code from that page here: ', async (code) => {
  try {
    // Get tokens using the code
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Refresh token:', tokens.refresh_token);
    console.log('Access token:', tokens.access_token);
  } catch (error) {
    console.error('Error getting tokens:', error);
  }
  rl.close();
});
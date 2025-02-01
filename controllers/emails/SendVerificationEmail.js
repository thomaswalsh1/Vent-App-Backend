const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const generateVerificationToken = require('./GenerateVerificationToken');
const generateEmailTemplate = require('./GenerateEmailTemplate');

dotenv.config();

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

async function SendVerificationEmail(email, username, token) {
  try {
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    const accessToken = await oAuth2Client.getAccessToken();

    const Transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SUPPORT_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });
    
    const verificationLink = `${process.env.ORIGIN}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.SUPPORT_EMAIL,
      to: email,
      subject: 'Verify your email for Vent',
      text: 'Hey, this is your verification email!',
      html: generateEmailTemplate({ username, verificationLink })
    };

    const info = await Transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
}

module.exports = SendVerificationEmail;
function createEmailTemplate(arg0) {
    throw new Error('Function not implemented.');
}


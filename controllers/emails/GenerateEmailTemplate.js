function generateEmailTemplate ({ username, verificationLink }) {
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email for Vent</title>
          <style>
            body {            
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: rgb(100 116 139);
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
                font-family: 'Norwester', sans-serif;
              text-align: center;
              padding: 20px 0;
              border-bottom: 2px solid #f4f4f4;
            }
            .content {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
              padding: 20px 0;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: rgb(100 116 139);
              color: white;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              color: #666;
              font-size: 0.8em;
            }
          </style>
          <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet">
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Vent!</h1>
            </div>
            <div class="content">
              <p>Hi ${username || 'there'},</p>
              <p>Thank you for joining Vent! </p> 
              <p> Get ready to enjoy creating and sharing your journals with the world. </p>
            <p>Please verify your email address to get started.</p>
              <p style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">${verificationLink}</p>
              <p>This verification link will expire in 24 hours.</p>
              <p>If you didn't create an account with Vent, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Vent. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
}
module.exports = generateEmailTemplate

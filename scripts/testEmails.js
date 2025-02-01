const SendVerificationEmail = require('../controllers/emails/SendVerificationEmail')

async function testEmails () {
  console.log('Testing email functionality...')
  try {
    await SendVerificationEmail('hinemiw321@kuandika.com', "BobbyT")
  } catch (error) {
    console.error('Error in testEmails:', error.message)
  }
}

testEmails()

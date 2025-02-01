function generateVerificationToken () {
  // Generate a random token - in production, use a more secure method
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

module.exports = generateVerificationToken

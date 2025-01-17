const jwt = require('jsonwebtoken')

function VerifyId (authorization) {
  const authHeader = authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing Authentication')
  }
  const userToken = authHeader.split(' ')[1]
  const decoded = jwt.verify(userToken, process.env.JWT_SECRET)
  if (typeof decoded === 'string')
    throw new Error('Authentication could not be verified')
  return decoded.id
}
module.exports = VerifyId

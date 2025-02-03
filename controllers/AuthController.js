const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User.js')
const Confirmation = require('../models/Confirmation.js')
const SendVerificationEmail = require('./emails/SendVerificationEmail.js')
const VerifyId = require('./fetchId/VerifyId.js')
const generateVerificationToken = require('./emails/GenerateVerificationToken.js')

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    // send response based on issue
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ message: 'Email already exists.' })
      }
      if (existingUser.username === username) {
        return res.status(409).json({ message: 'Username already exists.' })
      }
    }

    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      password: passwordHash
    })

    const savedUser = await newUser.save()

    await confirmationEmailHelper(savedUser._id)

    res.status(201).json(savedUser)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })

    if (!existingUser) {
      return res.status(404).json({
        message: 'User not found.'
      })
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    )

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Email/Password is incorrect.'
      })
    }

    // Generate a token with id and email params
    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    )

    res.status(200).json({
      message: 'Successfully signed in.',
      user: {
        id: existingUser._id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        username: existingUser.username
      },
      token
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.checkConfirmationStatus = async (req, res) => {
  try {
    const userId = VerifyId(req.headers.authorization)

    const isConfirmed = await Confirmation.findOne({ userId, confirmed: true })

    res.status(200).json({ isConfirmed: !!isConfirmed })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to fetch confirmation status', error })
  }
}

/**
 * Helper function for sending confirmation emails,
 * allows for emails to be sent on signup
 * 
 * @param {*} userId
 */
async function confirmationEmailHelper (userId) {
  try {
    const { email, username } = await User.findById(userId).then(e => {
      return { email: e.email, username: e.username }
    })

    //   const email = await User.findById(userId).then(e => e.email);
    //   const username = await User.findById(userId).then(e => e.username);

    const token = generateVerificationToken()

    await SendVerificationEmail(email, username, token)

    await Confirmation.create({
      userId,
      email,
      token,
      confirmed: false
    })
  } catch (error) {
    throw new Error("Error sending confirmation email: " + error)
  }
}

exports.sendConfirmationEmail = async (req, res) => {
  try {
    const userId = VerifyId(req.headers.authorization)

    await confirmationEmailHelper(userId)

    res.status(200).json({ message: 'Email confirmation has been sent' })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to send confirmation email', error: error.message })
  }
}

exports.confirmEmail = async (req, res) => {
  try {
    const token = req.query.token

    const confirmation = await Confirmation.findOneAndUpdate({ token }, { confirmed: true })

    res.status(200).json({ message: 'Email has now been confirmed.', isConfirmed: !!confirmation })
  } catch (error) {
    res.status(500).json({ message: 'Failed to confirm email', error })
  }
}

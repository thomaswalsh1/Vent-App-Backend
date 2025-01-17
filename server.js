const express = require('express')
const multer = require('multer')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

// routes
const authRoutes = require('./routes/AuthRoutes.js')
const postRoutes = require('./routes/PostRoutes.js')
const userRoutes = require('./routes/UserRoutes.js')
const reportRoutes = require('./routes/ReportRoutes.js')

const app = express()

// configure environment
dotenv.config()

// db

console.log(process.env.ORIGIN)

const corsOptions = {
  origin: 'https://vent-app-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

app.options('*', cors(corsOptions)) // preflight requests

app.use(express.json({ limit: '100mb' }))

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(e => console.log('Connected to MongoDB'))
  .catch(err => console.log(`Error: ${err}`))
// multer

app.use('/auth', authRoutes)
app.use('/posts', postRoutes)
app.use('/users', userRoutes)
app.use('/reports', reportRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something broke!' })
})

app.listen(3000, () => {
  console.log('Now running on port 3000')
})

module.exports = app // for vercel

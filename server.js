const express = require('express')
const multer = require('multer')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
import http from 'http';

// routes
const authRoutes = require('./routes/AuthRoutes.js')
const postRoutes = require('./routes/PostRoutes.js')
const userRoutes = require('./routes/UserRoutes.js')
const reportRoutes = require('./routes/ReportRoutes.js')

const app = express()

// configure environment
dotenv.config()

// db

// const corsOptions = {
//   origin: process.env.ORIGIN,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: [
//     'Access-Control-Allow-Origin',
//     'Origin',
//     'X-Requested-With',
//     'Content-Type',
//     'Accept',
//     'Authorization'
//   ],
//   credentials: true,
//   optionsSuccessStatus: 200
// }

// // Handle preflight requests for all routes
// app.options('*', cors(corsOptions))

// Apply CORS middleware
app.use(cors({
  origin: process.env.ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Access-Control-Allow-Origin',
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ],
  credentials: true
}))

app.use(express.json({ limit: '100mb' }))

mongoose
  .connect(process.env.MONGODB_URI, {
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
  console.log(req.headers); // debug 431
  console.error(err.stack)
  next();
})

app.listen(3000, () => {
  console.log('Now running on port 3000')
})

module.exports = app // for vercel

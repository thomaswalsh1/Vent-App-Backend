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
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(e => console.log('Connected to MongoDB'))
  .catch(err => console.log(`Error: ${err}`))



// multer

app.use(express.json({ limit: '100mb' }))


app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true
  })
)

app.options('*', cors()); // preflight requests

app.use('/auth', authRoutes)
app.use('/posts', postRoutes)
app.use('/users', userRoutes)
app.use('/reports', reportRoutes)

app.listen(3000, () => {
  console.log('Now running on port 3000')
})

const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// routes
const authRoutes = require('./routes/AuthRoutes.js');
const postRoutes = require('./routes/PostRoutes.js');
const userRoutes = require('./routes/UserRoutes.js');
const reportRoutes = require('./routes/ReportRoutes.js');

const app = express();

// db
mongoose.connect("mongodb://localhost:27017/social-app", {
    useNewUrlParser: true,
	useUnifiedTopology: true,
}).then(e => console.log("Connected to MongoDB")).catch(err => console.log(`Error: ${err}`))

// configure environment
dotenv.config();

// multer

app.use(express.json({ limit: '100mb' }));

app.use(cors({
    origin: process.env.ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));



app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/reports', reportRoutes);


app.listen(3000, () => {
    console.log("Now running on port 3000");
})
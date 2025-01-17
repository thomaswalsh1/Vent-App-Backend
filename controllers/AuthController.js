const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

exports.signup = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            username,
            password,
        } = req.body;

        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        // send response based on issue
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(409).json({ message: "Email already exists." });
            }
            if (existingUser.username === username) {
                return res.status(409).json({ message: "Username already exists." });
            }
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email,
            username,
            password: passwordHash,
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Email/Password is incorrect."
            })
        }

        // Generate a token with id and email params
        const token = jwt.sign(
            { id: existingUser._id, email: existingUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "4h" }
        );

        res.status(200).json({
            message: "Successfully signed in.",
            user: {
                id: existingUser._id,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                email: existingUser.email,
                username: existingUser.username,
            },
            token
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

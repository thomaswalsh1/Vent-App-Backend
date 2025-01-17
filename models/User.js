const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            min: 2,
            max: 50,
        },
        lastName: {
            type: String,
            required: true,
            min: 2,
            max: 50,
        },
        email: {
            type: String,
            required: true,
            max: 50,
            unique: true,
        },
        username: {
            type: String,
            required: true,
            max: 50,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            min: 5,
        },
        pfp: {
            data: Buffer,
            type: String, 
        },
        posts: {
            type: Array,
            default: [],
        },
        bio: {
            type: String,
            default: ""
        },
        num_followers: {
            type: Number,
            default: 0
        },
        num_following: {
            type: Number,
            default: 0
        },
        blocked: {
            type: Array,
            default: []
        },
        drafts: {
            type: Array,
            default: []
        },
        impressions: Number,
        private: {
            type: Boolean,
            default: false
        },
        isTestUser: {
            type: Boolean
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
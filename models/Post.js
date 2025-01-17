const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'friendsOnly', 'followersOnly'],
        default: "public"
    },
    num_likes: Number,
    userId: {
        type: String,
        required: true
    },
}, { timestamps: true })

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
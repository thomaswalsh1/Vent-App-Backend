const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema({
    postId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
})

const Like = mongoose.model("Like", LikeSchema)
module.exports = Like
const mongoose = require("mongoose")

// relational collection
const FollowerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isRequest: {
        type: Boolean,
        default: false
    },
}, {timestamps: true})

const Follower = mongoose.model("Follower", FollowerSchema);
module.exports = Follower;
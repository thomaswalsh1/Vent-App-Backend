const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['follow', 'request', 'approval', 'like', 'support', 'other']
    },
    read: {
        type: Boolean,
        default: false
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likedPostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: false
    }
}, { timestamps: true });

const Notification = mongoose.model("Notification", NotificationSchema)
module.exports = Notification
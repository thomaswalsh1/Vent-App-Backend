const Notification = require('../../models/Notification')

async function NotifyLike (liker, recipient, likedPostId) {
  if (liker !== recipient) { // no notification for self-like
    const newLike = new Notification({
        type: "like",
        read: false,
        recipient,
        fromUser: liker,
        likedPostId
    })
    await newLike.save();
  }
}

module.exports = NotifyLike

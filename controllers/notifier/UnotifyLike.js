const Notification = require("../../models/Notification")

async function UnotifyLike(liker, recipient, unlikedPostId) {
    await Notification.findOneAndDelete({
        type: "like",
        recipient,
        fromUser: liker,
        likedPostId: unlikedPostId
    })
}

module.exports = UnotifyLike;






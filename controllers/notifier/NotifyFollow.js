const Notification = require("../../models/Notification");
const UnotifyRequest = require("./UnotifyRequest");

/**
 * Apply a following notification to the followed user
 * @param {*} newFollower 
 * @param {*} followed 
 */
async function NotifyFollow(newFollower, followed, accepting = false) {

    if (accepting) {
        await UnotifyRequest(newFollower, followed);
    }

    const newFollow = new Notification({
        type: "follow",
        read: false,
        recipient: followed,
        fromUser: newFollower
    })
    await newFollow.save();
}
module.exports = NotifyFollow;
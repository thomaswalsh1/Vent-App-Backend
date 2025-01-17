const Notification = require("../../models/Notification");

/**
 * Apply a following notification to the requested user
 * @param {*} newFollower 
 * @param {*} followed 
 */
async function NotifyRequestFollow(newFollower, followed) {
    const newFollow = new Notification({
        type: "request",
        read: false,
        recipient: followed,
        fromUser: newFollower
    })
    await newFollow.save();
}
module.exports = NotifyRequestFollow;
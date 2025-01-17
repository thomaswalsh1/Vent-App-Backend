const Notification = require("../../models/Notification");
/**
 * Remove the following notification if the user is unfollowing
 * 
 * @param {*} unfollower the unfollower
 * @param {*} unfollowed the unfollowed
 */
async function UnotifyRequest(unfollower, unfollowed) {
    await Notification.deleteMany({
        type: "request",
        recipient: unfollowed,
        fromUser: unfollower
    })
}
module.exports = UnotifyRequest;
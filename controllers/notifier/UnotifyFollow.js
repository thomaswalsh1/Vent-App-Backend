const Notification = require('../../models/Notification')
/**
 * Remove the following notification if the user is unfollowing
 *
 * @param {*} unfollower the unfollower
 * @param {*} unfollowed the unfollowed
 */
async function UnotifyFollow (unfollower, unfollowed) {
  await Notification.deleteMany({
    $or: [
      {
        type: 'follow',
        recipient: unfollowed,
        fromUser: unfollower
      },
      {
        type: "request",
        recipient: unfollowed,
        fromUser: unfollower
      }
    ]
  })
}
module.exports = UnotifyFollow

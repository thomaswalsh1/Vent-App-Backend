const Follower = require('../models/Follower')
const Post = require('../models/Post')
const User = require('../models/User')

/**
 * Method to check if viewer follows author
 * @param viewerId
 * @param authorId
 * @returns if the viewer follows the author
 */
async function VerifyFollower (viewerId, authorId) {
  try {
    // check that the viewer follows the author
    const viewer = await Follower.exists({
      userId: authorId,
      followerId: viewerId,
      isRequest: false
    })

    // if the viewer and the author are the same, or if the viewer follows the author
    return viewerId === authorId || !!viewer
  } catch (error) {
    console.error(error)
  }
  return false
}
module.exports = VerifyFollower

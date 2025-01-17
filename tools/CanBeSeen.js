const VerifyFollower = require('./VerifyFollower')
const VerifyFriends = require('./VerifyFriends')

async function CanBeSeen (viewerId, post) {
  if (post.visibility === 'public') {
    return true
  } else if (post.visibility === 'private') {
    return viewerId === post.userId
  } else {
    // friendsOnly and followersOnly
    const followersOnlyPost = await VerifyFollower(viewerId, post.userId)
    if (post.visibility === 'followersOnly')
      return followersOnlyPost
    const verified = await VerifyFriends(viewerId, post.userId)
    return verified
  }
}
module.exports = CanBeSeen

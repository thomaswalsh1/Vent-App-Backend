const Follower = require('../models/Follower.js')
const User = require('../models/User.js')
const VerifyId = require('./fetchId/VerifyId.js')
const Notification = require('../models/Notification.js')
const multer = require('multer')
const NotifyFollow = require('./notifier/NotifyFollow.js')
const UnotifyFollow = require('./notifier/UnotifyFollow.js')
const jwt = require('jsonwebtoken')
const VerifyFriends = require('../tools/VerifyFriends.js')
const NotifyRequestFollow = require('./notifier/NotifyRequest.js')
const VerifyFollower = require('../tools/VerifyFollower.js')
const Confirmation = require('../models/Confirmation.js')
const SendVerificationEmail = require('./emails/SendVerificationEmail.js')

exports.updateUser = async (req, res) => {
  try {
    const data = req.body

    console.log(req.body)

    if (req.file) {
      // use multer for pfp
      updates.pfp = {
        data: req.file.buffer, // binary
        contentType: req.file.mimetype // MIME
      }
    }

    // console.log(data)

    await User.findByIdAndUpdate(req.params.id, data, {
      runValidators: true
    })

    res.status(200).json({ message: 'Greetings! Update Request received' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getUser = async (req, res) => {
  try {
    // console.log("we are in get User");
    const userId = VerifyId(req.headers.authorization)
    const id = req.params.id

    // check for private account
    const foundUser = await User.findById(id).select('-email -password')
    let viewable = true
    const privateViewable = await VerifyFollower(userId, id)
    if (foundUser.private) viewable = privateViewable
    res.status(200).json({
      ...foundUser.toObject(),
      viewable: viewable
    })
  } catch (err) {
    console.error(err)
    console.log('Error in getUser: ' + err)
    res.status(500).json({ error: err.message })
  }
}

exports.searchUsers = async (req, res) => {
  // console.log("Made it to search Users");
  const search = req.query.search || ''
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 6
  const skip = (page - 1) * limit

  try {
    const users = await User.find({
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalCount = await User.countDocuments({
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    })

    const hasMore = skip + limit < totalCount

    res.status(200).json({ users, hasMore })
  } catch (error) {
    console.log('Error in searchUsers: ' + error)
    res.status(500).json({ message: 'Failed to search posts', error })
  }
}

exports.getUserNotifications = async (req, res) => {
  try {
    const id = VerifyId(req.headers.authorization)

    // pagination

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const notifs = await Notification.find({
      recipient: id
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalCount = notifs.length

    const hasMore = skip + limit < totalCount

    res.status(200).json({ notifs, hasMore })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications', error })
  }
}

exports.readUserNotification = async (req, res) => {
  try {
    const notifId = req.params.notifId
    const userId = VerifyId(req.headers.authorization)

    await Notification.findByIdAndUpdate(notifId, {
      read: true
    })

    res.status(200).json({ message: 'Successfully read notification' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to read notification', error })
  }
}

exports.checkUnreadNotifications = async (req, res) => {
  try {
    const userId = VerifyId(req.headers.authorization)

    const found = await Notification.findOne({
      recipient: userId,
      read: false
    })

    res.status(200).json({ unreadNotificationsFound: !!found })
  } catch (error) {
    res.status(500).json({ message: 'Failed to read notification', error })
  }
}

// TODO: add pagination
exports.getFollowers = async (req, res) => {
  try {
    // pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const relationships = await Follower.find({
      userId: req.params.id
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // const followers = await Promise.all(
    //   relationships.map(async (relationship, index) => {
    //     return await User.findById(relationship.followerId)
    //   })
    // )

    const followers = relationships.map(
      (relationship, index) => relationship.followerId
    )

    const totalCount = await Follower.countDocuments({
      userId: req.params.id
    })

    const hasMore = skip + limit < totalCount

    res.status(200).json({ users: followers, hasMore })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch followers', error })
  }
}

exports.followUser = async (req, res) => {
  const userId = req.params.id // The ID of the user being followed
  const followerId = VerifyId(req.headers.authorization)

  try {
    if (userId === followerId) {
      return res.status(400).json({ message: 'You cannot follow yourself.' })
    }

    // check if following request is needed
    const user = await User.findById(userId)

    const isPrivate = user.private === true

    if (isPrivate) return handleRequestFollow(req, res)

    // Create the follower relationship
    await Follower.create({ userId, followerId, isRequest: false })

    // Increment follower and following counts
    await User.findByIdAndUpdate(userId, { $inc: { num_followers: 1 } })
    await User.findByIdAndUpdate(followerId, { $inc: { num_following: 1 } })

    // Notify for a follow
    await NotifyFollow(followerId, userId)

    res.status(200).json({ message: 'User followed successfully.' })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You already follow this user.' })
    }
    console.error(error)
    res.status(500).json({ message: 'Error following user.' })
  }
}

const handleRequestFollow = async (req, res) => {
  try {
    const userId = req.params.id // The ID of the user being followed
    const followerId = VerifyId(req.headers.authorization)

    await Follower.create({ userId, followerId, isRequest: true })

    await NotifyRequestFollow(followerId, userId)

    res.status(200).json({ message: 'Requested to follow user successfully.' })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You already follow this user.' })
    }
    console.error('Error in request follow' + error)
    res.status(500).json({ message: 'Error following user.' })
  }
}

exports.unfollowUser = async (req, res) => {
  const userId = req.params.id // The ID of the user being unfollowed
  const followerId = VerifyId(req.headers.authorization) // The ID of the current user

  try {
    // Delete the follower relationship
    const result = await Follower.findOneAndDelete({ userId, followerId })

    if (!result) {
      return res.status(400).json({ message: 'You do not follow this user.' })
    }

    // Decrement follower and following counts
    await User.findByIdAndUpdate(userId, { $inc: { num_followers: -1 } })
    await User.findByIdAndUpdate(followerId, { $inc: { num_following: -1 } })

    UnotifyFollow(followerId, userId)

    res.status(200).json({ message: 'User unfollowed successfully.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error unfollowing user.' })
  }
}

exports.acceptAsFollower = async (req, res) => {
  try {
    const followerId = req.params.id // The ID of the user supposedly following
    const userId = VerifyId(req.headers.authorization) // The ID of the current user

    const existingRequest = await Follower.exists({
      userId,
      followerId,
      isRequest: true
    })

    if (!existingRequest) {
      return res
        .status(400)
        .json({ message: `This user has not requested to follow you.` })
    }

    await Follower.findByIdAndUpdate(existingRequest._id, {
      isRequest: false
    })

    await User.findByIdAndUpdate(userId, { $inc: { num_followers: 1 } })
    await User.findByIdAndUpdate(followerId, { $inc: { num_following: 1 } })

    await NotifyFollow(followerId, userId, true)

    res
      .status(200)
      .json({ message: 'Successfully accepted user as a follower.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error unfollowing user.' })
  }
}

exports.getFollowing = async (req, res) => {
  try {
    // pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const relationships = await Follower.find({
      followerId: req.params.id,
      isRequest: false // looking for following, not who's requested
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // const following = await Promise.all(
    //   relationships.map(async (relationship, index) => {
    //     return await User.findById(relationship.userId)
    //   })
    // ) // extract the users from the relationships

    const following = relationships.map(
      (relationship, index) => relationship.userId
    ) // just the id, fetch for data inside the user component

    const totalCount = await Follower.countDocuments({
      followerId: req.params.id,
      isRequest: false // looking for following, not who's requested
    })

    const hasMore = skip + limit < totalCount

    res.status(200).json({ users: following, hasMore })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch following', error })
  }
}

exports.checkFollowingStatus = async (req, res) => {
  try {
    const userId = req.params.id
    const followerId = VerifyId(req.headers.authorization)

    if (!userId || !followerId) throw new Error('Could not find authorization.')

    const isFollowing = await Follower.exists({ userId, followerId })

    res.status(200).json({ isFollowing: !!isFollowing })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch following status', error })
  }
}




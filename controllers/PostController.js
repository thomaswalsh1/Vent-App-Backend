const Post = require('../models/Post')
const VerifyFriends = require('../tools/VerifyFriends')
const jwt = require('jsonwebtoken')
const VerifyId = require('./fetchId/VerifyId')
const Like = require('../models/Like')
const User = require('../models/User')
const NotifyFollow = require('./notifier/NotifyFollow')
const NotifyLike = require('./notifier/NotifyLike')
const UnotifyLike = require('./notifier/UnotifyLike')
const VerifyFollower = require('../tools/VerifyFollower')
const CanBeSeen = require('../tools/CanBeSeen')

exports.createPost = async (req, res) => {
  try {
    const { title, content, author, userId, tags, visibility } = req.body

    const post = new Post({
      title,
      content,
      author,
      userId,
      tags,
      visibility
    })

    const savedPost = await post.save()
    res.status(200).json(savedPost)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.editPost = async (req, res) => {
  try {
    const postId = req.params.id;
    // console.log(postId);
    const authorId = VerifyId(req.headers.authorization);

    const newVisibility = req.body.visibility

    await Post.findOneAndUpdate({
      _id: postId,
      userId: authorId, // extra verification
    }, {
      visibility: newVisibility
    })

    res.status(200).json({ message: "Post edited successfully."})
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message })
  }
}

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id
    const verifiedUser = VerifyId(req.headers.authorization)

    await Post.findOneAndDelete({
      _id: postId,
      userId: verifiedUser
    })
    
    res.status(200).json({ message: 'Successfully deleted post' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getPosts = async (req, res) => {
  try {
    // pagination implementation
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    let posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalCount = await Post.countDocuments()
    const hasMore = skip + limit < totalCount

    const userToken = req.headers.authorization.split(' ')[1]

    const decoded = jwt.verify(userToken, process.env.JWT_SECRET)

    const userId = decoded.id

    posts = await Promise.all(
      posts.map(async post => {
        if (post.visibility === 'public') {
          return post
        } else if (post.visibility === 'private') {
          return userId === post.userId ? post : null
        } else {
          // friendsOnly and followersOnly
          const canSeeFollowersOnly = await VerifyFollower(userId, post.userId);
          if (post.visibility === 'followersOnly') return canSeeFollowersOnly ? post : null
          const verified = await VerifyFriends(userId, post.userId) // friendsOnly
          return verified ? post : null
        }
      })
    ).then(e => e.filter(Boolean)) // remove the null values

    res.status(200).json({ posts, hasMore })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getPost = async (req, res) => {
  try {
    const userId = VerifyId(req.headers.authorization);
    const post = await Post.findById(req.params.id)

    const canBeSeen = await CanBeSeen(userId, post)
    if (!canBeSeen) return res.status(401).json({ message: "You are not authorized to view this resource."})
    res.status(200).json(post)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.searchPosts = async (req, res) => {
  try {
    // pagination implementation
    const search = req.query.search || ''
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    let posts = await Post.find({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalCount = await Post.countDocuments({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    })
    const hasMore = skip + limit < totalCount

    // authorization
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: 'Authorization token missing or invalid.' })
    }
    const userToken = authHeader.split(' ')[1]
    const decoded = jwt.verify(userToken, process.env.JWT_SECRET)
    const userId = decoded.id

    posts = await Promise.all(
      posts.map(async post => {
        if (post.visibility === 'public') return post // public
        if (post.visibility === 'private')
          return userId === post.userId ? post : null // private
        const followerOnlyPost = await VerifyFollower(userId, post.userId) // followersOnly
        if (post.visibility === 'followersOnly') {
          return followerOnlyPost ? post : null
        }
        const verified = await VerifyFriends(userId, post.userId) // friendsOnly
        return verified ? post : null
      })
    ).then(e => e.filter(Boolean)) // remove the null values

    res.status(200).json({ posts, hasMore })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = VerifyId(req.headers.authorization)

    const newLike = new Like({
      postId: postId,
      userId: userId
    })

    // create new Like
    await newLike.save()

    // update like count
    await Post.findByIdAndUpdate(postId, {
      $inc: {
        num_likes: 1
      }
    })

    // notify the user
    const poster = await Post.findById(postId).then(e => e.userId)
    await NotifyLike(userId, poster, postId)

    res.status(200).json({ message: 'Post liked successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.unlikePost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = VerifyId(req.headers.authorization)

    // delete the like
    await Like.findOneAndDelete({ postId, userId })

    // update like count
    await Post.findByIdAndUpdate(postId, {
      $inc: {
        num_likes: -1
      }
    })

    // notify the user
    const poster = await Post.findById(postId).then(e => e.userId)
    await UnotifyLike(userId, poster, postId)

    res.status(200).json({ message: 'Post unliked successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.likeStatus = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = VerifyId(req.headers.authorization)

    const likeStatus = await Like.exists({ postId, userId })

    res.status(200).json({ isLiked: !!likeStatus })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

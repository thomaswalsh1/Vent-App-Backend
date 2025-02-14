const express = require('express')
const {
  updateUser,
  getUser,
  getUserNotifications,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowingStatus,
  readUserNotification,
  acceptAsFollower,
  searchUsers,
  checkUnreadNotifications,
} = require('../controllers/UserController');
const multer = require('multer');

const router = express.Router()

// multure for image uploading
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Limit file size to 100 MB
});

// images if needed
router.put('/:id', upload.single('file'), updateUser)

router.get('/search', searchUsers);

router.get('/:id', getUser)

router.get('/:id/notifications', getUserNotifications)
router.patch('/:id/notifications/:notifId', readUserNotification)
router.get('/:id/notifications/status', checkUnreadNotifications)

router.get('/:id/followers', getFollowers)
router.get('/:id/following', getFollowing)

router.post('/:id/followers', followUser)
router.delete('/:id/followers', unfollowUser)

// accept user as a follower if possible
router.patch('/:id/accept', acceptAsFollower)


router.get('/:id/following', getFollowing)

// check if user is following
router.get(`/:id/following/status`, checkFollowingStatus)




module.exports = router

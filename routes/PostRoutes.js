const express = require('express');
const { createPost, getPosts, getPost, searchPosts, likePost, unlikePost, likeStatus, deletePost, editPost} = require('../controllers/PostController');

const router = express.Router();

router.post('/', createPost);
router.get('/', getPosts);

router.get('/search', searchPosts);

router.patch('/:id', editPost);

router.get('/:id', getPost);
router.delete('/:id', deletePost);

router.post('/:id/likes', likePost);
router.delete('/:id/likes', unlikePost);
router.get('/:id/likes/status', likeStatus);


module.exports = router;
const express = require('express');
const { createPost, getPosts, addComment, likePost } = require('../controllers/forumController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);
router.post('/posts', createPost);
router.get('/posts', getPosts);
router.post('/comments', addComment);
router.post('/like', likePost);

module.exports = router;

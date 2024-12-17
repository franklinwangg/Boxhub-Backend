const express = require('express');
const router = express.Router();

const userRoutes = require('./users');
const commentRoutes = require('./comment');
const createPostImageRoutes = require('./createPostImage');
const createPostTitleRoutes = require('./createPostTitleAndContent');
const fetchAllPostsRoutes = require('./fetchAllPosts');

// Mount routes
router.use('/users', userRoutes);
router.use('/comments', commentRoutes);
router.use('/posts/createImage', createPostImageRoutes);
router.use('/posts/createTitle', createPostTitleRoutes);
router.use('/posts/fetchAll', fetchAllPostsRoutes);

module.exports = router;

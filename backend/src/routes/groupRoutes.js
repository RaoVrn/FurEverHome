const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createGroup,
  getAllGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  getUserGroups,
  updateGroup,
  deleteGroup,
  manageGroupMember,
  getGroupStats
} = require('../controllers/groupController');

const {
  createGroupPost,
  getGroupPosts,
  getGroupPost,
  toggleLikePost,
  addComment,
  deleteComment,
  updatePost,
  deletePost,
  sharePetToGroup,
  togglePinPost
} = require('../controllers/groupPostController');

// Group management routes
router.post('/', authMiddleware, createGroup);
router.get('/', getAllGroups);
router.get('/stats', getGroupStats);
router.get('/my-groups', authMiddleware, getUserGroups);
router.get('/:id', authMiddleware, getGroupById);
router.put('/:id', authMiddleware, updateGroup);
router.delete('/:id', authMiddleware, deleteGroup);

// Group membership routes
router.post('/:id/join', authMiddleware, joinGroup);
router.post('/:id/leave', authMiddleware, leaveGroup);
router.patch('/:groupId/members/:memberId', authMiddleware, manageGroupMember);

// Group posts routes
router.post('/:groupId/posts', authMiddleware, createGroupPost);
router.get('/:groupId/posts', authMiddleware, getGroupPosts);
router.post('/:groupId/share-pet', authMiddleware, sharePetToGroup);

// Individual post routes
router.get('/posts/:postId', authMiddleware, getGroupPost);
router.put('/posts/:postId', authMiddleware, updatePost);
router.delete('/posts/:postId', authMiddleware, deletePost);
router.post('/posts/:postId/like', authMiddleware, toggleLikePost);
router.post('/posts/:postId/pin', authMiddleware, togglePinPost);

// Comments routes
router.post('/posts/:postId/comments', authMiddleware, addComment);
router.delete('/posts/:postId/comments/:commentId', authMiddleware, deleteComment);

module.exports = router;

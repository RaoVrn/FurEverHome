const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit to match frontend
  }
});

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
router.post('/:groupId/posts', authMiddleware, upload.array('images', 5), createGroupPost);
router.get('/:groupId/posts', authMiddleware, getGroupPosts);
router.post('/:groupId/share-pet', authMiddleware, sharePetToGroup);

// Individual post routes
router.get('/posts/:postId', authMiddleware, getGroupPost);
router.put('/posts/:postId', authMiddleware, upload.array('images', 5), updatePost);
router.delete('/posts/:postId', authMiddleware, deletePost);
router.post('/posts/:postId/like', authMiddleware, toggleLikePost);
router.post('/posts/:postId/pin', authMiddleware, togglePinPost);

// Comments routes
router.post('/posts/:postId/comments', authMiddleware, addComment);
router.delete('/posts/:postId/comments/:commentId', authMiddleware, deleteComment);

module.exports = router;

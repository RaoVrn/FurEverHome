const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, changePassword, deleteAccount, getAccountStats, updateNotificationSettings, exportUserData } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.post('/change-password', authMiddleware, changePassword);
router.delete('/account', authMiddleware, deleteAccount);
router.get('/account-stats', authMiddleware, getAccountStats);
router.put('/notification-settings', authMiddleware, updateNotificationSettings);
router.get('/export-data', authMiddleware, exportUserData);

module.exports = router;

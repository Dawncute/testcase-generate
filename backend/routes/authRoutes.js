const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/update-user', authController.updateUser);
router.put('/change-password', authController.changePassword);

module.exports = router;
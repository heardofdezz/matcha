const path = require('path');

const express = require('express');

////Requiring Controller
const userController = require('../controllers/user');

const router = express.Router();

router.get('/', userController.getIndex);
// User GET Login
router.get('/login', userController.getLogin);
// User POST Login
router.post('/login', userController.postLogin);

// User GET Sign up
router.get('/signup', userController.getSignup);
// User POST Sign up
router.post('/signup', userController.postSignup);
/// GET USER VERIFY
router.get('/verify/:code', userController.getVerify);
//// GET USER DETAILS PAGE
router.get('/user/details', userController.getDetails);
////// user post details 
router.post('/user/details', userController.postDetails);
/// USER SWIPE GET PAGE
router.get('/user/swipe', userController.getSwipe);
//// USER SWIPE POST PAGE
router.post('', userController.postSwipe);
//// USER CHAT GET PAGE
router.get('/user/chat', userController.getChat);
/// USER GET ADMIRERS LISTING GET PAGE
router.get('/user/liked', userController.getLiked);
//// USER GET MACTHED--- PROFILE MATCH GET PAGE
router.get('/user/matched', userController.getMatched);
//////// GET USER PROFILE
router.get('/user/profile', userController.getProfile);
///////////// POST USER PROFILE (EDITING INFORMATION)
router.post('/user/profile', userController.postProfile);

module.exports = router;
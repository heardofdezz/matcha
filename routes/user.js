const express = require('express');

////Requiring Controller
const userController = require('../controllers/user');

const router = express.Router();

router.get('/', userController.getIndex);
// User GET Login
router.get('/login', userController.getLogin);
// User POST Login
router.post('/login', userController.postLogin);
// Logout User
router.get('/logout', userController.getLogout);
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
router.get('/user/swipe/:page(\\d+)', userController.getSwipe);
/// LIKE PEOPLE
router.get('/user/like/:id(\\d+)/:page', userController.getLike);
/// BLOCK PEOPLE
router.get('/user/block/:id(\\d+)/:page', userController.getBlock);
/// REPORT PEOPLE
router.get('/user/report/:id(\\d+)', userController.getReport);
//////// GET USER X PROFILE
router.get('/user/profile/:id(\\d+)', userController.getProfileX);
//// USER GET ADMIRERS--- PROFILE LIKERS
router.get('/user/liked/:page(\\d+)', userController.getAdmirers);
//// USER GET MACTHED--- PROFILE MATCH GET PAGE
router.get('/user/matched/:page(\\d+)', userController.getMatched);
//////// GET USER PROFILE
router.get('/user/profile', userController.getProfile);
///////////// GET USER PROFILE (EDITING INFORMATION)
router.get('/user/edit-profile', userController.getProfileEdit);
///////////// POST USER PROFILE (EDITING INFORMATION)
router.post('/user/edit-profile', userController.postProfileEdit);
///////////// GET/POST USER PROFILE (EDITING INFORMATION)
////////////// Prenium Account
router.get('/premium', userController.getPremiumAccount);

/*v*v*vv CHAT | NOTIF vv*v*v*/
router.get('/user/chat/:id(\\d+)', userController.getUserChat);
router.post('/user/chatmsg', userController.PostChat);
router.post('/user/notif/read-all', userController.Postnotif);
/*^*^*^^ CHAT | NOTIF ^^*^*^*/

/*v*v*vv   VISITS   vv*v*v*/
router.post(`/visits/add`, userController.PostaddVisit);
router.get('/user/visits',userController.getVisit);
/*^*^*^^   VISITS   ^^*^*^*/

/*v*v*vv FORGOT | RESET vv*v*v*/
router.get('/forgotpassword', userController.getForgotPassword);
router.post('/forgotpassword', userController.postForgotPassword);
router.get('/resetpassword/:token', userController.getResetPassword);
router.post('/resetpassword/:token', userController.postResetPassword);
/*^*^*^^ FORGOT | RESET ^^*^*^*/

router.get('/user/loginfo', userController.getModifyLogInfo);
router.post('/user/login', userController.postModifyLogInfo);

module.exports = router;
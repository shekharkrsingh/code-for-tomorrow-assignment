const express = require('express');
const {signUp, login, userProfile, forgetPassword, resetPassword} = require(
    '../controllers/userControler'
);
const {userMiddleware} = require('../middleware/userMiddleware');

const router = express.Router();

router.post("/signup", signUp)  //user registration
router.post("/login", login)  //user login
router.get("/profile", userMiddleware, userProfile)  //get user profile
router.post("/forgetpassword", forgetPassword);     //send reset password url
router.post("/updatepassword/:token", resetPassword);  //change password

module.exports = router;
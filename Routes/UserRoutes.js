const express = require('express')
const {UserSignupController,UserLoginController,UserLogoutController,UserphnoupdateController,UserRefereshTokenController} = require('../Controllers/UserController.js')
const {UserSignin,UserLogin} = require('../Middleware/UserValidation.js')
const {validateAccessToken,validateRefereshToken} = require ('../Middleware/TokenValidate.js')
const validate = require('../Middleware/validate.js')
const router = express.Router()

router.post('/signup',validate(UserSignin),UserSignupController)
router.post('/login',validate(UserLogin),UserLoginController)
router.post('/update',validateAccessToken,UserphnoupdateController)
router.get('/logout',UserLogoutController)
router.post('/refereshtoken',validateRefereshToken,UserRefereshTokenController)

module.exports = router
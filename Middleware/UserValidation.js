const Joi = require('joi');

const UserSignin = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required(),
    phno: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    user_device_info: Joi.object({
        os: Joi.string().optional(),
        device_type: Joi.string().optional(),
        browser: Joi.string().optional(),
        browser_version: Joi.string().optional(),
    }).optional()
});

const UserLogin = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required(),
})

module.exports = { UserSignin, UserLogin }
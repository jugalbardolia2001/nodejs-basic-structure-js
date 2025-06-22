const { models } = require('../DbConfig/config.js')
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { AccessTokenGenarate, RefereshTokenGenarate } = require('../Helper/TokenGenarate.js')

const UserSignupController = async (req, res) => {
    try {
        const { email, password, phno,user_device_info } = req.body
        if (!(email || password)) {
            return res.status(400).send({ message: "email password required" })
        }

        //check for existing email
        const existingemailcheck = await models.Users.findOne({ where: { email: email } })
        if (existingemailcheck) {
            return res.status(400).send({ message: "email already exist" })
        } 
        const userId = uuidv4();
        //generate referesh and access token  
        const newUser = await models.Users.create(
            {
                user_id: userId,
                email,
                password,
                phno,
                user_device_info
            })

        return res.status(200).send({ message: "user created successfully" })
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message })
    }
}

const UserLoginController = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email) {
            return res.status(400).send({ message: "email required" })
        }
        if (!password) {
            return res.status(400).send({ message: "password required" })
        }
        const user = await models.Users.findOne({ where: { email: email } })
        if (!user) {
            return res.status(400).send({ message: "invalid email" })
        }
        const checkpassword = await bcrypt.compare(password, user.password)
        if (!checkpassword) {
            return res.status(400).send({ message: "invalid password" })
        }
        //generate tokens
        const referesh_token = await RefereshTokenGenarate(user)
        const accesstoken = await AccessTokenGenarate(user)
        //update in db
        await models.Users.update({
            referesh_token,
            token_expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 7 days expiry
            token_revoked: 0
        },
            { where: { user_id: user.user_id } }
        )

        return res.status(200).send({ message: "user login successfully", user: { email: user.email, user_id: user.user_id, accesstoken, referesh_token } })
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message })
    }
}

const UserLogoutController = async (req, res) => {
    try {
        //fetch from header
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return res.status(400).send({ message: "authorization header required" })
        }
        const referesh_token = authorizationHeader.split(" ")[1]
        if (!referesh_token) {
            return res.status(400).send({ message: "referesh token required" })
        }
        else {
            const user = await models.Users.findOne({ where: { referesh_token: referesh_token } })
            if (!user) {
                return res.status(400).send({ message: "invalid referesh token" })
            }
            //verify using jwt
            else {
                const decoded = jwt.verify(referesh_token, process.env.REFRESH_TOKEN_SECRET)
                if (!decoded) {
                    return res.status(400).send({ message: "invalid referesh token" })
                }
                //update in db
                await models.Users.update({
                    referesh_token: null,
                    token_expired_at: null,
                    token_revoked: 1
                },
                    { where: { referesh_token: referesh_token } }
                )
                return res.status(200).send({ message: "user logout successfully" })
            }
        }

    } catch (error) {
        console.log(error);
         res.status(400).send({ message: error.message })
    }
}

const UserphnoupdateController = async (req, res) => {
    try {
        const userId = req.user.payload.user_id;
        const { phno } = req.body
        if(!phno){
            return res.status(400).send({ message: "phno required" })
        }
        //check and verify for access token before updating
        const user = await models.Users.findOne({ where: { user_id : userId } })
        if(!user){
            return res.status(400).send({ message: "invalid access token" })
        }
        //update in db
        await models.Users.update({ phno }, { where: { user_id: userId } })
        return res.status(200).send({ message: "user phno updated successfully" })
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message })
    }
}

const UserRefereshTokenController = async (req, res) => {   
    try {
        const payload = {
            user_id: req.user.payload.user_id,
            created_at: req.user.payload.created_at,
            updated_at: req.user.payload.updated_at,
          }; 
    const accesstoken = await AccessTokenGenarate(payload)
    return res.status(200).send({message : "token refereshed succesfully" , accessToken : accesstoken})
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message })
    }
}   

module.exports = { UserSignupController, UserLoginController ,
    UserLogoutController,UserphnoupdateController,UserRefereshTokenController}
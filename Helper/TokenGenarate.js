//create referesh and access token using jwt
const jwt = require('jsonwebtoken')
const {models} = require('../DbConfig/config.js')
const dotenv = require('dotenv')
dotenv.config()

const RefereshTokenGenarate = async (user) => {
    const payload = {
        user_id: user.user_id,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    const referesh_token = jwt.sign({payload},process.env.REFRESH_TOKEN_SECRET,{ expiresIn:'7d'})                
    //save in database and return referesh token
    await models.Users.update({referesh_token}, {where: {user_id: user.user_id}})
    return referesh_token
     

}
const AccessTokenGenarate = async (user) => {
    const payload = {
        user_id: user.user_id,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    const access_token = jwt.sign({payload},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'2m'})
    return access_token
}

module.exports = {RefereshTokenGenarate,AccessTokenGenarate}


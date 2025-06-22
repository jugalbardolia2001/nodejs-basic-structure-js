//validate access token from headers.authoroziation beaerar token
const dotenv = require('dotenv')
dotenv.config()
const jwt = require('jsonwebtoken')
const validateAccessToken = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return res.status(400).send({ message: "authorization header required" });
    }
    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      return res.status(400).send({ message: "token required" });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) {
      return res.status(400).send({ message: "invalid token" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    if(error.name === 'TokenExpiredError'){
        return res.status(400).send({ message: "token expired please login again" });
    }
    if(error.name === 'JsonWebTokenError'){
        return res.status(400).send({ message: "invalid token" });
    }
    console.error(error);
    return res.status(500).send({ message: "internal server error" });
  }
};

const validateRefereshToken = (req,res,next) => {
    try {
        const authorizationHeader  = req.headers.authorization
        if(!authorizationHeader){
            return res.status(400).send({message : "authorization header required"})
        }
        const token = authorizationHeader.split(" ")[1]
        if(!token){
            return res.status(400).send({message : "token required"})
        }
        const decoded = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET)
        if(!decoded){
            return res.status(400).send({message : "token invalid"})
        }
        req.user = decoded
        next()
    } catch (error) {
        if(error.name === 'TokenExpiredError'){
            return res.status(400).send({ message: "token expired please login again" });
        }
        if(error.name === 'JsonWebTokenError'){
            return res.status(400).send({ message: "invalid token" });
        }
        console.log(error);
        return res.status(400).send({ message: error.message });
    }
}
module.exports = { validateAccessToken,validateRefereshToken }
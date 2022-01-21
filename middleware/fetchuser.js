const jwt = require('jsonwebtoken');

const myModule = require('../constants')
const JWT_SECRET = myModule.JWT_SECRET

const fetchuser = (req,res,next)=>{
    //Get the user from jwt token and add it to req object
    const token = req.header('auth-token');
    
    //check if token exists or not
    if(!token){
        res.status(401).send({error :"Plaese authenticate using valid token"})
    }

    try {
        const data = jwt.verify(token,JWT_SECRET)
        req.user = data.user;
        next(); 
    } catch (error) {
        res.status(401).send({error :"Plaese authenticate using valid token"})
    }
    
}

module.exports = fetchuser;
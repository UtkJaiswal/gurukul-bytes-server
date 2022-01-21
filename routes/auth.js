const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')
const upload = require('../middleware/upload')

const myModule = require('../constants')
const JWT_SECRET=myModule.JWT_SECRET

const app = express();
app.use('../uploads',express.static('uploads'))


//ROUTE 0: Route to test after deployment
router.get(
  //http://localhost:5000/api/auth/test
  "/test",(req,res)=>{
    return res.json("Test Successful");
  }
)

//ROUTE 1: Create a User using POST request:"/api/auth/createUser". No authentication required
router.post(
  "/createUser",upload.single('profile_picture'),
  [
    body("email", "Enter a valid E-mail").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success=false;
    let userExists=false;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("error=",errors)
      return res.status(400).json({ success,userExists,errors: errors.array() });
    }

    
    try {
      //check whether the user email already exists
      let user = await User.findOne({ email: req.body.email });
      userExists=true;
      if (user) {
        return res
          .status(400)
          .json({ success,userExists,error: "User with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);//generate salt to make password more secured
      const securedPassword = await bcrypt.hash(req.body.password,salt);
      //create a new user
      let path=""
      
      if(req.file){
        path=req.file.path;
        
      }
      user = await User.create({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        date_of_birth: req.body.date_of_birth,
        gender: req.body.gender,
        email: req.body.email,
        password: securedPassword,
        address: req.body.address,
        profile_picture:path
      });
      
      const data = {
        user:{
          id:user.id
        }
      }
      //sign the  token so that any other user cannot login into another users account
      const authToken = jwt.sign(data,JWT_SECRET)
      
      success=true;
      res.json({success,userExists,authToken});

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//ROUTE 2: Authenticate a User using POST request "/api/auth/login". No authentication required
router.post('/login',[
  body('email','Enter a valid email').isEmail(),  
  body('password','Password cannot be blank').exists()
],async(req,res)=>{
  let success=false
  let waitForFiveMinutes = false;
  

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors:errors.array()})
  }

  const {email,password} = req.body;
  try {
    let user = await User.findOne({email});
    //check if a user with given email exists or not
    if(!user) {
      success=false
      return res.status(400).json({success,waitForFiveMinutes,error:"Please use correct credentials"})
    }

    
    

    //compare the password
    const passwordCompare = await bcrypt.compare(password,user.password);
    
    //check if password of the user is  correct or not
    if(!passwordCompare) {
      success=false
    
      //count of wrong password attempts increased
      user.numberOfIncorrectLoginAttempts++;
      

      //check if user has already tried more than 2 times and the last attempt was not before 5 minutes
      const timeNow = new Date();
      const diffMs = timeNow - user.lastIncorrectLoginTime;
      const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
      //lastIncorrect login time updated to current time
      user.lastIncorrectLoginTime = new Date();
      const updatedUser = await User.findByIdAndUpdate(user._id,{$set:user},{new:true});
      if(user.numberOfIncorrectLoginAttempts>=3 &&  diffMins<5){
        waitForFiveMinutes=true;
        return res.status(400).json({success,waitForFiveMinutes,error:"Please use correct credentials"})
      }
      
      return res.status(400).json({success,waitForFiveMinutes,error:"Please use correct credentials"})
    }
    //since password is correct so we will now change numberOfIncorrectLoginAttempts to zero and lastIncorrect login time to default
    user.numberOfIncorrectLoginAttempts=0;
    user.lastIncorrectLoginTime = "2020-01-01";
    waitForFiveMinutes=false;
    const updatedUser = await User.findByIdAndUpdate(user._id,{$set:user},{new:true});
    const data = {
      user:{
        id:user.id
      }
    }
    //sign the  token so that any other user cannot login into another user's account
    const authtoken = jwt.sign(data,JWT_SECRET);
    success=true;
    res.json({success,authtoken})

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }

})


//ROUTE 3: Get User details using POST request "/api/auth/getuser". Authentication required
router.post('/getuser',fetchuser,async(req,res)=>{
  
  try {
      
      const userId=req.user.id
      const a = await User.findById(userId)
      
      if(a.email==='admin123@gmail.com'){
        const user = await User.find()
        res.send(user)
      }
      else{
        
        const user = await User.findById(userId)
        
        res.send([user])
        
      }
      
    
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }

})
 

module.exports = router;

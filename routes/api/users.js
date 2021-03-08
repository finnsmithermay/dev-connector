const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');
const gravatar = require('gravatar');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const normalize = require('normalize-url');

//@route   Get api/users
//@des     register user
//@access  Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({min:6})
],async (req, res) => {
    
     const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;

    try {
        
    //see if user exists 
        let user = await User.findOne({ email });

        if(user){
           return  res.status(400).json({errors: [{msg: 'User already exists'}]});
        }

    //get users gravatar
    const avatar = normalize(
        gravatar.url(email, {
          s: '200',
          r: 'pg',
          d: 'mm'
        }),
        { forceHttps: true }
      );
   
        user = new User({
            name,
            email,
            avatar,
            password
        });
    //Encrypt password 
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();
        
    //return json web token 

    const payload = {
        user:{
            id: user.id
        }
    }

    jwt.sign(
        payload, 
        config.get('jwtSecret'),
        {expiresIn: 360000}, //change to 3600 on deploy
        (err,token) => {
            if(err) throw err;
            res.json({token});
        }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
   




});

module.exports = router;
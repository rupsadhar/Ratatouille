const express = require('express');
const router = express.Router();
const {check, validationRequest} = require('express-validator/check');
const { validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const User = require('../../models/User');

// @route    POST api/users
// @desc     Register User
// @access   Public


router.post(
'/', 
[
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please Include a valid email').isEmail(),
    check('password', 'Please Enter a password with 8 or more characters').isLength({ min: 6 })
],
async (req, res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    
    const { name, email, password } = req.body;
    try{
        //see if users exists
        let user  = await User.findOne({email});
        if(user){
            res.status(400).json({ errors: ['user already exists'] });
        }

        //get user gravatar
        const avatar = gravatar.url(email, {
            s:'200',
            r:'pg',
            d:'mm'
        })

        user =new User({
            name,
            email,
            avatar,
            password
        });

        //Encrypt password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        //Return Json web token


        res.send('User Registered');

    } catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }

    


    res.send('User route');
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const Foodie = require('../../models/Foodie');

// @route    POST api/foodies
// @desc     Register Foodie
// @access   Public

router.post(
    '/',
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please Include a valid email').isEmail(),
    check(
        'password',
        'Please Enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;
        try {
            //see if foodie exists
            let foodie = await Foodie.findOne({ email });
            if (foodie) {
                return res
                    .status(400)
                    .json({ errors: ['foodie already exists'] });
            }

            //get foodies gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });

            foodie = new Foodie({
                name,
                email,
                avatar,
                password
            });

            //Encrypt password
            const salt = await bcrypt.genSalt(10);

            foodie.password = await bcrypt.hash(password, salt);

            await foodie.save();

            const payload = {
                foodie: {
                    id: foodie.id
                }
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;

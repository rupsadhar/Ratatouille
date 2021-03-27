const express = require('express');
const router = express.Router();
const foodieauth = require('../../middleware/foodieauth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const Foodie = require('../../models/Foodie');

// @route    GET api/foodieauth
// @desc     Test route
// @access   Private
router.get('/', foodieauth, async (req, res) => {
  try {
    const foodie = await Foodie.findById(req.foodie.id).select('-password');
    res.json(foodie);
  } catch {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/foodieauth
// @desc     Authenticate foodie and get token
// @access   Public
router.post(
  '/',
  check('email', 'Please Include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      //see if foodie exists
      let foodie = await Foodie.findOne({ email });
      if (!foodie) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, foodie.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const payload = {
        foodie: {
          id: foodie.id,
        },
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

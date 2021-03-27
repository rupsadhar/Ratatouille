const express = require('express');
const router = express.Router();
const chefauth = require('../../middleware/chefauth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const Chef = require('../../models/Chef');

// @route    GET api/chefauth
// @desc     Test route
// @access   Private

router.get('/', chefauth, async (req, res) => {
  try {
    const chef = await Chef.findById(req.chef.id).select('-password');
    res.json(chef);
  } catch {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/chefauth
// @desc     Authenticate chef and get token
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
      //see if chef exists
      let chef = await Chef.findOne({ email });
      if (!chef) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, chef.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const payload = {
        chef: {
          id: chef.id,
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

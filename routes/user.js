const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../model/User");
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post(
  "/signup",
  [
    check("username", "Please Enter a Valid Username")
      .not()
      .isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({
      //   errors: errors.array()
      // });
      res.render('signup', {error: errors.errors})
      return;
    }

    const { username, email, password, isOrganizer } = req.body;
    try {
      let user = await User.findOne({
        email
      });
      if (user) {
        // return res.status(400).json({
        //   msg: "User Already Exists"
        // });
        res.render('signup', { errorM: "User Already Exists" })
        return;
      }

      user = new User({
        username,
        email,
        password,
        isOrganizer
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 10000
        },
        (err, token) => {
          if (err) throw err;
          // res.status(200).json({
          //   token
          // });
          res.render('home', {message: "User Created Successfully", lister: user.isOrganizer});
        }
      );
    } catch (err) {
      console.log(err.message);
      // res.status(500).send("Error in Saving");
      res.render('signup', { errorM: err.message.stringify })
    }
  }
);

router.post(
  "/login",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // return res.status(400).json({
      //   errors: errors.array()
      // });
      res.render('login', {error: errors.errors})
      return;
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({
        email
      });
      if (!user)
        // return res.status(400).json({
        //   message: "User Not Exist"
        // });
        
        return res.render('login', {errorM: "User Not Exist"});
        // return;

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        // return res.status(400).json({
        //   message: "Incorrect Password !"
        // });
        return res.render('login', {errorM: "Incorrect Password"});

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 3600
        },
        (err, token) => {
          if (err) throw err;
          // res.status(200).json({
          //   token
          // });
          res.render('home', { message: `Welcome ${user.username}`, lister: user.isOrganizer })
        }
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: "Server Error"
      });
    }
  }
);

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
});

module.exports = router;
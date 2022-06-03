const express = require("express");
const { check, validationResult } = require("express-validator/check");
const router = express.Router();
const Event = require("../model/Event");
const auth = require("../middleware/auth");
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post(
    "/createEvent",
    [
      check("name", "Please Enter a Valid Name")
        .not()
        .isEmpty(),
      check("date", "Please enter a valid date").isDate()
    ], auth, 
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('createEvent', {error: errors.errors})
        return;
      }
  
      const { name, date } = req.body;
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
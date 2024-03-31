const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const validator = require("validator");
var config = require("config");

exports.register = async (req, res, next) => {
  try {
    let { email, password, firstName, lastName, address, phoneNo, city } =
      req.body;
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "User Already exist",
      });
    } else
      if (!email || !password || !phoneNo) {
        return res.status(400).json({
          message: "All required Feild must be filled",
        });
      } else if (!validator.isEmail(email)) {
        return res.status(400).json({
          message: "Email is not valid",
        });
      } else if (!validator.isStrongPassword(password)) {
        return res.status(400).json({
          message: "password is not strong enough",
        });
      } else {
        let salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        user = await User.create({
          email,
          password,
          firstName,
          lastName,
          address,
          phoneNo,
          city,
        });
        const token = jwt.sign(
          {
            _id: user._id,
            email: user.email,
            role: "user",
          },
          config.get("jwtPrivateKey")
        );

        return res
          .status(200)
          .cookie("token", token, {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true,
          })
          .json({
            user,
            token,
            message: "success",
          });
      }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email }).select("+password");

    if (!email) {
      return res.status(400).json({
        message: "Please Enter Email",
      });
    } else if (!email || !password) {
      return res.status(400).json({
        message: "Please Enter Password",
      });
    } else if (!user) {
      return res.status(400).json({
        message: "User not exist",
      });
    } else {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({
          message: "Incorrect Password",
        });
      } else {
        const token = jwt.sign(
          {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: "user",
          },
          config.get("jwtPrivateKey")
        );
        return res
          .status(200)
          .cookie("token", token, {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: false,
          })
          .json({
            message: "success",
            token,
            user,
          });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.viewUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      user,
    });
  } catch (err) { }
};
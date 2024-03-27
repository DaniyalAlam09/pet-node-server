// middleware/authMiddleware.js
const User = require("../models/User");
const jwt = require('jsonwebtoken');
const config = require("config");

exports.isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Missing token.' });
  }

  try {
    const user = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = await User.findById(user._id);

    next();
  } catch (error) {
    res.status(401).json({ message: 'Access denied. Invalid token.' });
  }
};



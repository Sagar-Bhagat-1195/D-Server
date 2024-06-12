const router = require('express').Router();
const jwt = require('jsonwebtoken');
// const User = require('path/to/your/user/model'); // Replace with the actual path
const User = require("./user.model");

// Define your JWT secret
const JWT_SECRET_KEY =
  process.env.REACT_APP_JWT_SECRET || "your_default_secret_here";
console.log("JWT_SECRET_KEY :" + JWT_SECRET_KEY);

const fetchUser = async (req, res, next) => {
  // Get the token from the header
  const token = req.header('auth-token');

  // Check if token doesn't exist
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET_KEY);

    // Fetch the user using the decoded token payload
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    // Attach the user object to the request for later use
    req.userId = decoded.id;
    next(); // Move to the next middleware or route handler
  } catch (err) {
    console.error(err.message);
    res.status(401).send('please authentication valid token...');
  }
};

module.exports = fetchUser;
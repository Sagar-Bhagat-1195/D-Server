const router = require("express").Router();
const jwt = require("jsonwebtoken");
// const Admin = require('path/to/your/admin/model'); // Replace with the actual path
const Super_Admin = require("./superadmin.model");

// Define your JWT secret
const JWT_SECRET_KEY =
  process.env.REACT_APP_JWT_SECRET || "your_default_secret_here";
console.log("JWT_SECRET_KEY :" + JWT_SECRET_KEY);

const fetchAdmin = async (req, res, next) => {
  // Get the token from the header
  const token = req.header("auth-token");

  // Check if token doesn't exist
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET_KEY);

    // Fetch the admin using the decoded token payload
    const admin = await Super_Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({ msg: "Super Admin not found" });
    }
    // Attach the admin object to the request for later use
    req.Super_AdminId = decoded.id;
    next(); // Move to the next middleware or route handler
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: err.message });
  }
};

module.exports = fetchAdmin;

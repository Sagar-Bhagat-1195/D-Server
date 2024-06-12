const bcrypt = require("bcrypt");
const USER = require("./user.model");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
// Load environment variables if not already loaded (for development)

// Load environment variables if not already loaded (for development)
// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }

// const JWT_SECRET_KEY = process.env.REACT_APP_JWT_SECRET;
// Define your JWT secret
const JWT_SECRET_KEY =
  process.env.REACT_APP_JWT_SECRET || "your_default_secret_here";
console.log("JWT_SECRET :" + JWT_SECRET_KEY);

exports.SignUp = async function (req, res, next) {
  try {
    // if(!req.body || !req.body.name || !req.body.email || !req.body.password){
    //     throw new Error("Please enter valid fields")
    // }

    // Validate input fields
    await body("name", "Enter a valid name")
      .notEmpty()
      .isLength({ min: 1, max: 20 })
      .run(req);
    await body("phone", "Enter a valid phone number")
      .notEmpty()
      .isNumeric()
      .isLength({ min: 10, max: 10 })
      .run(req);
    await body("email", "Enter a valid email").notEmpty().isEmail().run(req);
    await body("password", "Password must be at least 8 characters")
      .notEmpty()
      .isLength({ min: 8, max: 12 })
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // const { name, phone, email, password } = req.body;
    // console.log(req.body.email);
    let existing_Admin = await USER.findOne({ email: req.body.email });

    if (existing_Admin) {
      return res
        .status(400)
        .json({ error: "Admin with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    req.body.password = bcrypt.hashSync(req.body.password, salt);
    // req.body.password = bcrypt.hashSync(req.body.password, 10);

    console.log("req.adminId :" + req.adminId); // Set USER ADMIN ID
    req.body.admin_owner = req.adminId; // Set USER ADMIN ID
    const newUser = await USER.create(req.body);
    // console.log(newUser);

    console.log("newUser._id :" + newUser._id);
    // Signing JWT with an object as payload
    // const userId =newUser._id;
    // const authToken = jwt.sign({userId}, JWT_SECRET_KEY);
    const authToken = jwt.sign({ id: newUser._id }, JWT_SECRET_KEY);

    // console.log("authToken :" + authToken);
    res.status(201).json({
      message: "Success",
      data: newUser,
      authToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.Login = async function (req, res, next) {
  try {
    // if (!req.body.email || !req.body.password) {
    //   throw new Error("Please enter valid fields");
    // }

    // Validate input fields
    // await body("name", "Enter a valid name")
    //   .notEmpty()
    //   .isLength({ min: 1, max: 20 })
    //   .run(req);
    await body("email", "Enter a valid email").notEmpty().isEmail().run(req);
    await body("password", "Password must be at least 8 characters")
      .notEmpty()
      .isLength({ min: 8, max: 12 })
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const checkUser = await USER.findOne({ email: req.body.email.toLowerCase() });

    if (!checkUser) {
      throw new Error("Please enter valid email");
    }

    let checkPass = bcrypt.compareSync(req.body.password, checkUser.password);

    if (!checkPass) {
      throw new Error("Please enter valid password");
    }
    const authToken = jwt.sign({ id: checkUser._id }, JWT_SECRET_KEY);
    res.status(201).json({
      message: "Success",
      data: checkUser,
      authToken,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

exports.AllUsers = async function (req, res, next) {
  if (req.params.id) {
    console.log("User ID :" + req.params.id);
  }

  try {
    var allusers = [];
    if (req.params.id) {
      // allusers = await USER.findById(req.params.id);
      allusers = await USER.findById(req.params.id)
        .where("admin_owner")
        .equals(req.adminId);
    } else {
      // allusers = await USER.find().select("name phone");
      allusers = await USER.find({ admin_owner: req.adminId }).select(
        "name phone email"
      );
    }
    console.log("allUsers :", allusers);
    console.log(" req.adminId :" + req.adminId);

    if (Array.isArray(allusers) && allusers.length === 0) {
      // allUsers is an empty array
      // Your code here
      // allusers = { User: "users not Available " };
      res.status(201).json({
        message: "users not Available",
        userdata: [],
      });
    } else {
      res.status(201).json({
        message: "Success",
        userdata: allusers,
      });
    }
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

// exports.UpdateUserProfile = async function (req, res, next) {
//   console.log("UpdateUserProfile");
//   try {
//     console.log(req.userId);
//     // let user = await USER.findByIdAndUpdate(req.userId, req.body, {new: true})
//     let oldData = {};
//     let user = await USER.findById(req.userId);
//     oldData = { ...user._doc };
//     user.set(req.body);
//     await user.save();

//     res.status(201).json({
//       message: "Success",
//       data: user,
//       oldData,
//     });
//   } catch (error) {
//     res.status(404).json({
//       message: error.message,
//     });
//   }
// };

exports.UpdateUserProfile = async function (req, res, next) {
  console.log("UpdateUserProfile"); // Logging
  try {
    console.log(req.params.id); // Logging user ID being updated

    let oldData = {}; // Initialize variable to store old user data

    // Find user by ID
    let user = await USER.findById(req.params.id);

    if (!user) {
      // If user is not found, send a 404 response
      return res.status(404).json({ message: "User not found" });
    }

    // Store current user data in oldData before updating
    oldData = { ...user._doc };

    // Update user data with new data from request body
    user.set(req.body);

    // Save the updated user data
    await user.save();

    // Respond with success message, updated user data, and old data
    res.status(200).json({
      message: "User profile updated successfully",
      data: user,
      oldData,
    });
  } catch (error) {
    // If an error occurs, respond with error message
    console.error("Error updating user profile:", error);
    res.status(500).json({
      message: "Failed to update user profile",
      error: error.message,
    });
  }
};

exports.DeleteUser = async function (req, res, next) {
  try {
    const data = await USER.findByIdAndDelete(req.params.id);

    res.status(201).json({
      message: "Success",
      data: data,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

exports.UserImage = async function (req, res, next) {
  try {
    console.log(req.file);
    const data = await USER.findByIdAndUpdate(req.userId, {image: req.file.filename});

    res.status(201).json({
      message: "Success",
      data
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

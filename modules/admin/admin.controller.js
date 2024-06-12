const bcrypt = require("bcrypt");
const ADMIN = require("./admin.model");
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
    console.log(req.body.email);
    let existing_Admin = await ADMIN.findOne({ email: req.body.email });

    if (existing_Admin) {
      return res
        .status(400)
        .json({ error: "Admin with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    req.body.password = bcrypt.hashSync(req.body.password, salt);
    // req.body.password = bcrypt.hashSync(req.body.password, 10);

    const newAdmin = await ADMIN.create(req.body);
    console.log(newAdmin);

    console.log("newAdmin._id :" + newAdmin._id);
    // Signing JWT with an object as payload
    // const userId =newAdmin._id;
    // const authToken = jwt.sign({userId}, JWT_SECRET_KEY);
    const authToken = jwt.sign({ id: newAdmin._id }, JWT_SECRET_KEY);

    // console.log("authToken :" + authToken);
    res.status(201).json({
      message: "Success",
      data: newAdmin,
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
    await body("email", "Enter a valid email").notEmpty().isEmail().run(req);
    await body("password", "Password must be at least 8 characters")
      .notEmpty()
      .isLength({ min: 8, max: 12 })
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const checkUser = await ADMIN.findOne({ email: req.body.email });

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

exports.Update = async function (req, res, next) {
  try {
    // if(!req.body || !req.body.name || !req.body.email || !req.body.password){
    //     throw new Error("Please enter valid fields")
    // }

    // Validate input fields
    await body("name", "Enter a valid name")
      .isLength({ min: 1, max: 20 })
      .run(req);
    await body("phone", "Enter a valid phone number")
      .isNumeric()
      .isLength({ min: 10, max: 10 })
      .run(req);
    await body("email", "Enter a valid email").isEmail().run(req);
    await body("password", "Password must be at least 8 characters")
      .isLength({ min: 8, max: 12 })
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const salt = await bcrypt.genSalt(10);
    req.body.password = bcrypt.hashSync(req.body.password, salt);
    // req.body.password = bcrypt.hashSync(req.body.password, 10);

    // const { name, phone, email, password } = req.body;

    // let Update_Admin = await ADMIN.findByIdAndUpdate(req.adminId, req.body, {
    //   new: true,
    // });
    let old_Admin_Data = {};
    let Admin = await ADMIN.findById(req.adminId);
    old_Admin_Data = { ...Admin._doc };
    Admin.set(req.body);
    await Admin.save();

    // console.log("authToken :" + authToken);
    res.status(201).json({
      // message: "Success",
      // Update_Admin: Update_Admin,
      old_Admin_Data,
      data: Admin,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.AllAdmin = async function (req, res, next) {
  try {
    let allAdmin = [];
    if (req.params.id) {
      allAdmin = await ADMIN.findById(req.params.id);
    } else {
      allAdmin = await ADMIN.find().select("name phone");
    }
    res.status(201).json({
      message: "Success",
      data: allAdmin,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

exports.DeleteAdmin = async function (req, res, next) {
  try {

    let allAdmin = await ADMIN.findByIdAndDelete(req.params.id);

    res.status(201).json({
      message: "Success",
      data: allAdmin,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

var express = require("express");
var router = express.Router();
const adminController = require("./admin.controller");
const AdminSecure = require("../admin/admin.secure");
const super_AdminSecure = require("../superadmin/superadmin.secure");

/* GET home page. */
// router.get('/', function(req, res, next) {
//     //   res.render('index', { title: 'Express' });
//     res.send("Test")
// });

// router.get('/', function(req, res, next) {
//       res.render('index', { title: 'Express', data: [10, 20, 30] });
// });

router.post("/signup", super_AdminSecure, adminController.SignUp);
router.post("/login", adminController.Login);
router.put("/update", AdminSecure, adminController.Update);

//  Admin Protect Routes
router.get("/all/:id?", super_AdminSecure, adminController.AllAdmin);
router.delete("/:id", AdminSecure, adminController.DeleteAdmin);

module.exports = router;

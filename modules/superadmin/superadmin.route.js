var express = require("express");
var router = express.Router();
const super_adminController = require("./superadmin.controller");
const super_AdminSecure = require("../superadmin/superadmin.secure");

/* GET home page. */
// router.get('/', function(req, res, next) {
//     //   res.render('index', { title: 'Express' });
//     res.send("Test")
// });

// router.get('/', function(req, res, next) {
//       res.render('index', { title: 'Express', data: [10, 20, 30] });
// });

router.post("/signup", super_adminController.SignUp);
router.post("/login", super_adminController.Login);
router.put("/update", super_AdminSecure, super_adminController.Update);

//  Admin Protect Routes
router.get("/all/:id?", super_AdminSecure, super_adminController.AllAdmin);
router.delete('/:id', super_AdminSecure, super_adminController.DeleteAdmin);

module.exports = router;

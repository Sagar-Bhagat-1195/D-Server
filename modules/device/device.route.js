var express = require("express");
var router = express.Router();
const deviceController = require("./device.controller");
// const AdminSecure = require("../admin/admin.secure");
const UserSecure = require('../user/user.secure')

/* GET home page. */
// router.get('/', function(req, res, next) {
//     //   res.render('index', { title: 'Express' });
//     res.send("Test")
// });

// router.get('/', function(req, res, next) {
//       res.render('index', { title: 'Express', data: [10, 20, 30] });
// });

router.post("/:roomId?",UserSecure, deviceController.adddevice);
router.put("/:roomId?/:deviceId?", UserSecure, deviceController.UpdateDevice);


router.get("/:roomId?/:deviceId?", UserSecure, deviceController.GetDevice);
router.delete("/:roomId?/:deviceId?", UserSecure, deviceController.DeleteDevice);

module.exports = router;

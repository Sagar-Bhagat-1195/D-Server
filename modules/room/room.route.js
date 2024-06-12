var express = require("express");
var router = express.Router();
const roomController = require("./room.controller");
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

router.post("/addroom",UserSecure, roomController.AddRoom);
router.get("/all/:id?",UserSecure, roomController.GetRoom);


router.put('/:id', UserSecure, roomController.UpdateRoom);
router.delete('/:id', UserSecure, roomController.DeleteRoom);

module.exports = router;

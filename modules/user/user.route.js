var express = require("express");
var router = express.Router();
const userController = require("./user.controller");
const AdminSecure = require("../admin/admin.secure");
const UserSecure = require("./user.secure");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/users')
    },
    filename: function (req, file, cb) {
        console.log(file);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })
  

/* GET home page. */
// router.get('/', function(req, res, next) {
//     //   res.render('index', { title: 'Express' });
//     res.send("Test")
// });

// router.get('/', function(req, res, next) {
//       res.render('index', { title: 'Express', data: [10, 20, 30] });
// });

router.post("/signup", AdminSecure, userController.SignUp);
router.post("/login", userController.Login);
// router.put("/update", UserSecure, userController.UpdateUserProfile);
router.put("/update/:id?", AdminSecure, userController.UpdateUserProfile);

// User Protect Routes
router.get("/all/:id?", AdminSecure, userController.AllUsers);
router.delete("/:id", AdminSecure, userController.DeleteUser);

router.post("/image", UserSecure, upload.single("image"), userController.UserImage);
// http://localhost:3000/user/all/65e01f509b1b8d20f9ffd6fa //req.params.id

// router.get('/all', AdminSecure, userController.AllUsers); //req.query.id
// http://localhost:3000/user/all?id=65e01f509b1b8d20f9ffd6fa&name=John%20Doe

module.exports = router;

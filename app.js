// Database
require("./db/conn");
require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

const socketio = require("socket.io");


var indexRouter = require("./routes/index");

var superAdminRouter = require("./modules/superadmin/superadmin.route");
var adminRouter = require("./modules/admin/admin.route");
var userRouter = require("./modules/user/user.route");
var roomRouter = require("./modules/room/room.route");
var deviceRouter = require("./modules/device/device.route");
const { setupSocket } = require("./utilities/socket/socketSetup");

var app = express();
app.use(cors())

// Socket.io
const server = require('http').createServer(app);
const io = socketio(server);

setupSocket(io)

app.use(function (req, res, next) {
  req.io = io
  next();
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/superAdmin", superAdminRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/room", roomRouter);
app.use("/device", deviceRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// module.exports = app;
module.exports = { app, server };

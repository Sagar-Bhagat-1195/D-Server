const mongoose = require("mongoose");
// const Room = require("./Room");

const SuperAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const SuperAdmin = mongoose.model("SuperAdmin", SuperAdminSchema);

module.exports = SuperAdmin;

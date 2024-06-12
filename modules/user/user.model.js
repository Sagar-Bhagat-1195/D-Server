const mongoose = require("mongoose");
// const Room = require("./Room");
const roomSchema = require("../room/room.model");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    image: String,
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
    },
    admin_owner: {
      type: String,
    },
    // rooms: {
    //   type: [mongoose.Schema.Types.ObjectId], // Assuming you're referencing the Room by its ObjectId
    //   ref: "roomSchema", // Reference to the Room model
    //   default: [],
    // },
    rooms: {
      type: [roomSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;

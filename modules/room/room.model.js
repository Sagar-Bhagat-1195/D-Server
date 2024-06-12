// backend/models/Room.js
const mongoose = require("mongoose");
const deviceSchema = require("../device/device.model");

const RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    devices: {
      type: [deviceSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// const Room = mongoose.model("Room", RoomSchema);

module.exports = RoomSchema;

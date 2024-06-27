// const ROOM = require("./room.model");
const USER = require("../user/user.model");
// Assuming you have a Device model based on deviceSchema
// const DEVICE = require("./device.model");
const { body, validationResult } = require("express-validator");

// const { setupSocket } = import("../../utilities/socket");

// Call the setupSocket function
// const io = setupSocket();

exports.adddevice = async function (req, res, next) {
  try {
    console.log(req.io);
    console.log("ADD NEW Device REQUEST: ", req.body);
    if (!req.params.roomId)
      return res.status(400).json({ msg: "No room id provided" });

    const roomId = req.params.roomId;
    // console.log("roomId :", roomId);

    // Validate input fields
    await Promise.all([
      body("name", "Enter a valid Device name")
        .isLength({ min: 1, max: 20 })
        .run(req),
      body("type", "Enter a valid Device type")
        .isLength({ min: 1, max: 20 })
        .run(req),
      body("state", "Enter a valid Device state").isBoolean().run(req),
      body("value", "Enter a valid Device number").isNumeric().run(req),
      body("min_value", "Enter a valid Device number").isNumeric().run(req),
      body("max_value", "Enter a valid Device number").isNumeric().run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userToUpdate = await USER.findById(req.userId);
    if (!userToUpdate) {
      return res.status(400).json({ msg: "User not found" });
    }

    // console.log("userToUpdate :" + userToUpdate);

    const roomToUpdate = userToUpdate.rooms.find((room) => room.id === roomId);
    if (!roomToUpdate) {
      return res.status(401).json({ msg: "Unauthorized access to this room" });
    }
    // console.log("roomToUpdate :" + roomToUpdate);

    const NewDevice = {
      user_owner: userToUpdate._id,
      room_owner: roomId,
      name: req.body.name,
      type: req.body.type,
      state: req.body.state || false,
      stateLog: [
        {
          // time: new Date(),
          state: req.body.state || false,
        },
      ],
      value: isNaN(parseFloat(req.body.value))
        ? ""
        : parseFloat(req.body.value),
      valueLog: [
        {
          // time: new Date(),
          value: req.body.value || "",
        },
      ],
      min_value: isNaN(parseInt(req.body.min_value))
        ? NaN
        : parseInt(req.body.min_value),
      max_value: isNaN(parseInt(req.body.max_value))
        ? NaN
        : parseInt(req.body.max_value),
    };

    // Push the new device into the devices array of the target room
    roomToUpdate.devices.push(NewDevice);

    // Save the updated user document
    const updatedUser = await userToUpdate.save();
    if (req.io) {
      req.io.emit("rooms", { rooms: updatedUser.rooms })
    }
    res.status(201).json(updatedUser);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
};

exports.UpdateDevice = async function (req, res, next) {
  console.log("UpdateDevice");
  try {
    // Find the user by userId
    const userToUpdate = await USER.findById(req.userId);
    if (!userToUpdate) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Get the roomId and deviceId from the request parameters
    const roomId = req.params.roomId;
    const deviceId = req.params.deviceId;

    // Check if roomId and deviceId are provided
    if (!roomId || !deviceId) {
      return res.status(400).json({ msg: "RoomId or deviceId not provided" });
    }

    // Find the room to update in the user's rooms array
    const roomToUpdate = userToUpdate.rooms.find((room) => room.id === roomId);
    if (!roomToUpdate) {
      return res.status(401).json({ msg: "Unauthorized access to this room" });
    }

    // Find the device to update in the room's devices array
    const deviceToUpdate = roomToUpdate.devices.find(
      (device) => device.id === deviceId
    );
    if (!deviceToUpdate) {
      return res.status(404).json({ msg: "Device not found in this room" });
    }

    // Print the devices array for debugging
    console.log("Devices in the room:", roomToUpdate.devices);

    // Update device properties with the data from req.body
    Object.assign(deviceToUpdate, req.body);

    // Update stateLog if state changes
    if (deviceToUpdate.isModified("state")) {
      deviceToUpdate.stateLog.push({
        time: new Date(),
        state: deviceToUpdate.state,
      });
    }

    // Update valueLog if value changes
    if (deviceToUpdate.isModified("value")) {
      deviceToUpdate.valueLog.push({
        time: new Date(),
        value: deviceToUpdate.value,
      });
    }

    // Save the updated user document
    const updatedUser = await userToUpdate.save();

    if (req.io) {
      req.io.emit("rooms", { rooms: updatedUser.rooms }) // Api Call Socket Set
    }

    //  updatedUser = updatedUser.rooms.find((room) => room.id === roomId);

    res.status(200).json({ devices: roomToUpdate.devices });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.DeleteDevice = async function (req, res, next) {
  console.log("DeleteDevice");
  try {
    // Find the user by userId
    const userToUpdate = await USER.findById(req.userId);
    if (!userToUpdate) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Get the roomId and deviceId from the request parameters
    const roomId = req.params.roomId;
    const deviceId = req.params.deviceId;

    // Check if roomId and deviceId are provided
    if (!roomId || !deviceId) {
      return res.status(400).json({ msg: "RoomId or deviceId not provided" });
    }

    // Find the room to update in the user's rooms array
    const roomToUpdate = userToUpdate.rooms.find((room) => room.id === roomId);

    if (!roomToUpdate) {
      return res.status(401).json({ msg: "Unauthorized access to this room" });
    }

    // // Find the index of the device to update in the room's devices array
    const index = roomToUpdate.devices.findIndex(
      (device) => device.id === deviceId
    );

    console.log("roomToUpdate index", index);

    // // If the device is not found, return 404
    if (index === -1) {
      return res.status(404).json({ msg: "Device not found in this room" });
    }

    // // Remove the device from the array
    const deletedDevice = roomToUpdate.devices.splice(index, 1); // Extract the deleted device

    // Save the changes to the room, suppressing the warning
    await userToUpdate.save({ suppressWarning: true });

    if (req.io) {
      req.io.emit("rooms", { rooms: userToUpdate.rooms })
    }

    // Print the updated devices array for debugging
    console.log("Devices in the room:", roomToUpdate.devices);

    res.status(200).json({ deletedDevice: deletedDevice });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.GetDevice = async function (req, res, next) {
  console.log("GetDevice");
  try {
    // Find the user by userId
    const userToUpdate = await USER.findById(req.userId);
    if (!userToUpdate) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Get the roomId and deviceId from the request parameters
    const roomId = req.params.roomId;
    const deviceId = req.params.deviceId;

    // Check if roomId is provided
    if (!roomId) {
      return res.status(400).json({ msg: "RoomId not provided" });
    }

    // Find the room to update in the user's rooms array
    const roomToUpdate = userToUpdate.rooms.find((room) => room.id === roomId);

    if (!roomToUpdate) {
      return res.status(401).json({ msg: "Unauthorized access to this room" });
    }

    // If deviceId is provided, retrieve the specific device
    if (deviceId) {
      // Find the device by deviceId
      const deviceToUpdate = roomToUpdate.devices.find(
        (device) => device.id === deviceId
      );
      if (!deviceToUpdate) {
        return res.status(404).json({ msg: "Device not found in this room" });
      }
      return res.status(200).json({ device: deviceToUpdate });
    } else {
      // If deviceId is not provided, return all devices in the room
      return res.status(200).json({ devices: roomToUpdate.devices });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// const ROOM = require("./room.model");
const USER = require("../user/user.model");
const { body, validationResult } = require("express-validator");

exports.AddRoom = async function (req, res, next) {
  try {
    console.log("ADD NEW ROOM REQUEST: ", req.body);

    // Validate input fields
    await body("name", "Enter a valid Room name")
      .notEmpty()
      .isLength({ min: 1, max: 20 })
      .run(req);
    await body("type", "Enter a valid Room type")
      .notEmpty()
      .isLength({ min: 1, max: 20 })
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user already exists in database
    const existingUser = await USER.findById(req.userId);
    if (!existingUser) {
      return res.status(400).send("Invalid User ID.");
    }

    // Create a new room instance
    // const roomData = new ROOM(req.body);
    const roomData = req.body;

    // Associate room with the user
    existingUser.rooms.push(roomData);

    // Save the updated user document
    await existingUser.save();

    // Respond to request
    res.status(200).json(existingUser.rooms[existingUser.rooms.length - 1]);

    // Send response with status code and data
    // res.status(201).json(roomData);
  } catch (err) {
    console.error(`Error in addRoom: ${err}`);
    res.status(500).json({ err: "Server error" });
  }
};

exports.GetRoom = async function (req, res, next) {
  // console.log("Get All Room :)");
  try {
    // Check if user already exists in database
    const existingUser = await USER.findById(req.userId);
    console.log(existingUser);
    if (req.params.id) {
      console.log("Room ID :" + req.params.id);
      // Associate room with the user
      const currentRoom = existingUser.rooms.find(
        (item) => item._id == req.params.id
      );
      // Check if the room is found
      if (currentRoom) {
        console.log(currentRoom);
        // Respond to request with the found room
        return res.status(200).json({ data: currentRoom });
      } else {
        // If the room is not found, respond with an appropriate message
        return res.status(404).json({ error: "Room not found" });
      }
    } else {
      if (existingUser) {
        return res.status(200).json({ rooms: existingUser.rooms });
      } else {
        // If the user is not found, respond with an appropriate message
        return res.status(404).json({ error: "User not found" });
      }
    }
  } catch (err) {
    console.error(`Error in GetRoom: ${err}`);
    // If an error occurs, respond with an internal server error message
    return res.status(500).json({ error: "Server error" });
  }
};

exports.DeleteRoom = async function (req, res, next) {
  console.log("Delete Room:)");
  try {
    // Check if user already exists in database
    const existingUser = await USER.findById(req.userId);
    console.log(existingUser);
    if (existingUser) {
      console.log("Room ID :" + req.params.id);
      // Find the index of the room to be deleted
      const roomIndex = existingUser.rooms.findIndex(
        (item) => item._id == req.params.id
      );
      // Check if the room exists
      if (roomIndex !== -1) {
        // Remove the room from the user's rooms array
        existingUser.rooms.splice(roomIndex, 1);
        // Save the updated user object
        await existingUser.save();
        // Respond with a success message
        return res.status(200).json({ message: "Room deleted successfully" });
      } else {
        // If the room is not found, respond with an appropriate message
        return res.status(404).json({ error: "Room not found" });
      }
    } else {
      // If the user is not found, respond with an appropriate message
      return res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error(`Error in DeleteRoom: ${err}`);
    // If an error occurs, respond with an internal server error message
    return res.status(500).json({ error: "Server error" });
  }
};

exports.UpdateRoom = async function (req, res, next) {
  console.log("Update Room:)");
  try {
    // Check if user already exists in the database
    const existingUser = await USER.findById(req.userId);
    console.log(existingUser);
    if (existingUser) {
      console.log("Room ID: " + req.params.id);
      // Find the index of the room to be updated
      const roomIndex = existingUser.rooms.findIndex(
        (item) => item._id == req.params.id
      );
      // Check if the room exists
      if (roomIndex !== -1) {
        // Update the room with the new data
        // existingUser.rooms[roomIndex].name = req.body.name; // Assuming name is the property to be updated

        // Update the room with the new data
        if (req.body.name) existingUser.rooms[roomIndex].name = req.body.name;
        if (req.body.type) existingUser.rooms[roomIndex].type = req.body.type;

        // Save the updated user object
        await existingUser.save();
        // Respond with a success message and the updated room data
        return res.status(200).json({
          message: "Room updated successfully",
          data: existingUser.rooms[roomIndex],
        });
      } else {
        // If the room is not found, respond with an appropriate message
        return res.status(404).json({ error: "Room not found" });
      }
    } else {
      // If the user is not found, respond with an appropriate message
      return res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error(`Error in UpdateRoom: ${err}`);
    // If an error occurs, respond with an internal server error message
    return res.status(500).json({ error: "Server error" });
  }
};

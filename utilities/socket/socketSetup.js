// backend/middleware/socketSetup.js
const User = require("../../modules/user/user.model");
// const { handleNewDeviceAdded } = require("../middleware/NewDeviceAdded");
const jwt = require("jsonwebtoken");
// const { handleNewRoomAdded } = require("./NewRoomAdded");

let user;

const JWT_SECRET =
  process.env.REACT_APP_JWT_SECRET || "your_default_secret_here";

async function verifyUserToken(socket) {
  const token = socket.handshake.query.Authorization;
  try {
    if (!token) {
      throw new Error("Authentication error: Invalid token");
    }
    let decoded = await jwt.verify(token, JWT_SECRET);
    socket.userId = decoded?.id;
    return true;
  } catch (error) {
    socket.emit("verifyError", { message: error.message });
    return false;
  }
}

let connectedUsers = [];

function setupSocket(io) {
  io.on("connection", async (socket) => {
    await verifyUserToken(socket);

    console.log("User Connected");

    if (!connectedUsers.includes(socket.userId)) {
      connectedUsers.push(socket.userId);
    }

    const userId = socket.userId; // Replace with the actual user ID
    user = await User.findById(userId);
    let allRooms = user?.rooms || [];

    socket.emit("rooms", { rooms: allRooms });

    // Handle 'NewRoom Added' event

    // Listening for the "AddNewRoom_Socket" event
    socket.on("AddNewRoom_Socket", async (data) => {
      // Extracting name and type properties from the data object
      const { name, type } = data;

      // Here, you would typically perform actions related to the new room being added
      console.log(`New room added with Name: ${name}, Type: ${type}`);

      // For example, you might want to emit an event to notify clients that a new room has been added
      // io.emit("newRoomAdded", { id });

      // You can also perform additional asynchronous tasks such as database operations
      try {
        // For instance, you might want to save information about the new room to a database
        // await Room.create({ id }); // Assuming you have a model named Room and a method create to add a new room
        console.log("New room saved to the database.");
      } catch (error) {
        console.error("Error saving new room to the database:", error);
      }
    });

    // Assuming you have initialized socket.io on the server-side

    // Handle the "handle_SwitchToggle" event
    // socket.on("handle_SwitchToggle", async (data) => {
    //   try {
    //     // Extract the necessary data
    //     const { state } = data;
    //     const { deviceId } = data;

    //     // Do something with the received state
    //     console.log("Received switch state:", state);
    //     console.log("Received deviceId :", deviceId);

    //     // Perform any desired actions based on the received state
    //     // For example, update the device state in the database or trigger some other functionality
    //   } catch (error) {
    //     console.error("Error handling 'handle_SwitchToggle' event:", error);
    //   }
    // });

    socket.on("handle_SwitchToggle", async (data) => {
      try {
        user = await User.findById(userId);
        // Extract the necessary data
        const { roomId, deviceId, state } = data;
        console.log("Received switch state:", state);
        console.log("Received deviceId:", deviceId);
        console.log("Received roomId:", roomId);

        // Assuming you have access to the user object via middleware or elsewhere
        // const userId = socket.userId; // Replace with the actual user ID
        let userToUpdate = user; // Assuming you have access to the user object

        if (!userToUpdate) {
          // Ensure the user exists
          return console.error("User not found");
        }

        // Find the room to update in the user's rooms array
        const roomToUpdate = userToUpdate.rooms.find(
          (room) => room.id === roomId
        );
        if (!roomToUpdate) {
          // Ensure the user has access to the room
          return console.error("Unauthorized access to this room");
        }

        // Find the device to update in the room's devices array
        const deviceToUpdate = roomToUpdate.devices.find(
          (device) => device.id === deviceId
        );
        if (!deviceToUpdate) {
          // Ensure the device exists in the room
          return console.error("Device not found in this room");
        }

        // Update device state
        deviceToUpdate.state = state;

        // Update stateLog
        deviceToUpdate.stateLog.push({
          time: new Date(),
          state: state,
        });

        // Save the updated user document
        await userToUpdate.save();

        // Emit updated rooms data back to the client
        const allRooms = userToUpdate.rooms; // Assuming you have access to allRooms
        // console.log(allRooms);
        // socket.emit("rooms", { rooms: allRooms });
        io.emit("rooms", { rooms: allRooms });
        // socket.emit("rooms", { rooms: allRooms });
      } catch (error) {
        console.error("Error handling 'handle_SwitchToggle' event:", error);
      }
    });

    // // Handle 'NewDeviceAdded' event
    // socket.on("NewDeviceAdd", async (receivedDevice) => {
    //   handleNewDeviceAdded(socket, receivedDevice, io);
    // });

    // Delete_Device
socket.on("handle_DeleteDevice", async (data) => {
  try {
    // Extract the necessary data
    const { roomId, deviceId } = data;
    console.log("Received deviceId:", deviceId);
    console.log("Received roomId:", roomId);

    // Assuming you have access to the user object via middleware or elsewhere
    // const userId = socket.userId; // Replace with the actual user ID
    let userToUpdate = user; // Assuming you have access to the user object

    if (!userToUpdate) {
      // Ensure the user exists
      return console.error("User not found");
    }

    // Find the room to update in the user's rooms array
    const roomToUpdateIndex = userToUpdate.rooms.findIndex(
      (room) => room.id === roomId
    );
    if (roomToUpdateIndex === -1) {
      // Ensure the user has access to the room
      return console.error("Unauthorized access to this room");
    }

    const roomToUpdate = userToUpdate.rooms[roomToUpdateIndex];

    // Find the index of the device to update in the room's devices array
    const deviceIndex = roomToUpdate.devices.findIndex(
      (device) => device.id === deviceId
    );

    if (deviceIndex === -1) {
      // Ensure the device exists in the room
      return console.error("Device not found in this room");
    }

    // Remove the device from the devices array
    roomToUpdate.devices.splice(deviceIndex, 1);

    // Save the updated user document
    await userToUpdate.save();

    // Emit updated rooms data back to the client
    const allRooms = userToUpdate.rooms; // Assuming you have access to allRooms
    console.log(allRooms);
    io.emit("rooms", { rooms: allRooms });
  } catch (error) {
    console.error("Error handling Delete_Device event:", error);
  }
});


    socket.on("disconnect", () => {
      io.emit("New Data", {});
    });
  });
}

module.exports = { setupSocket };

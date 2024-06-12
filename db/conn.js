// backend/src/db/conn.js
// getting-started.js
// Load environment variables
require('dotenv').config();

const mongoose = require("mongoose");


// DataBase Crete || connected
const MONGODB_URI =
  process.env.REACT_APP_DB_CONNECTION_STRING || "mongodb://0.0.0.0:27017/home-automation-data-2024";

console.log(MONGODB_URI)
// const MONGODB_URI = 'mongodb://0.0.0.0:27017/home-automation-data-2024';
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("DB connected Is Successful...");
  })
  .catch((error) => {
    console.log(`NO :connected ${error} `);
  });


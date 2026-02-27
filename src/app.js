const express = require("express");
const connectDB = require("./config/database");

const app = express();

connectDB()
  .then(() => {
    console.log("connected to DB successfully");
    app.listen(3000, () => {
      console.log(`Backend started on port 3000`);
    });
  })
  .catch(() => {
    console.log("Couldn't connect to DB");
  });

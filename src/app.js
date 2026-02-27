const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/userSchema");

const app = express();

app.post("/signup", async (req, res) => {
  const userObj = {
    firstName: "abc",
    lastName: "def",
    age: 99,
    gender: "male",
    profession: "unemployed",
  };

  const user = new User(userObj);

  try {
    await user.save();
    res.send("User created successfully");
  } catch (err) {
    res.status(400).send("Couldn't save the user");
  }
});

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

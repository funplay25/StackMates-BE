const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/userSchema");
const validator = require("validator");

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
  const user = new User(req.body);
  try {
    if (!validator.isStrongPassword(user.password, { minLength: 6 })) {
      throw new Error(
        "Please type a strong password containing at least 6 characters",
      );
    }
    await user.save();
    res.send("user created successfully");
  } catch (error) {
    res
      .status(400)
      .send(`something went wrong while createing the user: ${error.message}`);
  }
});

app.get("/user", async (req, res) => {
  const userId = req.body?.userId;

  const user = await User.findById(userId);
  try {
    if (user) {
      res.send(user);
    } else {
      res.status(404).send("user not found");
    }
  } catch (error) {
    res.status(400).send("cant get user data");
  }
});

app.get("/users", async (req, res) => {
  const users = await User.find({});

  try {
    if (users) {
      res.send(users);
    } else {
      res.status(404).send("cant get users data");
    }
  } catch (error) {
    res.status(400).send("users data not found");
  }
});

app.delete("/user", async (req, res) => {
  const userProfession = req.body?.profession;

  const user = await User.findOneAndDelete({ profession: userProfession });

  try {
    if (user) {
      res.send(`user with ${userProfession} deleted successfully`);
    } else {
      res.status(404).send("such user not found, check again!");
    }
  } catch (error) {
    res.status(400).send("something went wrong while deleting the user");
  }
});

app.patch("/user", async (req, res) => {
  const userProfession = req.body?.userId;
  const userData = req.body;
  const doesContainEmail = Object.values(userData).includes(req.body?.email);

  try {
    if (doesContainEmail) {
      throw new Error("cant update user email");
    }

    if (userData?.skills.length > 5) {
      throw new Error("Maximum 5 skills allowed");
    }

    const user = await User.findOneAndUpdate(
      { _id: userProfession },
      userData,
      {
        runValidators: true,
      },
    );
    if (user) {
      res.send("user updated successfully");
    } else {
      res.status(400).send("user not found");
    }
  } catch (error) {
    res.status(400).send(`error while updating the user : ${error.message}`);
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

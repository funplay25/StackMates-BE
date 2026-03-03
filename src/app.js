require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/userSchema");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { validateSignUpData } = require("./utils/validate");
const { userAuth } = require("./middlewares/auth");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.send("user created successfully");
  } catch (error) {
    res
      .status(400)
      .send(`something went wrong while creating the user: ${error.message}`);
  }
});

app.get("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const validUser = await User.findOne({ email }).select("+password");

    if (!validUser) {
      throw new Error("Invalid credentials");
    }

    await validUser.validatePassword(password);

    const cookie = await validUser.getToken();
    res.cookie("token", cookie, {
      expires: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    });

    res.send("Login successfull");
  } catch (err) {
    res.status(400).send(`ERROR : ${err.message}`);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (err) {
    res.status(400).send(`ERROR: ${err.message}`);
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

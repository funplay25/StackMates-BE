const express = require("express");
const { validateSignUpData } = require("../utils/validate");
const bcrypt = require("bcrypt");
const User = require("../models/userSchema");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
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
    res.json({ success: true, message: "user created successfully" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const validUser = await User.findOne({ email: email }).select("+password");

    if (!validUser) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await validUser.validatePassword(password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "invalid credentials" });
    }

    const cookie = await validUser.getToken();
    res.cookie("token", cookie, {
      expires: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    });

    res.json({ success: true, data: validUser });
  } catch (err) {
    res.status(400).json({ success: false, message: `ERROR : ${err.message}` });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true });
    res.send(`logged out successfully`);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = authRouter;

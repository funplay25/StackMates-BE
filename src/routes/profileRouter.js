const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateProfileData } = require("../utils/validate");
const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const validator = require("validator");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (err) {
    res.status(400).json({ success: false, message: `ERROR: ${err.message}` });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    await validateProfileData(req);
    res.send(`${req.user.firstName} your profile is successfully updated.`);
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { newPassword, currentPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Both passwords are required" });
    }

    if (!validator.isStrongPassword(newPassword, { minLength: 6 })) {
      if (newPassword.length < 6) {
        throw new Error("Password must be 6 or more characters long");
      } else {
        throw new Error(
          "Password is too weak — try adding more variety (numbers, symbols, uppercase/lowercase)",
        );
      }
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User no longer exists" });
    }

    let isValidPassword = await user.validatePassword(currentPassword);

    if (!isValidPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();
    res.json({ success: true, message: "credentials updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = profileRouter;

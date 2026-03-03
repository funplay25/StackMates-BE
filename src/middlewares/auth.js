require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Please login first" });
    }

    let decodedMsg;

    try {
      decodedMsg = jwt.verify(token, process.env.COOKIE_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(decodedMsg._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: `ERROR : Internal server error` });
  }
};

module.exports = { userAuth };

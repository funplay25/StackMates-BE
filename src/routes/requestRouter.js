const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequestSchema");
const User = require("../models/userSchema");

const requestRouter = express.Router();

requestRouter.post("/request/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUser = req.user;

    const fromUserId = fromUser._id;
    const toUserId = req.params?.toUserId;
    const status = req.params?.status;

    const toUser = await User.findOne({ _id: toUserId });
    console.log(toUser);

    const connectionRequest = await ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    await connectionRequest.save();
    res.json({
      success: true,
      message: `${fromUser.firstName} sent request successfully to ${toUser.firstName}`,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: `ERROR: ${err.message}` });
  }
});

module.exports = requestRouter;

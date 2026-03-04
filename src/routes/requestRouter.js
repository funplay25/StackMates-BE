const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequestSchema");
const User = require("../models/userSchema");
const mongoose = require("mongoose");

const requestRouter = express.Router();

requestRouter.post("/request/:status/:toUserId", userAuth, async (req, res) => {
  const fromUser = req.user;
  const { toUserId, status } = req.params;
  const fromUserId = fromUser._id;

  try {
    const eligibleStatusFields = ["ignored", "interested"];

    const isStatusEligible = eligibleStatusFields.includes(status);

    if (!status || !isStatusEligible) {
      return res.status(401).json({
        success: false,
        message: `Invalid status. Allowed: "interested", "ignored"`,
      });
    }

    if (!mongoose.isValidObjectId(toUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const toUser = await User.findById(toUserId).select("firstName");

    if (!toUser) {
      return res.status(404).json({
        success: false,
        message: "Receiving user not found",
      });
    }

    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: `You already sent a request (status: ${existingRequest.status})`,
      });
    }

    const connectionRequest = await ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    await connectionRequest.save();
    return res.json({
      success: true,
      message: `Connection request sent`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `ERROR: ${err.message}`,
    });
  }
});

module.exports = requestRouter;

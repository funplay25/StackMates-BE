const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequestSchema");
const User = require("../models/userSchema");
const mongoose = require("mongoose");
const sendEmail = require("../utils/sendEmail");

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

    const emailRes = await sendEmail.run();
    console.log(emailRes);

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

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;
    const allowedStatusFields = ["accepted", "rejected"];

    try {
      if (!status || !requestId) {
        return res.status(400).json({ success: false, message: "Bad request" });
      }

      if (!allowedStatusFields.includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Status not allowed" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res
          .status(404)
          .json({ success: false, message: "Connection request not found" });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      return res.status(200).json({ success: true, data: data });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong!" });
    }
  },
);

module.exports = requestRouter;

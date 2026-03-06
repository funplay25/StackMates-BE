const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequestSchema");

const userRouter = express.Router();

const USER_DATA_TO_SEND = "firstName lastName skills gender age about";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  try {
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", "firstName lastName profileUrl");

    if (!connectionRequests) {
      return res
        .status(404)
        .json({ success: false, message: "Connection request not found." });
    }

    return res.status(200).json({ success: true, message: connectionRequests });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  try {
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_DATA_TO_SEND)
      .populate("toUserId", USER_DATA_TO_SEND);

    if (!connectionRequests) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found or no longer exists.",
      });
    }

    const dataToSend = connectionRequests.map((data) => {
      if (data.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return data.toUserId;
      } else {
        return data.fromUserId;
      }
    });

    return res.status(200).json({ success: false, message: dataToSend });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = userRouter;

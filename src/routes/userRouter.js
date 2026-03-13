const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequestSchema");
const User = require("../models/userSchema");

const userRouter = express.Router();

const USER_DATA_TO_SEND =
  "firstName lastName skills gender age about profileUrl";

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

    return res.status(200).json({ success: true, message: dataToSend });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  const loggedInUser = req.user;

  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page === undefined || limit === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "page and limit should be defined" });
    }

    if (isNaN(page) || isNaN(limit)) {
      return res.status(400).json({
        success: false,
        message: "page and limit should be valid numbers",
      });
    }

    if (!Number.isInteger(page) || !Number.isInteger(limit)) {
      return res
        .status(400)
        .json({ success: false, message: "page and limit should be integers" });
    }

    if (page < 1) {
      return res
        .status(400)
        .json({ success: false, message: "page should be >=1" });
    }

    if (limit < 1 || limit > 20) {
      return res
        .status(400)
        .json({ success: false, message: "limit should be > 1 or < 20" });
    }

    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    let hiddenUsersArr = new Set();

    await connectionRequests.map((req) => {
      hiddenUsersArr.add(req.fromUserId._id.toString());
      hiddenUsersArr.add(req.toUserId._id.toString());
    });

    const eligibleFeedData = await User.find({
      _id: { $nin: Array.from(hiddenUsersArr), $ne: loggedInUser._id },
    })
      .select(USER_DATA_TO_SEND)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ success: true, data: eligibleFeedData });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = userRouter;

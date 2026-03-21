const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chatSchema");
const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user?._id;

    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (!chat) {
      chat = await Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    return res.status(200).json({ success: true, data: chat });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = chatRouter;

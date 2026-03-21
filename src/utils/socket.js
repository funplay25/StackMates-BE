const socket = require("socket.io");
const {} = require("cookie-parser");
const cookie = require("cookie");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const ConnectionRequest = require("../models/connectionRequestSchema");
const Chat = require("../models/chatSchema");

const getRoomId = (id1, id2) => {
  const sorted = [id1, id2].sort().join("_");
  return crypto
    .createHmac("sha256", process.env.ROOM_SECRET)
    .update(sorted)
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.token;

      if (!token) return next(new Error("No Token"));

      const decoded = jwt.verify(token, process.env.COOKIE_SECRET);
      const user = await User.findById(decoded._id).select(
        "firstName _id lastName",
      );

      if (!user) return next(new Error("User Not Found"));
      socket.data.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication Failed"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", async ({ targetUserId }) => {
      try {
        const { _id, firstName } = socket.data.user;

        const roomId = getRoomId(_id.toString(), targetUserId);
        console.log(`${firstName} joined with roomId: ${roomId}`);

        const connectionAuth = await ConnectionRequest.findOne({
          $or: [
            { fromUserId: _id, toUserId: targetUserId },
            { fromUserId: targetUserId, toUserId: _id },
          ],
          status: "accepted",
        });

        if (!connectionAuth)
          return socket.emit("error", "Not Authorized to make a connection!");

        socket.join(roomId);
      } catch (err) {
        console.error(err.message);
      }
    });

    socket.on("sendMessage", async ({ targetUserId, text }) => {
      try {
        const { _id, firstName, lastName } = socket.data.user;

        let chat = await Chat.findOne({
          participants: {
            $all: { _id, targetUserId },
          },
        });

        if (!chat) {
          chat = await Chat({
            participants: [{ _id, targetUserId }],
            messages: [],
          });
        }

        chat.messages.push({ senderId: _id, text });

        await chat.save();

        const roomId = getRoomId(_id.toString(), targetUserId);

        io.to(roomId).emit("msgReceived", { firstName, lastName, text });
      } catch (err) {
        console.error(err.message);
      }
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;

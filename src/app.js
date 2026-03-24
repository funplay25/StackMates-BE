require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/userSchema");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");
const userRouter = require("./routes/userRouter");
const cors = require("cors");
const { createServer } = require("http");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chatRouter");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

const server = createServer(app);

initializeSocket(server);

connectDB()
  .then(() => {
    console.log("connected to DB successfully");
    server.listen(3000, () => {
      console.log(`Backend started on port 3000`);
    });
  })
  .catch(() => {
    console.log("Couldn't connect to DB");
  });

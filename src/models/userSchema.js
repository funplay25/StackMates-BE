require("dotenv").config();
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 10,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 10,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate(v) {
        if (!validator.isEmail(v)) {
          throw new Error("Invalid email address");
        }
      },
      immutable: true,
      select: false,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 128,
      select: false,
    },
    profileUrl: {
      type: String,
      trim: true,
      default:
        "https://i.pinimg.com/1200x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg",
      validate(v) {
        if (!validator.isURL(v)) {
          throw new Error("Invalid profile URL");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("this gender isn't valid");
        }
      },
    },
    skills: {
      type: [String],
    },
    about: {
      type: String,
      default: "Hey there, let's connect!",
    },
  },
  { timestamps: true },
);

userSchema.methods.getToken = async function () {
  const user = this;
  const userToken = jwt.sign({ _id: user._id }, process.env.COOKIE_SECRET, {
    expiresIn: "7d",
  });

  if (!userToken) {
    throw new Error("User no longer exists");
  }

  return userToken;
};

userSchema.methods.validatePassword = async function (passwordGivenByUser) {
  const user = this;
  const isMatch = await bcrypt.compare(passwordGivenByUser, user.password);

  if (isMatch) {
    return true;
  } else {
    return false;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;

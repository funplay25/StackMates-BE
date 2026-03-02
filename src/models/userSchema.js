const mongoose = require("mongoose");
const validator = require("validator");

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

const User = mongoose.model("User", userSchema);

module.exports = User;

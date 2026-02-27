const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
  },
  profession: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

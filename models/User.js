const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
  },
  phoneNumber: {
    type: String,
    default: "",
  },
  displayPictureUrl: {
    type: String,
    default: process.env.DP_PLACEHOLDER,
  },
  role: {
    type: String,
    default: "user",
  },
});

module.exports = mongoose.model("User", userSchema);

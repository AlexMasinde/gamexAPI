const mongoose = require("mongoose");

const refreshToken = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("RefreshToken", refreshToken);

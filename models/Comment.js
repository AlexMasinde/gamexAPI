const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  likes: [{ type: String }],
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Comment", commentSchema);

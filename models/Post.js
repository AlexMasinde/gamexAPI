const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  userName: {
    type: String,
    required: true,
  },
  gameTitle: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrls: [{ type: String }],
  likes: [{ type: String }],
  commentCount: {
    type: Number,
    default: 0,
  },
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
  exchanged: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Post", postSchema);

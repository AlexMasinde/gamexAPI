const router = require("express").Router();

const Comment = require("../models/Comment");
const Post = require("../models/Post");

const getUser = require("../middleware/getUser");
const auth = require("../middleware/auth");

//create a comment
router.post("/:postId", getUser, auth, async (req, res) => {
  const postId = req.params.postId;
  const { userId, userName } = req.user;
  const { commentText } = req.body;

  if (!commentText)
    return res.status(400).send({ message: "Comment text is required" });

  try {
    let post = await Post.findById(postId);
    if (!post) return res.status(404).send({ message: "Post not found" });

    const newComment = new Comment({
      postId,
      body: commentText,
      userName,
      userId,
    });

    const savedComment = await newComment.save();
    const numberOfComments = post.commentCount + 1;
    await Post.updateOne({ _id: postId }, { commentCount: numberOfComments });
    post = await Post.findById(postId);
    res.status(201).send({ post: { post }, comment: { savedComment } });
  } catch (err) {
    console.log(err);
    res.status(500).send("Could not create comment. Please try again");
  }
});

//delete comment
router.delete("/:commentId", getUser, auth, async (req, res) => {
  const commentId = req.params.commentId;
  const { userName } = req.user;

  try {
    const comment = await Comment.findOne({ _id: commentId });
    if (!comment) return res.status(404).send({ message: "Comment not found" });
    if (userName !== comment.userName)
      return res
        .status(403)
        .send({ message: "You can only delete your own comments" });
    const postId = comment.postId;
    const post = await Post.findById(postId);
    const updatedCommentCount = post.commentCount - 1;
    await Comment.deleteOne({ _id: commentId });
    await Post.updateOne(
      { _id: postId },
      { commentCount: updatedCommentCount }
    );
    res.status(200).send({ message: "Comment deleted successfully" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ message: "Could not delete post! Please try again" });
  }
});

//edit comment
router.patch("/:commentId", getUser, auth, async (req, res) => {
  const { commentText } = req.body;
  const commentId = req.params.commentId;
  const { userName } = req.user;

  if (!commentText) {
    return res.status(400).send({ message: "Comment text is required" });
  }

  try {
    let comment = await Comment.findOne({ _id: commentId });
    if (!comment) return res.status(404).send({ message: "Comment not found" });
    if (userName !== comment.userName)
      return res
        .status(403)
        .send({ message: "Not allowed to edit other users' comments" });
    await Comment.updateOne({ _id: commentId }, { body: commentText });
    comment = await Comment.findById(commentId);
    res.status(200).send(comment);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ message: "Could not update comment. Please try again" });
  }
});

module.exports = router;

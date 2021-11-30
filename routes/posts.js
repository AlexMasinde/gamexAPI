const router = require("express").Router();
const multer = require("multer");
const upload = multer({ desc: "uploads/" });

const Post = require("../models/Post");
const Comment = require("../models/Comment");

const getUser = require("../middleware/getUser");
const auth = require("../middleware/auth");
const { handleUpload, handleDelete } = require("../utils/imageHandler");

//get all the posts
router.get("/allposts", getUser, async (req, res) => {
  try {
    const posts = await Post.find();
    res.send(posts);
  } catch (err) {
    console.log(error);
    res
      .status(500)
      .status({ message: "Something went wrong. Please try again" });
  }
});

//get a single post
router.get("/:postId", getUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    res.status(200).send({ post });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .status({ message: "Something went wrong. Please try again" });
  }
});

//Create a new post
router.post(
  "/",
  getUser,
  auth,
  upload.array("gameimages", 3),
  async (req, res) => {
    const files = req.files;
    const { gameTitle, genre, description } = req.body;
    const { userName } = req.user;
    try {
      let imageUrls = [];
      if (files.length > 1) {
        const basekey = "gamepostimages";
        imageUrls = await handleUpload(files, basekey);
      }
      const post = new Post({
        userName,
        gameTitle,
        genre,
        imageUrls,
        description,
      });
      const savedPost = await post.save();
      res.status(201).send(savedPost);
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .status({ message: "Coult not create post. Please try again" });
    }
  }
);

//Update a post
router.patch("/:postId", getUser, auth, async (req, res) => {
  const { gameTitle, genre, description } = req.body;

  const gameUpdate = {};

  if (gameTitle) gameUpdate.gameTitle = gameTitle;
  if (genre) gameUpdate.genre = genre;
  if (description) gameUpdate.description = description;

  if (object.keys(gameUpdate).length === 0)
    return res.status(400).send({ message: "No updates were made" });

  const { userName } = req.user;
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).send({ message: "Post not found" });
    if (userName !== post.userName)
      return res
        .status(401)
        .send({ message: "You can only update your own posts" });
    await Post.updateOne(
      { _id: postId },
      {
        gameTitle,
        genre,
        description,
      }
    );
    const updatedPost = await Post.findById(postId);
    res.status(200).send(updatedPost);
  } catch (err) {
    res.send({ message: "Could not edit post" });
    console.log(err);
  }
});

//Mark game as exchanged
router.patch("/exchange/:postId", getUser, auth, async (req, res) => {
  const postId = req.params.postId;
  const { userName } = req.user;
  try {
    let post = await Post.findById(postId);
    if (!post) return res.status(404).send({ message: "Post not found" });
    if (userName !== post.userName)
      return res.status(401).send({
        message: "You can only mark or unmark posts that you created",
      });
    const updateBoolean = post.exchanged ? false : true;
    await Post.updateOne({ _id: postId }, { exchanged: updateBoolean });
    post = await Post.findById(postId);
    res.status(200).send(post);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Could not update post. Please try again" });
  }
});

//Delete a post
router.delete("/:postId", getUser, auth, async (req, res) => {
  const { userName } = req.user;
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);

    if (!post) return res.status(404).send({ message: "Post not found" });
    if (userName !== post.userName)
      return res
        .status(401)
        .send({ message: "You can only delete your own posts" });

    await handleDelete(post.imageUrls);
    await Post.deleteOne({ _id: postId });
    await Comment.deleteMany({ postId });
    res.send({ message: "Your post has been succesfully deleted" });
  } catch (err) {
    res.send({ message: "Could not delete post" });
    console.log(err);
  }
});

module.exports = router;

const Sentry = require("@sentry/node");
const router = require("express").Router();
const multer = require("multer");
const upload = multer({ desc: "uploads/" });

const Post = require("../models/Post");
const Comment = require("../models/Comment");

const getUser = require("../middleware/getUser");
const auth = require("../middleware/auth");

const { handleUpload, handleDelete } = require("../utils/imageHandler");

router.use(getUser);

//Create a new post
router.post("/", auth, upload.array("gameimages", 3), async (req, res) => {
  const files = req.files;
  const { gameTitle, genre, description } = req.body;
  const { userName } = req.user;

  const gamePost = {};

  if (gameTitle) gameUpdate.gameTitle = gameTitle;
  if (genre) gameUpdate.genre = genre;
  if (description) gameUpdate.description = description;

  if (Object.keys(gamePost).length === 0)
    return res.status(400).send({
      message: "Please provide a game title, genre, and description",
    });

  try {
    let imageUrls = [];
    if (files.length > 0) {
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
    Sentry.captureException(err);
    res
      .status(500)
      .status({ message: "Coult not create post. Please try again" });
  }
});

//get all the posts
router.get("/allposts", async (_, res) => {
  try {
    const posts = await Post.find();
    if (posts.length === 0) return res.send({ posts: "No posts found" });
    res.status(200).send(posts);
  } catch (err) {
    Sentry.captureException(err);
    res
      .status(500)
      .status({ message: "Something went wrong. Please try again" });
  }
});

//get a single post
router.get("/:postId", async (req, res) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    const comments = await Comment.find({ postId: postId });
    res.status(200).send({ post, comments });
  } catch (err) {
    Sentry.captureException(err);
    res
      .status(500)
      .status({ message: "Something went wrong. Please try again" });
  }
});

//get posts from one user
router.get("/user/:username", async (req, res) => {
  const username = req.params.username;
  if (!username)
    return res.status(400).send({ message: "Please provide a username" });
  try {
    const posts = await Post.find({ userName: username });
    if (posts.length === 0) return res.send({ posts: "No posts found" });
    res.status(200).send(posts);
  } catch (err) {
    Sentry.captureException(err);
    res
      .status(500)
      .status({ message: "Something went wrong. Please try again" });
  }
});

//Update a post
router.patch("/:postId", auth, async (req, res) => {
  const { gameTitle, genre, description } = req.body;

  const gameUpdate = {};

  if (gameTitle) gameUpdate.gameTitle = gameTitle;
  if (genre) gameUpdate.genre = genre;
  if (description) gameUpdate.description = description;

  if (Object.keys(gameUpdate).length === 0)
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
    Sentry.captureException(err);
    res.send({ message: "Could not edit post" });
  }
});

//Mark game as exchanged
router.patch("/exchange/:postId", auth, async (req, res) => {
  const postId = req.params.postId;
  const { userName } = req.user;
  try {
    let post = await Post.findById(postId);
    if (!post) return res.status(404).send({ message: "Post not found" });
    if (userName !== post.userName)
      return res.status(403).send({
        message: "You can only mark or unmark posts that you created",
      });
    const updateBoolean = post.exchanged ? false : true;
    await Post.updateOne({ _id: postId }, { exchanged: updateBoolean });
    res.status(200).send({ message: "Game post status updated succesfully" });
  } catch (err) {
    Sentry.captureException(err);
    res.status(500).send({ error: "Could not update post. Please try again" });
  }
});

//Delete a post
router.delete("/:postId", auth, async (req, res) => {
  const postId = req.params.postId;
  const { userName } = req.user;
  try {
    const post = await Post.findById(postId);

    if (!post) return res.status(404).send({ message: "Post not found" });
    if (userName !== post.userName)
      return res
        .status(401)
        .send({ message: "You can only delete posts that you created" });

    if (post.imageUrls.length > 0) {
      await handleDelete(post.imageUrls);
    }

    await Post.deleteOne({ _id: postId });
    await Comment.deleteMany({ postId });
    res.status(200).send({ message: "Post succesfully deleted" });
  } catch (err) {
    Sentry.captureException(err);
    res.send({ message: "Could not delete post" });
  }
});

//search posts by game title
router.get("/search/:searchterm", async (req, res) => {
  const searchterm = req.params.searchterm;
  if (!searchterm)
    return res.status(400).send({ message: "Please provide a search term" });
  try {
    const posts = await Post.find({ $text: { $search: searchterm } });
    if (posts.length === 0)
      return res.status(404).send({ message: "No posts found" });
    res.status(200).send(posts);
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
    res.status(500).send({ message: "Could not search posts" });
  }
});

module.exports = router;

const router = require("express").Router();

const Post = require("../models/Post");

//get all the posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.send(posts);
  } catch (err) {
    console.log(error);
  }
});

//get a single post
router.get("/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    res.send(post);
  } catch (err) {
    console.log(err);
  }
});

//Create a new post
router.post("/", async (req, res) => {
  const { userName, gameTitle, genre, description } = req.body;
  const post = new Post({
    userName,
    gameTitle,
    genre,
    description,
  });

  try {
    const savedPost = await post.save();
    res.status(201).send(savedPost);
    console.log(req.user);
  } catch (err) {
    console.log(err);
  }
});

//Update a post
router.patch("/:postId", async (req, res) => {
  const { gameTitle, genre, description } = req.body;
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).send({ message: "Post not found" });
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
router.patch("/exchange/:postId", async (req, res) => {
  const postId = req.params.postId;
  try {
    let post = await Post.findById(postId);
    if (!post) return res.status(404).send({ message: "Post not found" });
    const updateBoolean = post.exchanged ? false : true;
    await Post.updateOne({ _id: postId }, { exchanged: updateBoolean });
    post = await Post.findById(postId);
    res.status(200).send(post);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Something went wrong" });
  }
});

//Delete a post
router.delete("/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).send({ message: "Post not found" });

    await Post.deleteOne({ _id: req.params.postId });
    res.send("Your post has been succesfully deleted");
  } catch (err) {
    res.send({ message: "Could not delete post" });
    console.log(err);
  }
});

module.exports = router;

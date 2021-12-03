const Sentry = require("@sentry/node");

const router = require("express").Router();

const Comment = require("../models/Comment");
const Post = require("../models/Post");

const getUser = require("../middleware/getUser");
const auth = require("../middleware/auth");

router.use(getUser);
router.use(auth);

router.post("/", async (req, res) => {
  const { modelId, modelType } = req.body;
  const { userName } = req.user;

  if (!modelId || !modelType) return res.status(400).send("Invalid request");

  try {
    const schemaIdentifier = modelType === "post" ? Post : Comment;
    let payload = await schemaIdentifier.findById(modelId);
    if (!payload) return res.status(404).send({ message: "Not found" });
    const likes = payload.likes;
    const liked = likes.indexOf(userName) !== -1;
    if (!liked) {
      await schemaIdentifier.updateOne(
        { _id: modelId },
        { $push: { likes: userName } }
      );

      return res.status(200).send({ message: `Liked ${modelType}` });
    }
    await schemaIdentifier.updateOne(
      { _id: modelId },
      { $pull: { likes: userName } }
    );
    res.status(200).send({ message: `Unliked ${modelType}` });
  } catch (err) {
    Sentry.captureException(err);
    return res.status(500).send("Server error");
  }
});

module.exports = router;

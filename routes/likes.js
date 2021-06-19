const router = require("express").Router();

const Comment = require("../models/Comment");
const Post = require("../models/Post");

const getUser = require("../middleware/getUser");
const auth = require("../middleware/auth");

router.post("/", getUser, auth, async (req, res) => {
  const { modelId, modelType } = req.body;
  const { userName } = req.user;

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
    payload = await schemaIdentifier.findById(modelId);
    return res.status(200).send(payload);
  }
  await schemaIdentifier.updateOne(
    { _id: modelId },
    { $pull: { likes: userName } }
  );
  payload = await schemaIdentifier.findById(modelId);
  res.status(200).send(payload);
});

module.exports = router;

const Sentry = require("@sentry/node");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer({ desc: "uploads/" });

const User = require("../models/User");

const { createAccessToken } = require("../utils/tokens");
const { registerValidation, loginValidation } = require("../utils/validators");
const { handleUpload } = require("../utils/imageHandler");

const auth = require("../middleware/auth");
const getUser = require("../middleware/getUser");

//create a new user
router.post("/", async (req, res) => {
  const { userName, email, password } = req.body;

  const userPost = {};

  if (userName) userPost.userName = userName;
  if (email) userPost.email = email;
  if (password) userPost.password = password;

  if (Object.keys(userPost).length < 3)
    return res.status(400).send({
      message: "Please provide a user name, email, and password",
    });

  const { valid, errors } = registerValidation(userName, email, password);

  if (!valid) return res.status(400).send(errors);

  try {
    const duplicateError = {};
    const userExists = await User.find({
      $or: [{ userName: userName }, { email: email }],
    });

    if (userExists.length > 0 && userExists[0].email === email) {
      duplicateError.emailDuplicate = `User with ${email} already exists`;
      return res.status(409).send(duplicateError);
    }

    const hashedPaswword = await bcrypt.hash(password, 12);

    const user = new User({
      userName,
      email,
      password: hashedPaswword,
    });

    const newUser = await user.save();
    const userId = newUser._id;
    const token = createAccessToken(userId, userName);
    res.status(201).send({ ...newUser._doc, token: token, userId: userId });
  } catch (err) {
    Sentry.captureException(err);
    res.send({ error: "Could not create user" });
  }
});

//log into account
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userPost = {};

  if (email) userPost.email = email;
  if (password) userPost.password = password;

  if (Object.keys(userPost).length < 2)
    return res.status(400).send({
      message: "Please provide an email and password",
    });

  const { errors, valid } = loginValidation(email, password);
  if (!valid) return res.status(400).send(errors);
  try {
    const user = await User.findOne({ email });
    if (user === null)
      return res
        .status(400)
        .send({ error: "Wrong email or password, please try again" });
    const savedPassword = user.password;
    const validPassword = await bcrypt.compare(password, savedPassword);
    if (!validPassword)
      return res
        .status(400)
        .send({ error: "Wrong email or password, please try again" });
    const userId = user._id;
    const userName = user.userName;
    const token = createAccessToken(userId, userName);
    res.status(201).send({ ...user._doc, token: token });
  } catch (err) {
    Sentry.captureException(err);
    res.send(err);
  }
});

//upload images
router.post(
  "/displaypicture",
  getUser,
  auth,
  upload.single("displaypicture"),
  async (req, res) => {
    try {
      let files = [];
      files.push(req.file);
      if (files.length < 1)
        return res
          .status(400)
          .send({ message: "Please select an image and try again" });
      const basekey = "userdisplaypictures";
      const displayPictureUrl = await handleUpload(files, basekey);
      const user = req.user;
      await User.updateOne(
        { _id: user.userId },
        { displayPictureUrl: displayPictureUrl[0] }
      );
      res.status(200).send({
        userName: user.userName,
        message: "Display picture changed successfully",
        displayPictureUrl,
      });
    } catch (err) {
      Sentry.captureException(err);
      res
        .status(500)
        .send({ message: "Something went wrong. Please try again" });
    }
  }
);

//update phone number
router.patch("/phone", getUser, auth, async (req, res) => {
  const { phone } = req.body;
  const user = req.user;
  if (!phone)
    return res.status(400).send({ message: "Please provide a phone number" });
  try {
    await User.updateOne(
      { _id: user.userId },
      { $set: { phoneNumber: phone } }
    );
    res.status(200).send({
      message: "Phone number changed successfully",
    });
  } catch (err) {
    Sentry.captureException(err);
    res.status(500).send({ message: "Something went wrong. Please try again" });
  }
});

module.exports = router;

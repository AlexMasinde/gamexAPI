const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer({ desc: "uploads/" });

const User = require("../models/User");

const { sendAccessToken, createAccessToken } = require("../utils/tokens");
const { registerValidation, loginValidation } = require("../utils/validators");
const { handleUpload } = require("../utils/imageHandler");

const auth = require("../middleware/auth");
const getUser = require("../middleware/getUser");

//create a new user
router.post("/", async (req, res) => {
  const { userName, email, password } = req.body;
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
    sendAccessToken(userId, token, res);
    res.status(201).send(newUser);
  } catch (err) {
    console.log(err);
    res.send({ error: "Could not create user" });
  }
});

//log into account
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
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
    sendAccessToken(userId, token, res);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

//Logout of account
router.post("/logout", (_, res) => {
  res.send({
    message: "Logout succesful",
  });
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
      res.send({
        userName: user.userName,
        message: "Display picture changed successfully",
        displayPictureUrl,
      });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .send({ message: "Something went wrong. Please try again" });
    }
  }
);

module.exports = router;

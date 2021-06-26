const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer({ desc: "uploads/" });

const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");

const {
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken,
  createAccessToken,
} = require("../utils/tokens");
const { registerValidation, loginValidation } = require("../utils/validators");
const saveRefreshToken = require("../utils/saveRefreshToken");
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

    if (userExists.email === email) {
      duplicateError.emailDuplicate = `User with ${email} already exists`;
      return res.status(409).send(duplicateError);
    }

    if (userExists.userName === userName) {
      duplicateError.usernameDuplicate = "This username is already taken";
      return res.status(409).send(duplicateError);
    }

    const hashedPaswword = await bcrypt.hash(password, 12);

    const user = new User({
      userName,
      email,
      password: hashedPaswword,
    });

    const newUser = await user.save();
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
    const refreshToken = createRefreshToken(userId, userName);
    saveRefreshToken(userId, refreshToken);
    sendRefreshToken(res, refreshToken);
    sendAccessToken(userId, token, res);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

//Logout of account
router.post("/logout", (_, res) => {
  res.clearCookie("refreshtoken", { path: "/refresh_token" });
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

//Create and save new refresh tokens
router.post("/refresh_token", (req, res) => {
  const token = req.cookies.refreshtoken;
  if (!token) res.send({ accessToken: "" });
  jwt.verify(token, process.env.JWT_SECRET, async function (err, decodedToken) {
    if (err) {
      return res.send({ accessToken: "" });
    }
    const { userId, refreshToken } = decodedToken;
    const token = await RefreshToken.findById(userId);
    if (!token) return res.send({ accessToken: "" });
    if (token !== refreshToken) return res.send({ accessToken: "" });
    const newAccessToken = createAccessToken(userId);
    const newRefreshToken = createRefreshToken(userId);
    sendAccessToken(userId, newAccessToken, res);
    sendRefreshToken(res, newRefreshToken);
    saveRefreshToken(userId, newRefreshToken);
  });
});

module.exports = router;

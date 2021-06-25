const jwt = require("jsonwebtoken");

const createAccessToken = (userId, userName) => {
  return jwt.sign({ userId, userName }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const createRefreshToken = (userId, userName) => {
  return jwt.sign({ userId, userName }, process.env.JWT_SECRET, {
    expiresIn: "8d",
  });
};

const sendAccessToken = (userId, token, res) => {
  res.status(200).send({
    userId,
    token,
  });
};

const sendRefreshToken = (res, refreshToken) => {
  res.cookie("refreshtoken", refreshToken, {
    httpOnly: true,
    path: "/refresh_token",
  });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken,
};

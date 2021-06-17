const jwt = require("jsonwebtoken");

const createAccessToken = (userId, userName) => {
  return jwt.sign({ userId, userName }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

const createRefreshToken = (userId, userName) => {
  return jwt.sign({ userId, userName }, process.env.JWT_SECRET, {
    expiresIn: "7d",
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

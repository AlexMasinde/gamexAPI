const jwt = require("jsonwebtoken");

const createAccessToken = (userId, userName) => {
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

module.exports = {
  createAccessToken,
  sendAccessToken,
};

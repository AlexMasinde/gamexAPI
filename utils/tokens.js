const jwt = require("jsonwebtoken");

const createAccessToken = (userId, userName) => {
  return jwt.sign({ userId, userName }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = {
  createAccessToken,
};

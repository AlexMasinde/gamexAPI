const jwt = require("jsonwebtoken");

const getUser = (req, res, next) => {
  const token = req.header.authorization;
  if (!token) return next();
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    return next();
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Something went wrong" });
  }
};

module.exports = getUser;

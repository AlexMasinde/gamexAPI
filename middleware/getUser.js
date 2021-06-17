const jwt = require("jsonwebtoken");

const getUser = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return next();
  try {
    const token = authHeader.split("Bearer ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    return next();
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ error: "Something went wrong! Please login and try again" });
  }
};

module.exports = getUser;

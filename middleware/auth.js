const auth = (req, res, next) => {
  const user = req.user;
  if (!user)
    return res
      .status(401)
      .send({ message: "Please login or register to continue" });
  return next();
};

module.exports = auth;

const auth = (req, res, next) => {
  try {
    const user = req.user;
    if (!user)
      return res
        .status(401)
        .send({ message: "Please login or register to continue" });
    return next();
  } catch (err) {
    console.log(err);
    res.status(401).send({ error: "Not authorized" });
  }
};

module.exports = auth;

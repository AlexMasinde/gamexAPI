const Auth = (req, res, nex) => {
  try {
    const user = req.user;
    if (!user) throw new Error("Unauthenticated");
    return nex();
  } catch (err) {
    console.log(err);
    res.status(401).send({ error: "Not authorized" });
  }
};

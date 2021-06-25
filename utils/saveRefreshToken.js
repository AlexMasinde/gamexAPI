const RefreshToken = require("../models/RefreshToken");

//save refresh token to db
const saveRefreshToken = async (userId, refreshToken) => {
  try {
    const token = await RefreshToken.findOne({ userId });
    if (!token) {
      const newRefreshToken = new RefreshToken({
        userId: userId,
        refreshToken: refreshToken,
      });

      await newRefreshToken.save();
    }

    await RefreshToken.updateOne(
      { _id: userId },
      { $set: { refreshToken: refreshToken } }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Something went wrong" });
  }
};

module.exports = saveRefreshToken;

const sharp = require("sharp");

const resizeImage = async (buffer) => {
  const resizedImage = await sharp(buffer)
    .resize(500)
    .jpeg({ mozjpeg: true })
    .toBuffer();
  return resizedImage;
};

module.exports = resizeImage;

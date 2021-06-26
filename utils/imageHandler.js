const s3 = require("../awsconfig/s3");
const S3Uploader = require("../lib/S3Uploader");
const resizeImage = require("./resizeImage");

const imageHandler = new S3Uploader(s3);

const handleUpload = async (files, basekey) => {
  const promises = files.map(async (file) => {
    const { buffer, mimetype, originalname } = await file;
    const filename = originalname;
    const resizedBuffer = await resizeImage(buffer);

    const url = await imageHandler.upload(resizedBuffer, {
      filename,
      mimetype,
      basekey,
    });

    return url;
  });

  const imageUrls = await Promise.all(promises);
  return imageUrls;
};

const handleDelete = async (images) => {
  let keys = [];

  images.forEach((image) => {
    keys.push({ Key: image });
  });

  await imageHandler.delete(keys);
};

module.exports = { handleUpload, handleDelete };

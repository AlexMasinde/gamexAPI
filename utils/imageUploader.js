const s3 = require("../awsconfig/s3");
const S3Uploader = require("../lib/S3Uploader");

const imageUploader = new S3Uploader(s3);

const handleUpload = async (files, basekey) => {
  const promises = files.map(async (file) => {
    const { buffer, mimetype, originalname } = await file;
    const filename = originalname;
    const url = await imageUploader.upload(buffer, {
      filename,
      mimetype,
      basekey,
    });
    return url;
  });
  const imageUrls = await Promise.all(promises);
  return imageUrls;
};

module.exports = handleUpload;

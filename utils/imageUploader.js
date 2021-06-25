const s3 = require("../awsconfig/s3");
const S3Uploader = require("../lib/S3Uploader");

const imageUploader = new S3Uploader(s3);

const handleUpload = async (files, basekey) => {
  let urls = [];
  if (data.length < 1) {
    urls.push(process.env.DP_PLACEHOLDER);
    return urls;
  }
  const promises = files.map((file) => {
    const { createReadStream, filename, mimetype } = await file;
    const data = createReadStream();
    const url = await imageUploader.upload(data, {
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

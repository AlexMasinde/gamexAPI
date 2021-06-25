const { v4: uuid } = require("uuid");
const { extname } = require("path");

class S3Uploader {
  constructor(s3) {
    this.s3 = s3;
  }

  static generateFileName(filename) {
    const extension = extname(filename);
    const fileUniqueId = uuid();
    return `${fileUniqueId}${extension}`;
  }

  async upload(data, { filename, mimetype, basekey }) {
    const key = S3Uploader.generateFileName(filename);
    const { Location } = await this.s3
      .upload({
        Body: data,
        Key: `${basekey}/${key}`,
        Bucket: process.env.AWS_S3_BUCKET,
        ContentType: mimetype,
      })
      .promise();
    return Location;
  }
}

module.exports = S3Uploader;

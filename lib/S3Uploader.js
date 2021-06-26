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

  async upload(resizedBuffer, { filename, mimetype, basekey }) {
    const key = S3Uploader.generateFileName(filename);
    const { Location } = await this.s3
      .upload({
        Body: resizedBuffer,
        Key: `${basekey}/${key}`,
        Bucket: process.env.AWS_S3_BUCKET,
        ContentType: mimetype,
      })
      .promise();
    return Location;
  }

  async delete(keys) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Delete: {
        Objects: keys,
        Quiet: true,
      },
    };

    await this.s3.deleteObjects(params).promise();
  }
}

module.exports = S3Uploader;

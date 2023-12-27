require("dotenv/config");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "diakeallc",
  api_key: "552926134297386",
  api_secret: process.env.CLOUDINARY_SECRET,
});

const opts = {
  overwrite: true,
  invalidate: true,
  resource_type: "auto",
};

const uploadImage = (image, folder) => {
  return new Promise((res, rej) => {
    cloudinary.uploader.upload(image, { ...opts, folder }, (error, result) => {
      if (result && result.secure_url) return res(result.secure_url);

      return rej({ message: error.message });
    });
  });
};

const removeImage = (image_path) => {
  return new Promise((res, rej) => {
    const short_url = image_path.split("/").slice(-2).join("/").split(".")[0];
    cloudinary.uploader
      .destroy(short_url)
      .then((result) => res(result))
      .catch((err) => rej(err));
  });
};

module.exports = {
  uploadImage,
  removeImage,
};

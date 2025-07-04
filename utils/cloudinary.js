const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary upload image
const cloudinaryUploadImage = async (fileToUpload) => {
  try {
    const result = await cloudinary.uploader.upload(fileToUpload, {
      resource_type: "auto",
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

// Cloudinary Remove image
const cloudinaryRemoveImage = async (imagePublicId) => {
  try {
    return await cloudinary.uploader.destroy(imagePublicId);
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

// Cloudinary Remove Multiple image
const cloudinaryRemoveMultipleImage = async (publicIds) => {
  try {
    return await cloudinary.v2.api.delete_resources(publicIds);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
  cloudinaryRemoveMultipleImage,
};

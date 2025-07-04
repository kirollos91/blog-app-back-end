const path = require("node:path");
const multer = require("multer");

try {
  // Photo Storage
  const photoStorage = multer.diskStorage({
    destination: (request, file, cbFun) => {
      cbFun(null, path.join(__dirname, "../images/profiles"));
    },
    filename: (request, file, cbFun) => {
      if (file) {
        cbFun(
          null,
          new Date().toISOString().replace(/:/g, "-") + file.originalname
        );
      } else {
        cbFun({ message: "no file found" }, false);
      }
    },
  });

  // Photo upload middleware
  const photoUpload = multer({
    storage: photoStorage,
    fileFilter: (request, file, cbFun) => {
      if (file.mimetype.startsWith("image")) cbFun(null, true);
      else cbFun({ message: "Unsupported file format" }, false);
    },
    limits: {
      fileSize: 1024 * 1024, // 1 megabyte
    },
  });

  module.exports = photoUpload;
} catch (error) {
  throw new Error(error);
}

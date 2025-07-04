const jwt = require("jsonwebtoken");

const generateToken = (data, expiresData = null) =>
  jwt.sign(data, process.env.TOKEN_SECRET_KEY, {
    expiresIn: expiresData || process.env.TOKEN_EXPIRES_IN || "1y",
  });

module.exports = {
  generateToken,
};

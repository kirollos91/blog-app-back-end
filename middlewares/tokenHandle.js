const jwt = require("jsonwebtoken");

module.exports.verifyToken = (request, response, next) => {
  try {
    const authorization = request.headers.authorization || "";
    if (!authorization)
      return next(
        new Error("no token provided, access denied", {
          cause: "authorization",
        })
      );
    const token = authorization.split(" ")[1];

    const verifyToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    if (!verifyToken)
      return next(
        new Error("invalid token, access denied", { cause: "authorization" })
      );

    request.user = verifyToken;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * @description Access For Admin Only
 */

module.exports.verifyTokenAndAdmin = [
  this.verifyToken,
  (request, response, next) => {
    try {
      if (!request.user.isAdmin)
        return next(
          new Error("not allowed, only admin", {
            cause: "forbidden",
          })
        );
      next();
    } catch (error) {
      next(error);
    }
  },
];

/**
 * @description Access For User Himself Only
 */
module.exports.verifyTokenAndUserHimself = [
  this.verifyToken,
  (request, response, next) => {
    try {
      if (request.user.id !== request.params.id)
        return next(
          new Error("not allowed, only user himself", {
            cause: "forbidden",
          })
        );
      next();
    } catch (error) {
      next(error);
    }
  },
];

/**
 * @description Access For Admin & User Himself
 */
module.exports.verifyTokenAdminAndUserHimself = [
  this.verifyToken,
  (request, response, next) => {
    try {
      if (request.user.id !== request.params.id && !request.user.isAdmin)
        return next(
          new Error("not allowed, only admin or user himself", {
            cause: "forbidden",
          })
        );
      next();
    } catch (error) {
      next(error);
    }
  },
];

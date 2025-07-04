module.exports = (error, request, response, next) => {
  let statusCode = error.statusCode || 500;
  let cause = error.cause;

  if (error.cause === "404") {
    statusCode = 404;
    cause = undefined;
  } else if (error.cause === "authorization") {
    statusCode = 401;
    cause = undefined;
  } else if (error.cause === "forbidden") {
    statusCode = 403;
    cause = undefined;
  } else if (
    error.cause === "mongoose invalid id" ||
    error.name === "ValidationError"
  ) {
    statusCode = 400;
    cause = undefined;
  }

  response.status(statusCode).json({
    message: error.message,
    statusCode: statusCode,
    name: error.name,
    cause,
    stack:
      process.env.NODE_ENV === "production"
        ? undefined
        : error.stack
        ? error.stack.split("\n    ")
        : undefined,
    originError:
      process.env.NODE_ENV === "production"
        ? undefined
        : error.originError || undefined,
  });
};

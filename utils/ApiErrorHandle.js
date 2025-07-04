class ApiErrorHandle extends Error {
  constructor(message, statusCode, originError = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.name;
    this.cause = this.cause;
    this.stack = this.stack;
    this.originError = originError;
  }
}

module.exports = ApiErrorHandle;

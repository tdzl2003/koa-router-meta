/**
 * Created by tdzl2003 on 2017/7/22.
 */
class StatusError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
  toJson() {
    return Object.assign({
      message: this.message,
    }, this);
  }
}

StatusError.BAD_REQUEST = (msg) => new StatusError(400,msg || 'Bad Request');
StatusError.UNAUTHORIZED = (msg) => new StatusError(401,msg || 'Unauthorized');
StatusError.PAYMENT_REQUIRED = (msg) => new StatusError(402,msg || 'Payment Required');
StatusError.FORBIDDEN = (msg) => new StatusError(403,msg || 'Forbidden');
StatusError.NOT_FOUND = (msg) => new StatusError(404,msg || 'Not found');
StatusError.CONFLICT = (msg) => new StatusError(409,msg || 'Conflict');
StatusError.SERVER_INTERNAL = (msg) => new StatusError(500,msg || 'Server Internal');

StatusError.uniqueConflict = function(originError) {
  const err = new StatusError(409, 'conflict');
  err.fields = originError.fields;
  return err;
}

StatusError.from = function(err) {
  if (err instanceof StatusError) {
    return err;
  } else if (err instanceof SyntaxError) {
    return StatusError.BAD_REQUEST();
  } else {
    return StatusError.SERVER_INTERNAL();
  }
}

module.exports = StatusError;

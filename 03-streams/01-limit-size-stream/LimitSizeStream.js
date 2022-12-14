const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
    this.size = 0;
  }

  _transform(chunk, encoding, callback) {
    this.size += chunk.byteLength;
    if (this.size > this.limit) {
      const err = new LimitExceededError();
      callback(err, null);
      return;
    }
    callback(null, chunk);
  }
}

module.exports = LimitSizeStream;

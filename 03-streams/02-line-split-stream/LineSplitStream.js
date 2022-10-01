const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.lines = [];
    this.prevNewLines = [];
  }

  _transform(chunk, encoding, callback) {
    const newLines = chunk.toString().split(os.EOL);
    const isDelemiterExist = newLines.length > 1;

    if (this.prevNewLines.length === 1) {
      this.lines[this.lines.length - 1] += newLines.shift();
    }
    this.prevNewLines = newLines;
    this.lines = [...this.lines, ...newLines];

    if (isDelemiterExist || this.lines.length > 1) {
      callback(null, this.lines.shift());
    } else {
      callback(null, null);
    }
  }

  _flush(callback) {
    while (this.lines.length) {
      this.push(this.lines.shift());
    }
    callback();
  }
}

module.exports = LineSplitStream;


const lines = new LineSplitStream({
  encoding: 'utf-8',
});

function onData(line) {
  console.log(line);
}

lines.on('data', onData);

lines.write('a');
lines.write(`b${os.EOL}c`);
lines.write(`d${os.EOL}e`);

lines.end();

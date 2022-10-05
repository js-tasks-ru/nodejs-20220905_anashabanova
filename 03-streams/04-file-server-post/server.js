const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

const endWithErrorCode = (res, code) => {
  res.statusCode = code;
  res.end();
};

const getFileAndWriteIt = (filepath, req, res) => {
  const limitedStream = new LimitSizeStream({limit: 1000000});
  const outStream = fs.createWriteStream(filepath);
  req.pipe(limitedStream).pipe(outStream);

  const abortProcess = () => {
    outStream.destroy();
    limitedStream.destroy();
    fs.unlink(filepath, () => {});
  };

  req.on('end', () => {
    limitedStream.end();
  });
  req.on('aborted', () => {
    abortProcess();
  });

  limitedStream.on('error', (err) => {
    if (err.code === 'LIMIT_EXCEEDED') {
      endWithErrorCode(res, 413);
      abortProcess();
      return;
    }
    endWithErrorCode(res, 500);
  });
  limitedStream.on('end', () => {
    endWithErrorCode(res, 201);
  });
};

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const parsedPath = path.parse(pathname);

  const isDirExist = !!parsedPath.dir;
  if (isDirExist) {
    endWithErrorCode(res, 400);
    return;
  }

  switch (req.method) {
    case 'POST':
      const filepath = path.join(__dirname, 'files', pathname);
      fs.access(filepath, fs.F_OK, (err) => {
        if (err) {
          getFileAndWriteIt(filepath, req, res);
          return;
        }
        endWithErrorCode(res, 409);
        return;
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;

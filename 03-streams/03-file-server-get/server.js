const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

const endWithErrorCode = (res, code) => {
  res.statusCode = code;
  res.end();
};

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const isAllowedFilePath = !!path.parse(pathname).dir;
  if (isAllowedFilePath) {
    endWithErrorCode(res, 400);
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  req.on('error', () => {
    endWithErrorCode(res, 500);
  });

  switch (req.method) {
    case 'GET':
      const stream = fs.createReadStream(filepath);
      stream.on('error', () => {
        endWithErrorCode(res, 404);
      });
      req.on('close', () => {
        stream.destroy();
      });
      stream.pipe(res);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;

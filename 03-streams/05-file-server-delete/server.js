const http = require('http');
const path = require('path');
const fs = require('fs');

const endWithErrorCode = (res, code) => {
  res.statusCode = code;
  res.end();
};

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const parsedPath = path.parse(pathname);

  const isDirExist = !!parsedPath.dir;
  if (isDirExist) {
    endWithErrorCode(res, 400);
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      if (!fs.existsSync(filepath)) {
        endWithErrorCode(res, 404);
        return;
      }
      fs.unlink(filepath, function(err) {
        if (err) {
          endWithErrorCode(res, 500);
          return;
        }
        endWithErrorCode(res, 200);
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;

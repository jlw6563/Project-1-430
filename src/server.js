const http = require('http');
const fs = require('fs');
const mime = require('mime-types');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// https://stackoverflow.com/questions/2727167/how-do-you-get-a-list-of-the-names-of-all-files-present-in-a-directory-in-node-j
// https://www.geeksforgeeks.org/node-js/node-js-fs-readdirsync-method/

const files = fs.readdirSync(`${__dirname}../../files/`);

const directory = {};
files.forEach((filePath) => {
  const fileContent = fs.readFileSync(`${__dirname}../../files/${filePath}`);
  directory[filePath] = { content: fileContent, type: mime.lookup(fileContent) };
});

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl, request.url);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});

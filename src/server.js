const http = require('http');
const fs = require('fs');
const mime = require('mime-types');
const responses = require("./responses.js");


const port = process.env.PORT || process.env.NODE_PORT || 3000;

// https://stackoverflow.com/questions/2727167/how-do-you-get-a-list-of-the-names-of-all-files-present-in-a-directory-in-node-j
// https://www.geeksforgeeks.org/node-js/node-js-fs-readdirsync-method/

const files = fs.readdirSync(`${__dirname}../../files/`);
const directory = {};
files.forEach((filePath) => {
  const absoulutePath = `${__dirname}../../files/${filePath}`;
  const fileContent = fs.readFileSync(absoulutePath);
  directory[`/${filePath}`] = { content: fileContent, type: mime.lookup(absoulutePath) };
  if(filePath === "client.html") directory["/"] = { content: fileContent, type: mime.lookup(fileContent) };
});

console.log(directory);

const parseBody = (request, response, handler) => {
    const body = [];

    request.on('error', (err) => {
        console.dir(err);
        response.statusCode = 400;
        response.end();
    });

    request.on('data', (chunk) => {
        body.push(chunk);
    });

    request.on('end', () => {
        const bodyString = Buffer.concat(body).toString();
        request.body = query.parse(bodyString);

        handler(request, response);
    });
};

const handlePost = (request, response, parsedUrl) => {
    if (parsedUrl.pathname === '/addUser') {
        parseBody(request, response, jsonHandler.addUser);
    }
};

const handleGet = (request, response, parsedUrl) => {
  console.log(parsedUrl);
    if(directory[parsedUrl.pathname]) responses.sendPage(request,response, directory[parsedUrl.pathname]);
    else { responses.notFound(request, response)}
  
  // if (parsedUrl.pathname === '/') {
    //     responses.getIndex(request, response);
    // } else if (parsedUrl.pathname === '/style.css') {
    //     responses.getCSS(request, response);
    // } else if (parsedUrl.pathname === '/getUsers') {
    //     jsonHandler.getUsers(request, response);
    // } else {
    //     responses.notFound(request, response);
    // }
};



const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  handleGet(request,response,parsedUrl);
  // if (request.method === 'POST') {
  //   handlePost(request, response, parsedUrl);
  // } else {
  //   handleGet(request, response, parsedUrl, request.url);
  // }


};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});

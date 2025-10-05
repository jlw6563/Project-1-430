const http = require('http');
const fs = require('fs');
const query = require('querystring');
const mime = require('mime-types');
const responses = require('./responses.js');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

// https://stackoverflow.com/questions/2727167/how-do-you-get-a-list-of-the-names-of-all-files-present-in-a-directory-in-node-j
// https://www.geeksforgeeks.org/node-js/node-js-fs-readdirsync-method/

const FILES = fs.readdirSync(`${__dirname}../../files/`);
const PAGE_DIRECTORY = {};
FILES.forEach((filePath) => {
  const ABOSLUTE_PATH = `${__dirname}../../files/${filePath}`;
  const FILE_CONTENT = fs.readFileSync(ABOSLUTE_PATH);
  const MIME_TYPE = mime.lookup(ABOSLUTE_PATH);
  PAGE_DIRECTORY[`/${filePath}`] = { content: FILE_CONTENT, type: MIME_TYPE };
  if (filePath === 'client.html') PAGE_DIRECTORY['/'] = { content: FILE_CONTENT, type: MIME_TYPE };
});

const API_DIRECTORY = {
  '/PokemonNames': responses.getPokemonName,
  '/PokemonTypes': responses.getPokemonType,
  '/AllPokemon': responses.getAllPokemon,
};

const parseBody = (request, response, handler) => {
  const BODY = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    BODY.push(chunk);
  });

  request.on('end', () => {
    const BODY_STRING = Buffer.concat(BODY).toString();
    request.body = query.parse(BODY_STRING);

    handler(request, response);
  });
};

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/AddPokemon') {
    parseBody(request, response, responses.addPokemon);
  }
  else if (parsedUrl.pathname === '/Caught') parseBody(request, response, responses.caughtPokeomn);
};

const handleGet = (request, response, parsedUrl) => {
  if (PAGE_DIRECTORY[parsedUrl.pathname]) responses.sendPage(request, response, PAGE_DIRECTORY[parsedUrl.pathname]);
  else if (API_DIRECTORY[parsedUrl.pathname]) API_DIRECTORY[parsedUrl.pathname](request, response);
  else responses.failedResponse(request, response);
};

const onRequest = (request, response) => {
  const PROTOCOL = request.connection.encrypted ? 'https' : 'http';
  const PARSED_URL = new URL(request.url, `${PROTOCOL}://${request.headers.host}`);

  if (request.method === 'POST') {
    handlePost(request, response, PARSED_URL);
  } else {
    handleGet(request, response, PARSED_URL);
  }
};

http.createServer(onRequest).listen(PORT, () => {
  console.log(`Listening on 127.0.0.1: ${PORT}`);
});

const http = require('http');
const fs = require('fs');
const query = require('querystring');
const mime = require('mime-types');
const responses = require('./responses.js');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

// https://stackoverflow.com/questions/2727167/how-do-you-get-a-list-of-the-names-of-all-files-present-in-a-directory-in-node-j
// https://www.geeksforgeeks.org/node-js/node-js-fs-readdirsync-method/

//Static file hosting 
//Reads in all files in the files folder
const FILES = fs.readdirSync(`${__dirname}/../files/`);
const PAGE_DIRECTORY = {};

//For each file path gets the abosulte path
//Then reads in the file content
//Using the mime-types module we figure out the type based on the absolute path
//We create a page directory using the shortened file path and have it store the content and the type
//An extra check for if it's the client page to also map it to '/' as it doesn't automatically do it
FILES.forEach((filePath) => {
  const ABOSLUTE_PATH = `${__dirname}/../files/${filePath}`;
  const FILE_CONTENT = fs.readFileSync(ABOSLUTE_PATH);
  const MIME_TYPE = mime.lookup(ABOSLUTE_PATH);
  PAGE_DIRECTORY[`/${filePath}`] = { content: FILE_CONTENT, type: MIME_TYPE };
  if (filePath === 'client.html') PAGE_DIRECTORY['/'] = { content: FILE_CONTENT, type: MIME_TYPE };
});

//For all get API endpoints
const API_DIRECTORY = {
  '/PokemonNames': responses.getPokemonName,
  '/PokemonTypes': responses.getPokemonType,
  '/AllPokemon': responses.getAllPokemon,
  '/AllCaught': responses.getCaughtPokeon,
};

//Handles parsing from post requests
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
  } else if (parsedUrl.pathname === '/Caught') parseBody(request, response, responses.caughtPokeomn);
  else responses.failedResponse(request, response);
};

const handleGet = (request, response, parsedUrl) => {
  if (PAGE_DIRECTORY[parsedUrl.pathname]) responses.sendPage(request, response, PAGE_DIRECTORY[parsedUrl.pathname]);
  else if (API_DIRECTORY[parsedUrl.pathname]) {
    if (parsedUrl.search !== "")
      API_DIRECTORY[parsedUrl.pathname](request, response, parsedUrl);
    else API_DIRECTORY[parsedUrl.pathname](request, response);
  }
  else responses.failedResponse(request, response);
};

const onRequest = (request, response) => {
  const PROTOCOL = request.connection.encrypted ? 'https' : 'http';
  const PARSED_URL = new URL(request.url, `${PROTOCOL}://${request.headers.host}`);

  if (request.method === 'POST') { handlePost(request, response, PARSED_URL); } else { handleGet(request, response, PARSED_URL); }
};

http.createServer(onRequest).listen(PORT, () => {
  console.log(`Listening on 127.0.0.1: ${PORT}`);
});

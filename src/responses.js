const dataJson = require('../pokedex.json');

// Send all the different pages
const sendPage = (request, response, pageData) => {
  response.writeHead(200, { 'Content-Type': pageData.type });
  response.write(pageData.content);
  response.end();
};

// For any of the failed responses
// Has a default of just returning 404. Otherwise can pass in content and status code
const failedResponse = (request, response, content = JSON.stringify({
  message: 'The page you are looking for was not found',
  id: 'notFound',
}), statusCode = 404) => {
  response.writeHead(statusCode, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(content, 'utf8') });
  response.write(content);
  response.end();
};

// Successful response defaults with the 200 status code
const responseSucessful = (request, response, object, statusCode = 200) => {
  const objectJson = JSON.stringify(object);
  response.writeHead(statusCode, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(objectJson, 'utf8') });
  if (request.method !== 'HEAD') {
    response.write(objectJson);
  }
  response.end();
};

// Helper function for filtering the data based on searchParams
// caughtVal is defualt to false only caught filter will send a true
const filter = (parsedURL, caughtVal = false) => {
  let response = dataJson;

  // If there is no queryParams parsedURL will be undefined
  if (parsedURL) {
    // Does it for the type search filter
    const typeFilter = parsedURL.searchParams.get('type');
    // Checks if the typeFilter exists
    if (typeFilter) {
      response = response.filter((pokemon) => {
        const typeArrayFormatted = pokemon.type.map((type) => type.toLowerCase());
        if (typeArrayFormatted.includes(typeFilter)) return true;
        return false;
      });
    }

    // Weakness filter copy of the typeFilter execept with weakness instead
    const weaknessFilter = parsedURL.searchParams.get('weakness');
    if (weaknessFilter) {
      response = response.filter((pokemon) => {
        const weaknessArrayFormatted = pokemon.weaknesses.map((weakness) => weakness.toLowerCase());
        if (weaknessArrayFormatted.includes(weaknessFilter)) return true;
        return false;
      });
    }
  }

  // Does the caught pokemon
  if (caughtVal) response = response.filter((pokemon) => pokemon.caught);

  return response;
};

// Checks if the filtered response has nothing in it
// Responds with 400 bad request
const checkFilter = (array, request, response) => {
  if (array.length === 0) {
    failedResponse(
      request,
      response,
      JSON.stringify({ message: 'Bad Request Nothing Found', id: 'NothingFound' }),
      400,
    );
    return true;
  }
  return false;
};

// Have several functions that use this helper function for map the data for a specific format
const displayAllData = (responseArray) => responseArray.map((
  {
    num, name, type, weaknesses, height, weight,
  },
) => ({
  num, name, type, weaknesses, height, weight,
}));

// Returns all the pokemon names
const getPokemonName = (request, response) => {
  // Because there is no filtering just uses dataJSON
  let responseArray = dataJson;

  // Maps it so it is just the name
  responseArray = responseArray.map(({ name }) => ({ name }));

  responseSucessful(request, response, responseArray);
};

// Gets all the pokemon names and thata pokemons type
const getPokemonType = (request, response, parsedURL) => {
  let responseArray = filter(parsedURL);

  if (checkFilter(responseArray, request, response)) return;

  responseArray = responseArray.map(({ name, type }) => ({ name, type }));

  responseSucessful(request, response, responseArray);
};

// Gets all the data for the pokemon
const getAllPokemon = (request, response, parsedURL) => {
  let responseArray = filter(parsedURL);

  if (checkFilter(responseArray, request, response)) return;

  responseArray = displayAllData(responseArray);

  responseSucessful(request, response, responseArray);
};

// Gets all the caught Pokemon
const getCaughtPokeon = (request, response, parsedURL) => {
  let responseArray = filter(parsedURL, true);

  if (checkFilter(responseArray, request, response)) return;

  responseArray = displayAllData(responseArray);

  responseSucessful(request, response, responseArray);
};

// Post request to addPokemon/Update Pokemon
const addPokemon = (request, response) => {
  // Defualt Message
  const responseMessage = {
    message: 'Missing Params',
  };

  // Deconstructs the request.body
  const {
    num, name, height, weight,
  } = request.body;

  // If any of the params are missing
  if (!num || !name || !height || !weight) {
    responseMessage.id = 'missingParams';
    return failedResponse(request, response, JSON.stringify(responseMessage), 400);
  }

  // If the num already exists just update the data with the new data
  let responseCode = 204;
  if (dataJson[num - 1]) {
    dataJson[num - 1].name = name;
    dataJson[num - 1].height = height;
    dataJson[num - 1].weight = weight;
    responseMessage.message = 'Updated Pokemon';
    return responseSucessful(request, response, responseMessage, responseCode);
  }

  // Adds in a new pokemon by creating it
  responseCode = 201;
  const ID = parseInt(num, 10);
  dataJson.push({
    id: ID,
    num,
    name,
    img: '',
    type: [
    ],
    height,
    weight,
    weaknesses: [
    ],
  });
  responseMessage.message = 'Added Pokemon';

  return responseSucessful(request, response, responseMessage, responseCode);
};

// Adds the caught variable to the pokemon
const caughtPokeomn = (request, response) => {
  const responseMessage = {
    message: 'Pokemon Not Found',
  };

  const {
    caught,
  } = request.body;

  // If caught was empty
  if (!caught) {
    responseMessage.id = 'PokemonNotFound';
    return failedResponse(request, response, JSON.stringify(responseMessage), 400);
  }

  // Goes throught the list and checks it against the name of the current to see if needs to update
  for (let i = 0; i < dataJson.length; i++) {
    if (dataJson[i].name.toLowerCase().trim() === caught.toLowerCase().trim()) {
      dataJson[i].caught = true;
      responseMessage.message = 'Marked Pokemon Caught';
      return responseSucessful(request, response, JSON.stringify(responseMessage), 204);
    }
  }

  // If we don't return above we couldn't find that name and respond with a failure
  responseMessage.id = 'PokemonNotFound';
  return failedResponse(request, response, JSON.stringify(responseMessage), 400);
};

module.exports = {
  sendPage,
  failedResponse,
  getPokemonName,
  getPokemonType,
  getAllPokemon,
  addPokemon,
  caughtPokeomn,
  getCaughtPokeon,
};
